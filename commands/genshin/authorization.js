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
                "Здравствуйте, для авторизации вам надо отправить мне токен с сайта https://www.hoyolab.com\n**Инструкция только для ПК:**\n**1.** Авторизоваться на сайте\n**2.** Нажать правой кнопкой мыши в любом месте\n**3.** Кликнуть 'Просмотреть код элемента' (см. 1 скрин)\n**4.** Зайти в раздел консоль и прописать там команду document.cookie, нажать Enter (см. 2 скрин)\n**5.** Ответ на эту команду выслать мне в ЛС\nhttps://imgur.com/ZdwhDUm\nhttps://imgur.com/udbN4cG\n\n**Инструкция для телефонов (работает и на ПК):**\n**1.** Авторизоваться на сайте\n**2.** Скопировать ссылку, отправленную мной следующим сообщением вставить её в поле вместо адреса, и, если требуется, дописать в начале ссылки 'javascript:' (см. 3 скрин)\n**3.** В правом нижнем углу появится значок шестерёнки, нажмите на него и скопируйте токен (см. 4 скрин), а затем отправьте его мне в ЛС\nhttps://i.imgur.com/K7QXBhc.jpg\nhttps://i.imgur.com/HY87mlY.jpg"
            )
            .then((onfullfiled) => {
                msg.author.send(
                    'javascript:(function(){var script=document.createElement("script");script.src="//cdn.takagg.com/eruda-v1/eruda.js";document.body.appendChild(script);script.onload=function(){eruda.init()}})();'
                );
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
