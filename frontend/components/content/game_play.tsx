import useSocketContext, { SocketContext } from '@/lib/socket';
import { useRef, useEffect, useState } from 'react';


enum DIRECTION {
	IDLE = 0,
	UP,
	DOWN,
	LEFT,
	RIGHT
};
 
const rounds = [5, 5, 3, 3, 2];
const backgroundColor = '#000000';

type GameType = {
	canvas: HTMLCanvasElement,
	context: CanvasRenderingContext2D,
	initialize: Function,
  endGameMenu: Function,
	menu: Function,
	update: Function,
	draw: Function,
	loop: FrameRequestCallback,
	listen: Function,
	_resetTurn: Function,
	_turnDelayIsOver: Function,
	_generateRoundColor: Function,

	player: PlayerType,
	ai: PlayerType,
	ball: BallType,

	running: boolean,
	turn: PlayerType | null,
	timer: number,
	color: string,
	over: boolean,
	round: number,
};

type BallType = {
	width: number,
	height: number,
	x: number,
	y: number,
	moveX: DIRECTION,
	moveY: DIRECTION,
	speed: number,
};

type PlayerType = {
	width: number,
	height: number,
	x: number,
	y: number,
	score: number,
	move: DIRECTION,
	speed: number,
};

export default function GamePlay() {
	
	const Sock = useSocketContext();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	var Pong: GameType;
	var Ball = {
		new: function (canvas: HTMLCanvasElement, incrementedSpeed: number): BallType {
				return {
				width: 18,
				height: 18,
				x: (canvas.width / 2) - 9,
				y: (canvas.height / 2) - 9,
				moveX: DIRECTION.IDLE,
				moveY: DIRECTION.IDLE,
				speed: incrementedSpeed || 7 
				};
			}
	};
	 
	var Ai = {
		new: function (canvas: HTMLCanvasElement, side: string): PlayerType {
			return {
				width: 18,
				height: 180,
				x: side === 'left' ? 50 : canvas.width - 50,
				y: (canvas.height / 2) - 35,
				score: 0,
				move: DIRECTION.IDLE,
				speed: 20,
			};
		}
	};
	 
	useEffect(() => {
		const canvas = canvasRef.current as HTMLCanvasElement;

		var Game: GameType = {
			canvas: canvas,
			context: canvas.getContext('2d') as CanvasRenderingContext2D,

			player: Ai.new(canvas, 'left'),
			ai: Ai.new(canvas, 'right'),
			ball: Ball.new(canvas, 20), // NOTE: 

			running: false,
			over: false,
			turn: null,
			timer: 0,
			color: '#000000',
			round: 0,


			initialize: function () {
				this.canvas.style.width = (this.canvas.width / 2) + 'px';
				this.canvas.style.height = (this.canvas.height / 2) + 'px';

				this.player = Ai.new(this.canvas, 'left');
				this.ai = Ai.new(this.canvas, 'right');
				this.ball = Ball.new(this.canvas, 15); // NOTE: 

				this.ai.speed = 20;
				this.running = this.over = false;
				this.turn = this.ai;
				this.timer = this.round = 0;
				this.color = '#000000';

				Pong.menu();
				Pong.listen();
			},
		 
			endGameMenu: function (text: string) {
				// Change the canvas font size and color
				Pong.context.font = '45px Courier New';
				Pong.context.fillStyle = this.color;
	 
				// Draw the rectangle behind the 'Press any key to begin' text.
				Pong.context.fillRect(
				Pong.canvas.width / 2 - 350,
				Pong.canvas.height / 2 - 48,
				700,
				100
				);
	 
				// Change the canvas color;
				Pong.context.fillStyle = '#ffffff';
	 
				// Draw the end game menu text ('Game Over' and 'Winner')
				Pong.context.fillText(text,
				Pong.canvas.width / 2,
				Pong.canvas.height / 2 + 15
				);
	 
				setTimeout(function () {
				Pong = Object.assign({}, Game);
				Pong.initialize();
				}, 3000);
			},

			menu: function () {
				// Draw all the Pong objects in their current state
				Pong.draw();
	 
				// Change the canvas font size and color
				this.context.font = '50px Courier New';
				this.context.fillStyle = this.color;
	 
				// Draw the rectangle behind the 'Press any key to begin' text.
				this.context.fillRect(
				this.canvas.width / 2 - 350,
				this.canvas.height / 2 - 48,
				700,
				100
				);

				// Change the canvas color;
				this.context.fillStyle = '#ffffff';

				// Draw the 'press any key to begin' text
				this.context.fillText('Press any key to begin',
				this.canvas.width / 2,
				this.canvas.height / 2 + 15
				);
			},
	 
			// Update all objects (move the player, ai, ball, increment the score, etc.)
			update: function () {
				if (!this.over) {
				// If the ball collides with the bound limits - correct the x and y coords.
				if (this.ball.x <= 0)
				{
					Pong._resetTurn(this.ai, this.player);
				}
				if (this.ball.x >= this.canvas.width - this.ball.width)
				{
					Pong._resetTurn(this.player, this.ai);
				}
				if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
				if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;
	 
				// Move player if they player.move value was updated by a keyboard event
				if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
				else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
	 
				// On new serve (start of each turn) move the ball to the correct side
				// and randomize the direction to add some challenge.
				if (Pong._turnDelayIsOver.call(this) && this.turn) {
					this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
					this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
					this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
					this.turn = null;
				}
	 
				// If the player collides with the bound limits, update the x and y coords.
				if (this.player.y <= 0) this.player.y = 0;
				else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
	 
				// Move ball in intended direction based on moveY and moveX values
				if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
				else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
				if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
				else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
	 
				// Handle ai (AI) UP and DOWN movement
				if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
					if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
					else this.ai.y -= this.ai.speed / 4;
				}
				if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
					if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
					else this.ai.y += this.ai.speed / 4;
				}
	 
				// Handle ai (AI) wall collision
				if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
				else if (this.ai.y <= 0) this.ai.y = 0;
	 
				// Handle Player-Ball collisions
				if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
					if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
						this.ball.x = (this.player.x + this.ball.width);
						this.ball.moveX = DIRECTION.RIGHT;
	 
					}
				}
	 
				// Handle ai-ball collision
				if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
					if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
						this.ball.x = (this.ai.x - this.ball.width);
						this.ball.moveX = DIRECTION.LEFT;
	 
					}
				}
				}
	 
				// Handle the end of round transition
				// Check to see if the player won the round.
				if (this.player.score === rounds[this.round]) {
				// Check to see if there are any more rounds/levels left and display the victory screen if
				// there are not.
				if (!rounds[this.round + 1]) {
					this.over = true;
					setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
				} else {
					// If there is another round, reset all the values and increment the round number.
					this.color = this._generateRoundColor();
					this.player.score = this.ai.score = 0;
					this.player.speed += 0.5;
					this.ai.speed += 1;
					this.ball.speed += 1;
					this.round += 1;
	 
				}
				}
				// Check to see if the ai/AI has won the round.
				else if (this.ai.score === rounds[this.round]) {
				this.over = true;
				setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
				}
			},
	 
			// Draw the objects to the canvas element
			draw: function () {
				// Clear the Canvas
				this.context.clearRect(
				0,
				0,
				this.canvas.width,
				this.canvas.height
				);
	 
				// Set the fill style to black
				this.context.fillStyle = this.color;
	 
				// Draw the background
				this.context.fillRect(
				0,
				0,
				this.canvas.width,
				this.canvas.height
				);
	 
				// Set the fill style to white (For the paddles and the ball)
				this.context.fillStyle = '#ffffff';
	 
				const tmpObj: any = 0;
				Sock.gameSocket?.on('gamingPaddle', tmpObj);
				// Draw the Player
				this.context.fillRect(
				tmpObj.paddle1X,
				tmpObj.paddle1Y,
				// this.player.x,
				// this.player.y,
				this.player.width,
				this.player.height
				);
				
				// Draw the Ai
				this.context.fillRect(
				tmpObj.paddle2X,
				tmpObj.paddle2Y,
				// this.ai.x,
				// this.ai.y,
				this.ai.width,
				this.ai.height 
				);
	 
				// Draw the Ball
				if (Pong._turnDelayIsOver.call(this)) {
					const tmpObj: any = 0;
					Sock.gameSocket?.on('gamingBall', tmpObj);

				this.context.fillRect(
					tmpObj.ballX,
					tmpObj.ballY,
					this.ball.width,
					this.ball.height
				);
				}
	 
				// Draw the net (Line in the middle)
				this.context.beginPath();
				this.context.setLineDash([5, 15]);
				this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
				this.context.lineTo((this.canvas.width / 2), 140);
				this.context.lineWidth = 10;
				this.context.strokeStyle = '#ffffff';
				this.context.stroke();
	 
				// Set the default canvas font and align it to the center
				this.context.font = '40px sans-serif';
				this.context.textAlign = 'center';

				// Draw the players score (left)
				this.context.fillText(
				this.player.score.toString(),
				(this.canvas.width / 2) - 300,
				200
				);

				// Draw the paddles score (right)
				this.context.fillText(
				this.ai.score.toString(),
				(this.canvas.width / 2) + 300,
				200
				);

				// Change the font size for the center score text
				this.context.font = '20px sans-serif bold';

				// Draw the winning score (center)
				this.context.fillText(
				'Round ' + (Pong.round + 1),
				(this.canvas.width / 2),
				35
				);

				// Change the font size for the center score value
				this.context.font = '30px sans-serif bold';

				// Draw the current round number
				this.context.fillText(
				(rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1]).toString(),
				(this.canvas.width / 2),
				100
				);
			},

			loop: function () {
				Pong.update();
				Pong.draw();

				// If the game is not over, draw the next frame.
				if (!Pong.over) requestAnimationFrame(Pong.loop);
			},

			listen: function () {
				document.addEventListener('keydown', function (key) {
				// Handle the 'Press any key to begin' function and start the game.
				if (Pong.running === false) {
					Pong.running = true;
					window.requestAnimationFrame(Pong.loop);
				}

				// Handle up arrow and w key events
				if (key.code === 'KeyW')
				{
					Sock.gameSocket?.emit('keyW', 'DOWN');
					Pong.player.move = DIRECTION.UP;
				}

				// Handle down arrow and s key events
				if (key.code === 'KeyS')
				{
					Sock.gameSocket?.emit('keyS', 'DOWN');
					Pong.player.move = DIRECTION.DOWN;
				}
				});

				// Stop the player from moving when there are no keys being pressed.
				document.addEventListener('keyup', function (key) { 
					Sock.gameSocket?.emit('keyW', 'UP');
					Sock.gameSocket?.emit('keyS', 'UP');
					Pong.player.move = DIRECTION.IDLE;
				});
			},
	 
			// Reset the ball location, the player turns and set a delay before the next round begins.
			_resetTurn: function(victor: PlayerType, loser: PlayerType) {
				this.ball = Ball.new(canvas, this.ball.speed);
				this.turn = loser;
				this.timer = (new Date()).getTime();
				
				// victor.score++;
				const tmpObj: any = 0;
				Sock.gameSocket?.on('gamingScore', tmpObj);
				victor.score = tmpObj.score1;
			},
	 
			// Wait for a delay to have passed after each turn.
			_turnDelayIsOver: function() {
				return ((new Date()).getTime() - this.timer >= 1000);
			},
	 
			// Select a random color as the background of each level/round.
			_generateRoundColor: function () {
				var newColor = backgroundColor;
				if (newColor === this.color) return Pong._generateRoundColor();
				return newColor;
			}
		};
	 
		Pong = Object.assign({}, Game);
		Pong.initialize();
	}, []);
	return <canvas ref={canvasRef} width='1400' height='1000'></canvas>;
}
 
// The ball object (The cube that bounces back and forth)
