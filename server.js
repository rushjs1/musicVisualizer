const express = require("express");
const path = require("path");
const port = process.env.PORT || 8080;
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { Ableton } = require("ableton-js");
const ableton = new Ableton();
let master = null;

app.use(express.static(__dirname + "/dist"));

/* app.get("/src/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
}); */
app.get("/src/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "index.html"));
});

io.on("connection", socket => {
  console.log("a user connected");
  const test = async () => {
    ableton.song.addListener("is_playing", p => console.log("Playing:", p));
    ableton.song.addListener("tempo", t => console.log("Tempo:", t));
    master = await ableton.song.get("master_track");
    master.addListener("output_meter_left", d => {
      socket.emit("musicEmit", d);
    });
  };

  test();

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(port);

module.exports = io;
