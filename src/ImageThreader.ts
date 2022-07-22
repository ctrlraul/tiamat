import type { Client, Message } from 'discord.js'



// Methods

export class ImageThreader {

  private static channelIDs: string[] = [];
  private static initialized: boolean = false;



  // Methods

  public static init(client: Client): void {

    if (this.initialized) {
      throw new Error('Already initialized');
    }

    this.initialized = true;
  
    client.on('messageCreate', message => this.onMessageCreate(message));

  }


  public static addChannels(channelIDs: string[]): void {
    channelIDs.forEach(id => {
      this.channelIDs.push(id);
    });
  }


  public static removeChannel(channelID: string): void {

    const index = this.channelIDs.findIndex(id => id === channelID);

    if (index !== -1) {
      this.channelIDs.splice(index, 1);
    }

  }


  public static getChannelIDs(): string[] {
    return [...this.channelIDs];
  }



  // Private methods

  private static onMessageCreate(message: Message): void {

    if (!this.channelIDs.includes(message.channel.id)) {
      return;
    }

    if (message.type !== 'DEFAULT' && message.type !== 'REPLY') {
      return;
    }

    if (!message.attachments.size) {
      message.delete().catch();
      return;
    }

    // message.react('👍').catch();

    message.startThread({
      name: this.createThreadName(message),
      autoArchiveDuration: 4320,
    }).catch(err => {
      console.error('Failed to create thread:', err);
    });


  }


  private static createThreadName(message: Message): string {

    if (message.content.length) {
      return message.content;
    }

    const firstAttachment = message.attachments.first();

    if (firstAttachment && firstAttachment.name) {
      return firstAttachment.name;
    }

    return message.id;

  }

}
