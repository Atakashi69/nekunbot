const { MessageEmbed } = require("discord.js");
const Config = require("../config");

module.exports = {
    name: "help",
    description: "Показывает весь список команд",
    aliases: ["commands", "cmds", "помощь", "команды"],
    async execute(client, msg, args) {
        const data = [];
        const { commands } = msg.client;

        if (!args.length) {
            data.push(`${Config.prefix}${commands.map((c) => c.name).join(`\n${Config.prefix}`)}`);
            data.push(
                `Вы можете написать \`${Config.prefix}help [команда]\`, чтобы получить информацию об определённой команде`
            );

            const helpEmbed = new MessageEmbed()
                .setColor("#657EF8")
                .setTitle("Список всех моих команд")
                .setDescription(data.join());

            msg.reply({ embeds: helpEmbed });
            return;
        }

        const commandName = args[0];
        const cmd =
            commands.get(commandName) ||
            commands.find((command) => command.aliases && command.aliases.includes(commandName));

        if (!command) {
            msg.reply(`Команды '${commandName}' не существует`);
            return;
        }

        data.push();
    },
};

function getHelpEmbed(data) {
    return [helpEmbed];
}

function getCommandEmbed() {}
