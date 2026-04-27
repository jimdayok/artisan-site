"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type GameState = "ready" | "playing" | "ended";

type Popup = {
  id: number;
  text: string;
  x: number;
  y: number;
  life: number;
};

const GOLD = "#d4c09a";
const DARK = "#080706";
const PLAYER_MESSAGES = ["Clarity restored."];
const AI_MESSAGES = ["They added a fee."];
const RANDOM_MESSAGES = [
  "Restricted product choice detected",
  "Applying unnecessary markup...",
  "Override: Independent decision made",
];

export default function BreakTheSystemPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const gameRef = useRef({
    width: 800,
    height: 500,
    playerY: 190,
    aiY: 190,
    paddleW: 14,
    paddleH: 118,
    ballX: 400,
    ballY: 250,
    ballVX: 5.2,
    ballVY: 2.4,
    playerScore: 0,
    aiScore: 0,
    state: "ready" as GameState,
    message: "Tap or click the field to begin.",
    popups: [] as Popup[],
    nextPopupAt: 140,
  });
  const [score, setScore] = useState({ artisan: 0, corporate: 0 });
  const [message, setMessage] = useState("Tap or click the field to begin.");
  const [gameState, setGameState] = useState<GameState>("ready");

  const syncUi = useCallback(() => {
    const game = gameRef.current;
    setScore({ artisan: game.playerScore, corporate: game.aiScore });
    setMessage(game.message);
    setGameState(game.state);
  }, []);

  const addPopup = useCallback((text: string) => {
    const game = gameRef.current;
    game.popups.push({
      id: Date.now() + Math.random(),
      text,
      x: game.width * (0.28 + Math.random() * 0.44),
      y: game.height * (0.24 + Math.random() * 0.48),
      life: 120,
    });
  }, []);

  const resetBall = useCallback((direction: 1 | -1) => {
    const game = gameRef.current;
    game.ballX = game.width / 2;
    game.ballY = game.height / 2;
    game.ballVX = direction * (4.7 + Math.random() * 1.1);
    game.ballVY = (Math.random() > 0.5 ? 1 : -1) * (1.8 + Math.random() * 2.2);
  }, []);

  const resetGame = useCallback(() => {
    const game = gameRef.current;
    game.playerY = game.height / 2 - game.paddleH / 2;
    game.aiY = game.height / 2 - game.paddleH / 2;
    game.playerScore = 0;
    game.aiScore = 0;
    game.state = "playing";
    game.message = "Keep control of the light.";
    game.popups = [];
    game.nextPopupAt = 110;
    resetBall(Math.random() > 0.5 ? 1 : -1);
    syncUi();
  }, [resetBall, syncUi]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const cssWidth = Math.min(parent?.clientWidth ?? 800, 800);
    const cssHeight = Math.max(280, Math.min(500, cssWidth * 0.625));
    const ratio = window.devicePixelRatio || 1;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(cssHeight * ratio);

    const game = gameRef.current;
    const playerRatio = (game.playerY + game.paddleH / 2) / game.height;
    const aiRatio = (game.aiY + game.paddleH / 2) / game.height;
    game.width = cssWidth;
    game.height = cssHeight;
    game.paddleH = Math.max(74, Math.min(118, cssHeight * 0.24));
    game.playerY = playerRatio * cssHeight - game.paddleH / 2;
    game.aiY = aiRatio * cssHeight - game.paddleH / 2;
    game.ballX = Math.min(Math.max(game.ballX, 24), cssWidth - 24);
    game.ballY = Math.min(Math.max(game.ballY, 24), cssHeight - 24);
  }, []);

  const movePlayer = useCallback((clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const game = gameRef.current;
    const y = clientY - rect.top;
    game.playerY = Math.max(10, Math.min(game.height - game.paddleH - 10, y - game.paddleH / 2));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const ratio = window.devicePixelRatio || 1;
    const game = gameRef.current;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, game.width, game.height);

    const gradient = context.createRadialGradient(
      game.width * 0.5,
      game.height * 0.45,
      20,
      game.width * 0.5,
      game.height * 0.5,
      game.width * 0.72
    );
    gradient.addColorStop(0, "rgba(212, 192, 154, 0.12)");
    gradient.addColorStop(0.46, "rgba(30, 24, 18, 0.62)");
    gradient.addColorStop(1, DARK);
    context.fillStyle = gradient;
    context.fillRect(0, 0, game.width, game.height);

    context.save();
    context.globalAlpha = 0.18;
    context.strokeStyle = GOLD;
    context.setLineDash([8, 16]);
    context.beginPath();
    context.moveTo(game.width / 2, 22);
    context.lineTo(game.width / 2, game.height - 22);
    context.stroke();
    context.restore();

    context.fillStyle = "rgba(255,255,255,0.08)";
    context.fillRect(0, 0, game.width, 1);
    context.fillRect(0, game.height - 1, game.width, 1);

    context.save();
    context.shadowColor = "rgba(212,192,154,0.85)";
    context.shadowBlur = 24;
    context.fillStyle = GOLD;
    roundRect(context, 24, game.playerY, game.paddleW, game.paddleH, 8);
    context.fill();
    context.restore();

    context.save();
    context.shadowColor = "rgba(255,255,255,0.32)";
    context.shadowBlur = 16;
    context.fillStyle = "rgba(255,255,255,0.58)";
    roundRect(context, game.width - 24 - game.paddleW, game.aiY, game.paddleW, game.paddleH, 8);
    context.fill();
    context.restore();

    context.save();
    context.strokeStyle = "rgba(212,192,154,0.18)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(game.ballX - game.ballVX * 5, game.ballY - game.ballVY * 5);
    context.lineTo(game.ballX - game.ballVX * 15, game.ballY - game.ballVY * 15);
    context.stroke();
    context.restore();

    context.save();
    context.shadowColor = "rgba(212,192,154,0.95)";
    context.shadowBlur = 28;
    context.fillStyle = GOLD;
    context.beginPath();
    context.arc(game.ballX, game.ballY, 8, 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.save();
    context.font = "600 10px ui-sans-serif, system-ui, sans-serif";
    context.letterSpacing = "2px";
    context.textAlign = "center";
    game.popups.forEach((popup) => {
      context.globalAlpha = Math.max(0, Math.min(1, popup.life / 60));
      context.fillStyle = "rgba(212,192,154,0.88)";
      context.fillText(popup.text.toUpperCase(), popup.x, popup.y - (120 - popup.life) * 0.15);
    });
    context.restore();
  }, []);

  const step = useCallback(() => {
    const game = gameRef.current;

    if (game.state === "playing") {
      game.ballX += game.ballVX;
      game.ballY += game.ballVY;

      if (game.ballY <= 14 || game.ballY >= game.height - 14) {
        game.ballVY *= -1;
        game.ballY = Math.max(14, Math.min(game.height - 14, game.ballY));
      }

      const aiTarget = game.ballY - game.paddleH / 2;
      game.aiY += (aiTarget - game.aiY) * 0.055;
      game.aiY = Math.max(10, Math.min(game.height - game.paddleH - 10, game.aiY));

      const playerHit =
        game.ballX - 8 <= 24 + game.paddleW &&
        game.ballX > 24 &&
        game.ballY >= game.playerY &&
        game.ballY <= game.playerY + game.paddleH;

      if (playerHit) {
        const offset = (game.ballY - (game.playerY + game.paddleH / 2)) / (game.paddleH / 2);
        game.ballVX = Math.abs(game.ballVX) + 0.22;
        game.ballVY = offset * 5.4 + (Math.random() - 0.5) * 1.4;
        game.ballX = 24 + game.paddleW + 10;
      }

      const aiHit =
        game.ballX + 8 >= game.width - 24 - game.paddleW &&
        game.ballX < game.width - 24 &&
        game.ballY >= game.aiY &&
        game.ballY <= game.aiY + game.paddleH;

      if (aiHit) {
        const offset = (game.ballY - (game.aiY + game.paddleH / 2)) / (game.paddleH / 2);
        game.ballVX = -Math.abs(game.ballVX) - 0.12;
        game.ballVY = offset * 4.8 + (Math.random() - 0.5) * 1.2;
        game.ballX = game.width - 24 - game.paddleW - 10;
      }

      if (game.ballX > game.width + 20) {
        game.playerScore += 1;
        game.message = PLAYER_MESSAGES[0];
        addPopup("Override: Independent decision made");
        resetBall(-1);
        syncUi();
      }

      if (game.ballX < -20) {
        game.aiScore += 1;
        game.message = AI_MESSAGES[0];
        addPopup("Applying unnecessary markup...");
        resetBall(1);
        syncUi();
      }

      if (game.playerScore >= 5 || game.aiScore >= 5) {
        game.state = "ended";
        game.message =
          game.playerScore >= 5
            ? "Independent wins again."
            : "They tried to control the outcome.";
        syncUi();
      }

      game.nextPopupAt -= 1;
      if (game.nextPopupAt <= 0) {
        addPopup(RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)]);
        game.nextPopupAt = 180 + Math.floor(Math.random() * 160);
      }
    }

    game.popups = game.popups
      .map((popup) => ({ ...popup, life: popup.life - 1 }))
      .filter((popup) => popup.life > 0);

    draw();
    frameRef.current = requestAnimationFrame(step);
  }, [addPopup, draw, resetBall, syncUi]);

  useEffect(() => {
    resizeCanvas();
    draw();
    window.addEventListener("resize", resizeCanvas);
    frameRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [draw, resizeCanvas, step]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080706] px-4 py-6 text-white md:px-8 md:py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,192,154,0.18),transparent_34%),radial-gradient(circle_at_18%_80%,rgba(255,255,255,0.08),transparent_28%)]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col items-center justify-center">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d4c09a]">
            Hidden Mode
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
            Break the System
          </h1>
          <p className="mt-3 text-base text-white/66 md:text-lg">
            Keep control of the light.
          </p>
        </div>

        <div className="mb-4 flex w-full max-w-[800px] items-center justify-between rounded-full border border-white/12 bg-white/[0.055] px-5 py-3 text-sm font-semibold text-white/82 backdrop-blur-md">
          <span>Artisan</span>
          <span className="text-2xl text-[#d4c09a]">
            {score.artisan} | {score.corporate}
          </span>
          <span>Corporate Lab</span>
        </div>

        <div className="w-full max-w-[800px] rounded-[28px] border border-[#d4c09a]/22 bg-black/50 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <canvas
            ref={canvasRef}
            className="block max-w-full touch-none rounded-[20px] border border-white/10"
            aria-label="Break the System Pong game"
            role="img"
            onMouseMove={(event) => movePlayer(event.clientY)}
            onTouchMove={(event) => {
              event.preventDefault();
              movePlayer(event.touches[0]?.clientY ?? 0);
            }}
            onClick={() => {
              if (gameRef.current.state !== "playing") resetGame();
            }}
          />
        </div>

        <div className="mt-5 flex min-h-12 flex-wrap items-center justify-center gap-3 text-center">
          <p className="rounded-full border border-white/10 bg-white/[0.055] px-5 py-2 text-sm font-semibold text-white/72">
            {message}
          </p>
          {gameState !== "playing" ? (
            <button
              type="button"
              onClick={resetGame}
              className="rounded-full bg-[#d4c09a] px-5 py-2 text-sm font-semibold text-[#080706] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
            >
              {gameState === "ended" ? "Play Again" : "Start"}
            </button>
          ) : null}
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-white/38">
          <span>Mouse or drag to move</span>
          <span aria-hidden="true">/</span>
          <Link href="/" className="transition hover:text-[#d4c09a]">
            Return to the network
          </Link>
        </div>
      </div>
    </main>
  );
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}
