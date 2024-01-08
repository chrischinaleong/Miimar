const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

class Character{
    constructor(name, age, allegiance, profession, location, notes){
        this.name = name;
        this.age = age;
        this.allegiance = allegiance;
        this.profession = profession;
        this.location = location;
        this.notes = notes;
    }
    assignValues(values){ //Assigns an array of values to the properties of this object.
        if (values.length == Object.values(this).length){
        this.name = values[0];
        this.age = values[1];
        this.allegiance = values[2];
        this.profession = values[3];
        this.location = values[4];
        this.notes = values[5];
        }
        else {
            this.age = values[0];
            this.allegiance = values[1];
            this.profession = values[2];
            this.location = values[3];
            this.notes = values[4];
        }
    }
    createModal(){ //returns a modal to be presented with discord.js's methods.
        this.autoPopulate();
        const modal = new ModalBuilder()
            .setCustomId('dataModal')
            .setTitle(`${this.name}`);
        const charAge = new TextInputBuilder()
            .setCustomId('charAge')
            .setLabel(`How old is this person`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.age)
            .setPlaceholder(this.age);
        
        const charAllegiance = new TextInputBuilder()
            .setCustomId('charAllegiance')
            .setLabel(`What faction are they mainly allied with?`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.allegiance)
            .setPlaceholder(this.allegiance);
        
        const charProfession = new TextInputBuilder()
            .setCustomId('charProfession')
            .setLabel(`What is their profession?`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.profession)
            .setPlaceholder(this.profession);

        const charLocation = new TextInputBuilder()
            .setCustomId('charLocation')
            .setLabel(`Where can we find them`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.location)
            .setPlaceholder(this.location);
        
        const charNotes = new TextInputBuilder()
         .setCustomId('charNotes')
         .setLabel(`Enter additional notes and relevant info.`)
         .setStyle(TextInputStyle.Paragraph)
         .setValue(this.notes);
         //.setPlaceholder(this.notes);

         const firstActionRow = new ActionRowBuilder().addComponents(charAge);
         const secondActionRow = new ActionRowBuilder().addComponents(charAllegiance);
         const thirdActionRow = new ActionRowBuilder().addComponents(charProfession);
         const fourthActionRow = new ActionRowBuilder().addComponents(charLocation);
         const fifthActionRow = new ActionRowBuilder().addComponents(charNotes);
        
         modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow)
         return modal;
    }
    autoPopulate(){ //method to be used within other methods in order to autopopulate empty properties
        let loopCounter = 0;
        for (let x in this){
            if (loopCounter == 0){
                loopCounter = 1;
                continue;
            } else if (!this[x]) {
                this[x] = `---`;
                loopCounter += 1;
            }
        }
    }
    assignFromModal(modal){
        /*
        this.age = modal.fields.getTextInputValue('charAge');
        this.allegiance = modal.fields.getTextInputValue('charAllegiance');
        this.profession = modal.fields.getTextInputValue('charProfession');
        this.location = modal.fields.getTextInputValue('charLocation');
        this.notes = modal.fields.getTextInputValue('charNotes');
        */
       return console.log(modal.fields.fields.map(item => item.value));

    }
    createEmbed(){
        this.autoPopulate();
        const characterFields = Object.values(this);
        const embed = {
            color: 0x75FF33,
            title: characterFields[0],
            description: characterFields[5],
            fields: [
                {
                    name: `Age:`,
                    value: characterFields[1],
                    inline: true
                },
                {
                    name: `Allegiance`,
                    value: characterFields[2],
                    inline: true
                },
                {
                    name: `Profession`,
                    value: characterFields[3],
                    inline: true
                },
                {
                    name: `Location`,
                    value: characterFields[4],
                    inline: true
                }
            ]

            

        }
        return embed;
    }
}
class Location{
    constructor(name, facAssociation, type, notes){
        this.name = name;
        this.association = facAssociation;
        this.type = type;
        this.notes = notes;
    }
    assignValues(values){
        if (values.length == Object.values(this).length) {
        this.name = values[0];
        this.association = values[1];
        this.type = values[2];
        this.notes = values[3];

    } else {
        this.association = values[0];
        this.type = values[1];
        this.notes = values[2];
    }
}
    createModal(){
        this.autoPopulate();
        const modal = new ModalBuilder()
            .setCustomId('dataModal')
            .setTitle(`${this.name}`);
        const locAssociation = new TextInputBuilder()
            .setCustomId('locAssociation')
            .setLabel(`What factions are associated with this place?`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.association)
            .setPlaceholder(this.association);
        const locType = new TextInputBuilder()
            .setCustomId('locType')
            .setLabel(`What kind of place is this`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.type)
            .setPlaceholder(this.type);
        const locNotes = new TextInputBuilder()
            .setCustomId('locNotes')
            .setLabel(`Enter additional notes and relevant info.`)
            .setStyle(TextInputStyle.Paragraph)
            .setValue(this.notes);
            //.setPlaceholder(this.notes);
        const firstActionRow = new ActionRowBuilder().addComponents(locAssociation);
        const secondActionRow = new ActionRowBuilder().addComponents(locType);
        const thirdActionRow = new ActionRowBuilder().addComponents(locNotes);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        return modal;
    }
    autoPopulate(){ 
        let loopCounter = 0;
        for (let x in this){
            if (loopCounter == 0){
                loopCounter = 1;
                continue;
            } else if (!this[x]) {
                this[x] = `---`;
                loopCounter += 1;
            }
        }
    }
    createEmbed(){
        this.autoPopulate();
        const locationFields = Object.values(this);
        const embed = {
            color: 0xFF33DB,
            title: locationFields[0],
            description: locationFields[3],
            fields: [
                {
                name: `Faction association`,
                value: locationFields[1],
                inline: true
            },
            {
                name: `Type of place`,
                value: locationFields[2],
                inline: true
            }
        ]
        }
        return embed;
    }
}

