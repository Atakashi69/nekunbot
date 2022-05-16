const { GenshinKit } = require("@genshin-kit/core");
const genshin = new GenshinKit();

module.exports = {
    genshin,
    login() {
        genshin.loginWithCookie(process.env.MHY_COOKIE);
        genshin.setServerType("os");
        genshin.setServerLocale("ru-ru");
    },
    toDHMS(sec_num) {
        let result = "";
        let days = Math.floor(sec_num / 86400);
        let hours = Math.floor((sec_num - days * 86400) / 3600);
        let minutes = Math.floor((sec_num - days * 86400 - hours * 3600) / 60);
        let seconds = sec_num - days * 86400 - hours * 3600 - minutes * 60;

        if (days > 0) result += days + "д. ";
        if (hours > 0) result += hours + "ч. ";
        if (minutes > 0) result += minutes + "м. ";
        if (seconds > 0) result += seconds + "с. ";
        return result;
    },
    getTransformerTime(recovery_time) {
        let result = "";
        if (recovery_time.Day == 0) {
            if (recovery_time.Hour > 0) result += recovery_time.Hour + "ч. ";
            if (recovery_time.Minute > 0) result += recovery_time.Minute + "м. ";
            if (recovery_time.Second > 0) result += recovery_time.Second + "с. ";
        } else {
            if (recovery_time.Day < 2) result = recovery_time.Day + " день";
            else if (recovery_time.Day < 5) result = recovery_time.Day + " дня";
            else result = recovery_time.Day + " дней";
        }
        return result;
    },
};
