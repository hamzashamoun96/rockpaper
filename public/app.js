"use strict";

let counter = 5;
let countInterval;
let buttons = ["rock", "paper", "scissors"];
let playerOneResult;
let playerTwoResult;

const socket = io('https://rock2021.herokuapp.com/');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

if (username && room) {
  socket.emit("join", username, room, (error, AvailableRooms) => {
    alert(error);
    alert(`The Available Rooms Are ${AvailableRooms}`);
    location.href = "/home.html";
  });
}
let player1;
let player2;
socket.on("onlineusers", (usersArr) => {
  $(".usersOnline").empty();
  $(".usersOnline").append("<h2>Online Users :</h2>");
  usersArr.forEach((e) => {
    $(".usersOnline").append(`<p>${e.username}</p>`);
  });

  if (usersArr.length === 2) {
    player1 = usersArr[0].username;
    player2 = usersArr[1].username;

    countInterval = setInterval(timer, 1000);
    if (username === player1) {
      // console.log('MUST_BE_PLAYER_1',player1,username)

      for (let i = 0; i < buttons.length; i++) {
        $(`#${buttons[i]}Btn`).on("click", () => {
          $("#player1").css("background-image", `url(./img/${buttons[i]}.png)`);
        });
      }
    } else if (username !== player1) {
      for (let i = 0; i < buttons.length; i++) {
        $(`#${buttons[i]}Btn`).on("click", () => {
          $("#player2").css("background-image", `url(./img/${buttons[i]}.png)`);
        });
      }
    }
  }
});

socket.on("gameresults", (result, gameArr) => {
  let idxP1 = gameArr.findIndex((e) => (e.player === "player 1" ? 1 : 0));
  let idxP2 = gameArr.findIndex((e) => (e.player === "player 2" ? 1 : 0));
  
  if(gameArr[idxP1].hand === "none" && gameArr[idxP2].hand !== "none"){
    $("#player1").css(
      "background-image",
      `url(./img/noselect.png)`
    );
    $("#player2").css(
      "background-image",
      `url(./img/${gameArr[idxP2].hand}.png)`
    );
  }else if(gameArr[idxP2].hand === "none" && gameArr[idxP1].hand !== "none"){
    $("#player1").css(
      "background-image",
      `url(./img/${gameArr[idxP1].hand}.png)`
    );
    $("#player2").css(
      "background-image",
      `url(./img/noselect.png)`
    );
  }else if (gameArr[idxP1].hand === "none" && gameArr[idxP2].hand === "none"){
    $("#player1").css(
      "background-image",
      `url(./img/noselect.png)`
    );
    $("#player2").css(
      "background-image",
      `url(./img/noselect.png)`
    );
  }else{
    $("#player1").css(
      "background-image",
      `url(./img/${gameArr[idxP1].hand}.png)`
    );
    $("#player2").css(
      "background-image",
      `url(./img/${gameArr[idxP2].hand}.png)`
    );
  }
  
 

  $(".result").text(result);
  $(".result").show();
  setTimeout(() => {
    location.href = "/home.html";
  }, 5000);
});

function timer() {
  $(".timer").empty();
  $(".timer").append(`<h3>${counter} s</h3>`);
  if (counter === 0) {
    clearInterval(countInterval);

    playerOneResult = $("#player1").css("background-image").slice(31, -1);
    playerTwoResult = $("#player2").css("background-image").slice(31, -1);

    if (username === player1) {
      if (playerOneResult !== "") {
        socket.emit("playeroneresult", playerOneResult, "player 1");
      } else {
        socket.emit("playeroneresult", "none", "player 1");
      }
    } else if (username === player2) {
      if (playerTwoResult !== "") {
        socket.emit("playertworesult", playerTwoResult, "player 2");
      } else {
        socket.emit("playertworesult", "none", "player 2");
      }
    }
  }
  counter--;
}
