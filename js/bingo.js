const bingoSquares = document.querySelectorAll(".bingo-square");
const progressCount = document.getElementById("progress-count");

function updateProgress() {
    const completedSquares = document.querySelectorAll(
        ".bingo-square.completed:not(.free)"
    ).length;

    progressCount.textContent = completedSquares;
}

bingoSquares.forEach((square, index) => {

    const savedState = localStorage.getItem(`bingo-${index}`);

    if (savedState === "completed") {
        square.classList.add("completed");
    }

    square.addEventListener("click", () => {

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