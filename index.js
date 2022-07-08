const fs = require('node:fs')
const path = require('node:path')
const { Client, Intents, Collection, MessageEmbed } = require('discord.js')
const { Player } = require('discord-player')
require('dotenv').config()

require('./sendCommands')()

// let c = {
// 	blurple: '#5865F2',
// 	green: '#57F287',
// 	yellow: '#FEE75C',
// 	pink: '#EB459E',
// 	red: 'ED4245',
// 	white: '#FFFFFF',
// 	black: '#000000',
// }

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
})

// command handling

client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command)
}

// Player

const player = new Player(client)
client.player = player

// TODO: Add embed
player.on('trackStart', (queue, track) => {
	let songEmbed = new MessageEmbed()
		.setColor('#ea4e82')
		.setTitle('🎶 | Now Playing')
		.setThumbnail(track.thumbnail)
		.setDescription(`Now Playing ${track.title}`)
		.setAuthor({
			name: track.requestedBy.username,
			iconURL: track.requestedBy.avatarURL(),
		})
	queue.metadata.channel.send({ embeds: [songEmbed] })
})

player.on('channelEmpty', (queue) => {
	queue.metadata.channel.send({
		embeds: [
			new MessageEmbed()
				.setColor('#FF0000')
				.setTitle('❌ | Channel Empty')
				.setDescription('I left the voice channel since it was empty!'),
		],
	})
	queue.destroy(true)
})

player.on('queueEnd', (queue) => {
	queue.metadata.channel.send({
		embeds: [
			new MessageEmbed()
				.setColor('#ea4e82')
				.setTitle('🛑 | Queue Finished Playing')
				.setDescription(
					'I left the voice channel since the queue finished playing!'
				),
		],
	})
	queue.destroy(true)
})

player.on('error', (queue, error) => {
	console.error(error)
	// queue.metadata.channel.send({
	// 	embeds: [
	// 		new MessageEmbed()
	// 			.setColor('#FF0000')
	// 			.setTitle(':no_entry_sign: | Error')
	// 			.setDescription(
	// 				'An unexpected error occured. \n Error: ```' + error + '```'
	// 			),
	// 	],
	// })
})

client.once('ready', () => {
	console.log('Music firing up!')
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return

	interaction.client = client

	const command = client.commands.get(interaction.commandName)

	if (!command) return

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		await interaction.channel.send({
			content: 'There was an error while executing this command!',
		})
	}
})

client.login(process.env.TOKEN)
