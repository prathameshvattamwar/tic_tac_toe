const statusDisplay = document.querySelector('.status-display');
const gameBoard = document.querySelector('.game-board');
const cells = document.querySelectorAll('.cell');
const restartButton = document.querySelector('.restart-button');
const modeButtons = document.querySelectorAll('.mode-button');

let gameActive = true;
let currentPlayer = 'X';
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = 'pvp'; // Default mode: Player vs Player
const playerSymbol = 'X'; // Human player is always X in PvC
const computerSymbol = 'O';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

const winningMessage = () => `Player ${currentPlayer} Wins!`;
const drawMessage = () => `Game Ended in a Draw!`;
const currentPlayerTurn = () => `Player ${currentPlayer}'s Turn`;

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase(), 'played');
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.textContent = currentPlayerTurn();
}

function highlightWinningCells(condition) {
    condition.forEach(index => cells[index].classList.add('win'));
}

function checkResult() {
    let roundWon = false;
    let winningCondition = null;

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') continue;
        if (a === b && b === c) {
            roundWon = true;
            winningCondition = winCondition;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.textContent = winningMessage();
        gameActive = false;
        if (winningCondition) highlightWinningCells(winningCondition);
        gameBoard.classList.remove('thinking'); // Ensure thinking overlay is removed
        return true; // Game ended
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.textContent = drawMessage();
        gameActive = false;
        gameBoard.classList.remove('thinking'); // Ensure thinking overlay is removed
        return true; // Game ended
    }

    handlePlayerChange();
    return false; // Game continues
}

function makeComputerMove() {
    gameBoard.classList.add('thinking'); // Show thinking overlay
    statusDisplay.textContent = `Player ${computerSymbol}'s Turn (Computer is thinking...)`;

    setTimeout(() => {
        let availableCellsIndexes = [];
        gameState.forEach((cell, index) => {
            if (cell === "") {
                availableCellsIndexes.push(index);
            }
        });

        if (availableCellsIndexes.length === 0 || !gameActive) {
             gameBoard.classList.remove('thinking');
             return; // No moves available or game ended
        }

        // --- Simple AI: Random Move ---
        const randomIndex = Math.floor(Math.random() * availableCellsIndexes.length);
        const computerMoveIndex = availableCellsIndexes[randomIndex];
        // -----------------------------

        const cellToPlay = cells[computerMoveIndex];
        handleCellPlayed(cellToPlay, computerMoveIndex);
        gameBoard.classList.remove('thinking'); // Remove overlay after move
        checkResult(); // Check result after computer's move

    }, 750); // Delay for realistic "thinking" time
}


function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive || (gameMode === 'pvc' && currentPlayer !== playerSymbol)) {
        return; // Ignore click if cell is taken, game inactive, or not player's turn in PvC
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    const gameEnded = checkResult();

    if (gameMode === 'pvc' && !gameEnded && gameActive && currentPlayer === computerSymbol) {
        makeComputerMove();
    }
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.textContent = currentPlayerTurn();
    cells.forEach(cell => {
        cell.classList.remove('x', 'o', 'played', 'win');
    });
     gameBoard.classList.remove('thinking');
    // Re-enable event listeners if they were somehow removed (though not done in this logic)
     cells.forEach(cell => cell.addEventListener('click', handleCellClick));

     // If starting in PvC mode and computer (O) should go first (optional feature), trigger its move.
     // Currently, Player X always starts.
}

function setGameMode(mode) {
    gameMode = mode;
    modeButtons.forEach(button => {
        if (button.dataset.mode === mode) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    handleRestartGame(); // Restart game when mode changes
}

function initializeGame() {
    statusDisplay.textContent = currentPlayerTurn();
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartButton.addEventListener('click', handleRestartGame);
    modeButtons.forEach(button => button.addEventListener('click', () => setGameMode(button.dataset.mode)));

    // Set initial active button based on default mode
    document.querySelector(`.mode-button[data-mode="${gameMode}"]`).classList.add('active');
}

initializeGame();