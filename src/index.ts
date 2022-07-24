import * as CommandsManager from './CommandsManager';
import { Database } from './Database';
import { Client, Intents } from 'discord.js';
import { join } from 'path';
import { env } from './utils/env';
import { ImageThreader } from './ImageThreader';



// Init client

const commands = CommandsManager.importCommands(join(__dirname, 'commands'));
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES
]});


client.on('ready', async () => {
  
  console.log(`Logged in as '${client.user?.tag}'!`);

  // Init threader
  ImageThreader.init(client);

  // Set commands
  CommandsManager.setCommands(client, commands).catch(err => {
    console.error('Failed to set commands:', err);
  });


  try {

    const guilds = await client.guilds.fetch();
    const guildsData = await Database.getGuildsData();

    // Enable auto threading channels
    for (const data of guildsData) {
      if (guilds.some(guild => guild.id === data.id)) {
        ImageThreader.addChannels(data.auto_threading_channels);
      }
    }

    // Make sure all guilds are registered
    for (const [id, guild] of guilds) {
      if (!guildsData.some(data => data.id === id)) {
        Database.registerGuild(guild.id).then(() => {
          console.log(`Successfuly registered new guild '${guild.name}'`);
        }).catch(err => {
          console.log(`Failed to register guild '${guild.name}':`, err);
        });
      }
    }

  } catch (err: any) {

    console.log('Sync guilds:', err);

  }

});


client.on('interactionCreate', interaction => {

  if (!interaction.isCommand() || !interaction.guild) {
    return;
  }

  CommandsManager.handleInteraction(commands, interaction).then(cmd => {
    console.log(`Command '${cmd.data.name}' called from '${interaction.guild!.name}'`);
  }).catch(err => {
    console.error(`Failed to handle command from '${interaction.guild!.name}':`, err.message);
  });

});


client.on('guildCreate', async guild => {

  try {

    const data = await Database.getGuildData(guild.id);

    if (!data) {
      await Database.registerGuild(guild.id);
    }

    console.log(`Registered new guild '${guild.name}'`);

  } catch(err: any) {

    console.error('Failed to register new guild:', err);

  }

});


client.login(env('DISCORD_TOKEN'));
