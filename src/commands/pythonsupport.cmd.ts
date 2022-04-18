import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager'



const MARIJA_ID = '336988655748907008'



export const command: Command = {

  data: new SlashCommandBuilder()
    .setName('emergency')
    .setDescription('Contact Marija for an emergency'),

  execute (interaction) {
    interaction.reply({
      content: `<@${MARIJA_ID}> `.repeat(10)
    })
  },

}
