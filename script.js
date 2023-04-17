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
let usertiles= [];
let pos = document.getElementById("tilespositon");
let divsize = 720;
let gridwidth = screen.width / 40;
let gridheight = screen.height / 26;
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
            tile.style.width=gridwidth-5+"px";
            tile.style.height=gridheight-3+"px";
            tile.style.borderRadius="7px";
            tile.style.backgroundColor = "#C724B1";
            tile.style.color= "#fff";
            tile.style.opacity = "0.5";
            tile.style.textShadow= "0 0 7px #fff,0 0 10px #fff,0 0 21px #fff";
            tile.style.border="none";
            tile.style.margin="2px";
            tile.addEventListener("mouseover", (event) => {tile.style.opacity="1";tile.style.cursor="grab"});
            tile.addEventListener("mouseout", (event) => {tile.style.opacity="0.5";});
            tile.textContent=repartation[x].letter;
            tile.className='tile';
            alltiles.push(tile);
            
            tile.onmousedown = function(event) {

        let shiftX = event.clientX - 
        tile.getBoundingClientRect().left;
        let shiftY = event.clientY - 
        tile.getBoundingClientRect().top;
        tile.style.position = 'absolute';
        
        document.body.append(tile);

        moveAt(event.pageX, event.pageY);

        // moves the tile at (pageX, pageY) coordinates
        // taking initial shifts into account
        function moveAt(pageX, pageY) {
            
            tile.style.left = pageX - shiftX + 'px';
            tile.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        // move the tile on mousemove
        document.addEventListener('mousemove', onMouseMove);

        // drop the tile, remove unneeded handlers
        
        tile.onmouseup = function(e) {
            let elements= document.elementsFromPoint(e.clientX, e.clientY); 
            document.removeEventListener('mousemove', onMouseMove);
            tile.onmouseup = null;
            document.body.removeChild(tile);
            for(let i =0; i<elements.length;i++){
                if(elements[i].id=="tilespositon"){
                    elements[i].appendChild(tile);
                    break;
                }
                
                else if(elements[i].className=="space"){
                    if(elements[i].hasChildNodes()){
                        pos.appendChild(tile);
                        tile.style.position = "";
                        tile.style.left = "";
                        tile.style.top = "";
                    }
                    else{
                    elements[i].appendChild(tile);
                    tile.style.left="";
                    tile.style.top="";}
                    
                    break;
                }
                else{
                if(i==elements.length-1){
                    pos.appendChild(tile);
                    tile.style.position="";
                    tile.style.left="";
                    tile.style.top="";
                    
                    break;
                }
                }
            }
        };

        };

        
        tile.ondragstart = function() {
        return false;
        };


    }
}}
function gridmaker(){
    
    contentelem.style.display="grid";
    contentelem.style.gridArea="code";
    contentelem.style.gridTemplateRows=`repeat(18,${gridheight}px) `;
    contentelem.style.gridTemplateColumns = `repeat(40,${gridwidth}px) `;

}
function generatetiles(){
    for(let x =0; x<12;x++){
        let rand = Math.floor(Math.random() * alltiles.length);
        usertiles.push(alltiles[rand]);
        alltiles.splice(rand,1);
    }
    usertiles.map(x=>(pos.appendChild(x)))
}

createtiles();
createdivs();
gridmaker();
generatetiles();
