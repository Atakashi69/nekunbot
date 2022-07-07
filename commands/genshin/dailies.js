const Config = require("../../config");
const userUidSchema = require("../../schemas/user-uid-schema");
const genshin = require("../../genshinkit").genshin;

module.exports = {
    name: "dailies",
    description: "Показывает выполнимость дейликов",
    aliases: ["d", "д", "дейлики", "поручения", "dailies", "daily"],
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
                            `[${result.UID}]\n:date: Выполнено поручений: ${
                                dailyNote.finished_task_num
                            }, доп. награда ${
                                dailyNote.is_extra_task_reward_received
                                    ? "собрана :white_check_mark:"
                                    : "не собрана :x:"
                            }`
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
