import { db } from "../firebase/firebase-config.js";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let roomData = null;
let currentRoom = "";
let alertShown = false;

function generateRoomCode(){
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for(let i=0;i<6;i++){
        code += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    return code;
}

const createBtn = document.getElementById("createRoom");
const joinBtn = document.getElementById("joinRoom");
const roomInput = document.getElementById("roomCode");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const status = document.getElementById("status");
const nameInput = document.getElementById("playerName");

// Setup & Game UI items
const lobbySection = document.getElementById("lobbySection");
const setupSection = document.getElementById("setupSection");
const secretNumberInput = document.getElementById("secretNumberInput");
const submitSecretBtn = document.getElementById("submitSecretBtn");
const setupStatus = document.getElementById("setupStatus");

const gameSection = document.getElementById("gameSection");
const guessInput = document.getElementById("guessInput");
const submitGuessBtn = document.getElementById("submitGuessBtn");
const feedbackDisplay = document.getElementById("feedbackDisplay");
const historyLog = document.getElementById("historyLog");

createBtn.addEventListener("click", createRoom);
joinBtn.addEventListener("click", joinRoom);
submitSecretBtn.addEventListener("click", lockInSecretNumber);
submitGuessBtn.addEventListener("click", handleGuessSubmit);

async function createRoom(){
    const name = nameInput.value.trim() || "Host";
    localStorage.setItem("numPlayerRole", "player1");
    localStorage.setItem("numStoredName", name);

    const roomCode = generateRoomCode();
    currentRoom = roomCode;

    await setDoc(doc(db, "numberRooms", roomCode), {
        player1: name,
        player2: "",
        player1Secret: "",
        player2Secret: "",
        player1Progress: "Not Ready ❌",
        player2Progress: "Not Ready ❌",
        winner: "",
        gameActive: false,
        playerCount: 1
    });
    roomCodeDisplay.innerText = "Room Code: " + roomCode;
    watchRoom(roomCode);
}

async function joinRoom(){
    const name = nameInput.value.trim() || "Guest";
    localStorage.setItem("numPlayerRole", "player2");
    localStorage.setItem("numStoredName", name);

    const roomCode = roomInput.value.trim().toUpperCase();
    if(!roomCode){
        alert("Enter Room Code");
        return;
    }
    const roomRef = doc(db, "numberRooms", roomCode);
    const roomSnap = await getDoc(roomRef);
    if(!roomSnap.exists()){
        alert("Room Not Found");
        return;
    }
    await updateDoc(roomRef, {
        player2: name,
        playerCount: 2
    });
    currentRoom = roomCode;
    watchRoom(roomCode);
}

async function lockInSecretNumber() {
    const value = secretNumberInput.value.trim();
    if(value.length !== 4) {
        alert("Your secret number must be exactly 4 digits long!");
        return;
    }
    const role = localStorage.getItem("numPlayerRole");
    const roomRef = doc(db, "numberRooms", currentRoom);

    if(role === "player1") {
        await updateDoc(roomRef, {
            player1Secret: value,
            player1Progress: "0/4 Correct"
        });
    } else {
        await updateDoc(roomRef, {
            player2Secret: value,
            player2Progress: "0/4 Correct"
        });
    }
    setupStatus.innerText = "Your secret number is locked in safely! Waiting for opponent...";
    secretNumberInput.disabled = true;
    submitSecretBtn.disabled = true;
}

async function handleGuessSubmit() {
    const guess = guessInput.value.trim();
    if(guess.length !== 4) {
        alert("Enter a 4-digit guess!");
        return;
    }

    const role = localStorage.getItem("numPlayerRole");
    const myName = localStorage.getItem("numStoredName");
    const roomRef = doc(db, "numberRooms", currentRoom);
    
    const targetSecret = role === "player1" ? roomData.player2Secret : roomData.player1Secret;
    
    let matchCount = 0;
    let accuratePositions = [];
    const positionNames = ["1st", "2nd", "3rd", "4th"];

    // Compare each index position accurately
    for(let i = 0; i < 4; i++) {
        if(guess[i] === targetSecret[i]) {
            matchCount++;
            accuratePositions.push(positionNames[i]);
        }
    }

    // Format the feedback string specifically naming the digit positions
    let feedbackText = "";
    if (matchCount === 4) {
        feedbackText = "All digits match perfectly!";
    } else if (matchCount > 0) {
        feedbackText = accuratePositions.join(", ") + " digit is correct";
    } else {
        feedbackText = "No matching digits found in correct positions.";
    }
    
    feedbackDisplay.innerText = feedbackText;

    // Append custom detailed breakdown row into your historical list log
    const logItem = document.createElement("div");
    logItem.className = "log-item";
    logItem.innerHTML = `Tried <strong>${guess}</strong> &rarr; <span class="hint-span">${feedbackText}</span>`;
    historyLog.prepend(logItem);
    
    guessInput.value = "";

    // Sync match strings dynamically to show correct counters in your bottom view strip
    const progressString = `${matchCount}/4 Correct`;
    if(role === "player1") {
        await updateDoc(roomRef, { player1Progress: progressString });
    } else {
        await updateDoc(roomRef, { player2Progress: progressString });
    }

    if(matchCount === 4) {
        await updateDoc(roomRef, { winner: myName });
    }
}

function watchRoom(roomCode){
    currentRoom = roomCode;
    const roomRef = doc(db, "numberRooms", roomCode);
    onSnapshot(roomRef, (snapshot)=>{
        if(!snapshot.exists()) return;
        const data = snapshot.data();
        roomData = data;

        status.innerHTML = `
            <h3>Lobby Status</h3>
            Player 1: ${data.player1 || "Waiting..."}<br>
            Player 2: ${data.player2 || "Waiting..."}<br>
            Players Joined: ${data.playerCount}/2
        `;

        document.getElementById("p1Name").innerText = data.player1 || "Player 1";
        document.getElementById("p2Name").innerText = data.player2 || "Player 2";
        document.getElementById("p1Status").innerText = data.player1Progress;
        document.getElementById("p2Status").innerText = data.player2Progress;

        if(data.playerCount === 2) {
            lobbySection.style.display = "none";
            setupSection.style.display = "block";
        }

        if(data.player1Secret && data.player2Secret) {
            setupSection.style.display = "none";
            gameSection.style.display = "block";
        }

        if(data.winner && !alertShown){
            alertShown = true;
            alert("🏆 " + data.winner + " has cracked the number and won the match!");
            location.reload();
        }
    });
}