const Discord = require('discord.js');
const richEmbedService = require('./richembed.service');
const testdata = require('../testdata/testdata');
const COMMAND_NAMES = require('../utils/mp-supported-methods');

/* eslint-disable */
const mpIconUrl = 'https://is5-ssl.mzstatic.com/image/thumb/Purple118/v4/a4/81/d2/a481d2af-405f-b611-fabb-d7875e97b086/AppIcon-0-1x_U007emarketing-0-0-85-220-0-7.png/246x0w.jpg';
const fullDescription = `From: ${testdata.fullMpUserData.location}\nFavorite Climbs: ${testdata.fullMpUserData.favoriteClimbs}\nOther Interests: ${testdata.fullMpUserData.otherInterests}\nBlurb: ${testdata.fullMpUserData.personalText}`;
/* eslint-enable */

/* eslint-disable max-len */
describe('Rich Embed Service', () => {
    let testObject;
    beforeEach(() => {
        testObject = richEmbedService({ richEmbed: Discord.RichEmbed });
    });
    describe('createForUser', () => {
        it('should create RichEmbed for user data', () => {
            const actual = testObject.createForUser(testdata.fullMpUserData);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(testdata.fullMpUserData.name, mpIconUrl, testdata.fullMpUserData.url)
                .setThumbnail(testdata.fullMpUserData.avatar)
                .setDescription(fullDescription)
                .addField('Boulders', testdata.fullMpUserData.styles.Boulders.lead)
                .addField('Trad Lead', testdata.fullMpUserData.styles.Trad.lead, true)
                .addField('Trad Follow', testdata.fullMpUserData.styles.Trad.follow, true)
                .addField('Sport Lead', testdata.fullMpUserData.styles.Sport.lead, true)
                .addField('Sport Follow', testdata.fullMpUserData.styles.Sport.follow, true)
                .addField('Aid Lead', testdata.fullMpUserData.styles.Aid.lead, true)
                .addField('Aid Follow', testdata.fullMpUserData.styles.Aid.follow, true)
                .addField('Ice Lead', testdata.fullMpUserData.styles.Ice.lead, true)
                .addField('Ice Follow', testdata.fullMpUserData.styles.Ice.follow, true)
                .addField('Mixed Lead', testdata.fullMpUserData.styles.Mixed.lead, true)
                .addField('Mixed Follow', testdata.fullMpUserData.styles.Mixed.follow, true)
                .setFooter(`Joined Mountain Project on ${testdata.fullMpUserData.memberSince}`);

            expect(actual).toEqual(expected);
        });
        it('should not have fields for empty values', () => {
            const actual = testObject.createForUser(testdata.mpUserData);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(testdata.mpUserData.name, mpIconUrl, testdata.mpUserData.url)
                .setThumbnail(testdata.mpUserData.avatar)
                .setDescription(`From: ${testdata.mpUserData.location}`)
                .addField('Boulders', testdata.mpUserData.styles.Boulders.lead)
                .addField('Sport Lead', testdata.mpUserData.styles.Sport.lead, true)
                .addField('Sport Follow', testdata.mpUserData.styles.Sport.follow, true)
                .setFooter(`Joined Mountain Project on ${testdata.mpUserData.memberSince}`);

            expect((actual)).toEqual((expected));
        });
        it('should not have sections in the description for empty values', () => {
            const input = {
                name: 'name',
                url: 'url',
                avatar: 'avatar',
                memberSince: 'now',
                favoriteClimbs: 'pink one in the corner',
                personalText: 'my personal blurb',
            };
            const actual = testObject.createForUser(input);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(input.name, mpIconUrl, input.url)
                .setThumbnail(input.avatar)
                .setDescription(`Favorite Climbs: ${input.favoriteClimbs}\nBlurb: ${input.personalText}`)
                .setFooter(`Joined Mountain Project on ${input.memberSince}`);

            expect((actual)).toEqual(
                (expected),
            );
        });
        it('should have a sensible default for description if all values are empty', () => {
            const input = {
                name: 'name',
                url: 'url',
                avatar: 'avatar',
                memberSince: 'now',
            };
            const actual = testObject.createForUser(input);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(input.name, mpIconUrl, input.url)
                .setThumbnail(input.avatar)
                .setDescription('*No data on Mountain Project Profile*')
                .setFooter(`Joined Mountain Project on ${input.memberSince}`);

            expect((actual)).toEqual(
                (expected),
            );
        });
    });
    describe('createForRoutes', () => {
        it('should create RichEmbed for route data', () => {
            const route = testdata.trimmedMpRoutesAtData.routes[0];
            const actual = testObject.createForRoutes({ routes: [route] });

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(route.name, mpIconUrl, route.url)
                .setDescription(
                    `${route.pitches} pitch${
                        route.pitches > 1 ? 'es' : ''
                    } in ${route.location.join(' > ')}`,
                )
                .setThumbnail(route.imgSqSmall)
                .addField('Style', route.type, true)
                .addField('Grade', route.rating, true)
                .addField('Stars', '⭐⭐⭐', true)
                .addField('Votes', route.starVotes, true)
                .addField('Latitude', route.latitude, true)
                .addField('Longitude', route.longitude, true)
                .setImage(route.imgMedium);

            expect(actual).toEqual([expected]);
        });
        it('should show a 💣  if stars is 1', () => {
            const route = {
                stars: 1,
                pitches: '',
                rating: 'not relevant',
                location: [],
            };

            const actual = testObject.createForRoutes({ routes: [route] });

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(route.name, mpIconUrl, route.url)
                .setDescription(
                    `${route.pitches} pitch${
                        route.pitches > 1 ? 'es' : ''
                    } in ${route.location.join(' > ')}`,
                )
                .setThumbnail(route.imgSqSmall)
                .addField('Style', route.type, true)
                .addField('Grade', route.rating, true)
                .addField('Stars', '💣', true)
                .addField('Votes', route.starVotes, true)
                .addField('Latitude', route.latitude, true)
                .addField('Longitude', route.longitude, true)
                .setImage(route.imgMedium);

            expect(actual).toEqual([expected]);
        });
        it('should say `Boulder problem` if pitches is empty string and rating starts with V', () => {
            const route = {
                stars: 1,
                pitches: '',
                rating: 'V',
                location: [],
            };

            const actual = testObject.createForRoutes({
                routes: [route],
            });

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(route.name, mpIconUrl, route.url)
                .setDescription(`Boulder problem in ${route.location.join(' > ')}`)
                .setThumbnail(route.imgSqSmall)
                .addField('Style', route.type, true)
                .addField('Grade', route.rating, true)
                .addField('Stars', '💣', true)
                .addField('Votes', route.starVotes, true)
                .addField('Latitude', route.latitude, true)
                .addField('Longitude', route.longitude, true)
                .setImage(route.imgMedium);

            expect(actual).toEqual([expected]);
        });
        it('should handle a location that is not an array', () => {
            const route = {
                stars: 1,
                pitches: 69,
                rating: 'not relevant',
                location: 'location > from > db > is > already > a > string',
            };

            const actual = testObject.createForRoutes({ routes: [route] });

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(route.name, mpIconUrl, route.url)
                .setDescription(
                    `${route.pitches} pitch${
                        route.pitches > 1 ? 'es' : ''
                    } in ${route.location}`,
                )
                .setThumbnail(route.imgSqSmall)
                .addField('Style', route.type, true)
                .addField('Grade', route.rating, true)
                .addField('Stars', '💣', true)
                .addField('Votes', route.starVotes, true)
                .addField('Latitude', route.latitude, true)
                .addField('Longitude', route.longitude, true)
                .setImage(route.imgMedium);

            expect(actual).toEqual([expected]);
        });
        it('should return an array of RichEmbeds, one for each route passed in', () => {
            const route = testdata.trimmedMpRoutesAtData.routes[0];
            const actual = testObject.createForRoutes({ routes: [route, route] });

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(route.name, mpIconUrl, route.url)
                .setDescription(
                    `${route.pitches} pitch${
                        route.pitches > 1 ? 'es' : ''
                    } in ${route.location.join(' > ')}`,
                )
                .setThumbnail(route.imgSqSmall)
                .addField('Style', route.type, true)
                .addField('Grade', route.rating, true)
                .addField('Stars', '⭐⭐⭐', true)
                .addField('Votes', route.starVotes, true)
                .addField('Latitude', route.latitude, true)
                .addField('Longitude', route.longitude, true)
                .setImage(route.imgMedium);

            expect(actual).toEqual([expected, expected]);
        });
    });
    describe('createForHelp', () => {
        it('should create richEmbed for get user', () => {
            const actual = testObject.createForHelp(['user']);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor('!mp user <userId | email>')
                .setDescription(
                    'Fetches user data from [MountainProject.com](https://www.mountainproject.com).\nIf you have an account, you can navigate to your profile there, and copy the string of numbers from the url.```https://www.mountainproject.com/user/<COPY THIS PART>/<your user name>```Alternatively, you can just use your email address.',
                )
                .addField('Example 1', '`!mp user 12345678`', true)
                .addField('Example 2', '`!mp user foo@bar.com`', true)
                .addField(
                    'Shortcut',
                    'You can use `!mp save <userId | email>` to enable the shorthand notation',
                    true,
                )
                .addField('Shorthand Notation', '`!mp user`', true)
                .setFooter(
                    'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                    'https://cash.app/favicon.png',
                );

            expect(actual).toEqual(expected);
        });
        it('should create richEmbed for get ticks', () => {
            const actual = testObject.createForHelp(['ticks']);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor('!mp ticks <userId | email>')
                .setDescription(
                    'Fetches user\'s tick list from [MountainProject.com](https://www.mountainproject.com).\nIf you have an account, you can navigate to your profile there, and copy the string of numbers from the url.```https://www.mountainproject.com/user/<COPY THIS PART>/<your user name>```Alternatively, you can just use your email address.',
                )
                .addField('Example 1', '`!mp ticks 12345678`', true)
                .addField('Example 2', '`!mp ticks foo@bar.com`', true)
                .addField(
                    'Shortcut',
                    'You can use `!mp save <userId | email>` to enable the shorthand notation',
                    true,
                )
                .addField('Shorthand Notation', '`!mp ticks`', true)
                .setFooter(
                    'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                    'https://cash.app/favicon.png',
                );

            expect(actual).toEqual(expected);
        });
        it('should create richEmbed for get todos', () => {
            const actual = testObject.createForHelp(['todos']);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor('!mp todos <userId | email>')
                .setDescription(
                    'Fetches user\'s todo list from [MountainProject.com](https://www.mountainproject.com).\nIf you have an account, you can navigate to your profile there, and copy the string of numbers from the url.```https://www.mountainproject.com/user/<COPY THIS PART>/<your user name>```Alternatively, you can just use your email address.',
                )
                .addField('Example 1', '`!mp todos 12345678`', true)
                .addField('Example 2', '`!mp todos foo@bar.com`', true)
                .addField(
                    'Shortcut',
                    'You can use `!mp save <userId | email>` to enable the shorthand notation',
                    true,
                )
                .addField('Shorthand Notation', '`!mp todos`', true)
                .setFooter(
                    'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                    'https://cash.app/favicon.png',
                );

            expect(actual).toEqual(expected);
        });
        it('should create richEmbed for get routes', () => {
            const actual = testObject.createForHelp(['routes']);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor('!mp routes [routeId [routeId [routeId ...]]]')
                .setDescription(
                    'Fetches route data from [MountainProject.com](https://www.mountainproject.com).\nTo find a routeId, find it on Mountain Project, then copy the string of numbers from the url```https://www.mountainproject.com/route/<COPY THIS PART>/<route name>````',
                )
                .addField(
                    'Example 1',
                    '`!mp routes 12345678 87654321 6872364 43546784`',
                    true,
                )
                .addField('Example 2', '`!mp routes 82673473`', true)
                .setFooter(
                    'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                    'https://cash.app/favicon.png',
                );

            expect(actual).toEqual(expected);
        });
        it('should create richEmbed for get routesAt', () => {
            const actual = testObject.createForHelp(['routesAt']);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor(
                    '!mp routesAt <lat> <lon> [maxDistance] [maxResults] [minDiff] [maxDiff]',
                )
                .setDescription(
                    'Fetches route data by latitude and longitude from [MountainProject.com](https://www.mountainproject.com).',
                )
                .addField('Example 1', '`!mp routesAt 123.45 98.76`', true)
                .addField('Example 2', '`!mp routesAt  123.45 98.76 maxDistance=5`', true)
                .addField('Example 3', '`!mp routesAt  123.45 98.76 maxDistance=5 maxResults=6 minDiff=5.12 maxDiff=5.13a`', true)
                .addField('Example 4', '`!mp routesAt  123.45 98.76 minDiff=V16 maxResults=20`', true)
                .setFooter(
                    'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                    'https://cash.app/favicon.png',
                );

            expect(actual).toEqual(expected);
        });
        it('should create richEmbed for save id', () => {
            const actual = testObject.createForHelp(['save']);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor('!mp save <userId | email>')
                .setDescription('Saves your userId or email to enable shorthand notation of certain other commands.')
                .addField('Example 1', '!mp save 123456789', true)
                .addField('Example 2', '!mp save foo@bar.com', true)
                .setFooter(
                    'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                    'https://cash.app/favicon.png',
                );

            expect(actual).toEqual(expected);
        });
        it('should create richEmbed for get id', () => {
            const actual = testObject.createForHelp(['get']);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor('!mp get')
                .setDescription('Gets the userId or email you previously saved.')
                .addField('Example', '!mp get')
                .setFooter(
                    'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                    'https://cash.app/favicon.png',
                );

            expect(actual).toEqual(expected);
        });
        it('should create richEmbed for delete id', () => {
            const actual = testObject.createForHelp(['delete']);

            const expected = new Discord.RichEmbed()
                .setColor('#7286D5')
                .setAuthor('!mp delete')
                .setDescription(
                    'Deletes the userId or email you previously saved.',
                )
                .addField('Example', '!mp delete')
                .setFooter(
                    'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                    'https://cash.app/favicon.png',
                );

            expect(actual).toEqual(expected);
        });
        it('should return array of all richEmbeds if `all` is passed', () => {
            const actual = testObject.createForHelp(['all']);

            expect(actual).toBeInstanceOf(Array);
            expect(actual.length).toEqual(Object.keys(COMMAND_NAMES).length - 1);
            actual.forEach((item) => {
                expect(item).toBeInstanceOf(Discord.RichEmbed);
            });
        });
        it('should return array of all richEmbeds if no parameter is passed', () => {
            const actual = testObject.createForHelp([]);

            expect(actual).toBeInstanceOf(Array);
            expect(actual.length).toEqual(Object.keys(COMMAND_NAMES).length - 1);
            actual.forEach((item) => {
                expect(item).toBeInstanceOf(Discord.RichEmbed);
            });
        });
        it('should throw an error if a param was passed that we cant help with', () => {
            let actual;
            try {
                testObject.createForHelp(['asdkfjh']);
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(new Error('Sorry, I can\'t help with that'));
        });
    });
});
