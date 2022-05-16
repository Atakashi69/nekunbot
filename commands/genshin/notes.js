const Config = require("../../config");
const { toDHMS, getTransformerTime } = require("../../genshinkit");
const userUidSchema = require("../../schemas/user-uid-schema");
const genshin = require("../../genshinkit").genshin;

module.exports = {
    name: "notes",
    description: "Показывает текущее количество смолы",
    aliases: ["n", "з", "заметки"],
    async execute(client, msg, args) {
        if (args.length != 0) return;
        const query = { discordID: msg.author.id };
        const projection = { cookie: 1, UID: 1 };
        userUidSchema
            .findOne(query, projection)
            .then((result) => {
                genshin
                    .setCookie(result.cookie)
                    .getDailyNote(result.UID)
                    .then((dailyNote) => {
                        msg.reply(
                            `:notebook_with_decorative_cover: **Игровые заметки**\n:crescent_moon: Смола: ${
                                dailyNote.current_resin
                            }/${dailyNote.max_resin}\n:arrows_counterclockwise: До полного восстановления ${toDHMS(
                                dailyNote.resin_recovery_time
                            )}\n:date: Выполнено поручений: ${dailyNote.finished_task_num}, доп. награда ${
                                dailyNote.is_extra_task_reward_received ? "собрана" : "не собрана"
                            }\n:money_with_wings: Скидки на боссов: ${
                                dailyNote.remain_resin_discount_num
                            }\n:moneybag: Монеты обители: ${dailyNote.current_home_coin}/${
                                dailyNote.max_home_coin
                            }\n:arrows_counterclockwise: До полного восстановления ${toDHMS(
                                dailyNote.home_coin_recovery_time
                            )}\n:recycle: Преобразователь: ${
                                dailyNote.transformer.obtained ? "собран" : "не собран"
                            }\n:arrows_counterclockwise: До полного восстановления ${getTransformerTime(
                                dailyNote.transformer.recovery_time
                            )}\n:mag: Начатых экспедиций: ${dailyNote.current_expedition_num}/${
                                dailyNote.max_expedition_num
                            }\n${getExpeditionList(dailyNote.expeditions)}`
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

function getExpeditionList(expeditions) {
    let result = "";
    for (let i = 0; i < expeditions.length; i++) {
        result += `\t\t:clock1: Осталось времени: ${toDHMS(expeditions[i].remained_time)}`;
        if (i != expeditions.length - 1) result += "\n";
    }
    return result;
}
