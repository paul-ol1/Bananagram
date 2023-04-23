const express = require("express"); //Set up the express module
const app = express();
const port = 8008;
let repartation = [
  { letter: "A", count: 13 },
  { letter: "B", count: 3 },
  { letter: "C", count: 3 },
  { letter: "D", count: 6 },
  { letter: "E", count: 18 },
  { letter: "F", count: 3 },
  { letter: "G", count: 4 },
  { letter: "H", count: 3 },
  { letter: "I", count: 12 },
  { letter: "J", count: 2 },
  { letter: "K", count: 2 },
  { letter: "L", count: 5 },
  { letter: "M", count: 3 },
  { letter: "N", count: 8 },
  { letter: "O", count: 11 },
  { letter: "P", count: 3 },
  { letter: "Q", count: 2 },
  { letter: "R", count: 9 },
  { letter: "S", count: 6 },
  { letter: "T", count: 9 },
  { letter: "U", count: 6 },
  { letter: "V", count: 3 },
  { letter: "W", count: 3 },
  { letter: "X", count: 2 },
  { letter: "Y", count: 3 },
  { letter: "Z", count: 2 },
];
const path = require("path"); // bring in the path module to help locate files
const sqlite3 = require("sqlite3").verbose();

let database = new sqlite3.Database("Game.db", function (error) {
  if (error) {
    console.error(err.message);
    return {};
  }
});
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "home.html")); // res.sendFile sends the contents of a file
});

app.get("/newgame", function (req, res) {
  if (req.cookies.PlayerID === undefined) {
    let tiles = createtiles();
    createnewgame(tiles);
    
    setTimeout(x=>{
      database.all("SELECT * FROM Players", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log(rows);
        res.cookie("PlayerID", rows[rows.length - 1].PlayerID);
      }
    });
  }
    ,1000)};
    

  setTimeout(x=>{
    console.log(req.cookies); 
    res.sendFile(path.join(__dirname, "lobby.html"))},2000)
});


// return jpg images, html, css, and js files
app.get(
  ["/*.jpg", "/*.png", "/*.css", "/*.html", "/*.js", "/*.jpeg"],
  function (req, res) {
    res.sendFile(path.join(__dirname, req.path));
  }
);

// Start listening for requests on the designated port
app.listen(port, function () {
  console.log("App server is running on port", port);
  console.log("to end press Ctrl + C");
});

function createtiles() {
  let alltiles = [];
  for (let x = 0; x < repartation.length; x++) {
    for (let y = 0; y < repartation[x].count; y++) {
      alltiles.push(repartation[x].letter);
    }
  }
  return alltiles.join("");
}

function createnewgame(y) {
  database.run(`INSERT INTO Game(GameTiles)VALUES('${y}')`);

  database.all(
    "SELECT GameID FROM Game ORDER BY GameID DESC LIMIT 1",
    (err, rows) => {
      if (err) {
        reject(err);
      } else {
        database.run(`INSERT INTO Players(GameID)VALUES('${rows[0].GameID}')`);
      }
    }
  );

  setTimeout(x => {database.all("SELECT * FROM Players", (err, rows) => {
    if (err) {
      reject(err);
    } else {
      console.log(rows);
    }
  })}, 1000)
}
