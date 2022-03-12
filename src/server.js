const app = require("express")();
const http = require("http").Server(app);
const { main } = require("./../lib/mongodb.js");
const port = 8080;
const io = require("socket.io")(http);

app.get("/", async (req, res) => {
  return res.send("Singwatch API");
});

var dataRequested = false;
let db;
var data;
async function connectToDatabase() {
  if (db != undefined) {
    return db;
  }
  if (dataRequested == false) {
    dataRequested = true;
    db = await main();
    dbTrack();
  } else {
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}

async function dbTrack() {
  const collection = db.collection("discord");
  const changeStream = collection.watch();
  changeStream.on("change", (next) => {
    setNewData();
  });
}

async function setNewData() {
  const datasend = await db.collection("discord").find({}).toArray();
  if (datasend) {
    io.local.emit("setNewData", datasend);
  }
}

// ! Pegar o ultimo update do dados do banco de dados e enviar para o cliente - Amanhã

async function getInitialData() {
  await connectToDatabase();

  if (data !== undefined) {
    return data;
  }

  data = await db.collection("discord").find({}).toArray();
  if (data) {
    return data;
  }
}
io.on("connection", async function (socket) {
  console.log("A user connected: " + socket.id);

  // if dataRequested == false, make function only imit data when db is ready
  let data = await getInitialData();
  socket.emit("previusData", data);
  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function () {
    console.log("A user disconnected");
  });
});

http.listen(process.env.PORT || port, async () => {
  console.log(`Listening on port ${process.env.PORT || port}`);
  connectToDatabase();
});
