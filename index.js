const express = require("express"); //Set up the express module
const app = express();
const port = 8080;
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
const sqlite3 = require("sqlite3").verbose(); // pulls the sql module
const bodyParser = require("body-parser"); // this pulls in body-parser
const { all } = require("proxy-addr");
app.use(bodyParser.json()); // this tells the server to look for JSON requests
// Calls the existing database
let database = new sqlite3.Database("Game.db", function (error) {
  if (error) {
    console.error(err.message);
    return {};
  }
});

const fs = require("fs");
let englishwords = [];
// pushes each word from a txt file into an array and makes it uppercase because the tiles are returned in uppercase
fs.readFile(path.join(__dirname, "words.txt"), "utf8", function (err, data) {
  englishwords = data.toUpperCase().split("\n");
});

const cookieParser = require("cookie-parser");
const { pid } = require("process");
app.use(cookieParser());

// return the homepage
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

// return game page 
app.get("/game", function (req, res) {
  res.sendFile(path.join(__dirname, "game.html")); 
});

// return the all lobbies page
app.get("/joingame", function (req, res) {
  res.sendFile(path.join(__dirname, "lobbies.html")); // res.sendFile sends the contents of a file
});

// return the new game page
app.get("/newgame", function (req, res) {
  res.sendFile(path.join(__dirname, "enterdetails.html"));
});

// moves the user to the game lobby page if the user creates a new game and enter details or the user joins a game and enter his name 
app.get("/movetolobby", function (req, res) {
  res.sendFile(path.join(__dirname, "lobby.html"));
});
// checks if game has been won
app.post("/gamewon", function (req, res) {
  // takes in the game ID and if winner at the Game ID isn't null then someone has won the game
  let gameid = req.body.gid;
  async function onetime(){
  await gameWon(gameid).then(x=>{
      
      res.send(x[0].Winner);
    })
  }
  onetime();

  })
  // takes in the game id and divide the tiles amongst all existing users
