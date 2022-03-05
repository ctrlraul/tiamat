import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
import { Command } from '../CommandsManager'



const SUPERMECHS_WORKSHOP_URL = 'https://workshop-unlimited.vercel.app/'



export const command: Command = {

  data: new SlashCommandBuilder()
		.setName('wu')
		.setDescription('Link SuperMechs Workshop'),

	execute (interaction) {

    interaction.reply({
      embeds: [
        new MessageEmbed({
          color: '#112233',
          fields: [{
            name: 'SuperMechs Workshop:',
            value: SUPERMECHS_WORKSHOP_URL
          }]
        })
      ]
    })

	},

}
