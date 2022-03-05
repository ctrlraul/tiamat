import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
import { Command } from '../CommandsManager'



const REPORT_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSdpTi7ARgV-5ncdfXi2QzEOUXGlSM-1XN6IrMqyjknFyk0yxA/viewform'



export const command: Command = {

  data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Report a potential cheater'),

	execute (interaction) {

    interaction.reply({
      embeds: [
        new MessageEmbed({
          color: '#ff4444',
          fields: [{
            name: 'Report a potential cheater:',
            value: REPORT_FORM
          }]
        })
      ]
    })

	},

}
