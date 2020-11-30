import React, { useContext, useMemo, useState } from "react";
import { capitalize, mergeAll } from "lodash/fp";

import whiteKing from "../../images/pieces/white/king.png";
import blackKing from "../../images/pieces/black/king.png";

import { HistoryContext } from "../context/history";
import { GameStateContext } from "../context/game-state";
import { nextPlayer } from "../game/game";

type MessageProps = {
  message: string;
  details?: string;
  isHistory: boolean;
};

const statusMessageBlockStyle = {
  backgroundColor: "#e4e4e4",
  height: "100%",
  width: "75%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-evenly",
};

const statusMessageStyle = {
  width: "100%",
  textAlign: "center",
  fontSize: "25px",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const statusDetailsStyle = {
  textAlign: "center",
  fontSize: "17px",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const currentStatusColor = "#7F7F7F";
const historyStatusColor = "#b9b9b9";

const Message = ({ message, details, isHistory }: MessageProps) => {
  const messageStyle: object = useMemo(
    () =>
      mergeAll([
        {},
        statusMessageStyle,
        { color: !isHistory ? currentStatusColor : historyStatusColor },
      ]),
    [isHistory]
  );

  const detailsStyle = useMemo(
    () =>
      mergeAll([
        {},
        statusDetailsStyle,
        { color: !isHistory ? currentStatusColor : historyStatusColor },
      ]),
    [isHistory]
  );

  return (
    <div style={statusMessageBlockStyle}>
      <div style={messageStyle}>{message}</div>
      {details && <div style={detailsStyle}>{details}</div>}
    </div>
  );
};

const statusImageBlockStyle = {
  backgroundColor: "#e0e0e0",
  height: "100%",
  width: "25%",
  borderRight: "solid 0.1px #cccccc",
  position: "relative",
};

const statusContainerStyle = {
  height: "10%",
  width: "100%",
  border: "solid 0.1px #cccccc",
  backgroundColor: "#e4e4e4",
  display: "flex",
};

const statusImageStyle = {
  height: "80%",
  top: "10%",
  left: "10%",
  position: "absolute",
};

const GameStatus = () => {
  const { presentState, selectedState, isViewingHistory } = useContext(HistoryContext);
  const { gameStatus } = useContext(GameStateContext);
  const { playerInTurn } = selectedState;

  const imageStyle: object = useMemo(
    () => mergeAll([{}, statusImageStyle, { opacity: !isViewingHistory ? 1 : 0.5 }]),
    [isViewingHistory]
  );

  const imageSrc: string = useMemo(() => {
    switch (playerInTurn) {
      case "white":
        return whiteKing;
      case "black":
        return blackKing;
    }
  }, [playerInTurn]);

  const [message, details]: [string, string | false] = useMemo(() => {
    if (!gameStatus) `${capitalize(playerInTurn)} to play`;
    switch (gameStatus) {
      case "checkmate":
        return [
          "Game over",
          `${capitalize(nextPlayer(playerInTurn))} wins by checkmate`,
        ];
      case "stalemate":
        return ["Game over", "Stalemate!"];
      default:
        return [
          `${capitalize(playerInTurn)} to play`,
          isViewingHistory && "Viewing history",
        ];
    }
  }, [gameStatus, playerInTurn, isViewingHistory]);

  return (
    <div style={statusContainerStyle}>
      <div style={statusImageBlockStyle}>
        <img
          style={imageStyle}
          className={`status-image ${
            history ? " history-image" : "current-image"
          }`}
          src={imageSrc}
        />
      </div>
      <Message message={message} details={details} isHistory={isViewingHistory} />
    </div>
  );
};

export default GameStatus;
