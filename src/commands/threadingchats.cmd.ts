import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../CommandsManager';
import { Database } from '../Database';

export const command: Command = {

  permissions: ['MANAGE_MESSAGES'],

  data: new SlashCommandBuilder()
		.setName('threadingchats')
		.setDescription('A list of chats with threading enabled.'),

	async execute (interaction) {

    if (!interaction.guildId) {

      interaction.reply({
        content: 'You have to be in a server to use this command',
        ephemeral: true,
      }).catch();

      return;

    }

    try {

      const chats = await Database.getChannelsThreading(interaction.guildId);

      interaction.reply({
        content: chats.join(', '),
        ephemeral: true,
      }).catch();

    } catch(err: any) {

      interaction.reply({
        content: 'Error: ' + err.message,
        ephemeral: true,
      }).catch();

    }

	},

};
