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
let peel = document.getElementById("peel");
let mybody;
let tilesindex;
let onwininterval;

// create divs for the grid
function createdivs() {
  for (let x = 0; x < divsize; x++) {
    let newdiv = document.createElement("div");
    newdiv.className = "space";

    contentelem.appendChild(newdiv);
  }
}
// create tiles by taking in an array of letter and giving it functions
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
    // on mouse down you take in the coordinates of the event 
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
      // check each drop spots and the actions for each
      tile.onmouseup = function (e) {
        let elements = document.elementsFromPoint(e.clientX, e.clientY);
        document.removeEventListener("mousemove", onMouseMove);
        tile.onmouseup = null;
        document.body.removeChild(tile);
        for (let i = 0; i < elements.length; i++) {
          // if it's still in the div of tiles just leave it at the current position it was moved
          if (elements[i].id == "tilespositon") {
            elements[i].appendChild(tile);
            break;
          }
          // if it's in the wormhole we are removing it from a the hand and inserting into the wormhole div 
          if (elements[i].id == "wormhole") {
            let newtiles;
            elements[i].appendChild(tile);
            tile.style.left = "";
            tile.style.top = "";
            // removed the check tile interval to not mess with the aniimation
            clearInterval(checktileint);
            // return 3 tiles by giving up one 
            async function get3tiles() {
              await droptile(tile.textContent).then((a) => {
                // css for new tile
                newtiles = a;
                tile.style.transition = "transform 4s ease-in-out";
                tile.style.transform = "scale(0)";
                // remove old tile from all arrays
                alltiles.splice(alltiles.indexOf(tile), 1);
                usertiles.splice(usertiles.indexOf(tile.textContent), 1);
                newtiles.forEach((b) => {
                  usertiles.push(b);
                });
                // run the intervals back after all the animation is done
                setTimeout((tst) => {
                  elements[i].removeChild(tile);
                  checktileint = setInterval(checktiles, 1000);
                  createtiles(newtiles);
                }, 5000);
              });
            }

            get3tiles();
            break;
          } 
          // if the element is in a grid space
          else if (elements[i].className == "space") {
            // if the grid space alreay has a tile in it return the tile back to the hand 
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
// make grids
function gridmaker() {
  contentelem.style.display = "grid";
  contentelem.style.gridArea = "code";
  contentelem.style.gridTemplateRows = `repeat(18,${gridheight}px) `;
  contentelem.style.gridTemplateColumns = `repeat(40,${gridwidth}px) `;
}
// get cookie, if cookie doesn't exist return user home
async function getmycookie() {
  return new Promise((resolve, reject) => {
    fetch("/myCookie")
      .then((response) => response.json())
      .then((data) => {
        if(data == "null"){
          window.location.replace("/");
        }
        resolve(data);

      });
  });
}

//get cookie for game start
async function getmycookiebegingame() {
  return new Promise((resolve, reject) => {
    fetch("/myCookie")
      .then((response) => response.json())
      .then((data) => {
        
        if (data == null) {
          window.location.replace("/");
        }
        else{
          startgame();
          checktileint = setInterval(checktiles, 500);
        }
      });
  });
}

// get all users using a game id, i had the function (haven't used it yet but i could)
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
// begin the game by getting game id and user id from the cookie so i can set up individual pages
async function startgame() {
  await getmycookie().then((y) => {
    Gameid = y.GameID;
    yourid = y.PlayerID;
  });
  await getgamestate(Gameid).then((y) => {
    // if it's a new game (for the person that splits it's going to be zero), so it's going to split and share the tiles
    if (y == "0") {
      begin();
      sharetiles();
      let mybody = {
        gid: Gameid,
      };
      fetch("/launchgame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, // says that arguments are JSON formatted
        body: JSON.stringify(mybody), // POST puts arguments in the message body
      })
        .then((response) => response.text()) // we are expecting a text response
        .then((data) => {
        });
    }
    // this is for other members of the game it just takes in the tiles they have currently in the database and start their game
    if (y == "1") {
      gamediv.style.display = "grid";
      resumegame();

    }
  });
  // set an onwin interval here which checks every 3 sec if there is a winner and acts accordingly
   onwininterval = setInterval(winnerexist, 3000);
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

function begin() {
  setTimeout(async function () {
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

    location.reload();},1000);
}
// takes in the game id and splits in the db
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
// get user tiles currently in the database
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

//check the tiles in the database and the current user tiles to see if there is any difference, and update the tiles on the screen accordingly 
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
// for some reason it wasn't working properly and this was a fix i have no idea why
async function peelfunc() {
  await attemptpeel().then(x=>{
    console.log(x);
  });
}

// on peel it goes to the backend and and gives everyone a tile in the backend
// then the code  to check tiles does the rest and updates the tiles in the game
async function attemptpeel(){
return new Promise((resolve, reject) => {  fetch("/peel", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  }, // says that arguments are JSON formatted
  body: JSON.stringify(mybody), // POST puts arguments in the message body
})
  .then((response) => response.text()) // we are expecting a text response
  .then((data) => {
    resolve(data);
  });

})
}
// checks tiles allignment in a linked list fashion
function checktilesallignment() {
  let tiles = [];
  tilesindex = [];
  // the head of the element has for sides,  it's index , and the element contained (it doesn't have a top, i just did it to avoid errors)
  let head = {
    element: undefined,
    index: undefined,
    right: undefined,
    left: undefined,
    down: undefined,
    up: undefined,
  };
  //go through the grid to get the first element and that element is our head
  for (let x = 0; x < content.length; x++) {
    if (content[x].hasChildNodes()) {
      // check if it's at the end of the grid so it wouldn't have errors and recognize the next line first element as the right
      if (x % 40 == 0) {
        head.element = content[x].children[0];
        head.index = x;
        // in case it is there is no right
        head.right = {
          elem: undefined,
          elemindex: undefined,
        };
        //the left  if the element left to it (which there probably won't be)
        head.left = {
          elem: content[x - 1].children[0],
          elemindex: x - 1,
        };
        // the grid is done by columns of 40 so the element directly below is +40 of it in terms of index 
        head.down = {
          elem: content[x + 40].children[0],
          elemindex: x + 40,
        };
        // it probably doesn't have a top but to avoid errors
        head.up = {
          elem: content[x - 40].children[0],
          elemindex: x + 40,
        };
        
      }
      // same thing as earlier but this time if element is at the first tile(again to avoid errors)
      else if (x % 40 == 1) {
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
      } 
      // if the head is at the last row (act accordingly )
      else if (x >= 680 && x <= 720) {
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
      }
      // if the head is at the first row
      else if (x >= 0 && x <= 40) {
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
      } 
      // in case it's in the middle with no issues
      else {
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
      // insert this tile and its index into arrays i will use later
      tiles.push(head);
      tilesindex.push(head.index);
      break;
    }
  }
// to loop through all the tiles and create recursion 
  for (let x = 0; x < tiles.length; x++) {

    // if current tile has a left tile next to it insert that tile and the elements next to it
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
      // check if the next element down isn't outside the scope of the grid
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
      // check if the next element up isn't outside the scope of the grid
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
      // insert the element left to the current tile in our array of all tile if it isn't already in our array
      if (!tilesindex.includes(next.index)) {
        tiles.push(next);
        tilesindex.push(next.index);
      }
    }

    // same thing for the right element of the current tile 
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
    // same for the down
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

    // same for the top
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
  /* as long as a tile exists the code will keep pushing through and look for elements right next to it, and this all starts from the head, so it gets the next elements from the head and the next of the next of the head from all sides and then compare the length of all the tiles the user have with the length of tiles.next gotten so if they are equal it means all tiles are connected  */
  if (usertiles.length == tiles.length) {
    return true;
  } else {
    return false;
  }
}

// get all words using the index of the tiles connected 
function getallwords() {
  // sort index by ascending order to get a better hold of left to right elements and top to bottom
  tilesindex = tilesindex.sort((a, b) => a - b);// sort
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

    // for each tile index
    for (let y = x + 1; y < tilesindex.length; y++) {
      // create an array for vertical and horizontal words 
      // if an index of +40 exists in increment from the previous index insert that into the vertical array and if an index of +1 in increment exist insert that into the horizontal
      if (tilesindex[y] == horizontal + 1) {
        horizontalword.push(tilesindex[y]);
        horizontal = horizontal + 1;
      }

      if (tilesindex[y] == vertical + 40) {
        verticalword.push(tilesindex[y]);
        vertical = vertical + 40;
      }
    }
    // as long as there is more than one index in the array of index vertical or horizontal it is inserted in an array containing groups of indexes
    if (verticalword.length > 1) {
      indexgrouping.push(verticalword);
    }
    if (horizontalword.length > 1) {
      indexgrouping.push(horizontalword);
    }
  }

  /* since i'm doing it for each tile and i can have a situation where [1,2,3] is an array and [2,3] is another that would be an issue so i check for subsets , if an array is entirely a subset of another it is removed from the array of all index*/
  for (let x = 0; x < indexgrouping.length; x++) {
    for (let y = indexgrouping.length - 1; y > 0; y--) {
      if (indexgrouping[x] !== indexgrouping[y]) {
        if (checkSubset(indexgrouping[y], indexgrouping[x])) {
          indexgrouping.splice(y, 1);
        }
      }
    }
  }

  // when done checking for subsets convert all index into the text content of the element they represent
  for (let x = 0; x < indexgrouping.length; x++) {
    for (let i = 0; i < indexgrouping[x].length; i++) {
      indexgrouping[x][i] =
        content[indexgrouping[x][i]].children[0].textContent;
    }
  }
  return indexgrouping;
}
//chedks for subsets
function checkSubset(needle, haystack) {
  for (let i = 0; i < needle.length; i++) {
    if (haystack.indexOf(needle[i]) === -1) {
      return false;
    }
  }

  return true;
}


function bananas() {
  //if tiles are alined
  if (checktilesallignment()) {
    let w = getallwords();// get all words
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

    // send to backend to check if all words of the array is in our dictionary
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
              window.location.replace("/");
          });

          onlose();
        }
      });
  } else {
    alert("tiles are not connected or/and there are still tiles in hand");
  }
}


