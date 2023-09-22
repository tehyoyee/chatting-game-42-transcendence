'use client';

import Image from 'next/image';
import Link from 'next/link';
import defaultImage from '../../public/default.png';
import React, { useEffect, useContext, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import styles from '@/styles/matching.module.css';
import DotLoader from './dotLoader';



// import { GameKeyContext } from './GameKeyProvider';
import { io, Socket } from 'socket.io-client';
// import GameCustomizationNegotiation from './GameCustomizationNegotiation';
// import "./Pong.css";
import WebSocketContex, { SocketContext, SocketContextProvider } from '@/lib/socket'
import useSocketContext from '@/lib/socket';

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
	const chatUrl = `${serverUrl}/chat`;
	const gameUrl = `${serverUrl}/game`;


	type SocketContextType = {
    chatSocket: Socket | null,
		gameSocket: Socket | null,
	};
  
  
  
  
  

  
  export default function Matching() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const [queue, setQueue] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const SocketContext = useSocketContext();
    
    SocketContext.gameSocket?.on('gameStart', () => { setReady(true); });

    
    const exitQueueHandler = () => {
      console.log("exitQueue handler worked!");
      SocketContext.gameSocket?.emit('exitQueue');
    };
    
    useEffect(() => {

      if (!queue)
      {
          const JoinQueue = () => {
              SocketContext.gameSocket?.emit('joinQueue', "ADVANCED");
            }
          JoinQueue();
          setQueue(queue + 1);
      }

        if (ready) {
      const countdownInterval = setInterval(() => {
        if (countdown <= 1) {
          clearInterval(countdownInterval);
					router.push('/game/play');
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);
    }
  }, [ready, countdown, router]);

  return (
    <div>
      <div className={styles.userProfileContainer}>
        <div className={styles.userProfile}>
          <Image src={defaultImage} alt='profile image' className={styles.userImage} />
          <div className={styles.userText}></div>
        </div>
        { ready && <div className={styles.userProfile}>
          <Image src={defaultImage} alt='profile image' className={styles.userImage} />
          <div className={styles.userText}></div>
        </div> }
      </div>
      {loading && <p>Loading...</p>}
      {!ready && <DotLoader></DotLoader>}

      {/* {!loading && (queue >= 2) && (
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={() => setReady(true)}>Ready</button>
        </div>
      )} */}
      {countdown !== null && ready && countdown > 0 && (
        <div className={styles.countdownContainer}>
          <p className={styles.countdown}>{countdown}</p>
        </div>
      )}
        { !ready && <div>
          <Link href='/game' onClick={exitQueueHandler} className={styles.bottomRight}>Exit</Link>
        </div> 
        }
    </div>
  );
}




// "use client";




// interface PongGamePlayerUpdate {
// 	oponent_pong_position: number,
// 	ball_position: BallPosition,
// 	end_game?: boolean,
// 	end_game_reason?: string,
// 	score1?: number,
// 	score2?: number,
// }

// interface gameCustomizationRequest {
// 	winCondition: 'score' | 'time',
// 	winConditionValue: number,
// 	ballType: 'simple' | 'speedy' | 'bouncy',
// }

// interface BallPosition {
// 	x: number,
// 	y: number,
// }

// interface PongGameData {
// 	Socket: Socket,
// 	gameKey: string,
// 	endGame: () => void,
// }

// function pixelsToScreenPosition(pixels: number): number {
// 	return pixels / window.innerHeight * 100 - 50;
// }

// const PongGameDisplay: React.FC<PongGameData> = ({
// 	Socket,
// 	gameKey,
// 	endGame,
// }: PongGameData) => {

// 	const [player_pong_position, setPlayerPongPosition] = useState<number>(0);
// 	const [opponent_pong_position, setOpponentPongPosition] = useState<number>(0);
// 	const [ball_position, setBallPosition] = useState<BallPosition>({x: 0, y: 0});
//     const [displayScore, setDisplayScore] = useState<string>("0 - 0");
//     const [showScore, setShowScore] = useState<boolean>(false);

// 	useEffect(() => {
// 		const mouseMoveHandler = (event: MouseEvent) => {
// 			console.log(event.clientY);
// 			setPlayerPongPosition(pixelsToScreenPosition(event.clientY));
// 			Socket.emit('events', { event: "pongGamePlayerUpdate", data: {
// 				x: pixelsToScreenPosition(event.clientY),
// 				gameKey: gameKey
// 			}});
// 		}
// 		window.addEventListener('mousemove', mouseMoveHandler);
// 		return () => {
// 			window.removeEventListener('mousemove', mouseMoveHandler);
// 		}
// 	}, [gameKey, Socket]);

// 	useEffect(() => {
// 		if (gameKey) {


// 			const scoreDisplay = (data: PongGamePlayerUpdate) => {
// 				if (data?.score1 || data?.score2) {
// 					setDisplayScore(`${data.score1}-${data.score2}`);
//                     setShowScore(true);
//                     setTimeout(() => setShowScore(false), 1000);
// 				}
// 			}

// 			const manageGameLifecycle = (data: PongGamePlayerUpdate) => {
// 				if (data.end_game) {
// 					setDisplayScore(data?.end_game_reason ? data.end_game_reason : "Game Over");
// 					endGame();
// 				}
// 			}
			
			
// 			Socket.on('pongGamePlayerUpdate', (data: PongGamePlayerUpdate) => {
// 				scoreDisplay(data);
// 				manageGameLifecycle(data);
// 				setOpponentPongPosition(data.oponent_pong_position);
// 				setBallPosition(data.ball_position);
// 			});

// 			return () => {
// 				Socket.off('pongGamePlayerUpdate');
// 			};
// 		}
// 	}, [gameKey, Socket]);

// 	return (
// 		<>
// 			<div className="pong-container">
// 			<div className="pong-player" style={{top: player_pong_position + "vh"}}></div>
// 			{showScore && <div className="pong-score">{displayScore}</div>}
// 			<div className="pong-ball" style={{top: ball_position.y + "vh", left: ball_position.x + "vw"}}></div>
// 			<div className="pong-player" style={{top: opponent_pong_position + "vh"}}></div>
// 			</div>
// 		</>
// 	);
// }

// const PongGame: React.FC = () => {

	

	

// 	// if (!gameKey || !Socket) {
// 	// 	notFound();
// 	// }

	

// 	const LifeCycleHandle = (data: PongGamePlayerUpdate) => {
// 		if (data.end_game) {
// 			endGameHadler();
// 		}
// 	}

// 	useEffect(() => {
// 		if (Socket) {
// 			Socket.on('PongGameLifecycle', LifeCycleHandle);
// 			return () => {
// 				Socket.off('PongGameLifecycle');
// 			};
// 		}
// 	},[Socket]);

// 	return (
// 		<>
// 		<div className={"Display PongMain"}>
// 			{negotiating ? (
// 				<GameCustomizationNegotiation
// 					startGame={gameBeginInitiative}
// 				/>
// 			):(
// 				<PongGameDisplay
// 					Socket={Socket}
// 					gameKey={gameKey}
// 					endGame={endGameHadler}
// 				/>
// 			)}
// 		</div>
// 		</>
// 	);
// }
