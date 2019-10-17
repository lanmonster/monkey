const testObject = require('./service-factory');
const DiscordService = require('./discord.service');
const MountainProjectService = require('./mountainproject.service');
const RichEmbedService = require('./richembed.service');
const DatabaseService = require('./database.service');

jest.mock('./discord.service');
jest.mock('./mountainproject.service');
jest.mock('./richembed.service');
jest.mock('./database.service');

describe('Service Factory', () => {
    it('should create a Discord Service', () => {
        const deps = {};

        testObject.createDiscordService(deps);

        expect(DiscordService).toHaveBeenCalledWith(deps);
    });

    it('should create a Mountain Project Service', () => {
        const deps = {};

        testObject.createMountainProjectService(deps);

        expect(MountainProjectService).toHaveBeenCalledWith(deps);
    });

    it('sould create a Rich Embed Service', () => {
        const deps = {};

        testObject.createRichEmbedService(deps);

        expect(RichEmbedService).toHaveBeenCalledWith(deps);
    });

    it('sould create a Database Service', () => {
        const deps = {};

        testObject.createDatabaseService(deps);

        expect(DatabaseService).toHaveBeenCalledWith(deps);
    });
});
