import type { Client, Message, TextChannel } from 'discord.js'



export class AutoThreader {

  private channel: TextChannel | null = null
  public disabled = false


  public async init (client: Client, channelID: string): Promise<void> {

    if (this.channel) {
      throw new Error('Already initialized')
    }

    const channel = await client.channels.fetch(channelID)

    if (!channel) {
      throw new Error(`No channel found for id: ${channelID}`)
    }

    if (channel.type !== 'GUILD_TEXT') {
      throw new Error(`channelID must belong to a text channel`)
    }

    this.channel = channel

    client.on('messageCreate', message => {

      if (this.disabled) {
        return
      }

      if (message.channel !== channel) {
        return
      }

      if (message.type !== 'DEFAULT' && message.type !== 'REPLY') {
        return
      }

      if (!message.attachments.size) {
        message.delete().catch()
        return
      }


      message.startThread({
        name: this.createThreadName(message),
        autoArchiveDuration: 4320
      }).catch(err => {
        console.error('Failed to create thread:', err)
      })

    })

  }



  // Utils

  private createThreadName (message: Message): string {

    // const toChannelName = (text: string) => {
    //   return text
    //     .toLowerCase()
    //     .replace(/[^a-z]+/ig, ' ')
    //     .trim()
    //     .replace(/\s+/g, '-')
    // }

    if (message.content.length) {
      return message.content.slice(0, 48)
    }

    const firstAttachment = message.attachments.first()

    if (firstAttachment && firstAttachment.name) {
      return firstAttachment.name.slice(0, 48)
    }

    return message.id

  }

}
