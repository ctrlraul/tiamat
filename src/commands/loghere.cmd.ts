import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../CommandsManager';
import { Database } from '../Database';

export const command: Command = {

  permissions: ['MANAGE_MESSAGES'],

  data: new SlashCommandBuilder()
		.setName('loghere')
		.setDescription('Sets the chat you\'re in as Tiamat\'s logging chat.'),

	async execute (interaction) {

    try {

      if (!interaction.guild || !interaction.channel) {
        throw new Error('You must be in a text chat from a server!');
      }
  
      if (interaction.channel.type !== 'GUILD_TEXT') {
        throw new Error(`You need to be a normal text chat!`);
      }

      const permissions = interaction.channel.permissionsFor(interaction.client.user!);

      if (!permissions || !permissions.has('SEND_MESSAGES')) {
        throw new Error('I can\'t send messages here!');
      }

      await Database.setLogsChannel(interaction.guild.id, interaction.channel);

    } catch (err: any) {

      interaction.reply({
        content: 'Error: ' + err.message
      }).catch();

      return;

    }

    interaction.reply({
      content: `Logs channel set to <#${interaction.channelId}> (I will not spam, I promise!)`
    }).catch();

	},

};
