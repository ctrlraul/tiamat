import { SlashCommandBuilder } from '@discordjs/builders'
import { ColorResolvable, CommandInteraction, MessageEmbed } from 'discord.js'
import stats from './stats'
import statEmojis from './statEmojis'
import axios, { AxiosResponse } from 'axios'



// Config

const ITEMS_PACK_URL = 'https://gist.githubusercontent.com/ctrlraul/3b5669e4246bc2d7dc669d484db89062/raw/'
const ELEMENT_COLORS: Record<WUItem['element'], ColorResolvable> = {
  PHYSICAL: '#ffaa00',
  EXPLOSIVE: '#aa1111',
  ELECTRIC: '#00aaff',
}



// Types

import { Command } from '../../CommandsManager';

interface WUItem {
  name: string;
  type: string;
  element: 'PHYSICAL' | 'EXPLOSIVE' | 'ELECTRIC';
  image: string;
  stats: { [K: string]: number | [number, number] };
}

interface WUItemsPack {
  config: {
    name: string;
    description: string;
    key: string;
    base_url: string;
  };
  items: WUItem[];
}



// Data

let itemsPack: WUItemsPack | null = null
let itemsPackPromise: Promise<AxiosResponse<WUItemsPack>> | null = null



// Functions

function getBuffedStats (item: WUItem) {

  const buffedStats = Object.assign({}, item.stats);

  const buffFunctions = {
    add: (x: number, amount: number) => x + amount,
    mul: (x: number, amount: number) => x * amount
  };


  for (const [key, value] of Object.entries(item.stats)) {

    if (!value || key === 'health') {
      continue;
    }

    const statForm = stats[key];

    if (!statForm) {
      console.error(`Unknown stat '${key}'`);
      continue;
    }

    if (statForm.buff) {

      const { buff } = statForm;
      const buffFn = buffFunctions[buff.mode];

      if (Array.isArray(value)) {
        buffedStats[key] = value.map(x => Math.round(buffFn(x, buff.amount))) as [number, number];
      } else {
        buffedStats[key] = Math.round(buffFn(value, buff.amount));
      }

    }
  }


  return buffedStats;
}


function comparisonSafe (str: string): string {
  return str.toLowerCase().replace(/\s+/g, '')
}


async function getItemsPack () {

  if (itemsPack === null) {

    if (itemsPackPromise === null) {
      itemsPackPromise = axios.get(ITEMS_PACK_URL)
    }

    itemsPack = (await itemsPackPromise).data

  }

  return itemsPack

}



// Command

export const command: Command = {

  data: new SlashCommandBuilder()
    .addStringOption(option => option
      .setName('name')
      .setDescription('The item name')
      .setRequired(true)
    )
    // .addBooleanOption(option => option
    //   .setName('public')
    //   .setDescription('Whether should show it for everyone')
    // )
		.setName('item')
		.setDescription('Query item info'),


	async execute (interaction: CommandInteraction) {

    try {

      const itemsPack = await getItemsPack()
      const query = comparisonSafe(interaction.options.getString('name', true))
      const ephemeral = !interaction.options.getBoolean('public')

      let matches: WUItem[] = []

      for (const item of itemsPack.items) {

        const safeName = comparisonSafe(item.name)

        if (safeName.includes(query)) {
          if (safeName === query) {
            matches = [item]
            break
          } else {
            matches.push(item)
          }
        }
      }

      switch (matches.length) {

        case 0:
          interaction.reply({ content: `Not found!`, ephemeral })
          break
        
        
        case 1:
          const item = matches[0]
          const embedLines: string[] = []
          const itemStats = getBuffedStats(item)

          for (const [key, value] of Object.entries(itemStats)) {
            const valueStr = Array.isArray(value) ? value.join('-') : value.toString()
            const emoji = statEmojis[key] || '❔'
            const statName = stats[key]?.name || '?'
            embedLines.push(`${emoji} **${valueStr}** ${statName}`)
          }

          const embed = new MessageEmbed()
            .setColor(ELEMENT_COLORS[item.element])
            .addField(item.name, embedLines.join('\n'))
            .setImage(item.image.replace('%url%', itemsPack.config.base_url));

          interaction.reply({ embeds: [embed], ephemeral, })
          break
        
        
        default:

          const content = (
            matches.length > 4
            ? `Found ${matches.length} items! Please be more specific.`
            : `Found multiple items: ${matches.map(item => item.name).join(', ')}`
          )

          interaction.reply({ content, ephemeral })

          break

      }

    } catch (error: any) {

      console.error(error)

      interaction.reply({ content: error.message, ephemeral: true })

    }
		
	},

}
