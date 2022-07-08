const { SlashCommandBuilder } = require('@discordjs/builders')
const { QueryType } = require('discord-player')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffles the queue'),
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
			queue.shuffle()
		} catch (error) {
			console.error(error)
			return await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | I was unable to shuffle the queue!'),
				],
				ephemeral: true,
			})
		}

		return await interaction.followUp({
			embeds: [
				new MessageEmbed()
					.setColor('#ea4e82')
					.setTitle('🔀 | Shuffled the queue!'),
			],
		})
	},
}
