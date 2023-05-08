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

const fs = require("fs");
let englishwords = [];
fs.readFile(path.join(__dirname, "words.txt"), "utf8", function (err, data) {
  englishwords = data.toUpperCase().split("\n");
});

const cookieParser = require("cookie-parser");
const { pid } = require("process");
app.use(cookieParser());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "home.html")); // res.sendFile sends the contents of a file
});
// return jpg images, html, css, and js files
app.get(
  ["/*.jpg", "/*.png", "/*.css", "/*.html", "/*.js", "/*.jpeg", "/*.gif"],
  function (req, res) {
    res.sendFile(path.join(__dirname, req.path));
  }
);


app.get("/game", function (req, res) {
  res.sendFile(path.join(__dirname, "game.html")); // res.sendFile sends the contents of a file
});
app.get("/joingame", function (req, res) {
  res.sendFile(path.join(__dirname, "lobbies.html")); // res.sendFile sends the contents of a file
});
app.get("/newgame", function (req, res) {
  res.sendFile(path.join(__dirname, "enterdetails.html"));
});

app.get("/movetolobby", function (req, res) {
  res.sendFile(path.join(__dirname, "lobby.html"));
});

app.post("/gamewon", function (req, res) {
  let gameid = req.body.gid;
  async function onetime(){
  await gameWon(gameid).then(x=>{
      
      res.send(x[0].Winner);
    })
  }
  onetime();

  })
app.post("/sharetiles", function (req, res) {
  let gameid = req.body.gid;
  let allusers;
  let alltiles;
  let currtiles;

  async function onetime() {
    await allplayers(gameid).then((y) => {
      allusers = y;
    });
    await getalltiles(gameid).then((y) => {
      alltiles = y[0].GameTiles.split("");
      for (let x = 0; x < allusers.length; x++) {
        if (allusers.length >= 1 && allusers.length <= 4){
          currtiles = alltiles.splice(0, 21);
        }
         else if (allusers.length >= 5 && allusers.length <= 6) {
           currtiles = alltiles.splice(0, 15);
         }
         else if (allusers.length >= 7 && allusers.length <= 8) {
          currtiles = alltiles.splice(0, 11);
         }

        currtiles = currtiles.join("");
        database.run(
          ` UPDATE Players SET PlayerTiles= '${currtiles}' WHERE PlayerID= ${allusers[x].PlayerID}`
        );
      }
      alltiles = alltiles.join("");
      returntiles(alltiles, gameid);
      res.send(currtiles);
    });
  }
  onetime();
});
app.post("/peel", function (req, res) {
  let gameid = req.body.gid;
  let allusers;
  let alltiles;

  async function onetime() {
    await allplayers(gameid).then((y) => {
      allusers = y;
    });

    await getalltiles(gameid).then((y) => {
      alltiles = y[0].GameTiles.split("");
    });

    if(alltiles.length>= allusers.length){
    for (let x = 0; x < allusers.length; x++) {
      let usertiles = allusers[x].PlayerTiles;
      let newtile = alltiles.splice(0, 1);
      usertiles += newtile[0];
      database.run(
        ` UPDATE Players SET PlayerTiles= '${usertiles}' WHERE PlayerID= ${allusers[x].PlayerID}`
      );
    }
    alltiles = alltiles.join("");
    returntiles(alltiles,gameid);
    res.send("peel");
  }
  else{
    res.send("not enough tiles")
  }
  }

  onetime();
});
app.post("/droptile", function (req, res) {
  let gameid = req.body.gid;
  let gametile = req.body.tilecontent;
  let userid = req.body.pid;
  let alltiles;
  let newtiles;
  let usertiles = [];
  async function onetime() {
    await getalltiles(gameid).then((y) => {
      alltiles = y[0].GameTiles.split("");
      alltiles.push(gametile);
      if(alltiles.length>= 3){
      newtiles = alltiles.splice(0, 3);}
      else{
        
      }
    });

    await yourtiles(userid).then((y) => {
      usertiles = y[0].PlayerTiles.split("");
      usertiles.splice(usertiles.indexOf(gametile), 1);
      newtiles.forEach((x) => {
        usertiles.push(x);
      });

      usertiles = usertiles.join("");
      database.run(
        ` UPDATE Players SET PlayerTiles= '${usertiles}' WHERE PlayerID= ${userid}`
      );
      alltiles = alltiles.join("");
      database.run(
        ` UPDATE Game SET GameTiles= '${alltiles}' WHERE GameID= ${gameid}`
      );
      res.send(newtiles);
    });
  }
  onetime();
});
app.post("/getgamestarted", function (req, res) {
  let gameid = req.body.gid;
  async function onetime() {
    await checkgamestarted(gameid).then((x) => {
      if (x[0].Ongoing == 0) {
        res.send("false");
      } else {
        res.send("true");
      }
    });
  }
  onetime();
});
app.post("/gettiles", function (req, res) {
  let userid = req.body.pid;
  
  async function onetime() {
    await yourtiles(userid).then( x=>{
      x= x[0].PlayerTiles.split("");
      res.send(x);
    });

  }
  onetime();
});

app.post("/allplayers", function (req, res) {
  let gameid = req.body.gid;
  async function onetime() {
    let x = await allplayers(gameid);
    res.send(x);
  }
  onetime();
});
app.post("/split", function (req, res) {
  let gameid = req.body.gid;
  database.run(` UPDATE Game SET Action= "split" WHERE GameID= ${gameid}`);
  })

  app.post("/getAction", function (req, res) {
    let gameid = req.body.gid;
    async function onetime() {
    await getaction(gameid).then(x=>{
      if(x[0].Action != undefined){
      res.send(""+x[0].Action);}
    })
  }
  onetime();
  });