class worldEvent{
    constructor(name, date, factions, notes ){
        this.name = name;
        this.date = date;
        this.factions = factions;
        this.notes = notes;
    }
    assignValues(values){
        if (values.length == Object.values(this).length){
        this.name = values[0];
        this.date = values[1];
        this.factions = values[2];
        this.notes = values[3];
        } else {
            this.date = values[0];
            this.factions = values[1];
            this.notes = values[2];
        }
    
    }
    createModal(){
        this.autoPopulate();
        const modal = new ModalBuilder()
            .setCustomId('dataModal')
            .setTitle(`${this.name}`);
        
        const eventDate = new TextInputBuilder()
            .setCustomId('eventDate')
            .setLabel(`When did this occur?`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.date)
            .setPlaceholder(this.date);
        const eventFactions = new TextInputBuilder()
            .setCustomId('eventFactions')
            .setLabel(`What factions were involved?`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.factions)
            .setPlaceholder(this.factions);
        const eventNotes = new TextInputBuilder()
            .setCustomId('eventNotes')
            .setLabel('Enter additional notes or info.')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(this.notes);
            //.setPlaceholder(this.notes);

        const firstActionRow = new ActionRowBuilder().addComponents(eventDate);
        const secondActionRow = new ActionRowBuilder().addComponents(eventFactions);
        const thirdActionRow = new ActionRowBuilder().addComponents(eventNotes);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
        return modal;
    }
    autoPopulate(){ 
        let loopCounter = 0;
        for (let x in this){
            if (loopCounter == 0){
                loopCounter = 1;
                continue;
            } else if (!this[x]) {
                this[x] = `---`;
                loopCounter += 1;
            }
        }
    }
    createEmbed(){ 
        this.autoPopulate();
        const eventFields = Object.values(this);
        const embed = {
            color: 0x5733FF,
            title: eventFields[0],
            description: eventFields[3],
            fields: [
                {
                    name: `Date/Time of Occurrence`,
                    value: eventFields[1],
                    inline: true
                },
                {
                    name: `Factions Involved`,
                    value: eventFields[2],
                    inline: true
                }
            ]
            
        }
        return embed;
    }
}

