import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
import { Command } from '../CommandsManager'



const SUPPORT_EMAIL = 'support@gatogames.net'
const FORUM_FORM = 'https://community.supermechs.com/contact'



export const command: Command = {

  data: new SlashCommandBuilder()
		.setName('support')
		.setDescription('Show support contact forms'),

	execute (interaction) {

    interaction.reply({
      embeds: [
        new MessageEmbed({
          color: '#ff8822',
          fields: [{
            name: 'Contact Gato Games:',
            value: `Email: ${SUPPORT_EMAIL}\nForum: ${FORUM_FORM}`
          }]
        })
      ]
    })

	},

}
