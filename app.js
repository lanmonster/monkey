require('dotenv').config();

const axios = require('axios');
const Discord = require('discord.js');
const database = require('./models');
const ServiceFactory = require('./services/service-factory');

const client = new Discord.Client();

const richEmbedServiceDependencies = {
    richEmbed: Discord.RichEmbed,
};
const richEmbedService = ServiceFactory.createRichEmbedService(richEmbedServiceDependencies);

const databaseServiceDependencies = {
    db: database,
};
const databaseService = ServiceFactory.createDatabaseService(databaseServiceDependencies);

const mountainProjectServiceDependencies = {
    db: databaseService,
    http: axios,
    apiKey: process.env.mountainproject,
    richEmbedService,
    console,
};
const mountainProjectService = ServiceFactory.createMountainProjectService(mountainProjectServiceDependencies);

const discordServiceDependencies = {
    client,
    mountainProjectService,
    console,
};
const discordService = ServiceFactory.createDiscordService(discordServiceDependencies);

client.login(process.env[process.argv[2]]);
client.on('ready', discordService.onReady);
client.on('guildMemberAdd', discordService.onNewMember);
client.on('message', discordService.onMessage);
