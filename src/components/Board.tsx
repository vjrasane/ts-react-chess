import React, { useContext } from "react";
import Square from "./square";
import { BoardState, SquareContent } from "../game/board";
import { BoardCoordinates, getCoordinateNotation } from "../utils/coordinates";
import {
  LAYER_QUEENING_MENU_OVERLAY,
  BOARD_SIZE_PIXELS,
  SQUARE_SIZE_PIXELS,
} from "../utils/constants";
import { MoveContext } from "../context/move";
import { GameStateContext } from "../context/game-state";

type RowProps = {
  squares: SquareContent[];
  rowNum: number;
  state: BoardState;
};

const rowStyle = {
  height: SQUARE_SIZE_PIXELS,
  width: BOARD_SIZE_PIXELS,
};

const Row = ({ squares, rowNum }: RowProps) => (
  <div style={rowStyle}>
    {squares.map((content, colNum) => {
      const pos: BoardCoordinates = { col: colNum, row: rowNum };
      return (
        <Square
          key={getCoordinateNotation(pos)}
          content={content}
          position={pos}
        />
      );
    })}
  </div>
);

type BoardProps = {
  state: BoardState;
};

const queeningOverlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: LAYER_QUEENING_MENU_OVERLAY,
  background: "black",
  opacity: 0.45,
};

const boardStyle = {
  width: BOARD_SIZE_PIXELS,
  height: BOARD_SIZE_PIXELS,
  flexShrink: 0,
  position: "relative",
};

const Board = () => {
  const { board } = useContext(GameStateContext);
  const { queeningChoices, cancelQueening } = useContext(MoveContext);
  return (
    <div style={boardStyle}>
      {[...board].reverse().map((squares, revRow) => {
        const rowNum = 7 - revRow;
        return (
          <Row
            key={`row${rowNum}`}
            squares={squares}
            rowNum={rowNum}
            state={board}
          />
        );
      })}
      {!!queeningChoices.length && (
        <div style={queeningOverlayStyle} onClick={cancelQueening} />
      )}
    </div>
  );
};

export { Board };
