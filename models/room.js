const { Types, Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const roomSchema = new Schema({
  roomName: {
    type: String,
    required: true,
    set: (v) => v.replace(/[^a-z0-9-_!@#$%&*()+=?/><:;,.\\'"\[\] ]/gi, ""),
  },
  password: {
    type: String,
    required: true,
    set: (v) => bcrypt.hashSync(v, 12),
  },
  author: {
    type: Types.ObjectId,
    required: true,
    ref: "user",
  },
  size: {
    type: Number,
    default: 5,
  },
});

module.exports = model("room", roomSchema);
