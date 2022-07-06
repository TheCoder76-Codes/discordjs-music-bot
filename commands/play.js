const { SlashCommandBuilder } = require('@discordjs/builders')
const { QueryType } = require('discord-player')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays your song!')
		.addStringOption((option) =>
			option
				.setName('song')
				.setDescription('The song you wish to play')
				.setRequired(false)
		),
	async execute(interaction) {
		let client = interaction.client
		let player = client.player

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
		let query = interaction.options.get('song')
		const queue = player.createQueue(interaction.guild, {
			metadata: {
				channel: interaction.channel,
			},
		})

		if ((!query || query === '') && (queue.connection || queue.playing)) {
			try {
				queue.setPaused(false)
			} catch (error) {
				console.error(error)
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor('#FF0000')
							.setTitle('❌ | I could not resume the song!'),
					],
					ephemeral: true,
				})
			}

			return await interaction.followUp({
				embeds: [
					new MessageEmbed()
						.setColor('#ea4e82')
						.setTitle('✅ | The current song is now playing!'),
				],
			})
		}

		// verify vc connection
		try {
			if (!queue.connection)
				await queue.connect(interaction.member.voice.channel)
		} catch (error) {
			queue.destroy()
			console.error(error)
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | I could not join your voice channel!'),
				],
				ephemeral: true,
			})
		}

		await interaction.deferReply()

		query = query.value

		const track = await player.search(query, {
			requestedBy: interaction.user,
			searchEngine: QueryType.AUTO,
		})
		if (!track || !track.tracks.length)
			return await interaction.followUp({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | I could not find that song!')
						.setDescription(`Song name: ${query}`),
				],
				ephemeral: true,
			})

		if (!queue.playing) {
			if (track.playlist) queue.addTracks(track.tracks)
			else queue.play(track.tracks[0])
		} else if (queue.playing) {
			if (track.playlist) queue.addTracks(track.tracks)
			else queue.addTrack(track.tracks[0])
		}

		let addedToQueue = new MessageEmbed()
			.setColor('#ea4e82')
			.setTitle(
				`🎵 | Added new ${
					track.playlist ? 'playlist' : 'song'
				} to queue!`
			)

		if (track.playlist) {
			return await interaction.followUp({
				embeds: [addedToQueue],
			})
		} else {
			addedToQueue
				.setThumbnail(track.tracks[0].thumbnail)
				.setDescription(`Song name: ${track.tracks[0].title}`)
			return await interaction.followUp({
				embeds: [addedToQueue],
			})
		}
	},
}
