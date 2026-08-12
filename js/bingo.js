const SUPABASE_URL = "https://molrxdeqtsnkffzyvahm.supabase.co";
const SUPABASE_KEY = "sb_publishable_s-eACKlTB5SQCvJD_Mwq7A_szqi-P0j";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
async function saveSharedSquare(index, completed, proofPath = null, proofType = null) {
    const { error } = await supabaseClient
        .from("bingo_state")
        .upsert(
            {
                square_index: index,
                completed: completed,
                proof_path: proofPath,
                proof_type: proofType,
                updated_at: new Date().toISOString()
            },
            {
                onConflict: "square_index"
            }
        );

    if (error) {
        console.error("Kunne ikke synkronisere bingoruten:", error);
    }
}
const bingoSquares = document.querySelectorAll(".bingo-square");
const progressCount = document.getElementById("progress-count");
const bingoCombinations = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],

    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],

    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20]
];
function showAwardPopup() {
    const popup = document.getElementById("award-popup");

    if (popup) {
        popup.classList.add("show");
    }
}
function checkAwards() {
    bingoCombinations.forEach((combination, index) => {

        const hasBingo = combination.every(squareIndex => {
            const square = bingoSquares[squareIndex];

            return (
                square.classList.contains("completed") ||
                square.classList.contains("free")
            );
        });

        const awardKey = `award-${index + 1}`;

        if (hasBingo) {

    const wasUnlocked =
        localStorage.getItem(awardKey) === "unlocked";

    localStorage.setItem(awardKey, "unlocked");

    if (!wasUnlocked) {
        showAwardPopup();
    }

} else {
    localStorage.removeItem(awardKey);

    // Nullstill flerbruks-premier når bingoen forsvinner
    const awardNumber = index + 1;

    if (awardNumber === 1 || awardNumber === 4) {
        localStorage.removeItem(
            `multi-redeemed-${awardNumber}`
        );
    }
}
    });

    const allTasksCompleted = Array.from(bingoSquares)
        .filter(square => !square.classList.contains("free"))
        .every(square => square.classList.contains("completed"));

    if (allTasksCompleted) {
        localStorage.setItem("award-13", "unlocked");
    } else {
        localStorage.removeItem("award-13");
    }
}
function updateProgress() {
    const completedSquares = document.querySelectorAll(
        ".bingo-square.completed:not(.free)"
    ).length;

    progressCount.textContent = completedSquares;
    checkAwards();
}
async function loadProof(square, index) {
    const filePath = localStorage.getItem(`bingo-proof-${index}`);

    if (!filePath) {
        return;
    }

    const { data, error } = await supabaseClient.storage
        .from("bingo-proof")
        .createSignedUrl(filePath, 60 * 60 * 24 * 30);

    if (error) {
        console.error("Kunne ikke hente bevis:", error);
        return;
    }

    const extension = filePath.split(".").pop().toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "webp"];

    if (imageExtensions.includes(extension)) {
        square.innerHTML = `
            <img
                src="${data.signedUrl}"
                alt="Bingo-bevis"
                class="proof-image"
            >
            <span class="proof-check">✓</span>
            <span class="proof-remove">&times;</span>
        `;
    } else {
        square.innerHTML = `
    <video
        src="${data.signedUrl}"
        class="proof-video"
        muted
        playsinline
        preload="auto"
    ></video>

    <span class="proof-play">▶</span>
    <span class="proof-check">✓</span>
    <span class="proof-remove">&times;</span>
`;
    }
}
bingoSquares.forEach((square, index) => {
square.dataset.originalText = square.textContent.trim();
loadProof(square, index);
    const savedState = localStorage.getItem(`bingo-${index}`);

    if (savedState === "completed") {
        square.classList.add("completed");
    }

    square.addEventListener("click", () => {

    // Ruter som krever bevis håndteres av upload-funksjonen
    if (square.dataset.proof === "true") {
        return;
    }

    square.classList.toggle("completed");

    if (square.classList.contains("completed")) {
        localStorage.setItem(`bingo-${index}`, "completed");
    } else {
        localStorage.removeItem(`bingo-${index}`);
    }

    updateProgress();
});

});

updateProgress();
const proofUpload = document.getElementById("proof-upload");

let selectedSquare = null;
let selectedIndex = null;

bingoSquares.forEach((square, index) => {

    if (square.dataset.proof !== "true") {
        return;
    }

    square.addEventListener("click", (event) => {

    // Ikke åpne filvelger hvis man trykker på kontrollene
    if (
        event.target.closest(".proof-play") ||
        event.target.closest(".proof-remove") ||
        event.target.closest(".proof-video") ||
        event.target.closest(".proof-image")
    ) {
        return;
    }

    // Hvis ruten allerede har bevis, ikke åpne filvelger igjen
    const existingProof = localStorage.getItem(`bingo-proof-${index}`);

    if (existingProof) {
        return;
    }

    selectedSquare = square;
    selectedIndex = index;

    proofUpload.click();
});

});

