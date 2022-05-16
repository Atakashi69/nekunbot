module.exports = {
    name: "ping",
    description: "Проверить задержку бота (в развитии).",
    aliases: ["пинг"],
    async execute(client, msg, args) {
        msg.reply(`pong! (${client.ws.ping}ms)`);
    },
};
