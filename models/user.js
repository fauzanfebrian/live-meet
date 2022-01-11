const { Types, Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    set: (v) => bcrypt.hashSync(v, 12),
  },
  email: {
    type: String,
    required: true,
  },
  room: {
    type: Types.ObjectId,
    ref: "room",
  },
});

module.exports = model("user", userSchema);
