const awardCards = document.querySelectorAll(".award-card");
const awardsCount = document.getElementById("awards-count");

let unlockedCount = 0;


// --------------------------------
// VIS OPPLÅSTE PREMIER
// --------------------------------

awardCards.forEach(card => {
    const awardNumber = card.dataset.award;

    const unlocked =
        localStorage.getItem(`award-${awardNumber}`) === "unlocked";

    if (unlocked) {
        card.classList.remove("locked");
        card.classList.add("unlocked");

        const icon = card.querySelector(".award-icon");

        if (icon) {
            icon.textContent =
                awardNumber === "13" ? "🏆" : "🎁";
        }

        unlockedCount++;
    } else {
        card.classList.add("locked");
        card.classList.remove("unlocked");
    }
});

if (awardsCount) {
    awardsCount.textContent = unlockedCount;
}


// --------------------------------
// LØS INN PREMIER
// --------------------------------

const redeemButtons =
    document.querySelectorAll(".redeem-button");

redeemButtons.forEach(button => {

    // Finn kortet knappen faktisk ligger inne i
    const card = button.closest(".award-card");

    if (!card) {
        return;
    }

    const awardNumber = card.dataset.award;

    // Finn "Løst inn"-knappen KUN i samme premie
    const redeemedButton =
        card.querySelector(".redeemed-text");

    if (!redeemedButton) {
        return;
    }

    const unlocked =
        localStorage.getItem(`award-${awardNumber}`) === "unlocked";

    const redeemed =
        localStorage.getItem(`redeemed-${awardNumber}`) === "true";


    // Premien er låst
    if (!unlocked) {
        button.style.display = "none";
        redeemedButton.style.display = "none";
        return;
    }


    // Premien er låst opp og allerede løst inn
    if (redeemed) {
        button.style.display = "none";
        redeemedButton.style.display = "block";
    } else {
        // Premien er låst opp og kan løses inn
        button.style.display = "block";
        redeemedButton.style.display = "none";
    }


    // Løs inn
    button.addEventListener("click", () => {

        localStorage.setItem(
            `redeemed-${awardNumber}`,
            "true"
        );

        button.style.display = "none";
        redeemedButton.style.display = "block";
    });


    // Angre innløsning
    redeemedButton.addEventListener("click", () => {

        localStorage.removeItem(
            `redeemed-${awardNumber}`
        );

        redeemedButton.style.display = "none";
        button.style.display = "block";
    });
});


// --------------------------------
// HEMMELIG BREV
// --------------------------------

const letterButton =
    document.querySelector(".letter-button");

const letterOverlay =
    document.getElementById("letter-overlay");

const letterClose =
    document.getElementById("letter-close");

if (letterButton && letterOverlay) {
    letterButton.addEventListener("click", () => {
        letterOverlay.classList.add("open");
    });
}

if (letterClose && letterOverlay) {
    letterClose.addEventListener("click", () => {
        letterOverlay.classList.remove("open");
    });
}

if (letterOverlay) {
    letterOverlay.addEventListener("click", event => {
        if (event.target === letterOverlay) {
            letterOverlay.classList.remove("open");
        }
    });
}
const multiRedeemButtons =
    document.querySelectorAll(".multi-redeem-button");

multiRedeemButtons.forEach(button => {
    const card = button.closest(".award-card");

    if (!card) {
        return;
    }

    const awardNumber = card.dataset.award;
    const limit = Number(button.dataset.limit);

    const status = card.querySelector(".multi-redeem-status");
    const usedCount = card.querySelector(".used-count");

    const unlocked =
        localStorage.getItem(`award-${awardNumber}`) === "unlocked";

    let used =
        Number(localStorage.getItem(`multi-redeemed-${awardNumber}`)) || 0;

    if (!unlocked) {
        button.style.display = "none";

        if (status) {
            status.style.display = "none";
        }

        return;
    }

    function updateMultiRedeemUI() {
        usedCount.textContent = used;

        if (used >= limit) {
            button.style.display = "none";
        } else {
            button.style.display = "block";
        }

        status.style.display = "block";
    }

    button.addEventListener("click", () => {
        if (used >= limit) {
            return;
        }

        used++;

        localStorage.setItem(
            `multi-redeemed-${awardNumber}`,
            used
        );

        updateMultiRedeemUI();
    });

    updateMultiRedeemUI();
});