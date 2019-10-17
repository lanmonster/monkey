module.exports = ({
    client,
    mountainProjectService,
    console,
}) => ({
    onReady: () => {
        client.user.setActivity('with a bunch of bananas');
        console.log(`logged in as ${client.user.tag}!`);
    },

    onNewMember: (member) => {
        member.guild.defaultChannel.send(`Hey ${member}, welcome to the chat!`);
    },

    onMessage: async (message) => {
        if (!message.content.startsWith('!mp')) return;
        if (message.author.bot) return;

        try {
            const result = await mountainProjectService.process(message.content.split(' ').slice(1), message.author.id);

            if (result.selfdestruct) {
                message.channel.send(result.message)
                    .then((reply) => {
                        reply.delete(result.timeout);
                        message.delete(result.timeout);
                    });
            } else if (result instanceof Array) {
                result.forEach(item => message.channel.send(item));
            } else {
                message.channel.send(result);
            }
        } catch (error) {
            message.channel.send(error.message);
        }
    },
});
