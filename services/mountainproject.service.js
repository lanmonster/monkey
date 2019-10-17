const {
    generateUrl,
    addIdentifier,
    addRouteIds,
    addLatLon,
    addOptionalParams,
} = require('../utils/url.utils');
const COMMAND_NAMES = require('../utils/mp-supported-methods');

const removeEmptyValues = obj => Object.keys(obj)
    .filter(k => obj[k] !== '' && obj[k] !== '0000-00-00' && obj[k] !== '5.?' && obj[k] !== -1)
    .reduce((newObj, k) => {
        let result;
        if (obj[k] instanceof Array) {
            result = {
                [k]: obj[k].map(v => ((typeof v === 'number' || typeof v === 'string') ? v : removeEmptyValues(v))),
            };
        } else if (obj[k] instanceof Object) {
            result = { ...newObj, [k]: removeEmptyValues(obj[k]) };
        } else {
            result = { ...newObj, [k]: obj[k] };
        }
        if (result[k] instanceof Object && Object.keys(result[k]).length === 0) {
            delete result[k];
        }
        return result;
    }, {});

const removeUnwantedKeyValuePairs = ({ data }) => {
    /* eslint-disable */
    const {
        success,
        pts_climb,
        pts_hike,
        pts_mtb,
        pts_ski,
        pts_trailrun,
        ...rest
    } = data;
    /* eslint-enable */

    return rest;
};

const trimResponse = obj => removeEmptyValues(removeUnwantedKeyValuePairs(obj));

const prepareRouteLocationsForDb = routes => routes.map(route => ({
    ...route,
    location: route.location.join(' > '),
}));

const METHOD_NAMES = {
    GET_USER: 'user',
    GET_TICKS: 'ticks',
    GET_TODOS: 'to-dos',
    GET_ROUTES: 'routes',
    GET_ROUTES_AT: 'routes-for-lat-lon',
};

module.exports = ({
    db,
    http,
    richEmbedService,
    apiKey,
}) => {
    const selfDestructingMessage = message => ({ selfdestruct: true, timeout: 5000, message });
    const getUser = async ([identifier], user) => {
        try {
            const id = identifier || await db.getId(user);

            const url = addIdentifier(generateUrl(METHOD_NAMES.GET_USER, apiKey), id);
            return http.get(url);
        } catch (error) {
            throw new Error('You need to pass the userId or email for the user you want to find!');
        }
    };
    const getRoutes = async (routes) => {
        const { foundRoutes, notFoundRouteIds } = await db.findRoutesByIds(routes);

        if (notFoundRouteIds.length > 0) {
            const url = addRouteIds(generateUrl(METHOD_NAMES.GET_ROUTES, apiKey), notFoundRouteIds);
            const routesFromApi = (await http.get(url)).data;

            db.updateRouteCache(prepareRouteLocationsForDb(routesFromApi.routes));

            foundRoutes.push(...routesFromApi.routes);
        }

        return { data: { routes: foundRoutes } };
    };
    const getTicks = async ([identifier, ...optional], user) => {
        let id;
        try {
            id = identifier || await db.getId(user);
        } catch (error) {
            throw new Error('You need to pass the userId or email for the user you want to find!');
        }

        const url = addOptionalParams(addIdentifier(generateUrl(METHOD_NAMES.GET_TICKS, apiKey), id), optional);
        const ticks = removeUnwantedKeyValuePairs(await http.get(url)).ticks.map(tick => tick.routeId);
        return getRoutes(ticks);
    };
    const getTodos = async ([identifier, ...optional], user) => {
        let id;
        try {
            id = identifier || (await db.getId(user));
        } catch (error) {
            throw new Error(
                'You need to pass the userId or email for the user you want to find!',
            );
        }
        const url = addOptionalParams(addIdentifier(generateUrl(METHOD_NAMES.GET_TODOS, apiKey), id), optional);
        const todos = removeUnwantedKeyValuePairs(await http.get(url)).toDos;
        return getRoutes(todos);
    };
    const getRoutesAt = async ([lat, lon, ...optional]) => {
        const url = addOptionalParams(addLatLon(generateUrl(METHOD_NAMES.GET_ROUTES_AT, apiKey), lat, lon), optional);
        const result = await http.get(url);

        db.updateRouteCache(prepareRouteLocationsForDb(result.data.routes));

        return result;
    };
    const saveId = ([identifier], user) => {
        if (!identifier) throw new Error('You need to tell me what to save!');

        db.saveId(identifier, user);
        return selfDestructingMessage('Saved!');
    };
    const getId = async (user) => {
        let result;
        try {
            result = await db.getId(user);
        } catch ({ message }) {
            result = message;
        }
        return selfDestructingMessage(result);
    };
    const deleteId = async (user) => {
        let result;
        try {
            result = await db.deleteId(user) || 'Deleted!';
        } catch ({ message }) {
            result = message;
        }
        return selfDestructingMessage(result);
    };

    return {
        process: async ([method, ...rest], user) => {
            switch (method) {
            case COMMAND_NAMES.GET_USER:
                return richEmbedService.createForUser(trimResponse(await getUser(rest, user)));
            case COMMAND_NAMES.GET_TICKS:
                return richEmbedService.createForRoutes(removeUnwantedKeyValuePairs(await getTicks(rest, user)));
            case COMMAND_NAMES.GET_TODOS:
                return richEmbedService.createForRoutes(removeUnwantedKeyValuePairs(await getTodos(rest, user)));
            case COMMAND_NAMES.GET_ROUTES:
                return richEmbedService.createForRoutes(removeUnwantedKeyValuePairs(await getRoutes(rest)));
            case COMMAND_NAMES.GET_ROUTES_AT:
                return richEmbedService.createForRoutes(removeUnwantedKeyValuePairs(await getRoutesAt(rest)));
            case COMMAND_NAMES.SAVE_ID:
                return saveId(rest, user);
            case COMMAND_NAMES.GET_ID:
                return getId(user);
            case COMMAND_NAMES.DELETE_ID:
                return deleteId(user);
            case COMMAND_NAMES.HELP:
                return richEmbedService.createForHelp(rest);
            default:
                throw new Error('That method is not supported!');
            }
        },
    };
};
