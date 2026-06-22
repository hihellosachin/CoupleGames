import { db } from "../firebase/firebase-config.js";

import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let roomData = null;
let currentRoom = "";
let winnerShown = false;

function generateRoomCode(){

    const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for(let i=0;i<6;i++){

        code += chars.charAt(
            Math.floor(
                Math.random()*chars.length
            )
        );

    }

    return code;
}

function generateBoard(){

    const colors = [
        "red",
        "blue",
        "green",
        "yellow",
        "purple"
    ];

    const board = [];

    for(let i=0;i<100;i++){

        board.push({
            color: colors[
                Math.floor(
                    Math.random()*5
                )
            ],
            key:false
        });

    }

    const keyPositions = [];

    for(const color of colors){

        let placed = false;

        while(!placed){

            const pos =
            Math.floor(
                Math.random()*100
            );

            const row =
            Math.floor(pos/10);

            const col =
            pos%10;

            let valid = true;

            for(const existing of keyPositions){

                const er =
                Math.floor(existing/10);

                const ec =
                existing%10;

                if(
                    Math.abs(row-er)<=1 &&
                    Math.abs(col-ec)<=1
                ){
                    valid = false;
                    break;
                }

            }

            if(valid){

                board[pos].color =
                color;

                board[pos].key =
                true;

                keyPositions.push(pos);

                placed = true;

            }

        }

    }

    return board;

}

const createBtn =
document.getElementById("createRoom");

const joinBtn =
document.getElementById("joinRoom");

const roomInput =
document.getElementById("roomCode");

const roomCodeDisplay =
document.getElementById("roomCodeDisplay");

const status =
document.getElementById("status");

createBtn.addEventListener(
    "click",
    createRoom
);

joinBtn.addEventListener(
    "click",
    joinRoom
);

async function createRoom(){

    localStorage.setItem(
        "playerRole",
        "player1"
    );

    const roomCode =
    generateRoomCode();

    currentRoom =
    roomCode;

    const board =
    generateBoard();

    await setDoc(
        doc(
            db,
            "rooms",
            roomCode
        ),
        {
            player1:"Host",
            player2:"",

            player1Keys:0,
            player2Keys:0,

            player1Found:[],
            player2Found:[],

            winner:"",

            gameStarted:false,
            playerCount:1,

            board:board
        }
    );

    roomCodeDisplay.innerText =
    "Room Code: " + roomCode;

    watchRoom(roomCode);

}

async function joinRoom(){

    localStorage.setItem(
        "playerRole",
        "player2"
    );

    const roomCode =
    roomInput.value
    .trim()
    .toUpperCase();

    if(!roomCode){

        alert(
            "Enter Room Code"
        );

        return;
    }

    const roomRef =
    doc(
        db,
        "rooms",
        roomCode
    );

    const roomSnap =
    await getDoc(
        roomRef
    );

    if(!roomSnap.exists()){

        alert(
            "Room Not Found"
        );

        return;
    }

    await updateDoc(
        roomRef,
        {
            player2:"Guest",
            playerCount:2,
            gameStarted:true
        }
    );

    currentRoom =
    roomCode;

    watchRoom(roomCode);

}

function renderBoard(board){

    const grid =
    document.getElementById("grid");

    grid.innerHTML = "";

    board.forEach((tile,index)=>{

        const div =
        document.createElement("div");

        div.className =
        "tile";

        div.style.background =
        tile.color;

        div.dataset.index =
        index;

        if(tile.found){

            div.innerHTML = "🔑";

            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.justifyContent = "center";
            div.style.fontSize = "30px";

            div.style.border =
            "3px solid white";
        }

        div.addEventListener(
            "click",
            ()=>{
                checkTile(index);
            }
        );

        grid.appendChild(div);

    });

}



async function checkTile(index){

    if(!roomData) return;

    const tile =
    roomData.board[index];
    if(tile.found){

    alert("🔑 Key already discovered!");

    return;
}

    if(!tile.key){

        alert("❌ No Key");
        return;

    }

    const role =
    localStorage.getItem(
        "playerRole"
    );

    const color =
    tile.color;

    const roomRef =
    doc(
        db,
        "rooms",
        currentRoom
    );

    const board =
    [...roomData.board];

    board[index].found =
    true;

    if(role === "player1"){

        let found =
        roomData.player1Found || [];

        if(
            found.includes(color)
        ){

            alert(
                "Already Found " +
                color
            );

            return;
        }

        found.push(color);

        await updateDoc(
            roomRef,
            {
                player1Found:
                found,

                player1Keys:
                found.length,

                board:
                board
            }
        );

        alert(
            "🔑 Found " +
            color +
            " key!"
        );

        if(found.length >= 5){

            await updateDoc(
                roomRef,
                {
                    winner:
                    "Player 1"
                }
            );

        }

    }

    else if(
        role === "player2"
    ){

        let found =
        roomData.player2Found || [];

        if(
            found.includes(color)
        ){

            alert(
                "Already Found " +
                color
            );

            return;
        }

        found.push(color);

        await updateDoc(
            roomRef,
            {
                player2Found:
                found,

                player2Keys:
                found.length,

                board:
                board
            }
        );

        alert(
            "🔑 Found " +
            color +
            " key!"
        );

        if(found.length >= 5){

            await updateDoc(
                roomRef,
                {
                    winner:
                    "Player 2"
                }
            );

        }

    }

}

function watchRoom(roomCode){

    const roomRef =
    doc(
        db,
        "rooms",
        roomCode
    );

    onSnapshot(
        roomRef,
        (snapshot)=>{

            if(
                !snapshot.exists()
            ) return;

            const data =
            snapshot.data();

            roomData =
            data;

            status.innerHTML =
`
<h3>Lobby Status</h3>

Player 1:
${data.player1}

<br><br>

Player 2:
${data.player2}

<br><br>

Players:
${data.playerCount}/2

<br><br>

Game Started:
${data.gameStarted}
`;

            document
            .getElementById("p1")
            .innerText =
            data.player1Keys;

            document
            .getElementById("p2")
            .innerText =
            data.player2Keys;

            if(
                data.board &&
                data.board.length > 0
            ){
                renderBoard(
                    data.board
                );
            }

            if(data.winner){

    alert(
        "🏆 " +
        data.winner +
        " Wins!"
    );

}

        }
    );

}