proofUpload.addEventListener("change", async () => {

    const file = proofUpload.files[0];

    if (!file || selectedSquare === null) {
        return;
    }

    const extension = file.name.split(".").pop();

    const filePath =
        `proof-${selectedIndex}-${Date.now()}.${extension}`;

    selectedSquare.textContent = "Laster opp…";

    const { data, error } = await supabaseClient.storage
        .from("bingo-proof")
        .upload(filePath, file);

    if (error) {
        console.error(error);

        selectedSquare.textContent = "Opplasting feilet";
        return;
    }

    console.log("Uploaded:", data);
    selectedSquare.classList.add("completed");
localStorage.setItem(`bingo-${selectedIndex}`, "completed");
localStorage.setItem(`bingo-proof-${selectedIndex}`, filePath);
await saveSharedSquare(
    selectedIndex,
    true,
    filePath,
    file.type
);
updateProgress();

const { data: signedData, error: signedError } =
    await supabaseClient.storage
        .from("bingo-proof")
        .createSignedUrl(filePath, 60 * 60 * 24 * 30);

if (signedError) {
    console.error(signedError);
    selectedSquare.textContent = "Bevis lastet opp ✓";
    return;
}

if (file.type.startsWith("image/")) {
    selectedSquare.innerHTML = `
    <img
        src="${signedData.signedUrl}"
        alt="Bingo-bevis"
        class="proof-image"
    >
    <span class="proof-check">✓</span>
    <span class="proof-remove">&times;</span>
`;
} else {
    selectedSquare.innerHTML = `
    <video
        src="${signedData.signedUrl}"
        class="proof-video"
        muted
        playsinline
        preload="auto"
    ></video>

    <span class="proof-play">▶</span>
    <span class="proof-check">✓</span>
    <span class="proof-remove">&times;</span>
`;
}

proofUpload.value = "";
});
document.addEventListener("click", async (event) => {
    if (!event.target.classList.contains("proof-remove")) {
        return;
    }

    event.stopPropagation();

    const square = event.target.closest(".bingo-square");
    const index = Array.from(bingoSquares).indexOf(square);

    const filePath = localStorage.getItem(`bingo-proof-${index}`);

    if (filePath) {
        const { error } = await supabaseClient.storage
            .from("bingo-proof")
            .remove([filePath]);

        if (error) {
            console.error("Kunne ikke slette fil:", error);
        }
    }

    localStorage.removeItem(`bingo-proof-${index}`);
    localStorage.removeItem(`bingo-${index}`);

    await saveSharedSquare(
        index,
        false,
        null,
        null
    );

    square.classList.remove("completed");
    square.textContent = square.dataset.originalText;

    updateProgress();
});
async function loadSharedBingo() {
    const { data, error } = await supabaseClient
        .from("bingo_state")
        .select("*");

    if (error) {
        console.error("Kunne ikke hente felles bingo:", error);
        return;
    }

    for (const row of data) {
        const square = bingoSquares[row.square_index];

        if (!square) {
            continue;
        }

        if (row.completed) {
            square.classList.add("completed");
            localStorage.setItem(
                `bingo-${row.square_index}`,
                "completed"
            );
        } else {
            square.classList.remove("completed");
                   localStorage.removeItem(
            `bingo-${row.square_index}`
        );
    }

    if (row.proof_path) {
        localStorage.setItem(
            `bingo-proof-${row.square_index}`,
            row.proof_path
        );

        await loadProof(
            square,
            row.square_index
        );
    } else {
        localStorage.removeItem(
            `bingo-proof-${row.square_index}`
        );

        if (!square.classList.contains("free")) {
            square.textContent = square.dataset.originalText;
        }
    }
}

updateProgress();
}


document.addEventListener("click", (event) => {
    const playButton = event.target.closest(".proof-play");

    if (!playButton) {
        return;
    }

    event.stopPropagation();

    const square = playButton.closest(".bingo-square");
    const video = square.querySelector(".proof-video");

    if (!video) {
        return;
    }

    if (video.paused) {
        video.play();
        playButton.textContent = "❚❚";
    } else {
        video.pause();
        playButton.textContent = "▶";
    }
});


document.addEventListener("ended", (event) => {
    if (!event.target.classList.contains("proof-video")) {
        return;
    }

    const square = event.target.closest(".bingo-square");
    const playButton = square.querySelector(".proof-play");

    if (playButton) {
        playButton.textContent = "▶";
    }
}, true);


const awardPopup = document.getElementById("award-popup");
const awardPopupClose = document.getElementById("award-popup-close");

if (awardPopupClose) {
    awardPopupClose.addEventListener("click", () => {
        awardPopup.classList.remove("show");
    });
}


loadSharedBingo();


const bingoChannel = supabaseClient
    .channel("shared-bingo")
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "bingo_state"
        },
        async (payload) => {
            const row = payload.new;

            if (!row || row.square_index === undefined) {
                return;
            }

            const square = bingoSquares[row.square_index];

            if (!square) {
                return;
            }

            if (row.completed) {
                square.classList.add("completed");

                localStorage.setItem(
                    `bingo-${row.square_index}`,
                    "completed"
                );
            } else {
                square.classList.remove("completed");

                localStorage.removeItem(
                    `bingo-${row.square_index}`
                );
            }

            if (row.proof_path) {
                localStorage.setItem(
                    `bingo-proof-${row.square_index}`,
                    row.proof_path
                );

                await loadProof(
                    square,
                    row.square_index
                );
            } else {
                localStorage.removeItem(
                    `bingo-proof-${row.square_index}`
                );

                if (!square.classList.contains("free")) {
                    square.textContent =
                        square.dataset.originalText;
                }
            }

            updateProgress();
        }
    )
    .subscribe();