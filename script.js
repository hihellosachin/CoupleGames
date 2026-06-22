// Wait until page loads
document.addEventListener("DOMContentLoaded", () => {

    const singleBtn = document.getElementById("singleBtn");
    const multiBtn = document.getElementById("multiBtn");

    // Single Player Button
    if (singleBtn) {
        singleBtn.addEventListener("click", () => {
            window.location.href = "singleplayer/single.html";
        });
    }

    // Multiplayer Button
    if (multiBtn) {
        multiBtn.addEventListener("click", () => {
            window.location.href = "multiplayer/multi.html";
        });
    }

    console.log("Key Hunt Loaded Successfully");
});