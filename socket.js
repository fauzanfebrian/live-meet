let io;

module.exports = {
  initIO: (ioConn) => (io = ioConn),
  getIO: () => {
    if (!io) throw new Error("IO is not defined");
    return io;
  },
};
