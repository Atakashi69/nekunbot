const Config = require("../../config");
const userUidSchema = require("../../schemas/user-uid-schema");

module.exports = {
    name: "authorization",
    description: "Связывает ваш дискорд ID с предоставленным UID",
    aliases: ["auth", "авторизация"],
    async execute(client, msg, args) {
        const filter = (m) => m.author.id === msg.author.id;
        msg.author
            .send(
                "Здравствуйте, для авторизации вам надо отправить мне токен с сайта https://www.hoyolab.com\nЧтобы это сделать, вам необходимо:\n**1.** Авторизоваться на сайте\n**2.** Нажать правой кнопкой мыши в любом месте\n**3.** Кликнуть 'Просмотреть код элемента'\n**4.** Зайти в раздел консоль и прописать там команду document.cookie, нажать Enter\n**5.** Ответ на эту команду выслать мне в ЛС\n(скриншоты для наглядности)\nhttps://imgur.com/ZdwhDUm\nhttps://imgur.com/udbN4cG"
            )
            .then((onfullfiled) => {
                msg.author.dmChannel
                    .awaitMessages({ filter, max: 1, time: 3600_000, errors: ["time"] })
                    .then((respondCookie) => {
                        respondCookie = respondCookie.first();
                        msg.author.dmChannel.send("Отлично, теперь отправьте мне ваш UID").then((onfullfiled) => {
                            msg.author.dmChannel
                                .awaitMessages({ filter, max: 1, time: 3600_000, errors: ["time"] })
                                .then((respondUID) => {
                                    respondUID = respondUID.first();
                                    const query = { discordID: msg.author.id };
                                    const update = {
                                        $set: {
                                            discordID: msg.author.id,
                                            cookie: respondCookie.content,
                                            UID: parseInt(respondUID.content),
                                        },
                                    };
                                    const options = { upsert: true };
                                    userUidSchema
                                        .updateOne(query, update, options)
                                        .then((result) => {
                                            if (result.upsertedId) {
                                                msg.author.dmChannel.send(
                                                    ":white_check_mark: Предоставленный вами UID был связан с вашим дискорд аккаунтом"
                                                );
                                            } else {
                                                msg.author.dmChannel.send(
                                                    ":white_check_mark: UID был обновлён в базе данных"
                                                );
                                            }
                                        })
                                        .catch((e) => {
                                            msg.author.dmChannel.send(Config.errormsg);
                                            console.error(e);
                                        });
                                })
                                .catch((e) => {
                                    msg.author.dmChannel.send(
                                        "После часа ожиданий я не получил никакого ответа, до свидания"
                                    );
                                    console.error(e);
                                });
                        });
                    })
                    .catch((e) => {
                        msg.author.dmChannel.send("После часа ожиданий я не получил никакого ответа, до свидания");
                        console.error(e);
                    });
            });
    },
};
