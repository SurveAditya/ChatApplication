const express = require("express");
require("dotenv").config();
const app = express();
const dbConfig = require("./config/dbConfig");
const port = process.env.PORT || 5000;

const usersRoute = require("./routes/usersRoute");
const chatsRoute = require("./routes/chatsRoute");
const messagesRoute = require("./routes/messagesRoute");
app.use(
  express.json({
    limit: "50mb",
  })
);

//we need to write this server code to use socket.io
//note that in the end we listen to this server
const server = require("http").createServer(app);

// this code is for cors request
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// check the connection of socket from client
let onlineUsers = [];
io.on("connection", (socket) => {
  // socket events will be here
  socket.on("join-room", (userId) => {
    socket.join(userId);
  });

  // send message to clients (who are present in members array)
  socket.on("send-message", (message) => {
    io.to(message.members[0])
      .to(message.members[1])
      .emit("receive-message", message);
  });

  // clear unread messages
  socket.on("clear-unread-messages", (data) => {
    io.to(data.members[0])
      .to(data.members[1])
      .emit("unread-messages-cleared", data);
  });

  // typing event
  socket.on("typing", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("started-typing", data);
  });

  // online users

  socket.on("came-online", (userId) => {
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }

    io.emit("online-users-updated", onlineUsers);
  });

  socket.on("went-offline", (userId) => {
    onlineUsers = onlineUsers.filter((user) => user !== userId);
    io.emit("online-users-updated", onlineUsers);
  });
});

app.use("/api/users", usersRoute);
app.use("/api/chats", chatsRoute);
app.use("/api/messages", messagesRoute);

const path = require("path");
__dirname = path.resolve();
// render deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}


server.listen(port, () => console.log(`Server running on port ${port}`));



//Socket io steps
//First we emit the event from the client side(you can see that from home/index.js file we emit the event)
//then we listen to that event on the server side using the on method 
//then again if we want to emit something we do that using emit method from the server side
// for example if we want to send message from client to server then from server to all the clients
//we will do it by using useEffect hook in the client side and then we will emit the event from the client side
//then we will listen to that event on the server side using the on method
//then we will emit the event from the server side to all the clients using the emit method
//then we will listen to that event on the client side using the on method
// so in the above scenario we sent message to all
// if we want to send message to a particular user then we use the concept of rooms
// we will join the room of the particular user and then we will emit the event to that room