function onwin() {
  gamediv.style.display = "none";

  // Create a div element
  let windiv = document.createElement("div");

  // Set the style of the div
  windiv.style.position = "fixed";
  windiv.style.top = "50%";
  windiv.style.left = "50%";
  windiv.style.transform = "translate(-50%, -50%)";
  windiv.style.textAlign = "center";

  // Create a h1 element with the text "You Lose!!!"
  let winText = document.createElement("h1");
  winText.textContent = "You Win!!!";
  winText.style.fontSize = "5em";
  winText.style.color = "white";

  // Create a button element with the text "Return Home"
  const homeButton = document.createElement("button");
  homeButton.textContent = "Return Home";
  homeButton.style.marginTop = "20px";
  homeButton.style.width = "300px";
  homeButton.style.color = "white";

  homeButton.addEventListener("click", onquit);
    
  // Add the h1 and button elements to the div
  windiv.appendChild(winText);
  windiv.appendChild(homeButton);

  // Add the div to the document
  document.body.appendChild(windiv);
  
}
function onlose() {
  gamediv.style.display = "none";

  // Create a div element
  let loseDiv = document.createElement("div");

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

  homeButton.addEventListener("click", onquit);
  // Add the h1 and button elements to the div
  loseDiv.appendChild(loseText);
  loseDiv.appendChild(homeButton);

  // Add the div to the document
  document.body.appendChild(loseDiv);
  
}
// on quit return home and delete cookie
async function onquit() {
  let mybody = {
    PlayerID: yourid,
  };

  fetch("/removeplayeringame", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }, // says that arguments are JSON formatted
    body: JSON.stringify(mybody), // POST puts arguments in the message body
  });

document.cookie =
  "Playerdetails=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  window.location.replace("/");
}
//checks if winner exists and if it is your id 
async function winnerexist() {
  await checkwinner().then(
    x=>{
      if (x != "") {
        clearInterval(onwininterval);

        if (yourid == x) {
          onwin();
        } else {
          onlose();
        }
      } 
    }
  )
}

function checkwinner(){
  let mybody = {
    gid: Gameid,
  };
  return new Promise((resolve, reject) => {
  fetch("/gamewon", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }, // says that arguments are JSON formatted
    body: JSON.stringify(mybody), // POST puts arguments in the message body
  })
    .then((response) => response.text())
    .then((data) => {
      resolve(data);
    });
})
}
getmycookiebegingame();

/*createtiles();
createdivs();
gridmaker();
generatetiles();*/

