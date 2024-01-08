const { ActionRowBuilder,ButtonBuilder, ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder,StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply(`A collector has been opened up. One moment!`)
		const collectFilter = m => m.author.id === interaction.user.id;

		
		interaction.channel.awaitMessages({ filter: collectFilter, max:1, time:60000})
			.then(async collected => {
				console.log(collected.size)
				await interaction.editReply(collected.first().content)
			}
			)
			.catch(collected =>
				console.log(collected.size)
				)
		
} 
}
