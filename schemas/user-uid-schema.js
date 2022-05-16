const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    discordID: {
        type: String,
        required: true,
    },
    cookie: {
        type: String,
        required: false,
    },
    UID: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("userUid", schema, "user-uid");
