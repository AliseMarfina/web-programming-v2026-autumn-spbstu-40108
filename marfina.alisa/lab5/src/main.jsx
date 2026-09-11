import React, {
  StrictMode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const checkWinner = (board) => {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {winner: board[a], line};
    }
  }
  if (board.every((cell) => cell !== null)) {
    return {winner: 'draw', line: null};
  }
  return null;
};

const minimax = (board, isMaximizing, ai, human, depth = 0) => {
  const result = checkWinner(board);
  if (result) {
    if (result.winner === ai) {return 10 - depth;}
    if (result.winner === human) {return depth - 10;}
    return 0;
  }
  const current = isMaximizing ? ai : human;
  let best = isMaximizing ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = current;
      const score = minimax(board, !isMaximizing, ai, human, depth + 1);
      board[i] = null;
      best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
    }
  }
  return best;
};

const getBestMove = (board, ai, human) => {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = ai;
      const score = minimax(board, false, ai, human, 0);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
};

const getRandomMove = (board) => {
  const empty = board
    .map((v, i) => (v === null ? i : -1))
    .filter((i) => i !== -1);
  return empty[Math.floor(Math.random() * empty.length)];
};

const STORAGE_KEY = 'lab5-tictactoe';

function App() {
  const saved = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })[0];

  const [screen, setScreen] = useState(saved?.screen || 'menu');
  const [mode, setMode] = useState(saved?.mode || 'pvc');
  const [difficulty, setDifficulty] = useState(saved?.difficulty || 'hard');
  const [humanSign, setHumanSign] = useState(saved?.humanSign || 'X');
  const [board, setBoard] = useState(saved?.board || Array(9).fill(null));
  const [current, setCurrent] = useState(saved?.current || 'X');
  const [winnerInfo, setWinnerInfo] = useState(saved?.winnerInfo || null);
  const [score, setScore] = useState(saved?.score || {X: 0, O: 0, draw: 0});
  const [lastMove, setLastMove] = useState(saved?.lastMove || null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const state = {
      screen,
      mode,
      difficulty,
      humanSign,
      board,
      current,
      winnerInfo,
      score,
      lastMove,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    screen,
    mode,
    difficulty,
    humanSign,
    board,
    current,
    winnerInfo,
    score,
    lastMove,
  ]);

  useEffect(() => {
    if (
      screen !== 'game' ||
      mode !== 'pvc' ||
      winnerInfo ||
      current === humanSign
    )
      {return;}
    const timer = setTimeout(() => {
      const aiSign = humanSign === 'X' ? 'O' : 'X';
      const move =
        difficulty === 'hard'
          ? getBestMove([...board], aiSign, humanSign)
          : getRandomMove(board);
      if (move !== -1 && move !== undefined) {makeMove(move, aiSign);}
    }, 350);
    return () => clearTimeout(timer);
  }, [screen, mode, winnerInfo, current, humanSign, difficulty, board]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || screen !== 'game') {return;}
    const ctx = canvas.getContext('2d');
    const SIZE = 360;
    const CELL = SIZE / 3;
    const PAD = 24;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = '#6c7086';
    ctx.lineWidth = 4;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(SIZE, i * CELL);
      ctx.stroke();
    }

    for (let i = 0; i < 9; i++) {
      const v = board[i];
      if (!v) {continue;}
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = col * CELL + CELL / 2;
      const cy = row * CELL + CELL / 2;
      ctx.strokeStyle = v === 'X' ? '#f38ba8' : '#89b4fa';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      if (v === 'X') {
        ctx.beginPath();
        ctx.moveTo(cx - CELL / 2 + PAD, cy - CELL / 2 + PAD);
        ctx.lineTo(cx + CELL / 2 - PAD, cy + CELL / 2 - PAD);
        ctx.moveTo(cx + CELL / 2 - PAD, cy - CELL / 2 + PAD);
        ctx.lineTo(cx - CELL / 2 + PAD, cy + CELL / 2 - PAD);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, CELL / 2 - PAD, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (lastMove !== null && !winnerInfo) {
      const col = lastMove % 3;
      const row = Math.floor(lastMove / 3);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
    }

    if (winnerInfo && winnerInfo.line) {
      const [a, , c] = winnerInfo.line;
      const ax = (a % 3) * CELL + CELL / 2;
      const ay = Math.floor(a / 3) * CELL + CELL / 2;
      const cx = (c % 3) * CELL + CELL / 2;
      const cy = Math.floor(c / 3) * CELL + CELL / 2;
      ctx.strokeStyle = '#a6e3a1';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(cx, cy);
      ctx.stroke();
    }
  }, [board, winnerInfo, lastMove, screen]);

  const makeMove = useCallback(
    (index, signOverride) => {
      setBoard((prev) => {
        if (prev[index] !== null) {return prev;}
        const sign = signOverride || current;
        const next = prev.slice();
        next[index] = sign;
        setLastMove(index);
        const result = checkWinner(next);
        if (result) {
          setWinnerInfo(result);
          if (result.winner === 'draw')
            {setScore((s) => ({...s, draw: s.draw + 1}));}
          else {setScore((s) => ({...s, [result.winner]: s[result.winner] + 1}));}
          setTimeout(() => setScreen('result'), 700);
          return next;
        }
        setCurrent(sign === 'X' ? 'O' : 'X');
        return next;
      });
    },
    [current],
  );

  const startGame = (newMode, newDifficulty, newSign) => {
    setMode(newMode);
    setDifficulty(newDifficulty);
    setHumanSign(newSign);
    setBoard(Array(9).fill(null));
    setCurrent('X');
    setWinnerInfo(null);
    setLastMove(null);
    setScreen('game');
  };

  const restart = () => {
    setBoard(Array(9).fill(null));
    setCurrent('X');
    setWinnerInfo(null);
    setLastMove(null);
    setScreen('game');
  };

  const resetScore = () => setScore({X: 0, O: 0, draw: 0});

  const handleCellClick = (i) => {
    if (winnerInfo || board[i]) {return;}
    if (mode === 'pvc' && current !== humanSign) {return;}
    makeMove(i);
  };

  if (screen === 'menu') {
    return (
      <section className="menu" data-testid="menu-screen">
        <h1 className="title" data-testid="title">
          Крестики-нолики
        </h1>
        <p className="subtitle">Выберите режим игры</p>
        <div className="menu-group">
          <label>Режим:</label>
          <div className="btn-row">
            <button
              data-testid="mode-pvc"
              className={mode === 'pvc' ? 'active' : ''}
              onClick={() => setMode('pvc')}
            >
              Против компьютера
            </button>
            <button
              data-testid="mode-pvp"
              className={mode === 'pvp' ? 'active' : ''}
              onClick={() => setMode('pvp')}
            >
              Два игрока
            </button>
          </div>
        </div>
        {mode === 'pvc' && (
          <>
            <div className="menu-group">
              <label>Сложность:</label>
              <div className="btn-row">
                <button
                  data-testid="diff-easy"
                  className={difficulty === 'easy' ? 'active' : ''}
                  onClick={() => setDifficulty('easy')}
                >
                  Легко
                </button>
                <button
                  data-testid="diff-hard"
                  className={difficulty === 'hard' ? 'active' : ''}
                  onClick={() => setDifficulty('hard')}
                >
                  Непобедимый
                </button>
              </div>
            </div>
            <div className="menu-group">
              <label>Ваш знак:</label>
              <div className="btn-row">
                <button
                  data-testid="sign-X"
                  className={humanSign === 'X' ? 'active' : ''}
                  onClick={() => setHumanSign('X')}
                >
                  X
                </button>
                <button
                  data-testid="sign-O"
                  className={humanSign === 'O' ? 'active' : ''}
                  onClick={() => setHumanSign('O')}
                >
                  O
                </button>
              </div>
            </div>
          </>
        )}
        <button
          className="start-btn"
          data-testid="start-button"
          onClick={() => startGame(mode, difficulty, humanSign)}
        >
          Начать игру
        </button>
      </section>
    );
  }

  if (screen === 'result') {
    const title =
      winnerInfo.winner === 'draw'
        ? 'Ничья'
        : mode === 'pvc'
          ? winnerInfo.winner === humanSign
            ? 'Победа!'
            : 'Поражение'
          : `Победил ${winnerInfo.winner}`;
    return (
      <section className="result" data-testid="result-screen">
        <h2 data-testid="result-title">{title}</h2>
        <p className="result-sign" data-testid="result-sign">
          {winnerInfo.winner === 'draw' ? '—' : winnerInfo.winner}
        </p>
        <div className="result-actions">
          <button data-testid="restart-button" onClick={restart}>
            Играть снова
          </button>
          <button data-testid="menu-button" onClick={() => setScreen('menu')}>
            В меню
          </button>
          <button data-testid="reset-score-button" onClick={resetScore}>
            Сбросить счёт
          </button>
        </div>
      </section>
    );
  }

  const statusText = winnerInfo
    ? winnerInfo.winner === 'draw'
      ? 'Ничья!'
      : mode === 'pvc'
        ? winnerInfo.winner === humanSign
          ? 'Вы победили!'
          : 'Компьютер победил'
        : `Победили ${winnerInfo.winner}!`
    : mode === 'pvc'
      ? current === humanSign
        ? 'Ваш ход'
        : 'Ход компьютера...'
      : `Ход: ${current}`;

  return (
    <section className="game" data-testid="game-screen">
      <div className="scoreboard" data-testid="scoreboard">
        <span data-testid="score-X">X: {score.X}</span>
        <span data-testid="score-draw">Ничьи: {score.draw}</span>
        <span data-testid="score-O">O: {score.O}</span>
      </div>
      <div className="status" data-testid="status">
        {statusText}
      </div>
      <div
        className="board-wrapper"
        style={{width: 360, height: 360, position: 'relative'}}
      >
        <canvas
          ref={canvasRef}
          data-testid="board-canvas"
          style={{width: 360, height: 360, display: 'block'}}
        />
        <div className="board-overlay">
          {board.map((_, i) => (
            <button
              key={i}
              className="cell-btn"
              data-testid={`cell-${i}`}
              disabled={board[i] || winnerInfo}
              onClick={() => handleCellClick(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const rootElement = document.querySelector('[data-testid="app"]');

if (!rootElement) {
  throw new Error('Корневой элемент приложения не найден.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
