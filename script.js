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
let alltiles= [];
let divsize = 600;
let contentelem = document.getElementById("content");
function createdivs() {
  for (let x = 0; x < divsize; x++) {
    let newdiv = document.createElement("div");
    newdiv.className = "space";
    contentelem.appendChild(newdiv);
  }
}

function createtiles(){
    for(let x = 0; x<repartation.length;x++){
        for(let y =0;y<repartation[x].count;y++){
            let tile = document.createElement('button');
            tile.textContent=repartation[x].letter;
            tile.className='tile';
            alltiles.push(tile);
        }
    }
}

createtiles();
createdivs();
