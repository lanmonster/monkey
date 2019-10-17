const DatabaseService = require('./database.service');

const fakeDb = {
    Routes: {},
    Users: {},
};
describe('Database Service', () => {
    let testObject;
    beforeEach(() => {
        testObject = DatabaseService({
            db: fakeDb,
        });
    });
    describe('findRoutesByIds', () => {
        it('should populate the foundRoutes array with data from db', async () => {
            const expectedFound = { foo: 'bar' };
            const routeId = '1';
            fakeDb.Routes.findOne = jest.fn(given => (given.where.id === routeId
                ? Promise.resolve({ ...expectedFound, updatedAt: new Date() })
                : Promise.resolve(null)));

            const { foundRoutes, notFoundRouteIds } = await testObject.findRoutesByIds([routeId]);

            expect(foundRoutes).toEqual([expectedFound]);
            expect(notFoundRouteIds).toEqual([]);
        });
        it('should handle multiple ids', async () => {
            const expectedFound = { foo: 'bar' };
            fakeDb.Routes.findOne = jest.fn(() => Promise.resolve({ ...expectedFound, updatedAt: new Date() }));

            const { foundRoutes, notFoundRouteIds } = await testObject.findRoutesByIds(['1', '2']);

            expect(foundRoutes).toEqual([expectedFound, expectedFound]);
            expect(notFoundRouteIds).toEqual([]);
        });
        it('should filter out updatedAt and createdAt fields from found data', async () => {
            const expectedFound = { foo: 'bar' };
            fakeDb.Routes.findOne = jest.fn(() => Promise.resolve({
                ...expectedFound,
                updatedAt: new Date(),
                createdAt: 2,
            }));

            const {
                foundRoutes,
                notFoundRouteIds,
            } = await testObject.findRoutesByIds(['1']);

            expect(foundRoutes).toEqual([expectedFound]);
            expect(notFoundRouteIds).toEqual([]);
        });
        it('should populate the notFoundRouteIds with the ids that were not found', async () => {
            const expectedFound = { foo: 'bar' };
            const foundId = '1';
            const notFoundId = '2';
            fakeDb.Routes.findOne = jest.fn(given => (given.where.id === foundId
                ? Promise.resolve({
                    ...expectedFound,
                    updatedAt: new Date(),
                })
                : Promise.resolve(null)));

            const { foundRoutes, notFoundRouteIds } = await testObject.findRoutesByIds([foundId, notFoundId]);

            expect(foundRoutes).toEqual([expectedFound]);
            expect(notFoundRouteIds).toEqual([notFoundId]);
        });
        it('should condider updatedAt > 7 days to be not found', async () => {
            const currentDate = new Date();
            const eightDaysLater = new Date(
                currentDate.setDate(currentDate.getDate() + 8),
            );

            fakeDb.Routes.findOne = jest.fn(() => Promise.resolve({
                updatedAt: eightDaysLater.toISOString(),
            }));

            const routeId = '1';
            const { foundRoutes, notFoundRouteIds } = await testObject.findRoutesByIds([routeId]);

            expect(foundRoutes).toEqual([]);
            expect(notFoundRouteIds).toEqual([routeId]);
        });
    });
    describe('updateRouteCache', () => {
        it('should upsert for each input', () => {
            fakeDb.Routes.upsert = jest.fn();

            const inputObj = { foo: 'bar' };
            const input = [inputObj, inputObj];
            testObject.updateRouteCache(input);

            input.forEach((x) => {
                expect(fakeDb.Routes.upsert).toHaveBeenCalledWith(x);
            });
        });
    });
    describe('saveId', () => {
        it('should save the id in the db', () => {
            fakeDb.Users.upsert = jest.fn();
            const identifier = 'lsdkfj';
            const user = 'me';
            testObject.saveId(identifier, user);

            expect(fakeDb.Users.upsert).toHaveBeenCalledWith({
                id: user,
                mpId: identifier,
            });
        });
    });
    describe('getId', () => {
        it('should get the id from the db', async () => {
            const user = '234';
            const expectedId = 'mountain project id';
            const expectedReturn = {
                dataValues: {
                    id: user,
                    mpId: expectedId,
                },
            };
            fakeDb.Users.findByPk = jest.fn(() => Promise.resolve(expectedReturn));

            const actual = await testObject.getId(user);

            expect(actual).toEqual(expectedId);
        });
        it('should handle id not found', async () => {
            fakeDb.Users.findByPk = jest.fn(() => Promise.resolve(null));
            const user = '8745';

            let actual;
            try {
                await testObject.getId(user);
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(new Error('Nothing is stored yet!'));
        });
        it('should handle id found to be null', async () => {
            fakeDb.Users.findByPk = jest.fn(() => Promise.resolve({ dataValues: { mpId: null } }));
            const user = '8745';

            let actual;
            try {
                await testObject.getId(user);
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(new Error('Nothing is stored yet!'));
        });
    });
    describe('deleteId', () => {
        it('should delete the id from the db', async () => {
            const user = 'skudhf';
            const expectedReturn = {
                destroy: jest.fn(),
            };
            fakeDb.Users.findByPk = jest.fn(() => Promise.resolve(expectedReturn));

            await testObject.deleteId(user);

            expect(expectedReturn.destroy).toHaveBeenCalled();
        });
        it('should handle id not found', async () => {
            fakeDb.Users.findByPk = jest.fn(() => Promise.resolve(null));
            const user = '8745';

            let actual;
            try {
                await testObject.deleteId(user);
            } catch (error) {
                actual = error;
            }

            expect(actual).toEqual(new Error('Nothing is there to delete!'));
        });
    });
});
