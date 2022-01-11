const peerConfig = {
  config: { iceServers },
};

const socket = io("/");
const myPeer = new Peer(
  ISAUTHOR ? `roomauthor${ROOM_ID}`.replace(/[^a-z0-9]/gi, "") : undefined,
  peerConfig
);

const videoGrid = document.getElementById("video-grid");
const messages = document.querySelector("#messages");
const toggleMessageOpen = document.querySelector("#messages .toggle");
const toggleMessage = document.querySelector(".toggle-wrapper .message");
const messageContent = document.querySelector("#messages .messages-content");
const messageInput = document.querySelector("#messages .input-message input");
const messageButton = document.querySelector("#messages .input-message button");

let myStream;

const myVideo = document.createElement("video");
const userMediaOpt = {
  video: { frameRate: 30, facingMode: "user" },
  audio: true,
};
myVideo.muted = true;

function connectToNewUser(userId, stream, peer) {
  const call = (peer || myPeer).call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    const isExist = document.getElementById(userId);
    if (isExist) return;
    addVideoStream(video, userVideoStream, userId);
  });
  call.on("close", () => handleCallClosed(call.peer));
}

function setUserSpeaker(e) {
  const wrapper = e.closest(".wrapper-video");
  const video = wrapper.querySelector("video");
  e.classList.toggle("disable");
  if (wrapper.id !== "my-video") return (video.muted = !video.muted);
  video.michropone = video.michropone === undefined ? true : !video.michropone;
  const audioTrack = myStream
    .getTracks()
    .find((track) => track.kind === "audio");
  audioTrack.enabled = !video.michropone;
}

async function addVideoStream(video, stream, userId) {
  const wrapperVideo = document.createElement("div");
  const wrapperController = document.createElement("div");
  const speaker = document.createElement("button");
  const idVideo = userId || "my-video";

  wrapperVideo.className = "wrapper-video";
  wrapperController.className = "wrapper-controller";
  speaker.className = idVideo === "my-video" ? "mic" : "speaker";

  speaker.setAttribute("onclick", "setUserSpeaker(this)");
  wrapperVideo.setAttribute("id", `${idVideo}`);

  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => video.play());

  video.srcObject.getTracks().forEach((track) => {
    track.onended = () => console.log("ENDED");
  });

  wrapperController.append(speaker);
  wrapperVideo.append(video);
  wrapperVideo.append(wrapperController);

  if (idVideo?.includes?.("screenshare")) {
    video.setAttribute("controls", true);
    videoGrid.insertBefore(wrapperVideo, videoGrid.firstElementChild);
  } else videoGrid.append(wrapperVideo);

  return wrapperVideo;
}

const handleCallClosed = (id) => {
  myPeer.connections[id]?.[0]?.close();
  const video = document.getElementById(id);
  video?.remove?.();
};
const toggleMessageHandler = () => {
  messages.classList.toggle("closed");
  toggleMessage.innerText = "Messages";
};

function roomFullHandler() {
  alert("the room is full");
  window.location = "/room/anonym-room";
}

async function init() {
  const stream = await navigator.mediaDevices.getUserMedia(userMediaOpt);
  myStream = stream;
  addVideoStream(myVideo, stream);
  myPeer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      const isExist = document.getElementById(call.peer);
      if (isExist) return;
      addVideoStream(video, userVideoStream, call.peer);
    });
    call.on("close", () => handleCallClosed(call.peer));
  });

  socket.on("room-full", roomFullHandler);
  socket.on("user-connected", (userId) => connectToNewUser(userId, stream));
  socket.on("user-disconnected", (userId, destroy) => {
    handleCallClosed(userId);
    if (destroy) {
      alert(
        "The author of this room has leaved, this room will be destroyed on 5 seconds"
      );
      setTimeout(() => (window.location = "/"), 5000);
    }
    if (videoGrid.firstElementChild.id.includes("screenshare")) {
      videoGrid.firstElementChild.remove();
    }
  });
  socket.on("message", (message) => {
    const text = document.createElement("p");
    text.innerText = message;
    messageContent.append(text);
    const totalMessage =
      +toggleMessage.innerText?.split?.("( ")?.[1]?.split?.(" )")?.[0] ||
      undefined;

    if (totalMessage === undefined)
      toggleMessage.innerText = `Messages ( 1 ) >`;
    else toggleMessage.innerText = `Messages ( ${totalMessage + 1} ) >`;
  });

  myPeer.on("open", (id) => socket.emit("join-room", ROOM_ID, myPeer.id));
}

new MutationObserver((entries) => {
  const videoContainer = videoGrid.childNodes;
  videoContainer?.forEach?.(
    (doc) => doc.firstElementChild.nodeName !== "VIDEO" && doc.remove()
  );
}).observe(videoGrid, { childList: true });

messageButton.addEventListener("click", () => {
  if (messageInput.value.length < 1) return;
  socket.emit("message", messageInput.value);
  const p = document.createElement("p");
  p.innerText = messageInput.value;
  messageContent.append(p);
  messageInput.value = "";
});

toggleMessageOpen.addEventListener("click", toggleMessageHandler);
toggleMessage.addEventListener("click", toggleMessageHandler);

init();
