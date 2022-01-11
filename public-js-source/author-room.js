const buttonShareScreen = document.querySelector("#share-screen");
const controller = document.querySelector("#controller");
const toggleControllerOpen = document.querySelector("#controller .toggle");
const toggleController = document.querySelector(".toggle-wrapper .setting");

let screenShare, screenStream, screenPeer;

async function stopScreenSharing() {
  if (screenShare || !screenPeer) return;

  socket.emit("disconnect-share-screen");

  screenPeer.destroy();
  screenPeer = null;

  const screenShareWrapper = videoGrid.firstElementChild;
  screenStream.getTracks().forEach((track) => track.stop());
  screenShareWrapper.remove();
  screenStream = null;

  buttonShareScreen.innerText = "Share screen";
  buttonShareScreen.classList.remove("danger");
}
async function startShareScreen() {
  if (screenShare) {
    screenShare = false;
    return stopScreenSharing();
  }
  try {
    const videoScreen = document.createElement("video");
    const stream = await navigator?.mediaDevices?.getDisplayMedia?.({
      video: { cursor: "always", frameRate: 30 },
    });
    if (!stream) throw new Error("This device is not supported");

    const peer = new Peer(
      `screenshare${ROOM_ID}`.replace(/[^a-z0-9]/gi, ""),
      peerConfig
    );

    screenPeer = peer;
    screenStream = stream;
    stream.getTracks().forEach((track) => (track.onended = stopScreenSharing));

    videoScreen.muted = true;

    const peerConnectId = [...myPeer._connections]
      .filter((conn) => conn?.[1]?.length > 0)
      .map((conn) => conn?.[0]);

    peer.on("open", (id) => {
      addVideoStream(videoScreen, stream, id);
      socket.on("user-connected", (userId) =>
        connectToNewUser(userId, stream, peer)
      );
      peerConnectId.forEach((id) => peer.call(id, stream));
    });

    buttonShareScreen.innerText = "Stop share screen";
    buttonShareScreen.classList.add("danger");
    screenShare = true;
  } catch (error) {
    alert(error.message || "This device is not support to share screen");
  }
}

buttonShareScreen.addEventListener("click", startShareScreen);
toggleControllerOpen.addEventListener("click", () =>
  controller.classList.toggle("closed")
);
toggleController.addEventListener("click", () =>
  controller.classList.toggle("closed")
);
