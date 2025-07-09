let io = null;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("Client Connected");

      socket.on("disconnect", () => {
        console.log("Client Disconnected");
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
