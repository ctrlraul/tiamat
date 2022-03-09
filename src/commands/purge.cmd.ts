// TODO: Delete messages from specific users



import Discord, { Collection } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Command } from '../CommandsManager';
import { chunk } from '../utils/chunk';
import { env } from '../utils/env'



const matchAllNumbersAtTheEnd = /(\d+)\/?$/
let logsChannel: Discord.TextBasedChannel


// Functions

async function getMessagesToDelete (interaction: Discord.CommandInteraction, messageID: string) {

  if (interaction.channel === null) {
    throw new Error('Trying to get messages in null channel')
  }

  const message = await interaction.channel.messages.fetch(messageID)
  const messagesToDelete: Discord.Message[] = [message]

  if (passedTwoWeeks(message.createdTimestamp)) {
    throw new Error(`Can't delete messages that are over two weeks old!`)
  }

  const next100Messages = await interaction.channel.messages.fetch({
    after: message.id,
    limit: 100
  })

  next100Messages.mapValues(message => messagesToDelete.push(message))

  // Got the maximum messages, so let's check if there is more
  if (messagesToDelete.length === 100) {
    const more = await getMessagesToDelete(interaction, next100Messages.last()!.id)
    messagesToDelete.push(...more)
  }

  return messagesToDelete

}


// https://github.com/discord/discord-api-docs/issues/208
function passedTwoWeeks (timestamp: number) {
  return timestamp <= Date.now() - 14 * 24 * 60 * 60 * 1000
}



// Command

export const command: Command = {

  // disabled: true,

  permissions: ['MANAGE_MESSAGES'],


  data: new SlashCommandBuilder()
    .addStringOption(option => option
      .setName('link')
      .setDescription('The link of the message to begin deleting from. (Message ID works too!)')
      .setRequired(true)
    )
    .setName('purge')
    .setDescription('Deletes a message and everything after it'),


  async execute (interaction, cmd) {

    if (interaction.channel === null || interaction.guild === null) {
      return
    }


    // Make sure we can log who's purging
    if (logsChannel === undefined) {

      const channel = await interaction.guild.channels.fetch(env('LOGS_CHANNEL_ID'))

      if (channel === null) {
        throw new Error('Failed to fetch logs channel')
      }

      if (!channel.isText()) {
        throw new Error('Logs channel must be a text channel')
      }

      logsChannel = channel

    }


    // Ignore attempts to purge DMs, we can't do that
    if (interaction.channel.type === 'DM') {
      interaction.reply({ content: `I can't purge DMs` })
      return
    }


    const msgLinkOrID = interaction.options.getString('link', true)
    const match = msgLinkOrID.match(matchAllNumbersAtTheEnd)


    if (match === null) {

      interaction.reply({ content: `Invalid message link or id.`, ephemeral: true })
      
    } else {

      try {

        const messagesPerBatch = 100 // Max 100
        const messagesToDelete = await getMessagesToDelete(interaction, match[1])
        const batches = chunk(messagesToDelete, messagesPerBatch)

        let successfulDeletesCount = 0
        let failedDeletesCount = 0
        let tooOldCount = 0


        for (const batch of batches) {

          const collection = new Collection<string, Discord.Message>()

          for (const message of batch) {

            if (passedTwoWeeks(message.createdTimestamp)) {
              tooOldCount++
            } else {
              collection.set(message.id, message)
            }

          }

          try {

            await interaction.channel.bulkDelete(collection)

            successfulDeletesCount += batch.length

          } catch (err: any) {

            failedDeletesCount += batch.length

          }

        }


        const lines: string[] = []

        if (successfulDeletesCount > 0) {
          lines.push(`Successfuly deleted ${successfulDeletesCount} messages`)
        }

        if (failedDeletesCount > 0) {
          lines.push(`Failed to delete ${failedDeletesCount} messages`)
        }

        if (tooOldCount > 0) {
          lines.push(`${tooOldCount} messages are too old to be deleted`)
        }

        if (lines.length === 0) {
          lines.push('Succesfuly did nothing')
        }


        // Feedback
        interaction.reply({
          content: lines.join('\n'),
          ephemeral: true
        })


        // Log
        const embed = new Discord.MessageEmbed()

        embed.setAuthor({
          name: `${interaction.user.tag} (${interaction.user.id})`,
          iconURL: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
        })
        
        embed.setDescription(`**/${cmd.data.name}** called in ${interaction.channel.toString()}\n\n${lines.join('\n')}`)
        embed.setColor('#aa2211')

        logsChannel.send({ embeds: [embed] })
          .catch(err => console.error('Failed to send embed in logs channel:', err))

      } catch (err: any) {

        interaction.reply({
          content: 'Failed to purge: ' + err.message,
          ephemeral: true
        })
        
      }

    }
  }

}
