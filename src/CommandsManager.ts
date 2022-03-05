import { readdirSync, lstatSync } from 'fs'
import { join } from 'path'
import Discord, { CommandInteraction } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'



// Types

import { SlashCommandBuilder } from '@discordjs/builders'

export interface Command {
  disabled?: boolean
  permissions?: Discord.PermissionString[]
  data: SlashCommandBuilder
  execute: (interaction: Discord.CommandInteraction) => (void | Promise<void>)
}

export interface ImportedCommand {
  permissions: Discord.PermissionString[]
  data: SlashCommandBuilder
  execute: (interaction: Discord.CommandInteraction) => (void | Promise<void>)
}



// Stuff

const rest = new REST({ version: '9' })
const commandFileTest = /\.cmd\.\w+$/



// Functions

export async function setGuildCommands (client: Discord.Client, commandsMap: Record<string, Command>, guildID: string) {

  rest.setToken(client.token)

  const commands = Object.values(commandsMap)
  const commandJSONs = commands.map(command => command.data.toJSON())

  console.log('Setting commands...')

  try {

		await rest.put(
			Routes.applicationGuildCommands(client.user.id, guildID),
			{ body: commandJSONs },
		)

		console.log(
      'Successfuly set commands!',
      commands.map(command => command.data.name)
    )
    
	} catch (err: any) {

		throw new Error('Failed to set commands: ' + err.message)

	}

}


export function importCommands (commandsDirectory: string): Record<string, ImportedCommand> {

  const commands: Record<string, ImportedCommand> = {}
  const contents = readdirSync(commandsDirectory)


  for (const contentName of contents) {

    const fullPath = join(commandsDirectory, contentName)
    const isSubDirectory = lstatSync(fullPath).isDirectory()
    

    /* If the content is a sub directory we
     * load commands recursively from that */ 
    if (isSubDirectory) {

      const subDirCommands = Object.values(importCommands(fullPath))

      for (const command of subDirCommands) {

        importCommand(commands, command)

      }
      
    } else if (commandFileTest.test(fullPath)) {

      const command: Command = require(fullPath).command

      importCommand(commands, command)

    }
    
  }


  return commands

}


export function handleInteraction (commands: Record<string, Command>, interaction: CommandInteraction) {

  if (interaction.commandName in commands) {

    const command = commands[interaction.commandName]

    if (typeof interaction.member.permissions === 'string') {

      interaction.reply({ content: `I have encountered an error! ${interaction.member.permissions}` })

    } else if (hasPermissions(interaction.member.permissions, command.permissions)) {

      command.execute(interaction)

    } else {

      interaction.reply({
        content: 'You do not have permission to use this command!',
        ephemeral: true
      })

    }

  }

}


function hasPermissions (granted: Readonly<Discord.Permissions>, required: Discord.PermissionString[]) {
  return required.length === 0 || required.some(permission => granted.has(permission))
}


function importCommand (commands: Record<string, ImportedCommand>, command: ImportedCommand | Command) {

  if ('disabled' in command && command.disabled) {
    return
  }

  // Checks if there is already a command with this name
  if (command.data.name in commands) {
    throw new Error(`Found two commands with the name "${command.data.name}"`)
  }

  commands[command.data.name] = {
    permissions: command.permissions || [],
    data: command.data,
    execute: command.execute
  }

}
