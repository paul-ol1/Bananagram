let alltiles = [];
let usertiles = [];
let arrivalpos;
let Gameid;
let gamediv = document.getElementById("grid");
let yourid;
let timetoget;
let pos = document.getElementById("tilespositon");
let divsize = 720;
let gridwidth = screen.width / 40;
let gridheight = screen.height / 26;
let contentelem = document.getElementById("content");
let start = 16000;
let timeint;
let checktileint;
let timer = document.getElementById("timer");
let peel = document.getElementById("peel");
peel.addEventListener("click", peelfunc);

function createdivs() {
  for (let x = 0; x < divsize; x++) {
    let newdiv = document.createElement("div");
    newdiv.className = "space";

    contentelem.appendChild(newdiv);
  }
}

function createtiles(arr) {
  for (let x = 0; x < arr.length; x++) {
    let tile = document.createElement("button");
    tile.style.width = gridwidth - 5 + "px";
    tile.style.height = gridheight - 3 + "px";
    tile.style.borderRadius = "7px";
    tile.style.backgroundColor = "#C724B1";
    tile.style.color = "#fff";
    tile.style.opacity = "0.5";
    tile.style.fontSize = "1rem";
    tile.style.textShadow = "0 0 7px #fff,0 0 10px #fff,0 0 21px #fff";
    tile.style.border = "none";
    tile.style.margin = "2px";
    tile.addEventListener("mouseover", (event) => {
      tile.style.opacity = "1";
      tile.style.cursor = "grab";
    });
    tile.addEventListener("mouseout", (event) => {
      tile.style.opacity = "0.5";
    });
    tile.textContent = arr[x];
    tile.className = "tile";
    alltiles.push(tile);
    pos.appendChild(tile);

    tile.onmousedown = function (event) {
      let shiftX = event.clientX - tile.getBoundingClientRect().left;
      let shiftY = event.clientY - tile.getBoundingClientRect().top;
      tile.style.position = "absolute";

      document.body.append(tile);

      moveAt(event.pageX, event.pageY);

      // moves the tile at (pageX, pageY) coordinates
      // taking initial shifts into account
      function moveAt(pageX, pageY) {
        tile.style.left = pageX - shiftX + "px";
        tile.style.top = pageY - shiftY + "px";
      }

      function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
      }

      // move the tile on mousemove
      document.addEventListener("mousemove", onMouseMove);

      // drop the tile, remove unneeded handlers

      tile.onmouseup = function (e) {
        let elements = document.elementsFromPoint(e.clientX, e.clientY);
        document.removeEventListener("mousemove", onMouseMove);
        tile.onmouseup = null;
        document.body.removeChild(tile);
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].id == "tilespositon") {
            elements[i].appendChild(tile);
            break;
          }
          if (elements[i].id == "wormhole") {
            let newtiles;
            elements[i].appendChild(tile);
            tile.style.left = "";
            tile.style.top = "";
            clearInterval(checktileint);
            async function get3tiles() {
              console.log(tile.textContent);
              await droptile(tile.textContent).then((a) => {
                
                newtiles = a;
                console.log(newtiles);
                tile.style.transition = "transform 4s ease-in-out";
                tile.style.transform = "scale(0)";
            
                alltiles.splice(alltiles.indexOf(tile), 1);
                usertiles.splice(usertiles.indexOf(tile.textContent), 1);
                newtiles.forEach((b) => {
                  usertiles.push(b);
                });
                setTimeout(tst=>{
                elements[i].removeChild(tile);
                checktileint = setInterval(checktiles, 1000);
                createtiles(newtiles);
                }, 5000);
                
              });
            }

            get3tiles();

            break;
          } else if (elements[i].className == "space") {
            if (elements[i].hasChildNodes()) {
              pos.appendChild(tile);
              tile.style.position = "";
              tile.style.left = "";
              tile.style.top = "";
            } else {
              elements[i].appendChild(tile);
              tile.style.left = "";
              tile.style.top = "";
            }

            break;
          } else {
            if (i == elements.length - 1) {
              pos.appendChild(tile);
              tile.style.position = "";
              tile.style.left = "";
              tile.style.top = "";

              break;
            }
          }
        }
      };
    };

    tile.ondragstart = function () {
      return false;
    };
  }
}
function gridmaker() {
  contentelem.style.display = "grid";
  contentelem.style.gridArea = "code";
  contentelem.style.gridTemplateRows = `repeat(18,${gridheight}px) `;
  contentelem.style.gridTemplateColumns = `repeat(40,${gridwidth}px) `;
}

async function getmycookie() {
  return new Promise((resolve, reject) => {
    fetch("/myCookie")
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      });
  });
}

