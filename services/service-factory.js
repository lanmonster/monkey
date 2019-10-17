const DiscordService = require('./discord.service');
const MountainProjectService = require('./mountainproject.service');
const RichEmbedService = require('./richembed.service');
const DatabaseService = require('./database.service');

module.exports = {
    createDiscordService(dependencies) {
        return DiscordService(dependencies);
    },
    createMountainProjectService(dependencies) {
        return MountainProjectService(dependencies);
    },
    createRichEmbedService(dependencies) {
        return RichEmbedService(dependencies);
    },
    createDatabaseService(dependencies) {
        return DatabaseService(dependencies);
    },
};
