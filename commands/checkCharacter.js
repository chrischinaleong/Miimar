const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const {loadSavedCredentialsIfExist, saveCredentials, authorize, getValues, returnBatchRanges, returnEntries, editEntry} = require('../googleAuth')
const {spreadsheetId} = require('../config.json')
const {Character,Location,worldEvent,Faction,Item} = require('./entryClasses.js')

 
//Command should have one parameter, which is what item name it's looking for. From there, it checks through the spreadsheet and finds potential matches,
//adding each to a @fields array, which should be sent in an embed containing each entry's category. After that, the user enters which entry is/might be 
//correct using a string select menu, and the command constructs the appropriate object. Write a method for each class that constructs an embed appropriate to the 
//category.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkentry')
		.setDescription('Provides information about an existing entry.')
		.addStringOption(option => 
			option.setName('name')
			.setDescription('Name of the entry to search for')
			.setRequired(true))
		.addStringOption(option =>
			option.setName('category')
			.setDescription('Optionally have me only look in a certain category for this name')
			.setRequired(false)
			.addChoices(
				{name: 'Characters', value: 'characters'},
				{name: 'Locations', value: 'event'},
				{name: 'Events', value: 'worldEvent'},
				{name: 'Faction', value: 'faction'},
				{name: 'Item', value: 'item'},
			)),

	async execute(interaction) {




		const collectorFilter = i => i.user.id === interaction.user.id;
		let name = interaction.options.getString('name');
		let range = interaction.options.getString('category') ?? false;
		await interaction.deferReply();

		const fields = [];
		let matchIndex = 0;
		const possibleMatchFilter = i => i.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(i.name.toLowerCase());
		let isEntryFilled = false;

		//this first checks to see if there's any value in range to narrow down which command has been selected. 
		//This first step checks the WHOLE spreadsheet for any matches to the entry name.
		if (!range){
			const possibleMatches = [];
			const batchRange = ['characters', 'locations', 'events', 'items', 'factions'];
			const searchData = await returnBatchRanges(spreadsheetId, batchRange, 'COLUMNS')


//the following code block pushes all entries retrieved (i.e, the entire fuckin spreadsheet) into a multidimensional array, and then formats each entry into
//an embed compatible array of objects.
			searchData.data.valueRanges.forEach(element =>{
				possibleMatches.push(element.values[0])
			});
			possibleMatches.forEach(element =>
				element.shift());
			possibleMatches.forEach((element, category) => 
				element.forEach(innerEle =>
					fields.push({name: innerEle, value: `From ${batchRange[category]}`}))
				)
console.log(fields);


//next, we narrow down the pool. check to see if any of the entries were an exact match. If it was, the data for the value is retrieved and 
//an object is constructed based on the range and using the values retrieved from the spreadsheet.
			for (x of fields){
				if (x.name.toLowerCase() === name.toLowerCase()) {
					range = x.value.substr(5);
					switch(range){
						case 'characters':
							var newEntry = new Character();
							break;
						case 'locations':
							var newEntry = new Location();
							break;
						case 'events':
							var newEntry = new worldEvent();
							break;
						case 'items':
							var newEntry = new Item();
							break;
						case 'factions':
							var newEntry = new Faction();
					}
					let dataSearch = await returnEntries(spreadsheetId, range, "ROWS");
					for (y of dataSearch.data.values) {
						if (y[0].toLowerCase() === name.toLowerCase()) {
							newEntry.assignValues(y);
							isEntryFilled = true;
							break;
						}
					}
					break;
					
				}
			}


			//Following code block runs if an exact match for the name isn't found.
			//It searches for anything that might be close.
			if (!isEntryFilled) { 
			const realFields = [];
			fields.forEach(element =>{
				if (possibleMatchFilter(element)) {
					realFields.push(element)
				}
		})
			if (realFields.length === 0){ //If this array is empty, the bot could not find anything close to the name entered.
			 await interaction.followUp(`I couldn't find any matches or possible matches for ${name}. Sorry!`)
			 return;
		} 
			const matchesEmbed = {
			color: 0x33FFBD,
			title: `Miimar entries`,
			description: `I didn't find any exact matches for ${name}. Did you mean one of these following entries?`,
			fields: realFields
		}
		const select = new StringSelectMenuBuilder()
			.setCustomId('duplicates')
			.setPlaceholder('Select an entry that you may have possibly meant, or "None of the above" if there was no error.')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel("None of the above.")
					.setDescription(`Use this option if none of these options are entries you wanted to access, ending the command.`)
					.setValue('noDuplicate'),
			
			);
		realFields.forEach((element, index) => {
			select.addOptions(
				new StringSelectMenuOptionBuilder()
				.setLabel(element.name)
				.setDescription(element.value)
				.setValue(`${element.value.substr(5)}${index}`),
			);
			})
		const selectRow = new ActionRowBuilder()
			.addComponents(select);
		const response = await interaction.editReply({embeds: [matchesEmbed], components: [selectRow]});
		await response.awaitMessageComponent({filter: collectorFilter, time: 300_000})
			.then(async selectInteraction => {
				if(selectInteraction.values[0] === 'noDuplicate'){
					await selectInteraction.update({content: `Understood. Ending command.`, components: [], embeds: [] });
					return;
				} else {
					await selectInteraction.deferUpdate();
					matchIndex = selectInteraction.values[0].slice(-1)
					range = realFields[matchIndex].value.substr(5);
					console.log(range);
					await selectInteraction.deleteReply();
				}
			})
			.catch(e => console.log(e))
			switch(range){
				case 'characters':
					var newEntry = new Character();
					break;
				case 'locations':
					var newEntry = new Location();
					break;
				case 'events':
					var newEntry = new worldEvent();
					break;
				case 'items':
					var newEntry = new Item();
					break;
				case 'factions':
					var newEntry = new Faction();
			}
			let dataSearch = await returnEntries(spreadsheetId, range, "ROWS");
			for (y of dataSearch.data.values) {
				if (y[0].toLowerCase() === realFields[matchIndex].name.toLowerCase()) {
					newEntry.assignValues(y);
					isEntryFilled = true;
					console.log(newEntry.notes);
					break;
				}
			}
		}

		} else { //code block in case a category is specified.
			switch(range){
				case 'characters':
					var newEntry = new Character();
					break;
				case 'locations':
					var newEntry = new Location();
					break;
				case 'events':
					var newEntry = new worldEvent();
					break;
				case 'items':
					var newEntry = new Item();
					break;
				case 'factions':
					var newEntry = new Faction();
			}	
			const searchData = await returnEntries(spreadsheetId, range, 'ROWS')
			const possibleMatches = searchData.data.values;
			possibleMatches.shift();
			const matchFields = [];
			for (x of possibleMatches) {
				if (x[0].toLowerCase() === name.toLowerCase()){
					newEntry.assignValues(x);
					isEntryFilled = true;
					break;
				} else if(x[0].toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(x[0].toLowerCase())) {
					matchFields.push(
						{
							name: x[0],
							value: `from ${range}`
						}
					)
				}
			}

			if( !isEntryFilled && matchFields.length === 0){
				await interaction.followUp(`I couldn't find any matches or possible matches for ${name}. Sorry!`);
				return;
			} else if(!isEntryFilled) {
				const matchesEmbed = {
					color: 0x33FFBD,
					title: `Miimar entries`,
					description: `I didn't find any exact matches for ${name}. Did you mean one of these following entries?`,
					fields: matchFields
				}

				const select = new StringSelectMenuBuilder()
				.setCustomId('duplicates')
				.setPlaceholder('Select an entry that you may have possibly meant, or "None of the above" if there was no error.')
				.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel("None of the above.")
						.setDescription(`Use this option if none of these options are entries you wanted to access, ending the command.`)
						.setValue('noDuplicate'),
				
				);
			matchFields.forEach((element, index) => {
				select.addOptions(
					new StringSelectMenuOptionBuilder()
					.setLabel(element.name)
					.setDescription(element.value)
					.setValue(`${element.value.substr(5)}${index}`),
				);
				})
			const selectRow = new ActionRowBuilder()
				.addComponents(select);

			const response = await interaction.editReply({embeds: [matchesEmbed], components: [selectRow]});

			await response.awaitMessageComponent({filter: collectorFilter, time: 300_000})
				.then(async selectInteraction => {
					if(selectInteraction.values[0] === 'noDuplicate'){
						await selectInteraction.update({content: `Understood. Ending command.`, components: [], embeds: [] });
						return;
					} else {
						await selectInteraction.deferUpdate();
						matchIndex = selectInteraction.values[0].slice(-1)
						console.log(range);
						await selectInteraction.deleteReply();
					}
				})
				.catch(e => console.log(e))
				name = matchFields[matchIndex].name;

				for (x of possibleMatches) {
					if (x[0].toLowerCase() === name.toLowerCase()){
						newEntry.assignValues(x);
						isEntryFilled = true;
						break;
					} 
				}
			}

		}

		const editButton = new ButtonBuilder()
		.setCustomId(`edit`)
		.setLabel(`Edit`)
		.setStyle(ButtonStyle.Success)
		.setEmoji(`✍️`);

		const deleteButton = new ButtonBuilder()
		.setCustomId(`delete`)
		.setLabel(`Delete`)
		.setStyle(ButtonStyle.Danger)
		.setEmoji(`🗑️`);

		const endButton = new ButtonBuilder()
		.setCustomId(`close`)
		.setLabel(`Close`)
		.setStyle(ButtonStyle.Primary)
		.setEmoji(`👋`);

		const optionsRow = new ActionRowBuilder()
		.addComponents(editButton, endButton, deleteButton);

		const entryDisplay = await interaction.followUp({content: `Here's the information you requested!`, embeds: [newEntry.createEmbed()], components: [optionsRow]})//add button prompts for editing data, deleting data, or ending the interaction
		await entryDisplay.awaitMessageComponent({filter: collectorFilter})
			.then(async entryInteraction =>{
				switch(entryInteraction.customId) {
					case `close`:
						await entryDisplay.delete(); //there isnt an interaction to delete!!
						return;
					case `edit`:
						await entryInteraction.showModal(newEntry.createModal());
						await entryInteraction.awaitModalSubmit({filter: collectorFilter, time: 300_000})
							.then(async mInteraction => {
								const modalData = mInteraction.fields.fields.map(item => item.value);
								await mInteraction.deferReply();
								newEntry.assignValues(modalData);
								const editData = Object.values(newEntry);
								await editEntry(spreadsheetId, range, editData);
								await mInteraction.editReply({embeds: [newEntry.createEmbed()], content: `Here's the edited data, please relaunch the command if you need to edit again!`, components: []});
								return;
							})
							.catch(error => console.log(error));

				}

	})

	}
}
