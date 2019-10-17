module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.createTable('Routes', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
        },
        type: {
            type: Sequelize.STRING,
        },
        rating: {
            type: Sequelize.STRING,
        },
        stars: {
            type: Sequelize.FLOAT,
        },
        starVotes: {
            type: Sequelize.INTEGER,
        },
        pitches: {
            type: Sequelize.INTEGER,
        },
        location: {
            type: Sequelize.STRING,
        },
        url: {
            type: Sequelize.STRING,
        },
        imgSqSmall: {
            type: Sequelize.STRING,
        },
        imgSmall: {
            type: Sequelize.STRING,
        },
        imgSmallMed: {
            type: Sequelize.STRING,
        },
        imgMedium: {
            type: Sequelize.STRING,
        },
        longitude: {
            type: Sequelize.DOUBLE,
        },
        latitude: {
            type: Sequelize.DOUBLE,
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
        },
    }),
    down: queryInterface => queryInterface.dropTable('Routes'),
};
