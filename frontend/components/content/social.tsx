import { useEffect } from "react";
import usePlayerContext, { EPlayerState } from "./player_state";

export default function Social() {
	const { setPlayerState } = usePlayerContext();

	useEffect(() => {
		setPlayerState(EPlayerState.SOCIAL);
	}, []);

  return (
    <>social</>
  );
}
