import { Client, Intents } from 'discord.js'
import { join } from 'path'
import { env } from './utils/env'
import * as CommandsManager from './CommandsManager'
import { AutoThreader } from './AutoThreader'



// Config

const COMMANDS_DIRECTORY = join(__dirname, 'commands')



// Client

const commands = CommandsManager.importCommands(COMMANDS_DIRECTORY)
const artworkThreader = new AutoThreader()
const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES
]})

client.login(env('TOKEN')).then(async () => {

  // Set commands
  try {
    CommandsManager.setGuildCommands(client, commands, env('SUPERMECHS_GUILD_ID'))
  } catch (err: any) {
    console.error('Failed to set guild commands:', err)
  }

  // Init AutoThreader for #artwork
  try {
    await artworkThreader.init(client, env('ARTWORK_CHANNEL_ID'))
  } catch (err: any) {
    console.error(`Failed to init AutoThreader for artwork:`, err)
  }

})



// Client events

client.on('ready', () => {
  console.log(`Logged in as ${client.user!.tag}!`)
})


client.on('interactionCreate', async interaction => {

  if (!interaction.isCommand()) {
    return
  }

  CommandsManager.handleInteraction(commands, interaction)

})
