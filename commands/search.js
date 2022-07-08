const { SlashCommandBuilder } = require('@discordjs/builders')
const { QueryType } = require('discord-player')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search for a song')
		.addStringOption((option) =>
			option
				.setName('query')
				.setDescription('What you wish to search')
				.setRequired(true)
		),
	async execute(interaction) {
		let client = interaction.client
		let player = client.player

		let query = interaction.options.get('query').value

		const search = await player.search(query, {
			requestedBy: interaction.user,
			searchEngine: QueryType.AUTO,
		})

		if (search.playlist) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle("❌ | You can't search for playlists yet!"),
				],
			})
		}

		if (search.tracks.length === 0) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | No results found!'),
				],
			})
		}

		await interaction.deferReply()

		let embed = new MessageEmbed()
			.setColor('#ea4e82')
			.setTitle('🔎 | Search results')

		for (let i = 0; i < 10; i++) {
			let track = search.tracks[i]
			embed.addField(
				`${i + 1}. ${track.title}`,
				`${track.author} - ${track.duration}`
			)
		}

		await interaction.followUp({
			embeds: [embed],
		})
	},
}
