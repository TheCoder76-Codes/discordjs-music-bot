const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Shows the current queue')
		.addIntegerOption((option) =>
			option
				.setName('page')
				.setDescription('Page number')
				.setRequired(false)
		),
	async execute(interaction) {
		let client = interaction.client
		let player = client.player
		let queue = player.getQueue(interaction.guildId)

		if (!interaction.member.voice.channelId)
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | You are not in a voice channel!'),
				],
				ephemeral: true,
			})
		if (
			interaction.guild.me.voice.channelId &&
			interaction.member.voice.channelId !==
				interaction.guild.me.voice.channelId
		)
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle(
							'❌ | You are not in the same voice channel as me!'
						),
				],
				ephemeral: true,
			})

		if (!queue || !queue.connection || !queue.playing) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | I am not playing anything!'),
				],
				ephemeral: true,
			})
		}

		await interaction.deferReply()

		function totalTime() {
			let minutes = Math.floor(queue.totalTime / 1000 / 60)
			let seconds = (queue.totalTime / 1000) % 60
			return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
		}

		// Show queue tracks as a page system in the embed
		let tracks = queue.tracks
		let trackPage = interaction.options.getInteger('page')
		let trackPageMax = Math.ceil(tracks.length / 10)
		if (!trackPage || trackPage < 0 || trackPage > trackPageMax)
			trackPage = 1
		else trackPage = trackPage.value

		let trackPageTracks = tracks.slice((trackPage - 1) * 10, trackPage * 10)
		trackPageTracks.unshift(
			queue.previousTracks[queue.previousTracks.length - 1]
		)
		console.log(queue.totalTime)
		let trackPageEmbed = new MessageEmbed()
			.setColor('#ea4e82')
			.setTitle('🎶 | Queue')
			.setDescription(
				`${
					trackPageTracks.length
				} songs in queue, ${totalTime()} total time`
			)
		for (let i = 0; i < trackPageTracks.length; i++) {
			let track = trackPageTracks[i]
			trackPageEmbed.addField(
				`${i == 0 ? 'Now Playing:' : i + '.'} ${track.title}`,
				`${track.duration}`
			)
		}

		trackPageEmbed.setFooter({
			text: `Page ${trackPage} of ${trackPageMax}`,
		})

		await interaction.followUp({
			embeds: [trackPageEmbed],
		})
	},
}
