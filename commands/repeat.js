const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('repeat')
		.setDescription('Set the repeat mode')
		.addIntegerOption((option) =>
			option
				.setName('mode')
				.setDescription('The repeat mode')
				.setRequired(true)
				.addChoices(
					{ name: 'Off', value: 0 },
					{ name: 'Song', value: 1 },
					{ name: 'Queue', value: 2 },
					{ name: 'Autoplay', value: 3 }
				)
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

		try {
			await queue.setRepeatMode(interaction.options.getInteger('mode'))
		} catch (error) {
			console.log(error)
			return await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | I could not set the repeat mode!'),
				],
				ephemeral: true,
			})
		}

		return await interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setColor('#ea4e82')
					.setTitle('✅ | Repeat mode set!'),
			],
		})
	},
}
