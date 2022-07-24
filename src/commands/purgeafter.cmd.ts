import Discord, { Collection, TextChannel, Message, Channel } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager';
import { Database } from '../Database';



// Config

const MESSAGES_PER_BATCH: number = 100; // Max 100
const MATCH_TRAILLING_NUMBERS = /(\d+)\/?$/;



// Functions

async function getMessagesAfterMessage (message: Message): Promise<Collection<string, Message>> {

  const messages = await message.channel.messages.fetch({
    after: message.id,
    limit: MESSAGES_PER_BATCH,
  });

  if (messages.size === MESSAGES_PER_BATCH) {
  
    // Check if we got the maximum amount of messages per batch, if so we
    // continue starting from the last message in this batch.
    const nextBatch = await getMessagesAfterMessage(messages.last()!);

    return messages.concat(nextBatch);
  
  }

  return messages;

}


function passedTwoWeeks (timestamp: number): boolean {
  return timestamp <= Date.now() - 14 * 24 * 60 * 60 * 1000
}


function getMessageID(linkOrID: string): string | null {

  const match = linkOrID.match(MATCH_TRAILLING_NUMBERS);

  if (!match) {
    return null;
  }

  return match[1];

}


function chunkCollection<K, T>(collection: Collection<K, T>, chunkSize: number): Collection<K, T>[] {

  const chunks: Collection<K, T>[] = [];

  let currentChunk: Collection<K, T> = new Collection();

  collection.forEach((value, key) => {

    if (currentChunk.size === chunkSize) {
      chunks.push(currentChunk);
      currentChunk = new Collection();
    }

    currentChunk.set(key, value);

  });

  chunks.push(currentChunk);

  return chunks;

}



// Command

export const command: Command = {

  // disabled: true,

  permissions: ['MANAGE_MESSAGES'],


  data: new SlashCommandBuilder()
    .addStringOption(option => option
      .setName('message')
      .setDescription('The Link or ID of the message to delete everything after it.')
      .setRequired(true)
    )
    .setName('purgeafter')
    .setDescription('Deletes everything after a message.'),


  async execute (interaction, cmd) {

    // This already makes sure it's not being used from DMs
    if (!interaction.channel || !interaction.guild) {
      return interaction.reply({ content: `I can't purge here.` });
    }


    const messageID = getMessageID(
      interaction.options.getString('message', true)
    );

    if (!messageID) {
      return interaction.reply({
        content: `Invalid message Link or ID.`,
        ephemeral: true,
      });
    }


    let messagesToDelete: Collection<string, Message>;

    try {

      // Let Discord know this interaction may take a while...
      await interaction.deferReply({ ephemeral: true });

      const referenceMessage = await interaction.channel.messages.fetch(messageID);

      // Can't delete messages over two weeks old, see:
      // https://github.com/discord/discord-api-docs/issues/208
      if (passedTwoWeeks(referenceMessage.createdTimestamp)) {
        throw new Error(`Messages over two weeks old cannot be deleted!`);
      }

      messagesToDelete = await getMessagesAfterMessage(referenceMessage);

    } catch(err: any) {

      return interaction.reply({
        content: `Failed to get messages to delete: ${err.message}`,
        ephemeral: true,
      });

    }

    const batches = chunkCollection(messagesToDelete, MESSAGES_PER_BATCH);
    const channel: TextChannel = interaction.channel as TextChannel;
    let messagesDeletedCount: number = 0;
    let messagesFailedCount: number = 0;

    for (const batch of batches) {

      try {

        // Yes, this halts the loop until the promise resolves, we would like
        // to keep it that way so it doesn't send too many requests too fast.
        await channel.bulkDelete(batch);

        messagesDeletedCount += batch.size;

      } catch(err: any) {
        messagesFailedCount += batch.size;
      }

    }
    

    const replyLines: string[] = [];
    let logsChannel: Channel | null = null;

    try {

      const logsChannelID = await Database.getLogsChannelID(interaction.guild.id);

      if (logsChannelID) {
        logsChannel = await interaction.guild.channels.fetch(logsChannelID);
      } else {
        replyLines.push('Warning! No logs channel configured, use `/loghere` to set the logs channel.');
      }

    } catch(err: any) {
      replyLines.push(`Failed to get logs channel: ${err.message}`);
    }

    replyLines.push(`Deleted ${messagesDeletedCount} out of ${messagesToDelete.size} messages.`);

    if (messagesFailedCount) {
      replyLines.push(`Failed to delete ${messagesFailedCount} messages`);
    }


    // Log deletion

    if (logsChannel) {

      const embed = new Discord.MessageEmbed({
        author: {
          name: `${interaction.user.tag} (${interaction.user.id})`,
          iconURL: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
        },
        description: `\`/${cmd.data.name}\` called in <#${interaction.channel.id}>`,
        color: '#aa2211',
        fields: [{
          name: 'Result:',
          value: replyLines.join('\n'),
        }]
      })

      try {
        await (logsChannel as TextChannel).send({ embeds: [embed] });
      } catch(err: any) {
        replyLines.push('Failed to send embed in logs chat: ' + err.message);
      }

    }


    // Feedback

    interaction.editReply({ content: replyLines.join('\n') }).catch();

  }

}
