/* eslint-disable max-len */
const MountainProjectService = require('./mountainproject.service');
const testdata = require('../testdata/testdata');

const fakeDb = {};
const fakeHttp = {};
const fakeRichEmbedService = {};
const apiKey = 'my obviously fake api key';
const usageMessage = 'One of those optional parameters was formatted incorrectly. Please refer to the help page and try again.';

describe('Mountain Project Service', () => {
    let testObject;
    beforeEach(() => {
        testObject = MountainProjectService({
            db: fakeDb,
            http: fakeHttp,
            richEmbedService: fakeRichEmbedService,
            apiKey,
        });
    });
    it('should handle an unknown method', async () => {
        fakeHttp.get = jest.fn();

        let actual;
        try {
            await testObject.process(['lskdjfs', 'email']);
        } catch (error) {
            actual = error;
        }

        expect(actual).toEqual(new Error('That method is not supported!'));
        expect(fakeHttp.get).not.toHaveBeenCalled();
    });
    describe('get user', () => {
        it('should call `get user` when user is the first param', async () => {
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpUserData }));
            fakeRichEmbedService.createForUser = jest.fn();

            const identifier = '123bla4h';
            await testObject.process(['user', identifier]);

            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-user?key=${apiKey}&email=${identifier}`,
            );
            expect(fakeRichEmbedService.createForUser).toHaveBeenCalledWith(testdata.trimmedMpUserData);
        });
        it('should use the userid in the url if identifier is a number', async () => {
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpUserData }));
            fakeRichEmbedService.createForUser = jest.fn();

            const identifier = '123456789';
            await testObject.process(['user', identifier]);

            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-user?key=${apiKey}&userId=${identifier}`,
            );
            expect(fakeRichEmbedService.createForUser).toHaveBeenCalledWith(testdata.trimmedMpUserData);
        });
        it('should ask the db for an identifier if none was passed', async () => {
            const identifier = '134';
            const user = 'me';
            fakeDb.getId = jest.fn(given => Promise.resolve(given === user ? identifier : null));
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpUserData }));
            fakeRichEmbedService.createForUser = jest.fn();

            await testObject.process(['user'], user);

            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-user?key=${apiKey}&userId=${identifier}`,
            );
            expect(fakeDb.getId).toHaveBeenCalledWith(user);
        });
        it('should throw if no identifier was passed and none is saved', async () => {
            const expected = new Error('You need to pass the userId or email for the user you want to find!');
            fakeDb.getId = jest.fn(() => Promise.reject(new Error('not the expected message')));

            let actual;
            try {
                await testObject.process(['user'], 'me');
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(expected);
        });
    });
    describe('get ticks', () => {
        it('should call `get ticks` when ticks is the first param', async () => {
            const identifier = '464387lskjdf';
            const ticksUrl = `https://www.mountainproject.com/data/get-ticks?key=${apiKey}&email=${identifier}`;
            const resultOfRichEmbedService = 'ticks';
            fakeRichEmbedService.createForRoutes = jest.fn(() => resultOfRichEmbedService);
            fakeHttp.get = jest.fn(url => Promise.resolve({
                data: url === ticksUrl
                    ? testdata.mpTicksData
                    : testdata.mpRoutesData,
            }));
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({
                foundRoutes: [],
                notFoundRouteIds: [1],
            }));
            fakeDb.updateRouteCache = jest.fn();

            const actual = await testObject.process(['ticks', identifier]);

            expect(fakeRichEmbedService.createForRoutes).toHaveBeenCalledWith(testdata.trimmedMpRoutesData);
            expect(actual).toEqual(resultOfRichEmbedService);
            expect(fakeHttp.get).toHaveBeenCalledWith(ticksUrl);
        });
        it('should use the userid in the url if identifier is a number', async () => {
            const identifier = '123456789';
            const ticksUrl = `https://www.mountainproject.com/data/get-ticks?key=${apiKey}&userId=${identifier}`;
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({ foundRoutes: [], notFoundRouteIds: [1] }));
            fakeDb.updateRouteCache = jest.fn();
            fakeRichEmbedService.createForRoutes = jest.fn();
            fakeHttp.get = jest.fn(url => Promise.resolve({
                data: url === ticksUrl
                    ? testdata.mpTicksData
                    : testdata.mpRoutesData,
            }));

            await testObject.process(['ticks', identifier]);

            expect(fakeHttp.get).toHaveBeenCalledWith(ticksUrl);
        });
        it('should use the result from the db if no identifier is passed', async () => {
            const identifier = '123456789';
            const ticks = `https://www.mountainproject.com/data/get-ticks?key=${apiKey}&userId=${identifier}`;
            const user = 'me';
            fakeDb.getId = jest.fn(given => Promise.resolve(given === user ? identifier : null));
            fakeHttp.get = jest.fn(url => Promise.resolve({
                data:
                        url === ticks
                            ? testdata.mpTicksData
                            : testdata.mpRoutesData,
            }));
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({ foundRoutes: [], notFoundRouteIds: [1] }));
            fakeDb.updateRouteCache = jest.fn();

            await testObject.process(['ticks'], user);

            expect(fakeHttp.get).toHaveBeenCalledWith(ticks);
        });
        it('should handle the optional parameter', async () => {
            const identifier = '464387lskjdf';
            const start = 'startPos=5';
            const ticksUrl = `https://www.mountainproject.com/data/get-ticks?key=${apiKey}&email=${identifier}&${start}`;
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({
                foundRoutes: [],
                notFoundRouteIds: [1],
            }));
            fakeDb.updateRouteCache = jest.fn();
            fakeRichEmbedService.createForRoutes = jest.fn();
            fakeHttp.get = jest.fn(url => Promise.resolve({
                data: url === ticksUrl
                    ? testdata.mpTicksData
                    : testdata.mpRoutesData,
            }));

            await testObject.process(['ticks', identifier, start]);

            expect(fakeHttp.get).toHaveBeenCalledWith(ticksUrl);
        });
        it('should return usage help if optional param is faulty', async () => {
            fakeHttp.get = jest.fn();

            let actual;
            try {
                await testObject.process(['ticks', 'id', 'start@5']);
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(new Error(usageMessage));
            expect(fakeHttp.get).not.toHaveBeenCalled();
        });
        it('should throw if no identifier was passed and none is saved', async () => {
            const expected = new Error(
                'You need to pass the userId or email for the user you want to find!',
            );
            fakeDb.getId = jest.fn(() => Promise.reject(new Error('not the expected message')));

            let actual;
            try {
                await testObject.process(['ticks'], 'me');
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(expected);
        });
    });
    describe('get todos', () => {
        it('should call `get todos` when ticks is the first param', async () => {
            const identifier = '456lskjdf';
            const todoUrl = `https://www.mountainproject.com/data/get-to-dos?key=${apiKey}&email=${identifier}`;
            const resultOfRichEmbedService = 'todos';
            fakeRichEmbedService.createForRoutes = jest.fn(() => resultOfRichEmbedService);
            fakeHttp.get = jest.fn(url => Promise.resolve({ data: url === todoUrl ? testdata.mpTodosData : testdata.mpRoutesData }));
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({ foundRoutes: [], notFoundRouteIds: [1] }));
            fakeDb.updateRouteCache = jest.fn();

            const actual = await testObject.process(['todos', identifier]);

            expect(actual).toEqual(resultOfRichEmbedService);
            expect(fakeRichEmbedService.createForRoutes).toHaveBeenCalledWith(testdata.trimmedMpRoutesData);
            expect(fakeHttp.get).toHaveBeenCalledWith(todoUrl);
        });
        it('should use the userid in the url if identifier is a number', async () => {
            const identifier = '123456789';
            const todoUrl = `https://www.mountainproject.com/data/get-to-dos?key=${apiKey}&userId=${identifier}`;
            fakeHttp.get = jest.fn(url => Promise.resolve({
                data:
                         url === todoUrl
                             ? testdata.mpTodosData
                             : testdata.mpRoutesData,
            }));
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({ foundRoutes: [], notFoundRouteIds: [1] }));
            fakeDb.updateRouteCache = jest.fn();

            await testObject.process(['todos', identifier]);

            expect(fakeHttp.get).toHaveBeenCalledWith(todoUrl);
        });
        it('should use the result from the db if no identifier is passed', async () => {
            const identifier = '123456789';
            const todoUrl = `https://www.mountainproject.com/data/get-to-dos?key=${apiKey}&userId=${identifier}`;
            const user = 'me';
            fakeDb.getId = jest.fn(given => Promise.resolve(given === user ? identifier : null));
            fakeHttp.get = jest.fn(url => Promise.resolve({
                data:
                        url === todoUrl
                            ? testdata.mpTodosData
                            : testdata.mpRoutesData,
            }));
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({ foundRoutes: [], notFoundRouteIds: [1] }));
            fakeDb.updateRouteCache = jest.fn();

            await testObject.process(['todos'], user);

            expect(fakeHttp.get).toHaveBeenCalledWith(todoUrl);
        });
        it('should handle the optional parameter', async () => {
            const identifier = '464387lskjdf';
            const start = 'startPos=5';
            const todoUrl = `https://www.mountainproject.com/data/get-to-dos?key=${apiKey}&email=${identifier}&${start}`;

            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpTodosData }));
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpTodosData }));
            fakeHttp.get = jest.fn(url => Promise.resolve({
                data:
                        url === todoUrl
                            ? testdata.mpTodosData
                            : testdata.mpRoutesData,
            }));
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({ foundRoutes: [], notFoundRouteIds: [1] }));
            fakeDb.updateRouteCache = jest.fn();

            await testObject.process([
                'todos',
                identifier,
                start,
            ]);

            expect(fakeHttp.get).toHaveBeenCalledWith(todoUrl);
        });
        it('should return usage help if optional param is faulty', async () => {
            fakeHttp.get = jest.fn();

            let actual;
            try {
                await testObject.process([
                    'todos',
                    'id',
                    'start=',
                ]);
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(new Error(usageMessage));
            expect(fakeHttp.get).not.toHaveBeenCalled();
        });
        it('should throw if no identifier was passed and none is saved', async () => {
            const expected = new Error('You need to pass the userId or email for the user you want to find!');
            fakeDb.getId = jest.fn(() => Promise.reject(new Error('not the expected message')));

            let actual;
            try {
                await testObject.process(['todos'], 'me');
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(expected);
        });
    });
    describe('get routes', () => {
        it('should call `get routes` when routes is the first param', async () => {
            const resultOfRichEmbedService = 'yay';
            const routeIds = ['1', '2', '3'];

            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({
                foundRoutes: [],
                notFoundRouteIds: routeIds,
            }));
            fakeDb.updateRouteCache = jest.fn();
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpRoutesData }));
            fakeRichEmbedService.createForRoutes = jest.fn(
                () => resultOfRichEmbedService,
            );

            const actual = await testObject.process(['routes', '1', '2', '3']);

            expect(actual).toEqual(resultOfRichEmbedService);
            expect(
                fakeRichEmbedService.createForRoutes,
            ).toHaveBeenCalledWith(testdata.trimmedMpRoutesData);
            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-routes?key=${apiKey}&routeIds=${routeIds.join(',')}`,
            );
        });
        it('should not hit api if route is in cache', async () => {
            const routeId = '2345678';

            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({ foundRoutes: [testdata.trimmedMpRoutesData.routes[0]], notFoundRouteIds: [] }));
            fakeDb.updateRouteCache = jest.fn();
            fakeHttp.get = jest.fn();
            fakeRichEmbedService.createForRoutes = jest.fn();

            await testObject.process(['routes', routeId]);

            expect(fakeHttp.get).not.toHaveBeenCalled();
        });
        it('should hit api for unfound routes but not for found ones', async () => {
            const foundRouteId = '234';
            const notFoundRouteId = '86754';
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({ foundRoutes: [testdata.trimmedMpRoutesData.routes[0]], notFoundRouteIds: [notFoundRouteId] }));
            fakeDb.updateRouteCache = jest.fn();
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.routeDataForPartialFoundTest }));
            fakeRichEmbedService.createForRoutes = jest.fn();

            await testObject.process(['routes', foundRouteId, notFoundRouteId]);

            expect(fakeHttp.get).toHaveBeenCalledWith(`https://www.mountainproject.com/data/get-routes?key=${apiKey}&routeIds=${notFoundRouteId}`);
        });
        it('should update cache with results from api', async () => {
            fakeDb.findRoutesByIds = jest.fn(() => Promise.resolve({ foundRoutes: [{ foo: 'bar' }], notFoundRouteIds: [1] }));
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpRoutesData }));
            fakeDb.updateRouteCache = jest.fn();
            fakeRichEmbedService.createForRoutes = jest.fn();

            await testObject.process(['routes', '42']);

            const routes = testdata.trimmedMpRoutesData.routes.map(route => ({
                ...route,
                location: route.location.join(' > '),
            }));
            expect(fakeDb.updateRouteCache).toHaveBeenCalledWith(routes);
        });
    });
    describe('get routes for lat lon', () => {
        it('should call `get routes for lat lon` when routesAt is the first param', async () => {
            const resultOfRichEmbedService = 'foo';
            fakeRichEmbedService.createForRoutes = jest.fn(() => resultOfRichEmbedService);
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpRoutesAtData }));

            const lat = '1';
            const lon = '2';
            const actual = await testObject.process(['routesAt', lat, lon]);

            expect(fakeRichEmbedService.createForRoutes).toHaveBeenCalledWith(testdata.trimmedMpRoutesAtData);
            expect(actual).toEqual(resultOfRichEmbedService);
            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-routes-for-lat-lon?key=${apiKey}&lat=${lat}&lon=${lon}`,
            );
        });
        it('should handle optional maxDistance param', async () => {
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpRoutesAtData }));

            const lat = '1';
            const lon = '2';
            const maxDistance = 'maxDistance=5';
            await testObject.process([
                'routesAt',
                lat,
                lon,
                maxDistance,
            ]);

            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-routes-for-lat-lon?key=${apiKey}&lat=${lat}&lon=${lon}&${maxDistance}`,
            );
        });
        it('should handle optional maxResults param', async () => {
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpRoutesAtData }));

            const lat = '1';
            const lon = '2';
            const maxResults = 'maxResults=5';
            await testObject.process([
                'routesAt',
                lat,
                lon,
                maxResults,
            ]);

            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-routes-for-lat-lon?key=${apiKey}&lat=${lat}&lon=${lon}&${maxResults}`,
            );
        });
        it('should handle optional minDiff param', async () => {
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpRoutesAtData }));

            const lat = '1';
            const lon = '2';
            const minDiff = 'minDiff=5';
            await testObject.process([
                'routesAt',
                lat,
                lon,
                minDiff,
            ]);

            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-routes-for-lat-lon?key=${apiKey}&lat=${lat}&lon=${lon}&${minDiff}`,
            );
        });
        it('should handle optional maxDiff param', async () => {
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpRoutesAtData }));

            const lat = '1';
            const lon = '2';
            const maxDiff = 'maxDiff=5';
            await testObject.process([
                'routesAt',
                lat,
                lon,
                maxDiff,
            ]);

            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-routes-for-lat-lon?key=${apiKey}&lat=${lat}&lon=${lon}&${maxDiff}`,
            );
        });
        it('should handle all optional params at once', async () => {
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpRoutesAtData }));

            const lat = '1';
            const lon = '2';
            const maxDistance = 'maxDistance=5';
            const maxResults = 'maxResults=5';
            const minDiff = 'minDiff=5';
            const maxDiff = 'maxDiff=5';
            await testObject.process([
                'routesAt',
                lat,
                lon,
                maxDiff,
                maxResults,
                minDiff,
                maxDistance,
            ]);

            expect(fakeHttp.get).toHaveBeenCalledWith(
                `https://www.mountainproject.com/data/get-routes-for-lat-lon?key=${apiKey}&lat=${lat}&lon=${lon}&${maxDiff}&${maxResults}&${minDiff}&${maxDistance}`,
            );
        });
        it('should update cache with routes from api', async () => {
            fakeDb.updateRouteCache = jest.fn();
            fakeHttp.get = jest.fn(() => Promise.resolve({ data: testdata.mpRoutesAtData }));

            const lat = '1';
            const lon = '2';
            await testObject.process(['routesAt', lat, lon]);

            const routes = testdata.trimmedMpRoutesAtData.routes.map(
                route => ({
                    ...route,
                    location: route.location.join(' > '),
                }),
            );
            expect(fakeDb.updateRouteCache).toHaveBeenCalledWith(routes);
        });
        it('should return usage help if optional param is faulty', async () => {
            fakeHttp.get = jest.fn();

            let actual;
            try {
                await testObject.process([
                    'routesAt',
                    '1',
                    '2',
                    'maxDistanc=5',
                ]);
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(new Error(usageMessage));
            expect(fakeHttp.get).not.toHaveBeenCalled();
        });
    });
    describe('save id', () => {
        it('should save the identifier in the database', () => {
            fakeDb.saveId = jest.fn();
            const identifier = 'foo';
            const user = 'me';

            testObject.process(['save', identifier], user);

            expect(fakeDb.saveId).toHaveBeenCalledWith(identifier, user);
        });
        it('should return an object that lets the caller know how to handle the response', async () => {
            fakeDb.saveId = jest.fn();
            const identifier = 'foo';
            const user = 'me';

            const actual = await testObject.process(['save', identifier], user);

            const expected = {
                message: 'Saved!',
                selfdestruct: true,
                timeout: 5000,
            };

            expect(actual).toEqual(expected);
        });
        it('should handle no identifier parameter', async () => {
            const expected = new Error('You need to tell me what to save!');

            let actual;
            try {
                await testObject.process(['save'], 'foo');
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(expected);
        });
    });
    describe('get id', () => {
        it('should get the identifier in the database', () => {
            const user = 'me';
            fakeDb.getId = jest.fn();

            testObject.process(['get'], user);

            expect(fakeDb.getId).toHaveBeenCalledWith(user);
        });
        it('should return an object that lets the caller know how to handle the response', async () => {
            const user = 'me';
            const identifier = 'lsdkfhj';
            fakeDb.getId = jest.fn(() => Promise.resolve(identifier));

            const actual = await testObject.process(['get'], user);

            const expected = {
                message: identifier,
                selfdestruct: true,
                timeout: 5000,
            };
            expect(actual).toEqual(expected);
        });
        it('should handle when db throws', async () => {
            const user = 'sfjgyd';
            const message = 'error happened';
            fakeDb.getId = jest.fn(() => Promise.reject(new Error(message)));

            const actual = await testObject.process(['get'], user);

            const expected = {
                message,
                selfdestruct: true,
                timeout: 5000,
            };
            expect(actual).toEqual(expected);
        });
    });
    describe('delete id', () => {
        it('should delete the identifier in the database', () => {
            const user = 'me';
            fakeDb.deleteId = jest.fn();

            testObject.process(['delete'], user);

            expect(fakeDb.deleteId).toHaveBeenCalledWith(user);
        });
        it('should return an object that lets the caller know how to handle the response', async () => {
            const user = 'me';
            fakeDb.deleteId = jest.fn();

            const actual = await testObject.process(['delete'], user);

            const expected = {
                message: 'Deleted!',
                selfdestruct: true,
                timeout: 5000,
            };
            expect(actual).toEqual(expected);
        });
        it('should handle when db throws', async () => {
            const user = 'sfjgyd';
            const message = 'error happened';
            fakeDb.deleteId = jest.fn(() => Promise.reject(new Error(message)));

            const actual = await testObject.process(['delete'], user);

            const expected = {
                message,
                selfdestruct: true,
                timeout: 5000,
            };
            expect(actual).toEqual(expected);
        });
    });
    describe('help', () => {
        it('should provide a help response for get user', async () => {
            const expected = 'help me tom cruise';
            fakeRichEmbedService.createForHelp = jest.fn(() => expected);
            const method = 'user';

            const actual = await testObject.process(['help', method]);

            expect(actual).toEqual(expected);
            expect(fakeRichEmbedService.createForHelp).toHaveBeenCalledWith([method]);
        });
    });
});
