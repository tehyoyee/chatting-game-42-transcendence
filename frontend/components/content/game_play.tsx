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
  listen: Function;
  color: string;
};

export default function GamePlay() {
  const router = useRouter();
  const { setPlayerState } = usePlayerContext();
  const Sock = useSocketContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  var Pong: GameType;

  useEffect(() => {
    setPlayerState(EPlayerState.GAME_PLAYING);
    const canvas = canvasRef.current as HTMLCanvasElement;

    var Game: GameType = {
      canvas: canvas,
      context: canvas.getContext("2d") as CanvasRenderingContext2D,
      color: "#1bce8a",

      initialize: function () {
        this.canvas.style.width = 1800 / 2 + "px";
        this.canvas.style.height = 1300 / 2 + "px";
        // this.canvas.style.width = this.canvas.width / 2 + "px";
        // this.canvas.style.height = this.canvas.height / 2 + "px";

        Pong.listen();
      },

      draw: function (gamingInfo: any) {
        this.context.clearRect(0, 0, gamingInfo.canvasX, gamingInfo.canvasY);

        this.context.fillStyle = this.color;

        this.context.fillRect(0, 0, gamingInfo.canvasX, gamingInfo.canvasY);

        this.context.fillStyle = "#ffffff";

        this.context.fillText(
          gamingInfo.score1.toString(),
          gamingInfo.canvasX / 2 - 300,
          165
        );
        this.context.fillText(
          gamingInfo.score2.toString(),
          gamingInfo.canvasX / 2 + 300,
          165
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

        this.context.beginPath();
        this.context.setLineDash([5, 15]);
        this.context.moveTo(this.canvas.width / 2, this.canvas.height - 140);
        this.context.lineTo(this.canvas.width / 2, 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = "#ffffff";
        this.context.stroke();

        this.context.font = "40px sans-serif";
        this.context.textAlign = "center";

        this.context.font = "20px sans-serif bold";

        this.context.font = "30px sans-serif bold";

          if (!gamingInfo.winner)
          {
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
          }
          else
          {
            this.context.font = "500px sans-serif bold";
            this.context.fillText(
              "Winner: " + gamingInfo.winner,
              gamingInfo.canvasX / 2,
              gamingInfo.canvasY / 2
            );
          }
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

    Sock.gameSocket?.on("gamingInfo", (gamingInfo) => {
      Pong.draw(gamingInfo);
    });
    Sock.gameSocket?.on("endGame", (gamingInfo) => {
      Pong.draw(gamingInfo);
      // setTimeout(() => {
      //   router.push("/game");
      // }, 3000);
    });
  }, []);
  return <canvas ref={canvasRef} width="1800" height="1300"></canvas>;
}
