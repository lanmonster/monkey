# Monkey
![logo](https://cdn.discordapp.com/app-icons/334449281899429888/48ae4e04f59117b21d17b18b2b01695b.png)

A discord bot that brings data from mountainproject.com into the chat.
[Add it to your server!](https://discordapp.com/api/oauth2/authorize?client_id=334449281899429888&permissions=59392&scope=bot)

## Running local

To get this bot running locally, create a `.env` file in the root directory with these contents:

```
prod:<YOUR DISCORD KEY>
dev:<YOUR DISCORD KEY>
mountainproject=<YOUR MOUNTAINPROJECT KEY>
```

The `npm start` command will run using the `dev` key, and `npm run start-prod` will use the `prod` key. 

Refer to discordapp.com/developers to create your application and get your discord key.

Refer to https://www.mountainproject.com/data to get your mountain project key.