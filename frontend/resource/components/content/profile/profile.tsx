"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "/styles/profile.module.css";
import ProfileUpdator, { ImgUpdator, NameUpdator, TfaUpdator } from "@/components/content/profile/updator";
import ExpandableButtons from "@/components/content/expandableButtons";
import BackToTop from "@/components/content/backToTop";
import usePlayerContext, { EPlayerState } from "../player_state";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/structure/modal";
import { useFetch } from '@/lib/hook';

// incomplete
export interface IProfileType {
  user_id: number;
  username: string;
  nickname: string;
  //	avartar: string, // path to profile image stored in frontend server local directory
  email: string;
}

export enum UserAchievement {
  A0 = "",
  A1 = "WIN 1",
  A2 = "WIN 3",
  A3 = "WIN 5",
}

export interface IGameProfileType {
  win_count: number;
  lose_count: number;
  point: number;
  achievement: UserAchievement;
}

export interface IGameHistoriesType {
  gameHistories: any;
}

const serverUrl = `${process.env.NEXT_PUBLIC_APP_SERVER_URL}`;
const profileUrl = `${serverUrl}/profile`;

export default function Profile({
  uid,
  isMyProfile,
}: {
  uid: number;
  isMyProfile: boolean;
}) {
	/*
  const [profile, setProfile] = use<IProfileType>({
    user_id: 0,
    username: "",
    nickname: "",
    //		avartar: '/default.png',
    email: "",
  });
	*/
  const [profile, setProfile] = useFetch<IProfileType>(`${profileUrl}/${uid}`, {
    user_id: uid,
    username: "",
    nickname: "",
    //		avartar: '/default.png',
    email: "",
  });

  const [ update, setUpdate ] = useState<Object | null>(null);
  const { setPlayerState } = usePlayerContext();
	const [ firstLogin, setFirstLogin ] = useState<boolean>(false);
	const router = useRouter();
	const searchParams = useSearchParams();

  useEffect(() => {
    isMyProfile && setPlayerState(EPlayerState.PROFILE);
		searchParams.get('firstLogin') === "true" && setFirstLogin(true);
  }, []);

  useEffect(() => {
    (async () => {
      await fetch(`${profileUrl}/${uid}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => {
					if (!res.ok) throw new Error(`invalid response: ${res.status}`);
					return res.json();
				})
        .then((data) => {
          setProfile(data);
        })
        .catch((err) => {
          console.log(`${profileUrl}: fetch failed: ${err}`);
        });
    })();
  }, [update]);

  useEffect(() => {
    console.log(profile);
  }, [profile]);
  //////////////////////////////
  const userProps = [
    {
      prop: "username",
      value: profile.username,
    },
    {
      prop: "nickname",
      value: profile.nickname,
    },
    {
      prop: "email",
      value: profile.email,
    },
  ];
  //////////////////////////////
  const [gameProfile, setGameProfile] = useState<IGameProfileType>({
    win_count: 0,
    lose_count: 0,
    point: 0,
    achievement: UserAchievement.A0,
  });

  useEffect(() => {
    (async () => {
      await fetch(`${profileUrl}/${uid}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setGameProfile(data);
        })
        .catch((err) => {
          console.log(`${profileUrl}: fetch failed: ${err}`);
        });
    })();
  }, [update]);

  const [GameHistories, setGameHistories] = useState<IGameHistoriesType>({
    gameHistories: [{}],
  });

  useEffect(() => {
    (async () => {
      await fetch(`${profileUrl}/game/${uid}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setGameHistories(data);
        })
        .catch((err) => {
          console.log(`${profileUrl}: fetch failed: ${err}`);
        });
    })();
  }, []);


  const [ranking, setRanking] = useState();

  useEffect(() => {
    (async () => {
      await fetch(`${profileUrl}/ranking`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setRanking(data);
        })
        .catch((err) => {
          console.log(`${profileUrl}: fetch failed: ${err}`);
        });
    })();
  }, []);

  return (
    <div className={styles.profile}>
			{firstLogin &&
				<Modal
					backDrop={false}
					onClose={() => {setFirstLogin(false)}}>
					<div style={{textAlign: 'center'}}
						className={"centerItemBlock"}>
						<ul>
							<li>
								<h1>환영합니다! 닉네임과 아바타를 설정하세요.</h1>
							</li>
							<li
								style={{
                  margin: '0px 0px 0px 85px',
									padding: '10px',
								}}>
								<Image
									style={{
										margin: '10px',
									}}
									src={`${profileUrl}/avatar/${uid}`}
									height={128}
									width={128}
									alt={"profile image"}
								/>
                <div style={{margin: '0px 85px 0px 0px',}}>
                  <ImgUpdator uid={uid} setUpdate={{update: setUpdate}}></ImgUpdator>
                </div>
							</li>
							<li
								style={{
									margin: '10px',
									padding: '10px',
								}}>
								<p>{`닉네임: ${profile.nickname}`}</p>
								<NameUpdator uid={uid} setUpdate={{update: setUpdate}}></NameUpdator>
							</li>
							<li style={{margin: '25px 0px 0px 0px'}}>
								<TfaUpdator uid={uid}></TfaUpdator>
							</li>
						</ul>
					</div>
				</Modal>
			}
      {isMyProfile && (
        <ProfileUpdator
          uid={uid}
          update={{ setUpdate }}
        ></ProfileUpdator>
      )}
      <div
        className={`${"centerItemBlock gridRow1_2 gridCol1_2"} ${
          styles.profileImage
        }`}
      >
			<Image
				src={`${profileUrl}/avatar/${uid}`}
				height={128}
				width={128}
				alt={"profile image"}
			/>
      </div>
      <br></br>
      <ul>
        {userProps.map(({ prop, value }) => {
          return (
            <li className={styles.userProps} key={prop}>
              {prop}: {value}
            </li>
          );
        })}
        <br />
      </ul>
      <hr></hr>
      <ExpandableButtons
        gameHistories={GameHistories}
        win_count={gameProfile.win_count}
        lose_count={gameProfile.lose_count}
        point={gameProfile.point}
        achievement={gameProfile.achievement}
        ranking={ranking}
      ></ExpandableButtons>
      <BackToTop></BackToTop>
    </div>
  );
}
