import { SlashCommandBuilder } from '@discordjs/builders';
import { ImageThreader } from '../ImageThreader';
import { Command } from '../CommandsManager';
import { Database } from '../Database';

export const command: Command = {

  permissions: ['MANAGE_MESSAGES'],

  data: new SlashCommandBuilder()
		.setName('threading')
    .addBooleanOption(option => option
      .setName('enable')
      .setDescription('Whether threading should be enabled')
      .setRequired(true)
    )
		.setDescription('Enables auto threading in the chat you\'re in.'),

	async execute (interaction) {

    const enable = interaction.options.getBoolean('enable', true);

    try {

      if (!interaction.guildId || !interaction.channel) {
        throw new Error('You must be in a text chat from a server!');
      }

      if (enable) {
    
        if (interaction.channel.type !== 'GUILD_TEXT') {
          throw new Error(`You need to be a normal text chat!`);
        }
  
        const permissions = interaction.channel.permissionsFor(interaction.client.user!);
  
        if (!permissions || !permissions.has('CREATE_PUBLIC_THREADS')) {
          throw new Error('I can\'t send create threads here!');
        }

      }

      await Database.setChannelThreading(
        interaction.guildId,
        interaction.channelId,
        enable
      );

      if (enable) {
        ImageThreader.addChannels([interaction.channelId]);
      } else {
        ImageThreader.removeChannel(interaction.channelId);
      }

    } catch (err: any) {

      interaction.reply({
        content: 'Error: ' + err.message,
      }).catch();

      return;

    }

    interaction.reply({
      content: `Threading ${enable ? 'enabled' : 'disabled'}!`
    }).catch();

	},

};