app.post("/sharetiles", function (req, res) {
  let gameid = req.body.gid;
  let allusers;
  let alltiles;
  let currtiles;

  async function onetime() {
    //gets all current users in the game
    await allplayers(gameid).then((y) => {
      allusers = y;
    });
    //gets all tiles in the game
    await getalltiles(gameid).then((y) => {
      alltiles = y[0].GameTiles.split("");
      // divide tiles according to the amount of players in game
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
         // gives each user their tiles by updating the players data base and appending the tiles(letters of the tiles);
        currtiles = currtiles.join("");
        database.run(
          ` UPDATE Players SET PlayerTiles= '${currtiles}' WHERE PlayerID= ${allusers[x].PlayerID}`
        );
      }
      //return the remaining tiles to the game database
      alltiles = alltiles.join("");
      returntiles(alltiles, gameid);
      res.send(currtiles);
    });
  }
  onetime();
});
// takes all the players and the remaining tiles in the game and gives each player a tile
app.post("/peel", function (req, res) {
  let gameid = req.body.gid;
  let allusers;
  let alltiles;

  async function onetime() {
    //gets all current users in the game
    await allplayers(gameid).then((y) => {
      allusers = y;
    });
    // gets all tiles in the game
    await getalltiles(gameid).then((y) => {
      alltiles = y[0].GameTiles.split("");
    });
    // doesn't split if there are more users than remaining tiles
    if(alltiles.length>= allusers.length){
    for (let x = 0; x < allusers.length; x++) {
      // if there are enough tiles for each user you add one tile to current tiles in database
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
// drop tile takes in a tile and returns 3 tiles to the user
app.post("/droptile", function (req, res) {
  // takes in tile to return, the game id, and the user id 
  let gameid = req.body.gid;
  let gametile = req.body.tilecontent;
  let userid = req.body.pid;
  let alltiles;
  let newtiles;
  let usertiles = [];
  async function onetime() {
    // get all tiles
    await getalltiles(gameid).then((y) => {
      alltiles = y[0].GameTiles.split("");
      alltiles.push(gametile);
      //check if there is enough tiles to return 3 tiles if there isn't return what is left
      if(alltiles.length>= 3){
      newtiles = alltiles.splice(0, 3);}
      else{
        newtiles = alltiles.splice(0, alltiles.length);
      }
    });
    // get the user tile using the user's id 
    await yourtiles(userid).then((y) => {
      usertiles = y[0].PlayerTiles.split("");
      // remove the tile the user just dropped
      usertiles.splice(usertiles.indexOf(gametile), 1);
      // push in the new tiles we just got into the usertiles we got
      newtiles.forEach((x) => {
        usertiles.push(x);
      });
      
      usertiles = usertiles.join("");
      // return the new modified usertile into the database
      database.run(
        ` UPDATE Players SET PlayerTiles= '${usertiles}' WHERE PlayerID= ${userid}`
      );
      alltiles = alltiles.join("");
      // return all remaining tiles into the database
      database.run(
        ` UPDATE Game SET GameTiles= '${alltiles}' WHERE GameID= ${gameid}`
      );
      res.send(newtiles);
    });
  }
  onetime();
});
/* gets the current user tiles, this function is constantly running on the front end to check if there has been a peel of if the are new tiles or anything else that can modify the tiles the user has  it just returns the tiles currently in the database*/
app.post("/gettiles", function (req, res) {
  let userid = req.body.pid;
  // takes in user id and returns tiles
  async function onetime() {
    await yourtiles(userid).then( x=>{
      x= x[0].PlayerTiles.split("");
      res.send(x);
    });

  }
  onetime();
});
// returns all players at a game id
app.post("/allplayers", function (req, res) {
  let gameid = req.body.gid;
  async function onetime() {
    let x = await allplayers(gameid);
    res.send(x);
  }
  onetime();
});
// keeps track if the game was split
app.post("/split", function (req, res) {
  let gameid = req.body.gid;
  database.run(` UPDATE Game SET Action= "split" WHERE GameID= ${gameid}`);
  })
/* get current game action, so far there is just split as an action if i had more time i would insert a peel and a bananas to know when someone peels and notify everyone , or bananas, or split 
*/
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
  // know if game is ongoing
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
// change game state and begin the game
app.post("/launchgame", function (req, res) {
  let gameid = req.body.gid;
  database.run(` UPDATE Game SET Ongoing= 1 WHERE GameID= ${gameid}`);
  res.send("done");
});

// join a game by taking in the game id of the game just joined and the user name
app.post("/joingamelobby", function (req, res) {
  let gameid = req.body.gid;
  let playername = req.body.playern;
  async function onetime() {
    // check if there is no cookie which would mean still in another game to create a new cookie 
    if (req.cookies.Playerdetails === undefined) {
      // if there is no cookie create a new player
      let y = await createnewplayer(gameid, playername);
      // create a new cookie including playername, playerid, game id and gamename, this cookie expires after two hours, in case user hasn't lost till then
      res.cookie(
        "Playerdetails",
        {
          PlayerID: y[0].PlayerID,
          GameID: y[0].GameID,
          PlayerName: y[0].PlayerName,
          GameName: req.body.gn,
        },
        { expires: new Date(Date.now() + 7200000) }
      );
      res.send(y);
    } else {
      res.send({ state: "ingame" });
    }
  }

  onetime();
});
// when user attempts bananas it takes in an array of words and checks if they are all in our dictionary 
app.post("/bananas", function (req, res) {
  let userwords = req.body.words;
  let gameid = req.body.gid;
  let playerid = req.body.pid;
  let allcorrect = true;
  // if it finds a word that is not in our dictionary our final returned variable is false
  userwords.forEach((x) => {
    if (!englishwords.includes(x)) {
      allcorrect = false;
    }
  });
  // if the final returned variable is true(all words correct) then you set a winner in the game, and the function in the front end that constantly checks if there is a winner will know there is a winner and log every one else out of the game
  if (allcorrect) {
    database.run(`UPDATE Game SET Ongoing= 2 WHERE GameID= ${gameid}`);
    database.run(
      ` UPDATE Game SET Winner = ${playerid} WHERE GameID= ${gameid}`
    );
    res.send("true");
  } else {
    // if there is a word that is incorrect you lose
    async function onetime() {
      let playertiles;
      let alltiles;
      //gets the player's tiles
      await yourtiles(playerid).then((x) => {
        playertiles = x[0].PlayerTiles;
      });
      // get the remaining tiles in the game 
      await getalltiles(gameid).then((x) => {
        alltiles = x[0].GameTiles;
      });
      //appends the player who just lost's tiles to the bunch of tiles
      alltiles = alltiles + playertiles;
      // return the new remaining tiles back in the game and remove the Player's tiles from the player's db
      returntiles(alltiles, gameid);
      database.run(
        ` UPDATE Players SET PlayerTiles= '' WHERE PlayerID= ${playerid}`
      );
      res.send("false");
    }

    onetime();
  }
});
// delete a player from database by taking in Player id
app.post("/removeplayer", function (req, res) {
  database.run(`DELETE FROM Players WHERE PlayerID= ${req.body.PlayerID}`);
});

app.post("/removeplayeringame", function (req, res) {
  let gameid = req.body.gid;
  let playerid = req.body.pid;

  async function onetime() {
    let playertiles;
    let alltiles;
    //gets the player's tiles
    await yourtiles(playerid).then((x) => {
      playertiles = x[0].PlayerTiles;
      console.log(playertiles.length);
    });
    // get the remaining tiles in the game
    await getalltiles(gameid).then((x) => {
      alltiles = x[0].GameTiles;
      console.log(alltiles.length)
    });
    //appends the player who just lost's tiles to the bunch of tiles
    alltiles = alltiles + playertiles;
    console.log(alltiles.length);
    // return the new remaining tiles back in the game and remove the Player's tiles from the player's db
    returntiles(alltiles, gameid);
    database.run(
      ` UPDATE Players SET PlayerTiles= '' WHERE PlayerID= ${playerid}`
    );

    database.run(`DELETE FROM Players WHERE PlayerID= ${playerid}`);
  }

  onetime();
});

// creates a new game by taking in player name and game name
app.post("/createng", function (req, res) {
  
  gn = req.body.gamen;
  pname = req.body.playern;
  async function onetime() {
    // check if a cookie already exist
    if (req.cookies.Playerdetails === undefined) {
      let tiles = createtiles(); // takes in the tiles for this game
      let x = await createnewgame(tiles, gn); // creates a new game using the tiles we just got and the game name and it returns the game just created
      let y = await createnewplayer(x[0].GameID, pname); // create new player using the id of the game just created and player name 
      // create a cookie for the new game just created
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

// return all current game for the lobby
app.get("/allgames", function (req, res) {
  async function onetime() {
    let x = await getcurrentGandP();
    res.send(x);
  }
  onetime();
});

// returns the value of the cookie if the cookie exists
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
// creates tiles by taking in the repartition of letters and adding each amount of a letter needed to an array
function createtiles() {
  let alltiles = [];
  for (let x = 0; x < repartation.length; x++) {
    for (let y = 0; y < repartation[x].count; y++) {
      alltiles.push(repartation[x].letter);
    }
  }
  //randomize the array of tiles so i don't need to constantly worry about getting a random tile(s) as it is always random
  alltiles = alltiles.sort((a, b) => 0.5 - Math.random());
  return alltiles.join("");
}
// get the state of a game using it's id(if the game is ongoing or not)
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
  // create a new game by inserting game tiles the tiles that will be created, if the game is on going or not by returning a 0 for not started, the game name and nothing for action since there has been none, the id is autoincrementing
  database.run(
    `INSERT INTO Game(GameTiles, Ongoing, GameName,Action) VALUES('${gt}', 0, '${gn}','')`
  );
  //get the id of the most recently created game in this case it'd be the game the user created so you can return this and use it to log in the user directly into the lobby
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
  // create new game inserting the game id and playername. The Player id is autoincrementing
  database.run(
    `INSERT INTO Players (GameID, PlayerName) VALUES(${gid}, '${pname}')`
  );

  // returns the ID so it can be used again 
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

// get games that haven't started
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
// get all players in a game using its ID
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
// get all players
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
// gets all current games and the players in them
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
// get all tiles in a specific game by taking its id 
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
//return a set of tiles back into a game's db
function returntiles(remainingtiles, id) {
  database.run(
    ` UPDATE Game SET GameTiles= '${remainingtiles}' WHERE GameID= ${id}`
  );
}
// get a user's tiles 
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

// get the current action in a game
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
// get the results of the winner column of a game
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
