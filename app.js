const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const session = require("express-session");
const flash = require("connect-flash");

const MONGODB_URI =
  "mongodb+srv://fauzanfebriann:lahat123@cluster0.whp9l.mongodb.net/live-meet?retryWrites=true&w=majority";

const app = express();
const MongoDBStore = require("connect-mongodb-session")(session);

const csrf = require("csurf")();
const Room = require("./models/room");
const roomRoutes = require("./routes/room");
const authRoutes = require("./routes/auth");
const errorHandling = require("./controllers/error");
const setLocals = require("./middleware/setLocals");

let dbErr;
const dbErrHandle = (err) => err && (dbErr = err);
const store = new MongoDBStore(
  {
    uri: MONGODB_URI,
    collection: "sessions",
    expires: 1000 * 60 * 60 * 24 * 365,
  },
  dbErrHandle
);
mongoose.connect(MONGODB_URI).catch(dbErrHandle);

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) =>
  req.protocol === "https"
    ? next()
    : res.redirect("https://" + req.headers.host + req.url)
);

app.use((req, res, next) => (dbErr ? next(new Error(dbErr)) : next()));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 365 },
    store,
  })
);
app.use(csrf, flash(), setLocals);

app.use("/room", roomRoutes);
app.use(authRoutes);
app.get("/", (req, res) =>
  res.render("index", {
    pageTitle: "Home",
    data: {},
    validationErrors: {},
    userRoom: req?.user?.room?.toString?.(),
  })
);

app.use("/500", errorHandling.get500);
app.use(errorHandling.get404);
app.use(errorHandling.globalErrorHandling);

const port = process.env.PORT || 3000;
const server = app.listen(port);
const io = new Server(server);
io.on("connection", (socket) => {
  socket.on("join-room", async (roomId, userId) => {
    let room;
    try {
      room = await Room.findById(roomId);
    } catch (error) {
      room = null;
    }
    const socketRoom = io.sockets.adapter.rooms.get(roomId);
    if (socketRoom?.size === (room?.size || 5)) return socket.emit("room-full");
    await socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) =>
      socket.to(roomId).emit("message", message)
    );

    socket.on("disconnect-share-screen", () => {
      socket
        .to(roomId)
        .emit(
          "user-disconnected",
          `sharescreen${roomId}`.replace(/[^a-z0-9]/gi, "")
        );
    });

    socket.on("disconnect", () => {
      socket.rooms.clear();
      socket
        .to(roomId)
        .emit(
          "user-disconnected",
          userId,
          userId?.includes?.("roomauthor") && !room
        );
    });
  });
});
require("./socket").initIO(io);
