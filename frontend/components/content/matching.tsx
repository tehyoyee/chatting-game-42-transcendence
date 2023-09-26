"use client";

import Image from "next/image";
import Link from "next/link";
import defaultImage from "../../public/default.png";
import React, {
  useEffect,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import { useRouter, notFound, useSearchParams } from "next/navigation";
import styles from "@/styles/matching.module.css";
import DotLoader from "./dotLoader";
// import queryRouter from 'next/router';

// import { GameKeyContext } from './GameKeyProvider';
import { io, Socket } from "socket.io-client";
// import GameCustomizationNegotiation from './GameCustomizationNegotiation';
// import "./Pong.css";
import WebSocketContex, {
  SocketContext,
  SocketContextProvider,
} from "@/lib/socket";
import useSocketContext from "@/lib/socket";
import usePlayerContext, { EPlayerState } from "./player_state";
import useAuthContext from "../user/auth";

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const profileUrl = `${serverUrl}/profile`;
const chatUrl = `${serverUrl}/chat`;
const gameUrl = `${serverUrl}/game`;

type SocketContextType = {
  chatSocket: Socket | null;
  gameSocket: Socket | null;
};

export interface IProfileType {
  user_id: number;
  username: string;
  nickname: string;
  //	avartar: string, // path to profile image stored in frontend server local directory
  email: string;
}

export type TGameUsers = {
	leftUserName: string,
	rightUserName: string,
	leftUserId: number,
	rightUserId: number,
};

export default function Matching() {
  const ref = useRef(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [queue, setQueue] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const SocketContext = useSocketContext();
  const searchParams = useSearchParams();
  const { setPlayerState } = usePlayerContext();
  const { user } = useAuthContext();
  const [userObj, setUserObj] = useState<TGameUsers>({
    leftUserName: "",
    rightUserName: "",
    leftUserId: 0,
    rightUserId: 0,
  });

  let interval: any;

  const [profile, setProfile] = useState<IProfileType>({
    user_id: 0,
    username: "",
    nickname: "",
    //		avartar: '/default.png',
    email: "",
  });

  useEffect(() => {
    (async () => {
      await fetch(`${profileUrl}/${user.id}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
        })
        .catch((err) => {
          console.log(`${profileUrl}: fetch failed: ${err}`);
        });
    })();
  }, []);

  const exitQueueHandler = () => {
    console.log("exitQueue handler worked!");
    SocketContext.gameSocket?.emit("exitQueue");
  };

	/*
	useEffect(() => {
		if (!SocketContext.gameSocket) return;
		SocketContext.gameSocket?.on("gameStart", (obj) => {
			setUserObj(obj);
			setReady(true);
		});
		return () => {
			SocketContext.gameSocket?.off("gameStart");
		};
	}, [SocketContext.gameSocket]);
	*/

  useEffect(() => {
    setPlayerState(EPlayerState.GAME_MATCHING);
  }, []);

	useEffect(() => {
		if (!searchParams.get('gameStart')) return;
		const lun = searchParams.get('leftUserName');
		const run = searchParams.get('rightUserName');
		const lui = Number(searchParams.get('leftUserId'));
		const rui = Number(searchParams.get('rightUserId'));

		if (!lun || !run || !lui || !rui) return;
		const userData: TGameUsers = {
			leftUserName: lun,
			rightUserName: run,
			leftUserId:  lui,
			rightUserId: rui,
		};
		console.log('game started: ', userData);
		setUserObj(userData);
		setReady(true);
	}, [searchParams]);

  useEffect(() => {
    if (!queue && !searchParams.get('gameStart')) {
      const JoinQueue = () => {
        searchParams.get("normal")
          ? SocketContext.gameSocket?.emit("joinQueue", "NORMAL")
          : SocketContext.gameSocket?.emit("joinQueue", "ADVANCED");
      };
      if (ref.current) return;
      ref.current = true;
      JoinQueue();
      setQueue(queue + 1);
    }
    if (ready) {
      setPlayerState(EPlayerState.GAME_PLAYING);
      interval = setInterval(() => {
        setCountdown((countdown) => countdown - 1);
      }, 1000);
    }
  }, [ready, router]);

  useEffect(() => {
    if (countdown <= 0) {
      clearInterval(interval);
      router.push("/game/play");
    }
  }, [countdown]);

  return (
    <div>
      <div className={styles.userProfileContainer}>
        {!ready && (
          <div className={styles.userProfile}>
            <Image
              src={`${profileUrl}/avatar/${user.id}`}
              height={384}
              width={384}
              alt="profile image"
              className={styles.userImage}
            />
            <div className={styles.userText}>{profile.nickname}</div>
          </div>
        )}
        {ready && (
          <div className={styles.userProfile}>
            <Image
              src={`${profileUrl}/avatar/${userObj.leftUserId}`}
              height={384}
              width={384}
              alt="profile image"
              className={styles.userImage}
            />
            <div className={styles.userText}>{userObj.leftUserName}</div>
          </div>
        )}
        {ready && (
          <div className={styles.userProfile}>
            <Image
              src={`${profileUrl}/avatar/${userObj.rightUserId}`}
              height={384}
              width={384}
              alt="profile image"
              className={styles.userImage}
            />
            <div className={styles.userText}>{userObj.rightUserName}</div>
          </div>
        )}
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
      {!ready && (
        <div>
          <Link
            href="/game"
            onClick={exitQueueHandler}
            className={styles.bottomRight}
          >
            Exit
          </Link>
        </div>
      )}
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
