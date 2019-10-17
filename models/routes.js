module.exports = (sequelize, DataTypes) => {
    const Routes = sequelize.define('Routes', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        name: DataTypes.STRING,
        type: DataTypes.STRING,
        rating: DataTypes.STRING,
        stars: DataTypes.FLOAT,
        starVotes: DataTypes.INTEGER,
        pitches: DataTypes.INTEGER,
        location: DataTypes.STRING,
        url: DataTypes.STRING,
        imgSqSmall: DataTypes.STRING,
        imgSmall: DataTypes.STRING,
        imgSmallMed: DataTypes.STRING,
        imgMedium: DataTypes.STRING,
        longitude: DataTypes.DOUBLE,
        latitude: DataTypes.DOUBLE,
    }, {});
    Routes.associate = (models) => {
    // associations can be defined here
    };
    return Routes;
};
