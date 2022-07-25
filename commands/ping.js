module.exports = {
    name: "ping",
    description: "Проверяет задержку бота",
    aliases: ["пинг"],
    async execute(client, msg, args) {
        msg.reply(`pong! (${client.ws.ping}ms)`);
    },
};
