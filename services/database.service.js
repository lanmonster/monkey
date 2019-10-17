const MS_PER_DAY = 1000 * 60 * 60 * 24;

const isCacheValid = (lastUpdate) => {
    const today = new Date();
    const lastUpdateDate = new Date(lastUpdate);

    const utc1 = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );
    const utc2 = Date.UTC(lastUpdateDate.getFullYear(), lastUpdateDate.getMonth(), lastUpdateDate.getDate());

    return Math.floor((utc2 - utc1) / MS_PER_DAY) <= 7;
};

module.exports = ({ db }) => ({
    findRoutesByIds: async (ids) => {
        const foundRoutes = [];
        const notFoundRouteIds = [];

        await Promise.all(
            ids.map(async (id) => {
                const result = await db.Routes.findOne({ where: { id } });
                if (result && isCacheValid(result.updatedAt)) {
                    const { updatedAt, createdAt, ...route } = result;
                    foundRoutes.push(route);
                } else {
                    notFoundRouteIds.push(id);
                }
            }),
        );

        return { foundRoutes, notFoundRouteIds };
    },
    updateRouteCache: routes => routes.forEach((route) => {
        db.Routes.upsert(route);
    }),
    saveId: (mpId, id) => { db.Users.upsert({ id, mpId }); },
    getId: async (id) => {
        const result = await db.Users.findByPk(id);

        if (!result) throw new Error('Nothing is stored yet!');
        if (!result.dataValues.mpId) throw new Error('Nothing is stored yet!');

        return result.dataValues.mpId;
    },
    deleteId: async (id) => {
        const result = await db.Users.findByPk(id);

        if (!result) throw new Error('Nothing is there to delete!');

        result.destroy();
    },
});
