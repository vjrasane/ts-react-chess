import React from "react";
import { Board } from "./Board";
import GhostPiece from "./GhostPiece";
import GameStatus from "./GameStatus";
import Timers from "./Timers";
import History from "./History";
import Controls from "./Controls";
import { BOARD_SIZE_PIXELS } from "../utils/constants";

const gameContainerStyle = {
  display: "flex"
};

const sideBarContainerStyle = {
  height: BOARD_SIZE_PIXELS,
  width: "250px",
  minWidth: "200px",
  marginLeft: 7,
  display: "flex",
  flexDirection: "column",
  flexShrink: 0
};

const Game = () => (
  <div style={gameContainerStyle}>
    <Board />
    <GhostPiece />
    <div style={sideBarContainerStyle}>
      <GameStatus />
      <Timers />
      <History />
      <Controls />
    </div>
  </div>
);

export default Game;
