import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager'



const SUPERMECHS_WORKSHOP_URL = 'https://workshop-unlimited.vercel.app/'



export const command: Command = {

  data: new SlashCommandBuilder()
    .setName('wu')
    .setDescription('Link SuperMechs Workshop'),

  execute (interaction) {
    interaction.reply({ content: SUPERMECHS_WORKSHOP_URL })
  },

}
