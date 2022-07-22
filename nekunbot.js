require("dotenv").config();
const fs = require("fs");
const DiscordJS = require("discord.js");
const { Intents } = DiscordJS;
const mongoose = require("mongoose");

const Config = require("./config");

const client = new DiscordJS.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
    partials: ["CHANNEL"],
});

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    await mongoose.connect(
        process.env.MONGO_URI || "",
        {
            keepAlive: true,
        },
        console.log("Successfully connected to mongoDB")
    );

    client.commands = await new DiscordJS.Collection();
    const commands = getFiles("./commands");
    for (const file of commands) {
        const command = await require(`${file}`);
        client.commands.set(command.name, command);
    }

    await require("./genshinkit").login();
    client.user.setActivity("на свой префикс — n!", { type: "WATCHING" });
    console.log("Everything is ready!");
});

const getFiles = (dir) => {
    const files = fs.readdirSync(dir, {
        withFileTypes: true,
    });

    let commandFiles = [];

    for (const file of files) {
        if (file.isDirectory()) commandFiles = [...commandFiles, ...getFiles(`${dir}/${file.name}`)];
        else if (file.name.endsWith(".js")) commandFiles.push(`${dir}/${file.name}`);
    }

    return commandFiles;
};

client.on("messageCreate", async (msg) => {
    if (msg.author.bot || !msg.content.toLowerCase().startsWith(Config.prefix)) return;

    const args = msg.content.slice(Config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
        client.commands.get(commandName) ||
        client.commands.find((command) => command.aliases && command.aliases.includes(commandName));

    if (!command) return msg.reply(`Команды '${commandName}' не существует`);

    try {
        command.execute(client, msg, args);
    } catch (e) {
        msg.reply(Config.errormsg);
        console.error(e);
    }
});

client.login(process.env.DISCORD_TOKEN);
