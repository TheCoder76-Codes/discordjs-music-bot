const fs = require('node:fs')
const path = require('node:path')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

require('dotenv').config()

let clientId = process.env.APP_ID
let token = process.env.TOKEN
let guildId = '884957493334245377'

function sendCommands() {
	const commands = []
	const commandsPath = path.join(__dirname, 'commands')
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'))

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath)
		commands.push(command.data.toJSON())
	}

	const rest = new REST({ version: '9' }).setToken(token)

	;(async () => {
		try {
			console.log('Started refreshing application (/) commands.')

			await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
				body: commands,
			})

			console.log('Successfully reloaded application (/) commands.')
		} catch (error) {
			console.error(error)
		}
	})()
}

module.exports = sendCommands