class Item{
    constructor(name, foundLocation, owner, creator, notes){
        this.name = name;
        this.found = foundLocation;
        this.owner = owner;
        this.creator = creator;
        this.notes = notes;
    }
    assignValues(values){
        if (values.length == Object.values(this).length){
        this.name = values[0];
        this.found = values[1];
        this.owner = values[2];
        this.creator = values[3];
        this.notes = values[4];
        } else {
            this.found = values[0];
            this.owner = values[1];
            this.creator = values[2];
            this.notes = values[3];
        }
    }
    autoPopulate(){ 
        let loopCounter = 0;
        for (let x in this){
            if (loopCounter == 0){
                loopCounter = 1;
                continue;
            } else if (!this[x]) {
                this[x] = `---`;
                loopCounter += 1;
            }
        }
    }
    createModal(){
        this.autoPopulate();
        const modal = new ModalBuilder()
            .setCustomId('dataModal')
            .setTitle(`${this.name}`);
        
        const itemFound = new TextInputBuilder()
            .setCustomId('itemFound')
            .setLabel(`Where was this item found?`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.found)
            .setPlaceholder(this.found);

        const itemOwner = new TextInputBuilder()
            .setCustomId('itemOwner')
            .setLabel(`Who owns this item currently?`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.owner)
            .setPlaceholder(this.owner);
        const itemCreator = new TextInputBuilder()
            .setCustomId('itemCreator')
            .setLabel(`Who or what created this item`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.creator)
            .setPlaceholder(this.creator);
        const itemNotes = new TextInputBuilder()
            .setCustomId('itemNotes')
            .setLabel(`Enter additional notes and relevant info.`)
            .setStyle(TextInputStyle.Paragraph)
            .setValue(this.notes);
            //.setPlaceholder(this.notes);

        const firstActionRow = new ActionRowBuilder().addComponents(itemFound);
        const secondActionRow = new ActionRowBuilder().addComponents(itemOwner);
        const thirdActionRow = new ActionRowBuilder().addComponents(itemCreator);
        const fourthActionRow = new ActionRowBuilder().addComponents(itemNotes);
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
        return modal;
    }
    createEmbed(){
        this.autoPopulate();
        const itemFields = Object.values(this);
        const embed = {
            color: 0x33DBFF,
            title: itemFields[0],
            description: itemFields[4],
            fields: [
                {
                    name: `Found at`,
                    value: itemFields[1],
                    inline: true

                },
                {
                    name: `Owner`,
                    value: itemFields[2],
                    inline:true
                },
                {
                    name: `Creator`,
                    value: itemFields[3],
                    inline: true
                }
            ]
        }
        return embed;
    }
}

class Faction{
    constructor(name, objective, hqLocation, iMembers, notes){
        this.name = name;
        this.objective = objective;
        this.hqLocation = hqLocation;
        this.iMembers = iMembers;
        this.notes = notes;
    }
    createModal(){
        this.autoPopulate();
        const modal = new ModalBuilder()
            .setCustomId('dataModal')
            .setTitle(`${this.name}`);

        const factionObjective = new TextInputBuilder()
            .setCustomId('factionObjective')
            .setLabel(`What is this faction's goal?`)
            .setStyle(TextInputStyle.Paragraph)
            .setValue(this.objective)
            .setPlaceholder(this.objective);
        const factionHq = new TextInputBuilder()
            .setCustomId('factionHq')
            .setLabel(`Where is this faction's headquarters located?`)
            .setStyle(TextInputStyle.Short)
            .setValue(this.hqLocation)
            .setPlaceholder(this.hqLocation);
        const importantMembers = new TextInputBuilder()
            .setCustomId('importantMembers')
            .setLabel(`Who are this faction's notable members?`)
            .setStyle(TextInputStyle.Paragraph)
            .setValue(this.iMembers)
            .setPlaceholder(this.iMembers);
        const factionNotes = new TextInputBuilder()
            .setCustomId('factionNotes')
            .setLabel(`Enter additional notes and relevant info.`)
            .setStyle(TextInputStyle.Paragraph)
            .setValue(this.notes);
            //.setPlaceholder(this.notes);
        const firstActionRow = new ActionRowBuilder().addComponents(factionObjective);
        const secondActionRow = new ActionRowBuilder().addComponents(factionHq);
        const thirdActionRow = new ActionRowBuilder().addComponents(importantMembers);
        const fourthActionRow = new ActionRowBuilder().addComponents(factionNotes);
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
        return modal;
    }
    assignValues(values) {
        if (values.length == Object.values(this).length){
        this.name = values[0];
        this.objective = values[1];
        this.hqLocation = values[2];
        this.iMembers = values[3];
        this.notes = values[4];
        } else {
            this.objective = values[0];
            this.hqLocation = values[1];
            this.iMembers = values[2];
            this.notes = values[3];
        }
    }
    autoPopulate(){ 
        let loopCounter = 0;
        for (let x in this){
            if (loopCounter == 0){
                loopCounter = 1;
                continue;
            } else if (!this[x]) {
                this[x] = `---`;
                loopCounter += 1;
            }
        }
    }
    createEmbed(){
        this.autoPopulate();
        const factionFields = Object.values(this);
        const embed = {
            color: 0x5733FF,
            title: factionFields[0],
            description: factionFields[4],
            fields: [
                {
                    name: `Objective`,
                    value: factionFields[1],
                    inline: true
                },
                {
                    name: `Headquarters Location`,
                    value: factionFields[2],
                    inline: true
                },
                {
                    name: `Notable members`,
                    value: factionFields[3],
                    inline: true
                }
            ]
        } 
        return embed;
    }
}

module.exports ={
    Character,
    Location,
    worldEvent,
    Faction,
    Item
}