async function getusers(id) {
  let mybody = {
    gid: id,
  };
  return new Promise((resolve, reject) => {
    fetch("/allplayers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, // says that arguments are JSON formatted
      body: JSON.stringify(mybody), // POST puts arguments in the message body
    })
      .then((response) => response.json()) // we are expecting a text response
      .then((data) => {
        resolve(data);
      });
  });
}

async function startgame() {
  await getmycookie().then((y) => {
    Gameid = y.GameID;
    yourid = y.PlayerID;
  });
  await getgamestate(Gameid).then((y) => {
    if (y == 1) {
      timer.style.display = "none";
      gamediv.style.display = "grid";
      resumegame();
    }
    if (y == 0) {
      startstopwatch();
      sharetiles();
    }
  });
}
async function resumegame() {
  alltiles = [];
  createdivs();
  gridmaker();
  await getmycookie().then((y) => {
    Gameid = y.GameID;
    yourid = y.PlayerID;
  });
  await gettiles().then((x) => {
    usertiles = x;
    createtiles(x);
  });
}

function startstopwatch() {
  timeint = setInterval(elapse, 1000);
  setTimeout(async function () {
    clearInterval(timeint);
    timer.style.display = "none";
    gamediv.style.display = "grid";
    createdivs();
    gridmaker();
    await gettiles().then((x) => {
      usertiles = x;
      createtiles(x);
    });
    let mybody = {
      gid: Gameid,
    };
    fetch("/launchgame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, // says that arguments are JSON formatted
      body: JSON.stringify(mybody), // POST puts arguments in the message body
    });
  }, start + 1000);
}
function elapse() {
  start = start - 1000;
  convertmillisec(start);
}
function convertmillisec(elem) {
  let minutes = Math.floor(elem / 60000);
  let seconds = ((elem % 60000) / 1000).toFixed(0);
  let time = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  timer.innerHTML = "";
  timer.textContent = time;
}
function sharetiles() {
  let mybody = {
    gid: Gameid,
  };
  return new Promise((resolve, reject) => {
    fetch("/sharetiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, // says that arguments are JSON formatted
      body: JSON.stringify(mybody), // POST puts arguments in the message body
    })
      .then((response) => response.json()) // we are expecting a text response
      .then((data) => {
        resolve(data);
      });
  });
}
async function getgamestate(id) {
  let mybody = {
    gid: id,
  };
  return new Promise((resolve, reject) => {
    fetch("/getgamestate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, // says that arguments are JSON formatted
      body: JSON.stringify(mybody), // POST puts arguments in the message body
    })
      .then((response) => response.json()) // we are expecting a text response
      .then((data) => {
        resolve(data);
      });
  });
}
async function gettiles() {
  let mybody = {
    pid: yourid,
  };
  return new Promise((resolve, reject) => {
    fetch("/gettiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, // says that arguments are JSON formatted
      body: JSON.stringify(mybody), // POST puts arguments in the message body
    })
      .then((response) => response.json()) // we are expecting a text response
      .then((data) => {
        resolve(data);
      });
  });
}
async function droptile(tile) {
  let mybody = {
    gid: Gameid,
    tilecontent: tile,
    pid: yourid,
  };
  return new Promise((resolve, reject) => {
    fetch("/droptile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, // says that arguments are JSON formatted
      body: JSON.stringify(mybody), // POST puts arguments in the message body
    })
      .then((response) => response.json()) // we are expecting a text response
      .then((data) => {
        if (data != undefined) {
          resolve(data);
        } else {
          reject("no data");
        }
      });
  });
}


async function checktiles() {
  let clonearr = [];

  usertiles.forEach((x) => {
    clonearr.push(x);
  });

  let remainingtiles = [];

  await gettiles().then((x) => {
    
    let currentusertiles = x;
    for (let i = 0; i < x.length; i++) {
      let index = clonearr.indexOf(currentusertiles[i]);
      if (index > -1) {
        clonearr.splice(index, 1);
        currentusertiles[i] = "";
      }
    }
    for (let i = currentusertiles.length; i > -1; i--) {
      if (currentusertiles[i] == "") {
        currentusertiles.splice(i, 1);
      }
    }

    remainingtiles = currentusertiles;
  });
  if (remainingtiles.length > 0) {
    createtiles(remainingtiles);
    remainingtiles.forEach((z) => {
      usertiles.push(z);
    });
  }

  remainingtiles = [];
}

function peelfunc() {
  let mybody = {
    gid: Gameid,
  };
  console.log('peel');
  fetch("/peel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }, // says that arguments are JSON formatted
    body: JSON.stringify(mybody), // POST puts arguments in the message body
  });
}
checktileint = setInterval(checktiles, 2000);
/*createtiles();
createdivs();
gridmaker();
generatetiles();*/
startgame();
