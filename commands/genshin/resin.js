const Config = require("../../config");
const { toDHMS } = require("../../genshinkit");
const userUidSchema = require("../../schemas/user-uid-schema");
const genshin = require("../../genshinkit").genshin;

module.exports = {
    name: "resin",
    description: "Показывает текущее количество смолы",
    aliases: ["r", "р", "смола"],
    async execute(client, msg, args) {
        const query = { discordID: msg.author.id };
        const projection = { cookie: 1, UID: 1 };
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
