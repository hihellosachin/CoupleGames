const colors=[
'red',
'blue',
'green',
'yellow',
'purple'
];

const grid=document.getElementById("grid");

let foundKeys=0;

let keyPositions={};

colors.forEach(color=>{
keyPositions[color]=Math.floor(Math.random()*100);
});

for(let i=0;i<100;i++){

const tile=document.createElement("div");

const color=colors[Math.floor(Math.random()*5)];

tile.classList.add("tile");
tile.style.background=color;

tile.onclick=()=>{

for(let c in keyPositions){

if(keyPositions[c]===i){

tile.innerHTML="🔑";
tile.style.display="flex";
tile.style.alignItems="center";
tile.style.justifyContent="center";

foundKeys++;

delete keyPositions[c];

if(foundKeys===5){

alert("You Found All Keys!");
}

}
}

};

grid.appendChild(tile);

}