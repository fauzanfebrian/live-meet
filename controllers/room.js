const bcrypt = require("bcrypt");
const { v4: uuidV4, validate: uuidValidate } = require("uuid");

const errorsValidate = require("../utils/errorsValidate");
const Room = require("../models/room");
const { getIO } = require("../socket");

exports.createAnonymousRoom = (req, res) => {
  try {
    const io = getIO();

    const getRoomId = () => {
      const roomId = uuidV4();
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room?.size > 0) return getRoomId();
      return roomId;
    };

    res.redirect(`/room/${getRoomId()}`);
  } catch (error) {
    next(error);
  }
};
exports.renderRoom = async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    let author = false;
    if (!uuidValidate(roomId)) {
      const isAllowed = req.session.roomEnters?.includes?.(roomId);
      if (!isAllowed && roomId !== req?.user?.room?.toString?.()) {
        req.flash("error", "You're not allowed to enter this room");
        return res.redirect("/");
      }

      const room = await Room.findById(roomId);
      if (!room) return res.redirect("/anonym-room");

      if (room.author.toString() === req?.user?._id?.toString?.())
        author = true;
    } else {
      const io = getIO();
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) author = true;
    }

    res.render("room/room", {
      roomId,
      author,
      userName: req?.user?.name,
      userId: req?.user?._id?.toString?.(),
    });
  } catch (error) {
    next(error);
  }
};

exports.getCreateRoom = (req, res, next) => {
  res.render("room/create", {
    pageTitle: "Create your own room",
    data: {},
    validationErrors: {},
    edit: false,
  });
};
exports.getEditRoom = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findOne({ _id: roomId, author: req.user }).select(
      "-password"
    );
    if (!room) {
      req.flash("error", "Your room is not found");
      req.render("/");
    }
    res.render("room/create", {
      pageTitle: "Edit your own room",
      data: room,
      validationErrors: {},
      edit: true,
      roomId,
    });
  } catch (error) {
    if (error.message?.includes("Cast to ObjectId failed for value"))
      return res.redirect("/");
    next(error);
  }
};
exports.getRooms = async (req, res, next) => {
  const user = req.user ? await req.user.populate("room") : {};
  const rooms = req.session.roomEnters
    ? await Room.find({ _id: { $in: req.session.roomEnters } })
    : [];

  if (user?.room) rooms.unshift(user.room);

  res.render("room/index", { pageTitle: "Rooms", rooms });
};

exports.postCreateRoom = async (req, res, next) => {
  try {
    if (req.user.room) {
      req.flash("error", "You already have a room");
      return res.redirect("/room/create-room");
    }
    const { errorsArray, validationErrors, isEmpty } = errorsValidate(req);
    if (!isEmpty)
      return res.status(422).render("room/create", {
        pageTitle: "Create your own room",
        errorMessage: errorsArray[0].msg,
        data: req.body,
        validationErrors,
        edit: false,
      });

    const isNameExist = await Room.findOne({ roomName: req.body.roomName });
    if (isNameExist) {
      req.flash("error", "Room name already exist");
      return res.redirect("/room/create-room");
    }

    const room = await Room.create({ ...req.body, author: req.user });
    req.user.room = room;
    await req.user.save();
    req.flash("success", "Your room is created");
    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};
exports.postEditRoom = async (req, res, next) => {
  try {
    const { errorsArray, validationErrors, isEmpty } = errorsValidate(req);
    if (!isEmpty)
      return res.status(422).render("room/create", {
        pageTitle: "Create your own room",
        errorMessage: errorsArray[0].msg,
        data: req.body,
        validationErrors,
        edit: true,
      });

    const isNameExist = await Room.findOne({ roomName: req.body.roomName });
    if (
      isNameExist &&
      isNameExist.author.toString() !== req.user._id.toString()
    ) {
      req.flash("error", "Room name already exist");
      return res.redirect("/room/edit-room");
    }
    await Room.findByIdAndUpdate(req.body.roomId, req.body);
    req.flash("success", "Your room edit successful");
    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};
exports.postEnterRoom = async (req, res, next) => {
  try {
    const { roomName, password } = req.body;
    if (!roomName || !password) {
      req.flash("error", "Fill the field");
      return res.redirect("/");
    }
    const room = await Room.findOne({ roomName });
    if (!room) {
      await req.flash("error", "Room Not Found");
      return res.redirect("/");
    }
    const isEqual = await bcrypt.compare(password, room.password);
    if (!isEqual) {
      await req.flash("error", "Wrong Password");
      return res.redirect("/");
    }

    const roomId = room._id.toString();
    if (roomId !== req.user?._id?.toString?.()) {
      const roomEnters = req.session.roomEnters
        ? [...req.session.roomEnters]
        : [];
      if (!roomEnters.includes(roomId)) roomEnters.push(roomId);
      req.session.roomEnters = roomEnters;
    }

    return res.redirect(`/room/${roomId}`);
  } catch (error) {
    next(error);
  }
};
