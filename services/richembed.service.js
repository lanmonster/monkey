// eslint-disable-next-line max-len
const mountainProjectIconUrl = 'https://is5-ssl.mzstatic.com/image/thumb/Purple118/v4/a4/81/d2/a481d2af-405f-b611-fabb-d7875e97b086/AppIcon-0-1x_U007emarketing-0-0-85-220-0-7.png/246x0w.jpg';
const COMMAND_NAMES = require('../utils/mp-supported-methods');

const buildUserDescription = ({
    location,
    favoriteClimbs,
    otherInterests,
    personalText,
}) => {
    let result = '';
    if (location) result += `From: ${location}`;
    if (favoriteClimbs) { result += `${result ? '\n' : ''}Favorite Climbs: ${favoriteClimbs}`; }
    if (otherInterests) { result += `${result ? '\n' : ''}Other Interests: ${otherInterests}`; }
    if (personalText) result += `${result ? '\n' : ''}Blurb: ${personalText}`;
    return result || '*No data on Mountain Project Profile*';
};

const buildRouteDescription = ({ pitches, location, rating }) => {
    const routeInfo = rating.startsWith('V')
        ? 'Boulder problem'
        : `${pitches} pitch${pitches > 1 ? 'es' : ''}`;
    return `${routeInfo} in ${
        location instanceof Array ? location.join(' > ') : location
    }`;
};

const buildRouteStars = ({ stars }) => (stars === 1 ? '💣' : '⭐'.repeat(stars - 1));

