const SUPABASE_URL = "https://molrxdeqtsnkffzyvahm.supabase.co";
const SUPABASE_KEY = "sb_publishable_s-eACKlTB5SQCvJD_Mwq7A_szqi-P0j";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
const bingoSquares = document.querySelectorAll(".bingo-square");
const progressCount = document.getElementById("progress-count");

function updateProgress() {
    const completedSquares = document.querySelectorAll(
        ".bingo-square.completed:not(.free)"
    ).length;

    progressCount.textContent = completedSquares;
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
            <span class="proof-remove">×</span>
        `;
    } else {
        square.innerHTML = `
            <span class="proof-video">▶</span>
            <span class="proof-check">✓</span>
            <span class="proof-remove">×</span>
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

    square.addEventListener("click", () => {

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
    <span class="proof-remove">×</span>
`;
} else {
    selectedSquare.innerHTML = `
        <span class="proof-video">▶</span>
        <span class="proof-check">✓</span>
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

    square.classList.remove("completed");

    square.textContent = square.dataset.originalText;

    updateProgress();
});