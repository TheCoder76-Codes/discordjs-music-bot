const { SlashCommandBuilder } = require('@discordjs/builders')
const { QueryType } = require('discord-player')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jump')
		.setDescription('Jumps to the specified song')
		.addIntegerOption((option) =>
			option
				.setName('index')
				.setDescription('The index of the song to jump to')
				.setRequired(true)
		),
	async execute(interaction) {
		return await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor('#FF0000')
					.setTitle('❌ | Command Error')
					.setDescription('This command is not yet implemented!'),
			],
		})

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

		let index = interaction.options.getInteger('index')
		if (index > queue.tracks.length || index < 0) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | Invalid index!'),
				],
				ephemeral: true,
			})
		}

		index = index.value

		await interaction.deferReply()

		try {
			queue.jump(index)
		} catch (e) {
			console.error(e)
			return await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | I was unable to skip the song!'),
				],
			})
		}

		return await interaction.followUp({
			embeds: [
				new MessageEmbed()
					.setColor('#ea4e82')
					.setTitle('✅ | Skipped to the specified song!'),
			],
		})
	},
}
