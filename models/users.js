module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('Users', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        mpId: DataTypes.STRING,
    },
    {});
    Users.associate = (models) => {
        // associations can be defined here
    };
    return Users;
};
