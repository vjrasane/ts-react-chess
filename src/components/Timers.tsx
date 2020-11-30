import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useContext,
} from "react";
import moment from "moment";
import { GameStateContext } from "../context/game-state";

const millisLimit = 10 /* seconds */ * 1000; /* milliseconds */
const prettyTime = (millis: number) =>
  moment.utc(millis).format(millis <= millisLimit ? "mm:ss:SS" : "mm:ss");

const initialTime: number =
  5 /* minutes */ * 60 /* seconds */ * 1000; /* milliseconds */

type TimerProps = {
  isGameOver: boolean;
  isInTurn: boolean;
};

const Timer = ({ isGameOver, isInTurn }: TimerProps) => {
  const [timer, setTimer] = useState(Date.now());
  const [remaining, setRemaining] = useState<number>(initialTime);

  const getElapsedTime = useCallback(
    (now) => {
      const millis = now - timer;
      return millis;
    },
    [timer]
  );

  useEffect(() => {
    if (isInTurn) {
      setTimer(Date.now());
    }
  }, [isInTurn, setTimer]);

  useEffect(() => {
    if (remaining <= 0) return;
    if (isGameOver) return;
    if (!isInTurn) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setRemaining(remaining - getElapsedTime(now));
      setTimer(now);
    }, 10)

    return () => clearInterval(interval);
  }, [remaining, isGameOver, isInTurn, setRemaining, setTimer, getElapsedTime]);

  // TODO: set player out of time
  useEffect(() => {
    if (remaining < 0) {
      setRemaining(0);
    }
  }, [remaining, setRemaining]);

  return <div style={timerStyle}>{prettyTime(remaining)}</div>;
};

const timerContainerStyle = {
  height: "5%",
  width: "100%",
  borderLeft: "solid 0.1px #cccccc",
  borderRight: "solid 0.1px #cccccc",
  borderBottom: "solid 0.1px #CCCCCC",
  backgroundColor: "#f0f0f0",
  display: "flex",
};

const timerStyle = {
  fontSize: "3vh",
  alignSelf: "center",
  textAlign: "center",
  borderRight: "solid 0.1px #CCCCCC",
  fontFamily: "Arial, Helvetica, sans-serif",
  width: "50%",
};

const Timers = () => {
  const { playerInTurn, isGameOver } = useContext(GameStateContext);
  return (
    <div style={timerContainerStyle}>
      <Timer isInTurn={playerInTurn === "white"} isGameOver={isGameOver} />
      <Timer isInTurn={playerInTurn === "black"} isGameOver={isGameOver} />
    </div>
  );
};

export default Timers;