app.post("/getgamestate", function (req, res) {
  let gameid = req.body.gid;
  let gamestate;
  async function onetime() {
    
    await getgamestate(gameid).then((x) => {
      gamestate = "" + x[0].Ongoing;
    });
    res.send(gamestate);
  }
  onetime();
});

app.post("/launchgame", function (req, res) {
  let gameid = req.body.gid;
  database.run(` UPDATE Game SET Ongoing= 1 WHERE GameID= ${gameid}`);
  res.send("done");
});

app.post("/joingamelobby", function (req, res) {
  let gameid = req.body.gid;
  let playername = req.body.playern;
  async function onetime() {
    if (req.cookies.Playerdetails === undefined) {
      let y = await createnewplayer(gameid, playername);
      res.cookie(
        "Playerdetails",
        {
          PlayerID: y[0].PlayerID,
          GameID: y[0].GameID,
          PlayerName: y[0].PlayerName,
          GameName: req.body.gn,
        },
        { expires: new Date(Date.now() + 3600000) }
      );
      res.send(y);
    } else {
      res.send({ state: "ingame" });
    }
  }

  onetime();
});
app.post("/bananas", function (req, res) {
  let userwords = req.body.words;
  let gameid = req.body.gid;
  let playerid = req.body.pid;
  let allcorrect = true;
  userwords.forEach((x) => {
    if (!englishwords.includes(x)) {
      allcorrect = false;
    }
  });
  if (allcorrect) {
    database.run(`UPDATE Game SET Ongoing= 2 WHERE GameID= ${gameid}`);
    database.run(
      ` UPDATE Game SET Winner = ${playerid} WHERE GameID= ${gameid}`
    );
    res.send("true");
  } else {
    async function onetime() {
      let playertiles;
      let alltiles;
      await yourtiles(playerid).then((x) => {
        playertiles = x[0].PlayerTiles;
      });

      await getalltiles(gameid).then((x) => {
        alltiles = x[0].GameTiles;
      });
      alltiles = alltiles + playertiles;
      returntiles(alltiles, gameid);
      database.run(
        ` UPDATE Players SET PlayerTiles= '' WHERE PlayerID= ${playerid}`
      );
      res.send("false");
    }

    onetime();
  }
});

app.post("/removeplayer", function (req, res) {
  database.run(`DELETE FROM Players WHERE PlayerID= ${req.body.PlayerID}`);
});
app.post("/createng", function (req, res) {
  gn = req.body.gamen;
  pname = req.body.playern;
  async function onetime() {
    if (req.cookies.Playerdetails === undefined) {
      let tiles = createtiles();
      let x = await createnewgame(tiles, gn);
      let y = await createnewplayer(x[0].GameID, pname);

      res.cookie(
        "Playerdetails",
        JSON.stringify({
          PlayerID: y[0].PlayerID,
          GameID: y[0].GameID,
          PlayerName: y[0].PlayerName,
          GameName: gn,
        })
      );
      res.send(y);
    } else {
      res.send({ state: "ingame" });
    }
  }
  onetime();
});

app.get("/allgames", function (req, res) {
  async function onetime() {
    let x = await getcurrentGandP();
    res.send(x);
  }
  onetime();
});

app.get("/myCookie", (req, res) => {

   const myCookieValue = req.cookies.Playerdetails;
   
   if (myCookieValue != undefined) {
    res.send(myCookieValue);
   } else {
     res.send("null");
   }
 
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
  console.log("createtiles:" + alltiles.length);
  alltiles = alltiles.sort((a, b) => 0.5 - Math.random());
  return alltiles.join("");
}

async function getgamestate(id) {
  return new Promise((resolve, reject) => {
    database.all(
      `SELECT Ongoing FROM Game WHERE GameID = ${id}`,
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
async function createnewgame(gt, gn) {
  database.run(
    `INSERT INTO Game(GameTiles, Ongoing, GameName,Action) VALUES('${gt}', 0, '${gn}','')`
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
    database.all(
      "SELECT GameID,GameName FROM Game WHERE Ongoing = 0",
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}
async function allplayers(x) {
  return new Promise((resolve, reject) => {
    database.all(`SELECT * FROM Players WHERE GameID = ${x}`, (err, rows) => {
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
      GNAME: allgames[y].GameName,
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
      GNAME: allgames[y].GameName,
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

function getalltiles(id) {
  return new Promise((resolve, reject) => {
    database.all(
      `SELECT GameTiles FROM Game WHERE GameID= ${id}`,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function returntiles(remainingtiles, id) {
  database.run(
    ` UPDATE Game SET GameTiles= '${remainingtiles}' WHERE GameID= ${id}`
  );
}

function yourtiles(id) {
  return new Promise((resolve, reject) => {
    database.all(
      `SELECT PlayerTiles FROM Players WHERE PlayerID= ${id}`,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function checkgamestarted(id) {
  return new Promise((resolve, reject) => {
    database.all(
      `SELECT Ongoing FROM Game WHERE GameID= ${id}`,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function getaction(id) {
  return new Promise((resolve, reject) => {
    database.all(
      `SELECT Action FROM Game WHERE GameID= ${id}`,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function gameWon(id){
  return new Promise((resolve, reject) => {
    database.all(`SELECT Winner FROM Game WHERE GameID= ${id}`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}
