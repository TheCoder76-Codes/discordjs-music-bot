const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('previous')
		.setDescription('Plays the previous song in the queue'),
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

		try {
			queue.addTrack(
				queue.previousTracks[queue.previousTracks.length - 1]
			)
			queue.play(queue.previousTracks[queue.previousTracks.length - 2], {
				immediate: true,
			})
		} catch (error) {
			console.log(error)
			return await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | I could not play the previous song!'),
				],
			})
		}
		interaction.followUp({
			embeds: [
				new MessageEmbed()
					.setColor('#ea4e82')
					.setTitle('🎶 | Playing previous track!'),
			],
		})
	},
}