/* eslint-disable max-len */
module.exports = ({ richEmbed: RichEmbed }) => ({
    createForUser: ({
        name,
        url,
        avatar,
        memberSince,
        styles,
        ...descriptionInfo
    }) => {
        if (!name && !url && !memberSince && !styles && Object.keys(descriptionInfo).length === 0) {
            throw new Error('Unknown user!');
        }
        const result = new RichEmbed()
            .setColor('#7286D5')
            .setAuthor(name, mountainProjectIconUrl, url)
            .setThumbnail(avatar)
            .setDescription(buildUserDescription(descriptionInfo))
            .setFooter(`Joined Mountain Project on ${memberSince}`);

        if (styles) {
            if (styles.Boulders) {
                if (styles.Boulders.lead) {
                    result.addField('Boulders', styles.Boulders.lead);
                }
            }
            if (styles.Trad) {
                if (styles.Trad.lead) {
                    result.addField('Trad Lead', styles.Trad.lead, true);
                }
                if (styles.Trad.follow) {
                    result.addField('Trad Follow', styles.Trad.follow, true);
                }
            }
            if (styles.Sport) {
                if (styles.Sport.lead) {
                    result.addField('Sport Lead', styles.Sport.lead, true);
                }
                if (styles.Sport.follow) {
                    result.addField('Sport Follow', styles.Sport.follow, true);
                }
            }
            if (styles.Aid) {
                if (styles.Aid.lead) {
                    result.addField('Aid Lead', styles.Aid.lead, true);
                }
                if (styles.Aid.follow) {
                    result.addField('Aid Follow', styles.Aid.follow, true);
                }
            }
            if (styles.Ice) {
                if (styles.Ice.lead) {
                    result.addField('Ice Lead', styles.Ice.lead, true);
                }
                if (styles.Ice.follow) {
                    result.addField('Ice Follow', styles.Ice.follow, true);
                }
            }
            if (styles.Mixed) {
                if (styles.Mixed.lead) {
                    result.addField('Mixed Lead', styles.Mixed.lead, true);
                }
                if (styles.Mixed.follow) {
                    result.addField('Mixed Follow', styles.Mixed.follow, true);
                }
            }
        }
        return result;
    },
    createForRoutes: ({ routes }) => routes.map(route => new RichEmbed()
        .setColor('#7286D5')
        .setAuthor(route.name, mountainProjectIconUrl, route.url)
        .setDescription(buildRouteDescription(route))
        .setThumbnail(route.imgSqSmall)
        .addField('Style', route.type, true)
        .addField('Grade', route.rating, true)
        .addField('Stars', buildRouteStars(route), true)
        .addField('Votes', route.starVotes, true)
        .addField('Latitude', route.latitude, true)
        .addField('Longitude', route.longitude, true)
        .setImage(route.imgMedium)),
    createForHelp: ([method]) => {
        const userRichEmbed = new RichEmbed()
            .setColor('#7286D5')
            .setFooter(
                'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                'https://cash.app/favicon.png',
            )
            .setAuthor('!mp user <userId | email>')
            .setDescription(
                'Fetches user data from [MountainProject.com](https://www.mountainproject.com).\nIf you have an account, you can navigate to your profile there, and copy the string of numbers from the url.```https://www.mountainproject.com/user/<COPY THIS PART>/<your user name>```Alternatively, you can just use your email address.', // TODO: extract to strings.js
            )
            .addField('Example 1', '`!mp user 12345678`', true)
            .addField('Example 2', '`!mp user foo@bar.com`', true)
            .addField(
                'Shortcut',
                'You can use `!mp save <userId | email>` to enable the shorthand notation',
                true,
            )
            .addField('Shorthand Notation', '`!mp user`', true);
        const ticksRichEmbed = new RichEmbed()
            .setColor('#7286D5')
            .setFooter(
                'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                'https://cash.app/favicon.png',
            )
            .setAuthor('!mp ticks <userId | email>')
            .setDescription(
                "Fetches user's tick list from [MountainProject.com](https://www.mountainproject.com).\nIf you have an account, you can navigate to your profile there, and copy the string of numbers from the url.```https://www.mountainproject.com/user/<COPY THIS PART>/<your user name>```Alternatively, you can just use your email address.",
            )
            .addField('Example 1', '`!mp ticks 12345678`', true)
            .addField('Example 2', '`!mp ticks foo@bar.com`', true)
            .addField(
                'Shortcut',
                'You can use `!mp save <userId | email>` to enable the shorthand notation',
                true,
            )
            .addField('Shorthand Notation', '`!mp ticks`', true);

        const todosRichEmbed = new RichEmbed()
            .setColor('#7286D5')
            .setFooter(
                'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                'https://cash.app/favicon.png',
            )
            .setAuthor('!mp todos <userId | email>')
            .setDescription(
                "Fetches user's todo list from [MountainProject.com](https://www.mountainproject.com).\nIf you have an account, you can navigate to your profile there, and copy the string of numbers from the url.```https://www.mountainproject.com/user/<COPY THIS PART>/<your user name>```Alternatively, you can just use your email address.",
            )
            .addField('Example 1', '`!mp todos 12345678`', true)
            .addField('Example 2', '`!mp todos foo@bar.com`', true)
            .addField(
                'Shortcut',
                'You can use `!mp save <userId | email>` to enable the shorthand notation',
                true,
            )
            .addField('Shorthand Notation', '`!mp todos`', true);

        const routesRichEmbed = new RichEmbed()
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

        const routesAtRichEmbed = new RichEmbed()
            .setColor('#7286D5')
            .setAuthor(
                '!mp routesAt <lat> <lon> [maxDistance] [maxResults] [minDiff] [maxDiff]',
            )
            .setDescription(
                'Fetches route data by latitude and longitude from [MountainProject.com](https://www.mountainproject.com).',
            )
            .addField('Example 1', '`!mp routesAt 123.45 98.76`', true)
            .addField(
                'Example 2',
                '`!mp routesAt  123.45 98.76 maxDistance=5`',
                true,
            )
            .addField(
                'Example 3',
                '`!mp routesAt  123.45 98.76 maxDistance=5 maxResults=6 minDiff=5.12 maxDiff=5.13a`',
                true,
            )
            .addField(
                'Example 4',
                '`!mp routesAt  123.45 98.76 minDiff=V16 maxResults=20`',
                true,
            )
            .setFooter(
                'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                'https://cash.app/favicon.png',
            );
        const saveRichEmbed = new RichEmbed()
            .setColor('#7286D5')
            .setAuthor('!mp save <userId | email>')
            .setDescription(
                'Saves your userId or email to enable shorthand notation of certain other commands.',
            )
            .addField('Example 1', '!mp save 123456789', true)
            .addField('Example 2', '!mp save foo@bar.com', true)
            .setFooter(
                'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                'https://cash.app/favicon.png',
            );
        const getRichEmbed = new RichEmbed()
            .setColor('#7286D5')
            .setAuthor('!mp get')
            .setDescription('Gets the userId or email you previously saved.')
            .addField('Example', '!mp get')
            .setFooter(
                'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                'https://cash.app/favicon.png',
            );
        const deleteRichEmbed = new RichEmbed()
            .setColor('#7286D5')
            .setAuthor('!mp delete')
            .setDescription('Deletes the userId or email you previously saved.')
            .addField('Example', '!mp delete')
            .setFooter(
                'If you like this bot, please consider donating at https://cash.app/$KyleLanmon',
                'https://cash.app/favicon.png',
            );
        switch (method) {
        case COMMAND_NAMES.GET_USER:
            return userRichEmbed;
        case COMMAND_NAMES.GET_TICKS:
            return ticksRichEmbed;
        case COMMAND_NAMES.GET_TODOS:
            return todosRichEmbed;
        case COMMAND_NAMES.GET_ROUTES:
            return routesRichEmbed;
        case COMMAND_NAMES.GET_ROUTES_AT:
            return routesAtRichEmbed;
        case COMMAND_NAMES.SAVE_ID:
            return saveRichEmbed;
        case COMMAND_NAMES.GET_ID:
            return getRichEmbed;
        case COMMAND_NAMES.DELETE_ID:
            return deleteRichEmbed;
        case 'all':
        case undefined:
            return [userRichEmbed,
                ticksRichEmbed,
                todosRichEmbed,
                routesRichEmbed,
                routesAtRichEmbed,
                saveRichEmbed,
                getRichEmbed,
                deleteRichEmbed];
        default:
            throw new Error("Sorry, I can't help with that");
        }
    },
});
