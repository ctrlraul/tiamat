import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager'


export const command: Command = {

  data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),

	execute (interaction) {
		return interaction.reply({ content: 'Pongy!', ephemeral: true })
	},

}
