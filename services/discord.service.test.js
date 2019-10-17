const discordService = require('./discord.service');

const fakeClient = {
    user: {
        setActivity: jest.fn(),
    },
};
const fakeMountainProjectService = {
    process: jest.fn(),
};
const fakeConsole = {
    log: jest.fn(),
};
const fakeMember = {
    guild: {
        defaultChannel: {
            send: jest.fn(),
        },
    },
};
const baseMessage = {
    delete: jest.fn(),
    channel: {
        send: jest.fn(),
    },
    author: {
        bot: false,
    },
};

describe('Discord Service', () => {
    let testObject;
    beforeEach(() => {
        testObject = discordService({
            client: fakeClient,
            mountainProjectService: fakeMountainProjectService,
            console: fakeConsole,
        });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('onReady', () => {
        it("should set the game to 'with a bunch of bananas'", () => {
            testObject.onReady();

            expect(fakeClient.user.setActivity).toHaveBeenCalledWith('with a bunch of bananas');
            expect(fakeConsole.log).toHaveBeenCalledWith(`logged in as ${fakeClient.user.tag}!`);
        });
    });
    describe('onNewMember', () => {
        it('should welcome the new member in the default channel', () => {
            testObject.onNewMember(fakeMember);

            expect(fakeMember
                .guild
                .defaultChannel
                .send).toHaveBeenCalledWith(`Hey ${fakeMember}, welcome to the chat!`);
        });
    });
    describe('onMessage', () => {
        describe('exit early', () => {
            it('should exit early if message does not start with my prefix', async () => {
                const message = {
                    ...baseMessage,
                    content: 'does not start with prefix',
                };

                await testObject.onMessage(message);

                expect(fakeMountainProjectService.process).not.toHaveBeenCalled();
                expect(message.channel.send).not.toHaveBeenCalled();
            });
            it('should exit early if message does not start with !mp', () => {
                const message = {
                    ...baseMessage,
                    content: '!mo',
                };

                testObject.onMessage(message);

                expect(fakeMountainProjectService.process).not.toHaveBeenCalled();
                expect(message.channel.send).not.toHaveBeenCalled();
            });
            it('should exit early if message was from a bot', () => {
                const message = {
                    ...baseMessage,
                    content: '!',
                    author: {
                        bot: true,
                    },
                };

                testObject.onMessage(message);

                expect(message.channel.send).not.toHaveBeenCalled();
            });
        });
        it('should defer to MountainProjectService', async () => {
            const expectedReturnValue = 'hi';
            fakeMountainProjectService.process = jest.fn(() => expectedReturnValue);

            const expectedParams = ['whatever', 'other', 'text', 'was', 'passed'];
            const expectedUser = '4567';
            const message = {
                ...baseMessage,
                author: {
                    id: expectedUser,
                },
                content: `!mp ${expectedParams.join(' ')}`,
            };

            await testObject.onMessage(message);

            expect(fakeMountainProjectService.process).toHaveBeenCalledWith(expectedParams, expectedUser);
            expect(message.channel.send).toHaveBeenCalledWith(expectedReturnValue);
        });
        it('should handle MountainProjectService returning an array', async () => {
            const expectedReturnValue = ['hi', 'bye'];
            fakeMountainProjectService.process = jest.fn(
                () => expectedReturnValue,
            );

            const expectedParams = [
                'whatever',
                'other',
                'text',
                'was',
                'passed',
            ];
            const message = {
                ...baseMessage,
                content: `!mp ${expectedParams.join(' ')}`,
            };

            await testObject.onMessage(message);

            expect(fakeMountainProjectService.process).toHaveBeenCalledWith(
                expectedParams, undefined,
            );
            expectedReturnValue.forEach((item) => {
                expect(message.channel.send).toHaveBeenCalledWith(item);
            });
        });
        it('should handle self-destructing messages', async () => {
            const expectedReturnValue = {
                selfdestruct: true,
                timeout: 420,
                message: 'blaze it',
            };

            fakeMountainProjectService.process = jest.fn(() => expectedReturnValue);

            const myReply = {
                delete: jest.fn(),
            };
            const message = {
                ...baseMessage,
                channel: {
                    send: jest.fn(() => Promise.resolve(myReply)),
                },
                content: '!mp set 7563',
            };
            await testObject.onMessage(message);

            expect(message.channel.send).toHaveBeenCalledWith(expectedReturnValue.message);
            expect(myReply.delete).toHaveBeenCalledWith(expectedReturnValue.timeout);
            expect(message.delete).toHaveBeenCalledWith(expectedReturnValue.timeout);
        });
        it('should handle errors being thrown', async () => {
            const expectedMessage = 'error!!!';
            fakeMountainProjectService.process = jest.fn(() => { throw new Error(expectedMessage); });
            const message = {
                ...baseMessage,
                content: '!mp set',
            };

            await testObject.onMessage(message);

            expect(message.channel.send).toHaveBeenCalledWith(expectedMessage);
        });
    });
});
