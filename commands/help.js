const { MessageEmbed } = require("discord.js");
const Config = require("../config");

module.exports = {
    name: "help",
    description: "Показывает весь список команд",
    aliases: ["commands", "cmds", "помощь", "команды"],
    async execute(client, msg, args) {
        const data = [];
        const { commands } = msg.client;

        if (args.length === 0) {
            data.push(`${Config.prefix}${commands.map((c) => c.name).join(`\n${Config.prefix}`)}`);
            data.push(
                `\nВы можете написать \`${Config.prefix}help [команда]\`, чтобы получить информацию об определённой команде`
            );

            const helpEmbed = new MessageEmbed()
                .setColor("#657EF8")
                .setTitle("Список всех моих команд")
                .setDescription(data.join(""));

            msg.reply({ embeds: [helpEmbed] });
            return;
        }

        const commandName = args[0];
        const cmd =
            commands.get(commandName) ||
            commands.find((command) => command.aliases && command.aliases.includes(commandName));

        if (!cmd) {
            msg.reply(`Команды '${commandName}' не существует`);
            return;
        }

        if (cmd.name) data.push(`**Имя:** ${cmd.name}`);
        if (cmd.description) data.push(`**Описание:** ${cmd.description}`);
        if (cmd.aliases.length) data.push(`**Синонимы:** [${cmd.aliases.join(", ")}]`);

        const commandEmbed = new MessageEmbed().setColor("#657EF8").setDescription(data.join("\n"));
        msg.reply({ embeds: [commandEmbed] });
    },
};
