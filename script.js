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
let content = document.getElementsByClassName("space");
let start = 11000;
let timeint;
let checktileint;
let timer = document.getElementById("timer");
let peel = document.getElementById("peel");
let mybody;
let tilesindex;
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
              await droptile(tile.textContent).then((a) => {
                newtiles = a;
                tile.style.transition = "transform 4s ease-in-out";
                tile.style.transform = "scale(0)";

                alltiles.splice(alltiles.indexOf(tile), 1);
                usertiles.splice(usertiles.indexOf(tile.textContent), 1);
                newtiles.forEach((b) => {
                  usertiles.push(b);
                });
                setTimeout((tst) => {
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
    if(y=="0"){
        startstopwatch();
        sharetiles();
    }
      if(y == "1"){
        timer.style.display = "none";
        gamediv.style.display = "grid";
        resumegame();
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

    mybody = {
      gid: Gameid,
      pid: yourid,
    };
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
    location.reload();
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
  fetch("/peel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }, // says that arguments are JSON formatted
    body: JSON.stringify(mybody), // POST puts arguments in the message body
  });
}
function getallwords() {
  tilesindex = tilesindex.sort((a, b) => a - b);
  let allwords = [];
  let indexgrouping = [];
  for (let x = 0; x < tilesindex.length; x++) {
    let newarr = [];
    let horizontal = tilesindex[x];
    let vertical = tilesindex[x];
    let horizontalword = [];
    let verticalword = [];
    horizontalword.push(horizontal);
    verticalword.push(vertical);

    for (let y = x + 1; y < tilesindex.length; y++) {
      if (tilesindex[y] == horizontal + 1) {
        horizontalword.push(tilesindex[y]);
        horizontal = horizontal + 1;
      }

      if (tilesindex[y] == vertical + 40) {
        verticalword.push(tilesindex[y]);
        vertical = vertical + 40;
      }
    }

    if (verticalword.length > 1) {
      indexgrouping.push(verticalword);
    }
    if (horizontalword.length > 1) {
      indexgrouping.push(horizontalword);
    }
  }

  for (let x = 0; x < indexgrouping.length; x++) {
    for (let y = indexgrouping.length - 1; y > 0; y--) {
      if (indexgrouping[x] !== indexgrouping[y]) {
        if (checkSubset(indexgrouping[y], indexgrouping[x])) {
          indexgrouping.splice(y, 1);
        }
      }
    }
  }

  for (let x = 0; x < indexgrouping.length; x++) {
    for (let i = 0; i < indexgrouping[x].length; i++) {
      indexgrouping[x][i] =
        content[indexgrouping[x][i]].children[0].textContent;
    }
  }
  return indexgrouping;
}
function checktilesallignment() {
  let tiles = [];
  tilesindex = [];
  let head = {
    element: undefined,
    index: undefined,
    right: undefined,
    left: undefined,
    down: undefined,
    up: undefined,
  };
  for (let x = 0; x < content.length; x++) {
    if (content[x].hasChildNodes()) {
      if (x % 40 == 0) {
        head.element = content[x].children[0];
        head.index = x;

        head.right = {
          elem: undefined,
          elemindex: undefined,
        };
        head.left = {
          elem: content[x - 1].children[0],
          elemindex: x - 1,
        };

        head.down = {
          elem: content[x + 40].children[0],
          elemindex: x + 40,
        };
        head.up = {
          elem: content[x - 40].children[0],
          elemindex: x + 40,
        };
      } else if (x % 40 == 1) {
        head.element = content[x].children[0];
        head.index = x;

        head.right = {
          elem: content[x + 1].children[0],
          elemindex: x + 1,
        };
        head.left = {
          elem: undefined,
          elemindex: undefined,
        };
        head.up = {
          elem: content[x - 40].children[0],
          elemindex: x + 40,
        };
        head.down = {
          elem: content[x + 40].children[0],
          elemindex: x + 40,
        };
      } else if (x >= 680 && x <= 720) {
        head.element = content[x].children[0];
        head.index = x;

        head.right = {
          elem: content[x + 1].children[0],
          elemindex: x + 1,
        };
        head.down = {
          elem: undefined,
          elemindex: undefined,
        };
        head.up = {
          elem: content[x - 40].children[0],
          elemindex: x + 40,
        };
        head.left = {
          elem: content[x - 1].children[0],
          elemindex: x - 1,
        };
      } else if (x >= 0 && x <= 40) {
        head.element = content[x].children[0];
        head.index = x;

        head.right = {
          elem: content[x + 1].children[0],
          elemindex: x + 1,
        };
        head.left = {
          elem: content[x - 1].children[0],
          elemindex: x - 1,
        };

        head.down = {
          elem: content[x + 40].children[0],
          elemindex: x + 40,
        };
        head.up = {
          elem: undefined,
          elemindex: undefined,
        };
      } else {
        head.element = content[x].children[0];
        head.index = x;

        head.right = {
          elem: content[x + 1].children[0],
          elemindex: x + 1,
        };
        head.left = {
          elem: content[x - 1].children[0],
          elemindex: x - 1,
        };

        head.down = {
          elem: content[x + 40].children[0],
          elemindex: x + 40,
        };
        head.up = {
          elem: content[x - 40].children[0],
          elemindex: x + 40,
        };
      }

      tiles.push(head);
      tilesindex.push(head.index);
      break;
    }
  }

  for (let x = 0; x < tiles.length; x++) {
    if (tiles[x].left.elem != undefined) {
      let next = {
        element: undefined,
        index: undefined,
        left: undefined,
        right: undefined,
        down: undefined,
        up: undefined,
      };

      next.index = tiles[x].index - 1;
      next.element = content[next.index].children[0];

      next.right = {
        elem: content[next.index + 1].children[0],
        elemindex: next.index + 1,
      };
      if (content[next.index + 40] != undefined) {
        next.down = {
          elem: content[next.index + 40].children[0],
          elemindex: next.index + 40,
        };
      } else {
        next.down = {
          elem: undefined,
          elemindex: undefined,
        };
      }

      if (content[next.index - 40] != undefined) {
        next.up = {
          elem: content[next.index - 40].children[0],
          elemindex: next.index - 40,
        };
      } else {
        next.up = {
          elem: undefined,
          elemindex: undefined,
        };
      }

      next.left = {
        elem: content[next.index - 1].children[0],
        elemindex: next.index - 1,
      };

      if (!tilesindex.includes(next.index)) {
        tiles.push(next);
        tilesindex.push(next.index);
      }
    }

    if (tiles[x].right.elem != undefined) {
      let next = {
        element: undefined,
        index: undefined,
        right: undefined,
        down: undefined,
        left: undefined,
      };

      next.index = tiles[x].index + 1;
      next.element = content[next.index].children[0];
      next.right = {
        elem: content[next.index + 1].children[0],
        elemindex: next.index + 1,
      };
      if (content[next.index + 40] != undefined) {
        next.down = {
          elem: content[next.index + 40].children[0],
          elemindex: next.index + 40,
        };
      } else {
        next.down = {
          elem: undefined,
          elemindex: undefined,
        };
      }
      if (content[next.index - 40] != undefined) {
        next.up = {
          elem: content[next.index - 40].children[0],
          elemindex: next.index - 40,
        };
      } else {
        next.up = {
          elem: undefined,
          elemindex: undefined,
        };
      }

      next.left = {
        elem: content[next.index - 1].children[0],
        elemindex: next.index - 1,
      };

      if (!tilesindex.includes(next.index)) {
        tiles.push(next);
        tilesindex.push(next.index);
      }
    }

    if (tiles[x].down.elem != undefined) {
      let next = {
        element: undefined,
        index: undefined,
        left: undefined,
        right: undefined,
        down: undefined,
      };
      next.index = tiles[x].index + 40;
      next.element = content[next.index].children[0];
      next.right = {
        elem: content[next.index + 1].children[0],
        elemindex: next.index + 1,
      };
      if (content[next.index + 40] != undefined) {
        next.down = {
          elem: content[next.index + 40].children[0],
          elemindex: next.index + 40,
        };
      } else {
        next.down = {
          elem: undefined,
          elemindex: undefined,
        };
      }

      if (content[next.index - 40] != undefined) {
        next.up = {
          elem: content[next.index - 40].children[0],
          elemindex: next.index - 40,
        };
      } else {
        next.up = {
          elem: undefined,
          elemindex: undefined,
        };
      }

      next.left = {
        elem: content[next.index - 1].children[0],
        elemindex: next.index - 1,
      };

      if (!tilesindex.includes(next.index)) {
        tiles.push(next);
        tilesindex.push(next.index);
      }
    }

    if (tiles[x].up.elem != undefined) {
      let next = {
        element: undefined,
        index: undefined,
        left: undefined,
        right: undefined,
        down: undefined,
      };
      next.index = tiles[x].index - 40;
      next.element = content[next.index].children[0];
      next.right = {
        elem: content[next.index + 1].children[0],
        elemindex: next.index + 1,
      };
      if (content[next.index + 40] != undefined) {
        next.down = {
          elem: content[next.index + 40].children[0],
          elemindex: next.index + 40,
        };
      } else {
        next.down = {
          elem: undefined,
          elemindex: undefined,
        };
      }

      if (content[next.index - 40] != undefined) {
        next.up = {
          elem: content[next.index - 40].children[0],
          elemindex: next.index - 40,
        };
      } else {
        next.up = {
          elem: undefined,
          elemindex: undefined,
        };
      }

      next.left = {
        elem: content[next.index - 1].children[0],
        elemindex: next.index - 1,
      };

      if (!tilesindex.includes(next.index)) {
        tiles.push(next);
        tilesindex.push(next.index);
      }
    }
  }

  if (usertiles.length == tiles.length) {
    return true;
  } else {
    return false;
  }
}
function checkSubset(needle, haystack) {
  for (let i = 0; i < needle.length; i++) {
    if (haystack.indexOf(needle[i]) === -1) {
      return false;
    }
  }

  return true;
}

function bananas() {
  if (checktilesallignment()) {
    let w = getallwords();
    let userwords = [];
    w.forEach((x) => {
      x = x.join("");
      userwords.push(x);
    });

    let mybody = {
      gid: Gameid,
      words: userwords,
      pid: yourid,
    };

    fetch("/bananas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, // says that arguments are JSON formatted
      body: JSON.stringify(mybody), // POST puts arguments in the message body
    })
      .then((response) => response.json()) // we are expecting a text response
      .then((data) => {
        if (data == false) {
          window.addEventListener("beforeunload", (event) => {
            document.cookie =
              "Playerdetails=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          });

          onlose();
        }
      });
  } else {
    alert("tiles are not connected or/and there are still tiles in hand");
  }
}

function onlose() {
  gamediv.style.display = "none";

  // Create a div element
  const loseDiv = document.createElement("div");

  // Set the style of the div
  loseDiv.style.position = "fixed";
  loseDiv.style.top = "50%";
  loseDiv.style.left = "50%";
  loseDiv.style.transform = "translate(-50%, -50%)";
  loseDiv.style.textAlign = "center";

  // Create a h1 element with the text "You Lose!!!"
  const loseText = document.createElement("h1");
  loseText.textContent = "You Lose!!!";
  loseText.style.fontSize = "5em";
  loseText.style.color = "white";

  // Create a button element with the text "Return Home"
  const homeButton = document.createElement("button");
  homeButton.textContent = "Return Home";
  homeButton.style.marginTop = "20px";
  homeButton.style.width = "300px";
  homeButton.style.color = "white";

  homeButton.addEventListener("click", function () {
    document.cookie =
      "Playerdetails=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    let mybody = {
      PlayerID: yourid,
    };

    fetch("/removeplayer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, // says that arguments are JSON formatted
      body: JSON.stringify(mybody), // POST puts arguments in the message body
    });

    window.location.replace("/");
  });
  // Add the h1 and button elements to the div
  loseDiv.appendChild(loseText);
  loseDiv.appendChild(homeButton);

  // Add the div to the document
  document.body.appendChild(loseDiv);
}

async function onquit() {
   document.cookie =
     "Playerdetails=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
   let mybody = {
     PlayerID: yourid,
   };

   fetch("/removeplayer", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     }, // says that arguments are JSON formatted
     body: JSON.stringify(mybody), // POST puts arguments in the message body
   });

   window.location.replace("/");
}

async function winnerexist() {
  document.cookie =
    "Playerdetails=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  let mybody = {
    gid: Gameid,
  };

  fetch("/removeplayer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }, // says that arguments are JSON formatted
    body: JSON.stringify(mybody), // POST puts arguments in the message body
  });

  window.location.replace("/");
}

checktileint = setInterval(checktiles, 500);
/*createtiles();
createdivs();
gridmaker();
generatetiles();*/
startgame();
