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

redeemButtons.forEach(button => {

    const awardNumber = button.dataset.award;
    const redeemedText = document.querySelector(
        `[data-redeemed="${awardNumber}"]`
    );

    const redeemed =
        localStorage.getItem(`redeemed-${awardNumber}`) === "true";

    if (redeemed) {
        button.style.display = "none";
        redeemedText.style.display = "block";
    }

    button.addEventListener("click", () => {

        localStorage.setItem(`redeemed-${awardNumber}`, "true");

        button.style.display = "none";
        redeemedText.style.display = "block";
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