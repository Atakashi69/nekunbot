const Config = require("../../config");
const { toDHMS } = require("../../genshinkit");
const userUidSchema = require("../../schemas/user-uid-schema");
const genshin = require("../../genshinkit").genshin;

module.exports = {
    name: "resin",
    description: "Показывает текущее количество смолы",
    aliases: ["r", "с", "смола"],
    async execute(client, msg, args) {
        let query,
            projection = { cookie: 1, UID: 1 };
        if (args.length > 1) msg.reply("Слишком много аргументов");
        if (args.length == 0) {
            query = { discordID: msg.author.id };
        } else {
            if (args[0].length == 9) query = { UID: args[0] };
            else if (args[0].startsWith("<@")) query = { discordID: args[0].substring(2, args[0].length - 1) };
        }
        userUidSchema
            .findOne(query, projection)
            .then((result) => {
                genshin.setCookie(result.cookie);
                genshin
                    .getDailyNote(result.UID)
                    .then((dailyNote) => {
                        msg.reply(
                            `[${result.UID}]\n:crescent_moon: Смола: ${dailyNote.current_resin}/${
                                dailyNote.max_resin
                            }\n:arrows_counterclockwise: До полного восстановления ${toDHMS(
                                dailyNote.resin_recovery_time
                            )}`
                        );
                    })
                    .catch((e) => {
                        msg.reply(Config.errormsg);
                        console.error(e);
                    });
            })
            .catch((e) => {
                msg.reply(`${Config.errormsg} ${Config.authmsg}`);
                console.error(e);
            });
    },
};
