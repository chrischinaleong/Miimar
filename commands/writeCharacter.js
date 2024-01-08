const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');
const {loadSavedCredentialsIfExist, saveCredentials, authorize, writeValues, returnTableRange, returnEntries, appendValues} = require('../googleAuth')
const {spreadsheetId} = require('../config.json')
const {Character,Location,worldEvent,Faction,Item} = require('./entryClasses.js')


module.exports = {
        data: new SlashCommandBuilder()
            .setName('write')
            .setDescription('Add information about a character, location or item'),

        async execute(interaction) { //button & modal form component creation
			const characters = new ButtonBuilder()
			.setCustomId('characters')
			.setLabel('Characters')
			.setStyle(ButtonStyle.Primary);

			const locations = new ButtonBuilder()
			.setCustomId('locations')
			.setLabel('Locations')
			.setStyle(ButtonStyle.Primary);
			
			const events = new ButtonBuilder()
			.setCustomId('events')
			.setLabel('Events')
			.setStyle(ButtonStyle.Primary);
			
			const items = new ButtonBuilder()
			.setCustomId('items')
			.setLabel('Items')
			.setStyle(ButtonStyle.Primary);
			
			const factions = new ButtonBuilder()
			.setCustomId('factions')
			.setLabel('Factions')
			.setStyle(ButtonStyle.Primary);

			const yesConfirmation = new ButtonBuilder()
				.setCustomId('confirmation')
				.setLabel('Yes')
				.setStyle(ButtonStyle.Success);
			
			const noConfirmation = new ButtonBuilder()
			.setCustomId('rejection')
			.setLabel('No')
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder()
			.addComponents(characters, locations, events, items, factions);

		const confirmationRow = new ActionRowBuilder()
			.addComponents(yesConfirmation, noConfirmation);



	const response =	await interaction.reply({
			content: `What kind of entry would you like to make?`,
			components: [row],
	});


const collectorFilter = i => i.user.id === interaction.user.id;
const collectorFilterName = m => m.author.id === interaction.user.id;
const collectorDuplicateFilter = n => n.author.id === interaction.user.id && n.content.toLowerCase() != name.toLowerCase()
let name = '';
let range = '';


try {
	const confirmation = await response.awaitMessageComponent({filter: collectorFilter, time: 120000})
	range = confirmation.customId;
	await confirmation.deferUpdate();
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
	await confirmation.followUp({content: 'Selection received! Please enter a name for the entry.', components: [],});

	await interaction.channel.awaitMessages({filter: collectorFilterName, max: 1, time:60000})
		.then(collected => {
			console.log(collected.size)
			name = collected.first().content;
			confirmation.followUp({content: `Name received! Making entry for '${name}'; One moment...`, components: [],})
		}
		)
		.catch( error => {
			confirmation.followUp({content: `No valid input received within the time limit.`, components: [],})
			console.log(error);
		}
		);


	//Check for duplicate entries on the same sheet, presenting the option for the user to edit
	//said existing entry in a case where a duplicate is found, or renaming the current entry if not.
	const currentSheetData = await returnEntries(spreadsheetId, `'${range}'`, 'COLUMNS');
	let indexOfDupe = 0; // yet unused, can possibly be used to get the index of a duplicate
	const possibleDuplicates = [];

	for (x of currentSheetData.data.values[0]){ //Iterates through the name column
		indexOfDupe =  currentSheetData.data.values[0].indexOf(x);
		x = x.toLowerCase();
		const nameCheck = name.toLowerCase();
		if (x === nameCheck){ //If a duplicate is found, the following block of code runs.
			
			const duplicateResponse = await confirmation.followUp({content: `A duplicate entry was found for ${name}. Shall we edit this entry?`, components: [confirmationRow]});
			const duplicateConfirmation = await duplicateResponse.awaitMessageComponent({filter: collectorFilter, time: 120000}) 
			await duplicateConfirmation.deferUpdate(); 
			if (duplicateConfirmation.customId === 'confirmation'){
				await duplicateConfirmation.editReply({content: `Understood, fetching data for ${name}...`, components: []})
				//To do: make a method for the relevant objects that creates a modal form for the user to input data
				//Modal form contains existing data if any.
				let dupeData = await returnEntries(spreadsheetId, range, "ROWS");
				dupeData = dupeData.data.values[indexOfDupe];
				newEntry.assignValues(dupeData);
				console.log(newEntry.name);
				break;
			}	else { //forces the user to enter a new name for the entry, possibly going through the loop again.
				await duplicateConfirmation.editReply({content: `Please enter a new name for the entry in the channel. Entries identical to ${name} will be ignored.`, components: []});
				await interaction.channel.awaitMessages({filter: collectorDuplicateFilter, max: 1, time:60000})
				.then(collected => {
					console.log(collected.size)
					name = collected.first().content;
					duplicateConfirmation.followUp({content: `Name received! Checking for ${name}`, components: [],})
				}
				)
				.catch( error => {
					duplicateConfirmation.followUp({content: `No valid input received within the time limit.`, components: [],})
					console.log(error);
				}
				);
			}
		} else if(x.includes(nameCheck) || nameCheck.includes(x)) { //checks to see if the name provided is contained within the current entry and
			possibleDuplicates.push([indexOfDupe, x]); //adds it to an array to be presented with possible user errors later
		}


	}
	//TO DO: Final blocks of code, should actually get around to writing the data. Have it work on an if/else if control flow that checks if either
	//the name for the new entry is filled (a duplicate was found, and therefore data should have already been inputted), if not, then if there are values in the @possibleDuplcates
	//array (presents the user with options regarding the possible duplicates, moving on to the last option if the user selects 'None')
	//and finally, that the name entered is truly a unique entry, goes through the process of taking ALL the data from the user.
	//creating and presenting modals can likely be done with methods set up in entryClasses.js.
	if(newEntry.name) { //checks whether the name property of the new entry has been filled.
		const modalConfirm = await confirmation.followUp({content: `Are you ready to enter notes for ${newEntry.name}? 'No' will cancel this command.`, components: [confirmationRow]});
		await modalConfirm.awaitMessageComponent({filter:collectorFilter, time: 120000})
			.then(async confirmInteract => {
				await confirmInteract.showModal(newEntry.createModal());	
				confirmInteract.awaitModalSubmit({filter:collectorFilter, time: 840000 })
					.then(async mInteraction =>{
						const modalData = mInteraction.fields.fields.map(item => item.value);
						newEntry.assignValues(modalData);
						await mInteraction.deferUpdate();
						const finalData = Object.values(newEntry);
						const finalRange = `'${range}'!${indexOfDupe + 1}:${indexOfDupe + 1}`;
						console.log(finalRange);
						console.log(finalData);
						await writeValues(spreadsheetId, finalRange, finalData)
						.then(mInteraction.editReply({content: 'Entry complete!', components: []}))
						.catch(error => {
							console.log(error);
							mInteraction.update(`Didn't work.`);
						})
					})
					.catch(error => console.log(error))
			})
	}else if(possibleDuplicates.length != 0){ //checks whether there are possible
		const select = new StringSelectMenuBuilder()
			.setCustomId('duplicates')
			.setPlaceholder('Select an entry that you may have possibly meant, or "None of the above" if there was no error.')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel("None of the above.")
					.setDescription(`Use this option if you want to make a new entry, and not edit any of the other entries listed.`)
					.setValue('noDuplicate'),
			
			);
		const possibleDuplicatesMap = new Map(possibleDuplicates);
		possibleDuplicatesMap.forEach((value,key) => {
			select.addOptions(
				new StringSelectMenuOptionBuilder()
				.setLabel(value)
				.setDescription(`A possible existing entry.`)
				.setValue(`${key}`),
			)
		})
		const dupeCheckRow = new ActionRowBuilder()
			.addComponents(select);
		
		const errorResponse = await confirmation.followUp({content: `I checked and found a few possible existing entries that you may have meant. See if any of these apply and we can edit that.`,
		components: [dupeCheckRow]});

		try {
			const errorConfirm = await errorResponse.awaitMessageComponent({filter: collectorFilter, time: 300_000})
			if (errorConfirm.values[0] === 'noDuplicate') {
				newEntry.name = name;
				await errorConfirm.deferUpdate();
				const modalConfirm = await errorConfirm.followUp({content: `Understood. We'll make a new entry for ${name}. Are you ready to make your entry? 'No' will cancel this command.`,
				components: [confirmationRow]})
				await modalConfirm.awaitMessageComponent({filter:collectorFilter, time: 120000})
				.then(async confirmInteract => {
					await confirmInteract.showModal(newEntry.createModal());	
					confirmInteract.awaitModalSubmit({filter:collectorFilter, time: 840000 })
						.then(async mInteraction =>{
							const modalData = mInteraction.fields.fields.map(item => item.value);
							newEntry.assignValues(modalData);
							await mInteraction.deferUpdate();
							const finalData = Object.values(newEntry);
							const finalRange = `'${range}'!${indexOfDupe + 1}:${indexOfDupe + 1}`;
							console.log(finalRange);
							console.log(finalData);
							await appendValues(spreadsheetId, range, finalData)
							.then(mInteraction.editReply({content: 'Entry complete!', components: []}))
							.catch(error => {
								console.log(error);
								mInteraction.update(`Didn't work.`);
							})
						})
						.catch(error => console.log(error))
				})
				
			} else{
				let dupeData = await returnEntries(spreadsheetId, range, "ROWS");
				dupeData = dupeData.data.values[errorConfirm.values[0]];
				newEntry.assignValues(dupeData);
				await errorConfirm.deferUpdate();
				const modalConfirm = await errorConfirm.followUp({content: `Understood. We'll make a new entry for ${possibleDuplicatesMap.get(errorConfirm.values[0])}. Are you ready to make your entry? 'No' will cancel this command.`,
				components: [confirmationRow]})
				await modalConfirm.awaitMessageComponent({filter:collectorFilter, time: 120000})
				.then(async confirmInteract => {
					await confirmInteract.showModal(newEntry.createModal());	
					confirmInteract.awaitModalSubmit({filter:collectorFilter, time: 840000 })
						.then(async mInteraction =>{
							const modalData = mInteraction.fields.fields.map(item => item.value);
							newEntry.assignValues(modalData);
							await mInteraction.deferUpdate();
							const finalData = Object.values(newEntry);
							const finalRange = `'${range}'!${indexOfDupe + 1}:${indexOfDupe + 1}`;
							console.log(finalRange);
							console.log(finalData);
							await writeValues(spreadsheetId, finalRange, finalData)
							.then(mInteraction.editReply({content: 'Entry complete!', components: []}))
							.catch(error => {
								console.log(error);
								mInteraction.update(`Didn't work.`);
							})
						})
						.catch(error => console.log(error))
				})
			}
		}catch(e) {
			console.log(e)
		}
		
	}else {
		newEntry.name = name;
		const modalConfirm = await confirmation.followUp({content: `Understood. We'll make a new entry for ${name}. Are you ready to make your entry? 'No' will cancel this command.`, components: [confirmationRow]});
		await modalConfirm.awaitMessageComponent({filter:collectorFilter, time: 120000})
		.then(async confirmInteract => {
			await confirmInteract.showModal(newEntry.createModal());	
			confirmInteract.awaitModalSubmit({filter:collectorFilter, time: 840000 })
				.then(async mInteraction =>{
					const modalData = mInteraction.fields.fields.map(item => item.value);
					newEntry.assignValues(modalData);
					await mInteraction.deferUpdate();
					const finalData = Object.values(newEntry);
					const finalRange = `'${range}'!${indexOfDupe + 1}:${indexOfDupe + 1}`;
					console.log(finalRange);
					console.log(finalData);
					await appendValues(spreadsheetId, range, finalData)
					.then(mInteraction.editReply({content: 'Entry complete!', components: []}))
					.catch(error => {
						console.log(error);
						mInteraction.update(`Didn't work.`);
					})
				})
				.catch(error => console.log(error))
		})
		

	}
	
	
	
	
	
	/*
	const modalConfirm = await confirmation.followUp({content: `Are you ready to enter notes for ${newEntry.name}?`, components: [confirmationRow]});
	await modalConfirm.awaitMessageComponent({filter:collectorFilter, time: 120000})
		.then(confirmInteract => {
			confirmInteract.showModal(newEntry.createModal());
		})

	*/
}	catch(e) {
	//error handling
	if (e.name === 'Error [InteractionCollectorError]') {
		await interaction.editReply({content: `Option not selected within time limit.Command ended`, components: []})
		console.log(e)
	}
	else {
		await interaction.editReply({content: `Unknown error, process ended`, components: []})
		console.log(e);
	}
}



			
		



/*
            const tableRange = await returnTableRange('1UzpJQV2wIbF-c6mOyARz0Os4UFmFYB065UstqT7NZys', range)
            console.log(tableRange);
            await writeValues('1UzpJQV2wIbF-c6mOyARz0Os4UFmFYB065UstqT7NZys','A2:B2',name,information)
			
            await interaction.editReply(`You wanted to make an ${range}.`);
			*/
        }

}