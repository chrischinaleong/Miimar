const { ActionRowBuilder,ButtonBuilder, ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder,StringSelectMenuOptionBuilder } = require('discord.js');
	

module.exports  = {
    data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Replies with a wordy brief as to my functionalities'),
	async execute(interaction) {

        await interaction.reply(`Hello! I'm Miimar, and Chris has employed me to help you all manage the pieces of this large and needlessly complex puzzle you've found yourselves in.
My main functions are currently geared towards helping you sort and manage entries on **LORE** aspects of the campaign--I'm currently sorting out my workflow with the highlighted aspect in mind, and would appreciate if anything to do with the mechanical aspects of the game are kept away from me :).
I currently boast two commands:
**/check** will assist you in sorting through already-existing entries. Chris & I have made a few entries to test, so there's already some data in my books.
**/write** will let you enter some data into my codex.
        
        
        **__TO-DO__**
        -I'd like to be able to link keywords to already existing entries.
        -I want to help Chris distribute handouts and copy them into my codex mid-session.
        -I want to integrate with the lore Google Drive that Chris has set up.
        -I want to fix the closet of bugs that I probably have at this moment.
        -I want to implement any features that you'd like to see in addition to the above!`)
            }
        }