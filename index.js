"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 4000;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let usersArr = [];
for (let i = 0; i < 10; i++) {
  usersArr.push([]);
}

let userRoom;
let resRoom;
let valid = true;
let AvailableRooms = " ";
let gameArr = [];
let idxP1;
let idxP2;

io.on("connection", (socket) => {
  socket.on("join", (username, room, callback) => {
    addUser(username, socket.id, room);
    if (valid) {
      socket.join(room);
      resRoom = room;
      io.to(room).emit("onlineusers", usersArr[room - 1]);
    } else {
      getRandomRoom(usersArr);
      return callback("This Room Is Full", AvailableRooms);
    }
  });

  socket.on("disconnect", () => {
    usersAfterDisconnet(socket.id);
    io.to(userRoom).emit("onlineusers", usersArr[userRoom - 1]);
  });

  socket.on("playeroneresult", (playerResult, player) => {
    gameArr.push({
      hand: playerResult.split(".")[0],
      player,
    });
    if (gameArr.length === 2) {
      idxP1 = gameArr.findIndex((e) => (e.player === "player 1" ? 1 : 0));
      idxP2 = gameArr.findIndex((e) => (e.player === "player 2" ? 1 : 0));

      let finalResult = calcResult(gameArr[idxP1].hand, gameArr[idxP2].hand);
      io.to(resRoom).emit("gameresults", finalResult, gameArr);
      gameArr = [];
    }
  });

  socket.on("playertworesult", (playerResult, player) => {
    gameArr.push({
      hand: playerResult.split(".")[0],
      player,
    });

    if (gameArr.length === 2) {
      idxP1 = gameArr.findIndex((e) => (e.player === "player 1" ? 1 : 0));
      idxP2 = gameArr.findIndex((e) => (e.player === "player 2" ? 1 : 0));

      let finalResult = calcResult(gameArr[idxP1].hand, gameArr[idxP2].hand);
      io.to(resRoom).emit("gameresults", finalResult, gameArr);
      gameArr = [];
    }
  });
});

/*===================SOCKET_FUNCTIONS========================*/

function addUser(username, socketId, room) {
  if (usersArr[room - 1].length < 2) {
    usersArr[room - 1].push({
      username,
      id: socketId,
      room,
    });
    return (valid = true);
  } else {
    return (valid = false);
  }
}
function usersAfterDisconnet(socketId) {
  let idx;
  usersArr.map((e) => {
    idx = e.findIndex((i) => {
      return i.id === socketId;
    });
    if (!(idx === -1)) {
      userRoom = e[idx].room;
      e.splice(idx, 1);
    }
  });
  return userRoom;
}
function getRandomRoom(usersArr) {
  usersArr.map((arr, idx) => {
    if (arr.length < 2) {
      AvailableRooms += (idx + 1).toString() + " ";
    }
  });
  return AvailableRooms;
}
/*===================CALCULATE_RESULT========================*/
function calcResult(hand1, hand2) {
  if (hand1 === "none" && hand2 !== "none") return "Player 2 Win";
  if (hand2 === "none" && hand1 !== "none") return "Player 1 Win";
  if (hand1 === "none" && hand2 === "none") return "Draw";
  if (hand1 === "rock" && hand2 === "rock") return "Draw";
  if (hand1 === "rock" && hand2 === "paper") return "Player 2 Win";
  if (hand1 === "rock" && hand2 === "scissors") return "Player 1 Win";
  if (hand1 === "paper" && hand2 === "rock") return "Player 1 Win";
  if (hand1 === "paper" && hand2 === "paper") return "Draw";
  if (hand1 === "paper" && hand2 === "scissors") return "Player 2 Win";
  if (hand1 === "scissors" && hand2 === "rock") return "Player 2 Win";
  if (hand1 === "scissors" && hand2 === "paper") return "Player 1 Win";
  if (hand1 === "scissors" && hand2 === "scissors") return "Draw";
}
/*===================RUN_THE_SERVER==========================*/
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

// mongoose
  // .connect(process.env.MONGODB_URI, options)
  // .then(() => {
    // Start the web server
    // console.log("connected to MongoDB....!!");
    server.listen(port, () => {
      console.log(`working on ${port}`);
    });
  // })
  // .catch((e) => {
  //   throw new Error(e.message);
  // });
