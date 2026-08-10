const countdown = document.getElementById("countdown");

// Dagen vi sees igjen
const reunionDate = new Date(2026, 9, 5);

// Dagens dato, uten klokkeslett
const today = new Date();
today.setHours(0, 0, 0, 0);

const difference = reunionDate - today;
const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

if (daysLeft > 1) {
    countdown.textContent = `${daysLeft} dager til jeg får se deg igjen`;
} else if (daysLeft === 1) {
    countdown.textContent = "1 dag til jeg får se deg igjen";
} else {
    countdown.textContent = "Endelig sammen igjen ♥";
}