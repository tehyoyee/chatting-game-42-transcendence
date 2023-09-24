import usePlayerContext, { EPlayerState } from "./player_state";
import useSocketContext, { SocketContext } from "@/lib/socket";
import { useRef, useEffect, useState } from "react";
import User from "../user/user";
import { useRouter } from "next/navigation";

type GameType = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  initialize: Function;
  draw: Function;
	drawEndGame: Function;
  listen: Function;
  color: string;
};

type TGamingInfo = {
	canvasX: number,
	canvasY: number,
	player1: string,
	player2: string,
	score1: number,
	score2: number,
	ballX: number,
	ballY: number,
	paddle1X: number,
	paddle1Y: number,
	paddle2X: number,
	paddle2Y: number,
	paddleX: number,
	paddleY: number,
};

type TEndGameInfo = {
	canvasX: number,
	canvasY: number,
	player1: string,
	player2: string,
	score1: number,
	score2: number,
	winner: string,
};


export default function GamePlay() {
  const router = useRouter();
  const { setPlayerState } = usePlayerContext();
  const Sock = useSocketContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  let Pong: GameType;

  useEffect(() => {
    setPlayerState(EPlayerState.GAME_PLAYING);
    const canvas = canvasRef.current as HTMLCanvasElement;

    const Game: GameType = {
      canvas: canvas,
      context: canvas.getContext("2d") as CanvasRenderingContext2D,
      color: "#0ea1d6",

      initialize: function () {
        this.canvas.style.width = 1800 / 2 + "px";
        this.canvas.style.height = 1300 / 2 + "px";
        // this.canvas.style.width = this.canvas.width / 2 + "px";
        // this.canvas.style.height = this.canvas.height / 2 + "px";

        Pong.listen();
      },

      draw: function (gamingInfo: TGamingInfo) {
        this.context.clearRect(0, 0, gamingInfo.canvasX, gamingInfo.canvasY);

        this.context.font = "55px Arial";
        this.context.textAlign = "center";

        this.context.fillStyle = this.color;

        this.context.fillRect(0, 0, gamingInfo.canvasX, gamingInfo.canvasY);

        this.context.fillStyle = "#ffffff";

        this.context.fillText(
          gamingInfo.score1.toString(),
          gamingInfo.canvasX / 2 - 300,
          180
        );
        this.context.fillText(
          gamingInfo.score2.toString(),
          gamingInfo.canvasX / 2 + 300,
          180
        );
        this.context.fillText(
          gamingInfo.player1,
          gamingInfo.canvasX / 2 - 300,
          100
        );
        this.context.fillText(
          gamingInfo.player2,
          gamingInfo.canvasX / 2 + 300,
          100
        );
				this.context.fillRect(
					gamingInfo.paddle1X,
					gamingInfo.paddle1Y,
					gamingInfo.paddleX,
					gamingInfo.paddleY
				);
				this.context.fillRect(
					gamingInfo.paddle2X,
					gamingInfo.paddle2Y,
					gamingInfo.paddleX,
					gamingInfo.paddleY
				);
				this.context.fillRect(gamingInfo.ballX, gamingInfo.ballY, 20, 20);
				this.context.beginPath();
				this.context.setLineDash([5, 15]);
				this.context.moveTo(this.canvas.width / 2, this.canvas.height - 140);
				this.context.lineTo(this.canvas.width / 2, 140);
				this.context.lineWidth = 10;
				this.context.strokeStyle = "#ffffff";
				this.context.stroke();
			},

			drawEndGame: function (endGameInfo: TEndGameInfo) {
        this.context.clearRect(0, 0, endGameInfo.canvasX, endGameInfo.canvasY);
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, endGameInfo.canvasX, endGameInfo.canvasY);

        this.context.fillStyle = "#ffffff";

				this.context.font = "150px Arial";
				this.context.fillText(
					"Winner: " + endGameInfo.winner,
					endGameInfo.canvasX / 2,
					endGameInfo.canvasY / 2
					);
					
					this.context.font = "55px Arial";
				this.context.fillText(
					endGameInfo.score1.toString(),
					endGameInfo.canvasX / 2 - 300,
					180
				);
				this.context.fillText(
					endGameInfo.score2.toString(),
					endGameInfo.canvasX / 2 + 300,
					180
				);
				this.context.fillText(
					endGameInfo.player1,
					endGameInfo.canvasX / 2 - 300,
					100
				);
				this.context.fillText(
					endGameInfo.player2,
					endGameInfo.canvasX / 2 + 300,
					100
				);
				this.context.fillText(
					"3초 후에 종료됩니다.",
					endGameInfo.canvasX / 2,
					8 * endGameInfo.canvasY / 10
				);
      },

      listen: function () {
        document.addEventListener("keydown", function (key) {
          if (key.code === "KeyW") Sock.gameSocket?.emit("keyW", "DOWN");

          if (key.code === "KeyS") Sock.gameSocket?.emit("keyS", "DOWN");
        });

        document.addEventListener("keyup", function (key) {
          Sock.gameSocket?.emit("keyW", "UP");
          Sock.gameSocket?.emit("keyS", "UP");
        });
      },
    };
    Pong = Object.assign({}, Game);
    Pong.initialize();

    Sock.gameSocket?.on("gamingInfo", (gamingInfo: TGamingInfo) => {
      Pong.draw(gamingInfo);
    });
    Sock.gameSocket?.on("endGame", (endGameInfo: TEndGameInfo) => {
      Pong.drawEndGame(endGameInfo);
      setTimeout(() => {
        router.push("/game");
      }, 3000);
    });
  }, []);
  return <canvas ref={canvasRef} width="1800" height="1300"></canvas>;
}
