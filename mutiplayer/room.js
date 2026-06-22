import { db } from "./firebase/firebase-config.js";

import {
    doc,
    setDoc,
    updateDoc,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function generateRoomCode() {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return code;
}

export async function createRoom() {

    const roomCode = generateRoomCode();

    await setDoc(
        doc(db, "rooms", roomCode),
        {
            player1: "Host",
            player2: "",
            player1Keys: 0,
            player2Keys: 0,
            gameStarted: false,
            winner: "",
            createdAt: Date.now()
        }
    );

    return roomCode;
}

export async function joinRoom(roomCode) {

    const roomRef =
        doc(db, "rooms", roomCode);

    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
        alert("Room not found");
        return false;
    }

    await updateDoc(roomRef, {
        player2: "Guest",
        gameStarted: true
    });

    return true;
}

export function watchRoom(
    roomCode,
    callback
) {

    const roomRef =
        doc(db, "rooms", roomCode);

    onSnapshot(roomRef, (docSnap) => {

        if (docSnap.exists()) {

            callback(
                docSnap.data()
            );

        }

    });

}
