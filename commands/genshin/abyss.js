const { MessageEmbed, MessageAttachment } = require("discord.js");
const Config = require("../../config");
const fs = require("fs");
const userUidSchema = require("../../schemas/user-uid-schema");
const { createCanvas, loadImage, registerFont } = require("canvas");
const genshin = require("../../genshinkit").genshin;

module.exports = {
    name: "abyss",
    description: "Показывает информацию о вашей бездне",
    aliases: ["a", "а", "бездна"],
    async execute(client, msg, args) {
        const query = { discordID: msg.author.id };
        const projection = { cookie: 1, UID: 1 };
        userUidSchema
            .findOne(query, projection)
            .then((result) => {
                genshin
                    .setCookie(result.cookie)
                    .getAbyss(result.UID)
                    .then((abyss) => {
                        msg.reply("Ваш запрос обрабатывается, это займёт некоторое время :clock6:").then((msg) => {
                            getFloorsPic(abyss.floors).then((floorspic) => {
                                msg.edit({
                                    content: `[${result.UID}]\n` + getAbyssContent(abyss),
                                    embeds: getAbyssEmbed(abyss),
                                    files: [floorspic],
                                });
                            });
                        });
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

function getAbyssContent(abyss) {
    let result = `**Обзор витой бездны**\nПериод события: с ${new Date(
        abyss.start_time * 1000
    ).toLocaleDateString()} по ${new Date(abyss.end_time * 1000).toLocaleDateString()}\nМакс. глубина: ${
        abyss.max_floor
    } | ${abyss.total_star} :star: \nБитвы: ${abyss.total_win_times}/${abyss.total_battle_times} | ${Math.floor(
        (abyss.total_win_times / abyss.total_battle_times) * 100
    )}% побед`;
    return result;
}

function getAbyssEmbed(abyss) {
    const abyssEmbed = new MessageEmbed()
        .setColor("#4B0082")
        .setTitle("Боевая статистика")
        .setDescription(
            `
        **Максимум побед: **${abyss.defeat_rank[0].value} [${getCharNameFromURL(
                abyss.defeat_rank[0].avatar_icon
            )}]\n**Самый мощный удар: ** ${abyss.damage_rank[0].value} [${getCharNameFromURL(
                abyss.damage_rank[0].avatar_icon
            )}]\n**Макс. полученного урона: ** ${abyss.take_damage_rank[0].value} [${getCharNameFromURL(
                abyss.take_damage_rank[0].avatar_icon
            )}]\n**Выполнено взрывов стихий: ** ${abyss.energy_skill_rank[0].value} [${getCharNameFromURL(
                abyss.energy_skill_rank[0].avatar_icon
            )}]\n**Элементальные навыки: ** ${abyss.normal_skill_rank[0].value} [${getCharNameFromURL(
                abyss.normal_skill_rank[0].avatar_icon
            )}]\n**Попыток битв: ** ${getCharNameFromURL(abyss.reveal_rank[0].avatar_icon)}-${
                abyss.reveal_rank[0].value
            }, ${getCharNameFromURL(abyss.reveal_rank[1].avatar_icon)}-${
                abyss.reveal_rank[1].value
            }, ${getCharNameFromURL(abyss.reveal_rank[2].avatar_icon)}-${
                abyss.reveal_rank[2].value
            }, ${getCharNameFromURL(abyss.reveal_rank[3].avatar_icon)}-${abyss.reveal_rank[3].value}`
        )
        .setURL("https://www.hoyolab.com/accountCenter")
        .setImage(`attachment://floors.png`);

    return [abyssEmbed];
}

async function getFloorsPic(floors) {
    const path = __dirname + "\\abyssres\\";
    const imageName = `floors.png`;
    registerFont(path + "gifont.ttf", { family: "HYWenHei" });
    const canvas = createCanvas(1600, 1000);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.font = '24px "HYWenHei"';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(Config.errormsg, canvas.width / 2, 50);

    await loadImage(path + "abyssbg.png").then((image) => {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    });

    for (let i = 1; i <= 4; i++) {
        const floorWidth = canvas.width / 4;
        const offsetX = floorWidth * (i - 1);

        let grd = ctx.createLinearGradient(offsetX, 0, offsetX, canvas.height);
        grd.addColorStop(0, `rgba(90, 0, 130, ${0.15 + 0.15 * (i % 2)})`);
        grd.addColorStop(1, `rgba(30, 0, 130, ${0.15 + 0.15 * (i % 2)})`);
        ctx.fillStyle = grd;
        ctx.fillRect(offsetX, 0, floorWidth, canvas.height);

        const floorNumberWidth = floorWidth * 0.6; //Ширина прямоугольника "Номер этажа"
        ctx.fillRect(offsetX + (floorWidth / 2 - floorNumberWidth / 2), 50, floorNumberWidth, 50);

        for (let j = 1; j <= 3; j++) {
            const offsetY = (canvas.height / 3 - 50) * (j - 1);
            ctx.fillStyle = "rgba(75, 0, 130, 0.5)"; //Цвет прямоугольников

            const floorResultWidth = floorWidth * 0.8; //Ширина прямоугольника с результатом
            ctx.fillRect(offsetX + (floorWidth / 2 - floorResultWidth / 2), offsetY + 125, floorResultWidth, 25);

            const halfFloorWidth = floorWidth / 2;
            const floorFirstHalfWidth = halfFloorWidth * 0.8; //Ширина прямоугольника "половина"
            ctx.fillRect(
                offsetX + (halfFloorWidth / 2 - floorFirstHalfWidth / 2),
                offsetY + 175,
                floorFirstHalfWidth,
                25
            );
            ctx.fillRect(
                offsetX + (halfFloorWidth * 1.5 - floorFirstHalfWidth / 2),
                offsetY + 175,
                floorFirstHalfWidth,
                25
            );

            let quartFloorWidth = halfFloorWidth / 2;
            const avatarWidth = 64;
            const avatarHeight = 80;
            ctx.fillRect(offsetX + (quartFloorWidth - avatarWidth) - 5, offsetY + 210, avatarWidth, avatarHeight);
            ctx.fillRect(offsetX + quartFloorWidth + 5, offsetY + 210, avatarWidth, avatarHeight);
            ctx.fillRect(offsetX + (quartFloorWidth - avatarWidth) - 5, offsetY + 300, avatarWidth, avatarHeight);
            ctx.fillRect(offsetX + quartFloorWidth + 5, offsetY + 300, avatarWidth, avatarHeight);

            await loadImage(floors[i - 1].levels[j - 1].battles[0].avatars[0].icon).then((image) => {
                ctx.drawImage(
                    image,
                    offsetX + (quartFloorWidth - avatarWidth) - 5,
                    offsetY + 210,
                    avatarWidth,
                    avatarWidth
                );
            });
            await loadImage(floors[i - 1].levels[j - 1].battles[0].avatars[1].icon).then((image) => {
                ctx.drawImage(image, offsetX + quartFloorWidth + 5, offsetY + 210, avatarWidth, avatarWidth);
            });
            await loadImage(floors[i - 1].levels[j - 1].battles[0].avatars[2].icon).then((image) => {
                ctx.drawImage(
                    image,
                    offsetX + (quartFloorWidth - avatarWidth) - 5,
                    offsetY + 300,
                    avatarWidth,
                    avatarWidth
                );
            });
            await loadImage(floors[i - 1].levels[j - 1].battles[0].avatars[3].icon).then((image) => {
                ctx.drawImage(image, offsetX + quartFloorWidth + 5, offsetY + 300, avatarWidth, avatarWidth);
            });

            ctx.fillStyle = "white";
            ctx.font = '12px "HYWenHei"';
            ctx.fillText(
                `${floors[i - 1].levels[j - 1].battles[0].avatars[0].level}`,
                offsetX + quartFloorWidth - 5 - avatarWidth / 2,
                offsetY + 210 + avatarWidth + 12
            );
            ctx.fillText(
                `${floors[i - 1].levels[j - 1].battles[0].avatars[1].level}`,
                offsetX + quartFloorWidth + 5 + avatarWidth / 2,
                offsetY + 210 + avatarWidth + 12
            );
            ctx.fillText(
                `${floors[i - 1].levels[j - 1].battles[0].avatars[2].level}`,
                offsetX + quartFloorWidth - 5 - avatarWidth / 2,
                offsetY + 300 + avatarWidth + 12
            );
            ctx.fillText(
                `${floors[i - 1].levels[j - 1].battles[0].avatars[3].level}`,
                offsetX + quartFloorWidth + 5 + avatarWidth / 2,
                offsetY + 300 + avatarWidth + 12
            );
            ctx.fillStyle = "rgba(75, 0, 130, 0.5)"; //Цвет прямоугольников

            quartFloorWidth = halfFloorWidth * 1.5;
            ctx.fillRect(offsetX + (quartFloorWidth - avatarWidth) - 5, offsetY + 210, avatarWidth, avatarHeight);
            ctx.fillRect(offsetX + quartFloorWidth + 5, offsetY + 210, avatarWidth, avatarHeight);
            ctx.fillRect(offsetX + (quartFloorWidth - avatarWidth) - 5, offsetY + 300, avatarWidth, avatarHeight);
            ctx.fillRect(offsetX + quartFloorWidth + 5, offsetY + 300, avatarWidth, avatarHeight);

            await loadImage(floors[i - 1].levels[j - 1].battles[1].avatars[0].icon).then((image) => {
                ctx.drawImage(
                    image,
                    offsetX + (quartFloorWidth - avatarWidth) - 5,
                    offsetY + 210,
                    avatarWidth,
                    avatarWidth
                );
            });
            await loadImage(floors[i - 1].levels[j - 1].battles[1].avatars[1].icon).then((image) => {
                ctx.drawImage(image, offsetX + quartFloorWidth + 5, offsetY + 210, avatarWidth, avatarWidth);
            });
            await loadImage(floors[i - 1].levels[j - 1].battles[1].avatars[2].icon).then((image) => {
                ctx.drawImage(
                    image,
                    offsetX + (quartFloorWidth - avatarWidth) - 5,
                    offsetY + 300,
                    avatarWidth,
                    avatarWidth
                );
            });
            await loadImage(floors[i - 1].levels[j - 1].battles[1].avatars[3].icon).then((image) => {
                ctx.drawImage(image, offsetX + quartFloorWidth + 5, offsetY + 300, avatarWidth, avatarWidth);
            });

            ctx.fillStyle = "white";
            ctx.font = '12px "HYWenHei"';
            ctx.fillText(
                `${floors[i - 1].levels[j - 1].battles[1].avatars[0].level}`,
                offsetX + quartFloorWidth - 5 - avatarWidth / 2,
                offsetY + 210 + avatarWidth + 12
            );
            ctx.fillText(
                `${floors[i - 1].levels[j - 1].battles[1].avatars[1].level}`,
                offsetX + quartFloorWidth + 5 + avatarWidth / 2,
                offsetY + 210 + avatarWidth + 12
            );
            ctx.fillText(
                `${floors[i - 1].levels[j - 1].battles[1].avatars[2].level}`,
                offsetX + quartFloorWidth - 5 - avatarWidth / 2,
                offsetY + 300 + avatarWidth + 12
            );
            ctx.fillText(
                `${floors[i - 1].levels[j - 1].battles[1].avatars[3].level}`,
                offsetX + quartFloorWidth + 5 + avatarWidth / 2,
                offsetY + 300 + avatarWidth + 12
            );

            ctx.fillStyle = "white";
            ctx.font = '16px "HYWenHei"';
            ctx.fillText(
                `${floors[i - 1].levels[j - 1].index} Зал | ${floors[i - 1].levels[j - 1].star}/${
                    floors[i - 1].levels[j - 1].max_star
                }★ | ${new Date(floors[i - 1].levels[j - 1].battles[0].timestamp * 1000).toLocaleDateString()}`,
                offsetX + floorWidth / 2,
                offsetY + 143
            );
            ctx.fillText("1 половина", offsetX + halfFloorWidth / 2, offsetY + 192);
            ctx.fillText("2 половина", offsetX + halfFloorWidth * 1.5, offsetY + 192);
        }

        ctx.font = '24px "HYWenHei"';
        ctx.fillText(`${floors[i - 1].index} Этаж`, offsetX + floorWidth / 2, 84);
    }

    const attachment = new MessageAttachment(canvas.toBuffer(), imageName);
    return attachment;
}

function getCharNameFromURL(url) {
    let temp = url.split("_").pop();
    let name = temp.substring(0, temp.indexOf("."));
    let DB = JSON.parse(fs.readFileSync(__dirname + "\\abyssres\\entoru.json", "utf8"));
    return DB[name] || name;
}
