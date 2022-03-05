import { Client, Intents } from 'discord.js'
import { join } from 'path'
import { env } from './utils/env'
import * as CommandsManager from './CommandsManager'



// Config

const SUPERMECHS_GUILD_ID = '787831902462672896'
const COMMANDS_DIRECTORY = join(__dirname, 'commands')



// Client

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const commands = CommandsManager.importCommands(COMMANDS_DIRECTORY)

client.login(env('TOKEN')).then(async () => {

  // Set commands
  CommandsManager.setGuildCommands(client, commands, SUPERMECHS_GUILD_ID)

})



// Client events

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})


client.on('interactionCreate', async interaction => {

  if (!interaction.isCommand()) {
    return
  }

  CommandsManager.handleInteraction(commands, interaction)

})
