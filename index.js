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
const bodyParser = require("body-parser"); // this pulls in body-parser
const { all } = require("proxy-addr");
app.use(bodyParser.json()); // this tells the server to look for JSON requests
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

app.get("/joingame", function (req, res) {
  res.sendFile(path.join(__dirname, "lobbies.html")); // res.sendFile sends the contents of a file
});
app.get("/newgame", function (req, res) {
  res.sendFile(path.join(__dirname, "lobby.html"));
});

app.post("/creatng", function (req, res) {
  gn = req.body.gamename;
  pname = req.body.playername;
  async function ot() {
    if (req.cookies.PlayerID === undefined) {
      let tiles = createtiles();
      let x = await createnewgame(tiles, gn);
      let y = await createnewplayer(x[0].GameID, pname);
      console.log(y);
      res.cookie(
        "PlayerID",
        y[0].PlayerID,
        "GameID",
        y[0].GameID,
        "PlayerName",
        y[0].PlayerName,
        {
          maxAge: 100000,
        }
      );
    }
  }
  ot();
  res.send(y);
});

app.get("/allgames", function (req, res) {
  async function onetime() {
    let x = await getcurrentGandP();
    res.send(x);
  }
  onetime();
});

/*
    setTimeout((x) => {
      database.all("SELECT * FROM Players", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          res.cookie("PlayerID", rows[rows.length - 1].PlayerID, {
            maxAge: 100000,
          });
        }
      });
    }, 10);
  }

  setTimeout((x) => {
    
    res.sendFile(path.join(__dirname, "lobby.html"));
  }, 20);*/

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

async function createnewgame(gt, gn) {
  database.run(
    `INSERT INTO Game(GameTiles, Ongoing, GameName) VALUES('${gt}', 0, '${gn}')`
  );
  return new Promise((resolve, reject) => {
    database.all(
      "SELECT GameID FROM Game ORDER BY GameID DESC LIMIT 1",
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}

async function createnewplayer(gid, pname) {
  database.run(
    `INSERT INTO Players (GameID, PlayerName) VALUES(${gid}, '${pname}')`
  );
  return new Promise((resolve, reject) => {
    database.all(
      "SELECT * FROM Players ORDER BY PlayerID DESC LIMIT 1",
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}

async function getcurrentgames() {
  return new Promise((resolve, reject) => {
    database.all("SELECT GameID FROM Game WHERE Ongoing = 0", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function getcurrentplayers() {
  let GameswPlayers = [];
  let allplayers = [];
  let allgames = await getcurrentgames();

  for (let y = 0; y < allgames.length; y++) {
    GameswPlayers[y] = {
      GID: allgames[y].GameID,
      PID: [],
    };
  }
  return new Promise((resolve, reject) => {
    database.all("SELECT * FROM Players", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function getcurrentGandP() {
  let GameswPlayers = [];
  let allplayers;
  let allgames;
  await getcurrentplayers().then((x) => {
    allplayers = x;
  });
  await getcurrentgames().then((x) => {
    allgames = x;
  });
  for (let y = 0; y < allgames.length; y++) {
    GameswPlayers[y] = {
      GID: allgames[y].GameID,
      PID: [],
    };
  }

  for (let y = 0; y < GameswPlayers.length; y++) {
    for (let x = 0; x < allplayers.length; x++) {
      if (GameswPlayers[y].GID == allplayers[x].GameID) {
        GameswPlayers[y].PID.push(allplayers[x].PlayerID);
      }
    }
  }
  return GameswPlayers;
}
