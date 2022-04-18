import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager'



const ENEG_ID = '190505392504045570'



export const command: Command = {

  data: new SlashCommandBuilder()
    .setName('pythonsupport')
    .setDescription('Contact Eneg for a Python emergency'),

  execute (interaction) {
    interaction.reply({
      content: `<@${ENEG_ID}> `.repeat(10)
    })
  },

}
