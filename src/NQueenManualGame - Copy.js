// NQueenManualGame.jsx
import React, { useState, useEffect } from "react";
import "./NQueenManualGame.css";

const createEmptyBoard = (n) => Array.from({ length: n }, () => Array(n).fill(null));

const isSafe = (board, row, col, n) => {
    for (let i = 0; i < row; i++) {
        if (board[i][col] === 'Q') return false;
    }
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j] === 'Q') return false;
    }
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
        if (board[i][j] === 'Q') return false;
    }
    return true;
};

const validateFullBoard = (board, n) => {
    const queens = [];
    for (let i = 0; i < n; i++) {
        let found = false;
        for (let j = 0; j < n; j++) {
            if (board[i][j] === 'Q') {
                queens.push([i, j]);
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    const cols = new Set();
    const majorDiags = new Set();
    const minorDiags = new Set();

    for (const [r, c] of queens) {
        const major = r - c;
        const minor = r + c;
        if (cols.has(c) || majorDiags.has(major) || minorDiags.has(minor)) return false;
        cols.add(c);
        majorDiags.add(major);
        minorDiags.add(minor);
    }

    return true;
};

const NQueenManualGame = () => {
    const [power, setPower] = useState(3);
    const size = Math.pow(2, power);
    const [board, setBoard] = useState(createEmptyBoard(size));
    const [queenCount, setQueenCount] = useState(0);
    const [moves, setMoves] = useState(0);
    const [message, setMessage] = useState("");
    const [time, setTime] = useState(0);
    const [timer, setTimer] = useState(null);
    const [queenStack, setQueenStack] = useState([]);

    useEffect(() => {
        const savedTime = localStorage.getItem('gameTime');
        if (savedTime) setTime(Number(savedTime));
    }, []);

    const startTimer = () => {
        if (!timer) {
            const t = setInterval(() => {
                setTime((prev) => {
                    const updated = prev + 1;
                    localStorage.setItem('gameTime', updated);
                    return updated;
                });
            }, 1000);
            setTimer(t);
        }
    };

    const handleCellClick = (row, col) => {
        if (board[row][col] === 'Q') return;
        if (queenCount < size && isSafe(board, row, col, size)) {
            const newBoard = board.map(row => [...row]);
            newBoard[row][col] = 'Q';
            setBoard(newBoard);
            setQueenStack([...queenStack, { row, col }]);
            setQueenCount(queenCount + 1);
            setMoves(moves + 1);
            setMessage("");
            startTimer();

            if (queenCount + 1 === size) {
                if (validateFullBoard(newBoard, size)) {
                    setMessage("🎉 All queens placed successfully with no conflicts!");
                    clearInterval(timer);
                } else {
                    setMessage("❌ Queens placed, but they conflict. Please backtrack.");
                }
            }
        } else {
            setMessage("❌ Not a safe position. Try another or backtrack.");
        }
    };

    const handleBacktrack = () => {
        if (queenStack.length === 0) return;
        const { row, col } = queenStack[queenStack.length - 1];
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = null;
        setBoard(newBoard);
        setQueenStack(queenStack.slice(0, -1));
        setQueenCount(queenCount - 1);
        setMoves(moves + 1);
        setMessage("↩️ Last queen removed.");
    };

    const handleReset = () => {
        setBoard(createEmptyBoard(size));
        setQueenCount(0);
        setMoves(0);
        setMessage("");
        setTime(0);
        setQueenStack([]);
        localStorage.setItem('gameTime', 0);
        clearInterval(timer);
        setTimer(null);
    };

    const handlePowerChange = (e) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val < 2 || val > 4) return;
        const newSize = Math.pow(2, val);
        setPower(val);
        setBoard(createEmptyBoard(newSize));
        setQueenCount(0);
        setMoves(0);
        setMessage("");
        setTime(0);
        setQueenStack([]);
        localStorage.setItem('gameTime', 0);
        clearInterval(timer);
        setTimer(null);
    };

    return (
        <div className="nq-container">
            <h1 className="nq-title">♛ N-Queens Manual Game</h1>
            <div className="nq-controls">
                <label>
                    Board Power (2ⁿ):
                    <input type="number" value={power} min={2} max={4} onChange={handlePowerChange} />
                </label>
                <button onClick={handleBacktrack}>↩️ Backtrack</button>
                <button onClick={handleReset}>🔁 Reset</button>
            </div>
            <div className="nq-board" style={{ gridTemplateColumns: `repeat(${size}, 50px)` }}>
                {board.map((row, i) =>
                    row.map((cell, j) => (
                        <div
                            key={`${i}-${j}`}
                            onClick={() => handleCellClick(i, j)}
                            className={`nq-cell ${(i + j) % 2 === 0 ? "light" : "dark"}`}
                        >
                            {cell === "Q" ? "♛" : ""}
                        </div>
                    ))
                )}
            </div>
            <div className="nq-info">
                <p>Queens: {queenCount}/{size}</p>
                <p>Moves: {moves}</p>
                <p>Time: {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</p>
                <p className="nq-message">{message}</p>
            </div>
        </div>
    );
};

export default NQueenManualGame;