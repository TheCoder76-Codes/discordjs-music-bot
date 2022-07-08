const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription('Adjust the volume of the bot')
		.addIntegerOption((option) =>
			option
				.setName('volume')
				.setDescription('The volume between 0 and 100')
				.setRequired(true)
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

		let volume = interaction.options.get('volume').value

		if (volume < 0 || volume > 100) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | Volume must be between 0 and 100!'),
				],
				ephemeral: true,
			})
		}

		// verify vc connection
		if (!queue || !queue.connection || !queue.playing) {
			return await interaction.editReply({
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
			queue.setVolume(volume)
		} catch (error) {
			console.error(error)
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor('#FF0000')
						.setTitle('❌ | I could not set the volume!'),
				],
				ephemeral: true,
			})
		}

		await interaction.followUp({
			embeds: [
				new MessageEmbed()
					.setColor('#ea4e82')
					.setTitle('✅ | Volume set to ' + volume + '%'),
			],
		})
	},
}
