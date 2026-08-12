const awardCards = document.querySelectorAll(".award-card");
const awardsCount = document.getElementById("awards-count");

let unlockedCount = 0;

awardCards.forEach(card => {
    const awardNumber = card.dataset.award;
    const unlocked = localStorage.getItem(`award-${awardNumber}`) === "unlocked";

    if (unlocked) {
        card.classList.remove("locked");
        card.classList.add("unlocked");

        const icon = card.querySelector(".award-icon");
        icon.textContent = awardNumber === "13" ? "🏆" : "🎁";

        unlockedCount++;
    }
});

awardsCount.textContent = unlockedCount;
// Kaffe-premien

const redeemButtons = document.querySelectorAll(".redeem-button");

const redeemButtons = document.querySelectorAll(".redeem-button");

redeemButtons.forEach(button => {
    const awardNumber = button.dataset.award;

    const redeemedButton = document.querySelector(
        `[data-redeemed="${awardNumber}"]`
    );

    const redeemed =
        localStorage.getItem(`redeemed-${awardNumber}`) === "true";

    if (redeemed) {
        button.style.display = "none";
        redeemedButton.style.display = "block";
    }

    // Løs inn
    button.addEventListener("click", () => {
        localStorage.setItem(`redeemed-${awardNumber}`, "true");

        button.style.display = "none";
        redeemedButton.style.display = "block";
    });

    // Angre innløsning
    redeemedButton.addEventListener("click", () => {
        localStorage.removeItem(`redeemed-${awardNumber}`);

        redeemedButton.style.display = "none";
        button.style.display = "block";
    });
});


// Hemmelig brev

const letterButton = document.querySelector(".letter-button");
const letterOverlay = document.getElementById("letter-overlay");
const letterClose = document.getElementById("letter-close");

if (letterButton) {
    letterButton.addEventListener("click", () => {
        letterOverlay.classList.add("open");
    });
}

letterClose.addEventListener("click", () => {
    letterOverlay.classList.remove("open");
});

letterOverlay.addEventListener("click", event => {
    if (event.target === letterOverlay) {
        letterOverlay.classList.remove("open");
    }
});