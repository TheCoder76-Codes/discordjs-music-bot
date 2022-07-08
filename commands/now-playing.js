const { SlashCommandBuilder } = require('@discordjs/builders')
const { QueryType } = require('discord-player')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('now-playing')
		.setDescription('Shows the song currently playing'),
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

		let embed = new MessageEmbed()

		try {
			let track = queue.nowPlaying()
			embed
				.setColor('#ea4e82')
				.setTitle('🎶 | Now Playing')
				.setThumbnail(track.thumbnail)
				.setDescription(`Now Playing ${track.title}`)
				.setAuthor({
					name: track.requestedBy.username,
					iconURL: track.requestedBy.avatarURL(),
				})
		} catch (error) {
			console.log(error)
			return await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | I cannot get the current song!'),
				],
				ephemeral: true,
			})
		}

		return await interaction.followUp({
			embeds: [embed],
		})
	},
}
