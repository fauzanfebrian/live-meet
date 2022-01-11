const express = require("express");

const roomController = require("../controllers/room");
const roomValidation = require("../validator/room");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/", roomController.getRooms);
router.get("/anonym-room", roomController.createAnonymousRoom);
router.get("/create-room", isAuth(), roomController.getCreateRoom);
router.get("/edit-room/:id", isAuth(), roomController.getEditRoom);
router.get("/:roomId", roomController.renderRoom);

router.post(
  "/create-room",
  isAuth(),
  roomValidation.createRoom,
  roomController.postCreateRoom
);
router.post(
  "/edit-room",
  isAuth(),
  roomValidation.editRoom,
  roomController.postEditRoom
);
router.post("/enter-room", roomController.postEnterRoom);

module.exports = router;
