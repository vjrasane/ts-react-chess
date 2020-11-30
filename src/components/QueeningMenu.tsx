import { mergeAll, first } from "lodash/fp";
import React, { useContext, useMemo } from "react";
import background from "../../images/indicators/cyan_circle.png";
import { GameStateContext } from "../context/game-state";
import { MoveContext } from "../context/move";
import { PieceType } from "../game/board";
import { QueeningMove } from "../game/moves";
import { getPieceImage, Player } from "../game/pieces";
import {
  LAYER_PIECE,
  LAYER_QUEENING_MENU,
  PIECE_SIZE_PIXELS,
  SQUARE_SIZE_PIXELS,
} from "../utils/constants";

const queeningButtonStyle = {
  width: SQUARE_SIZE_PIXELS,
  height: SQUARE_SIZE_PIXELS,
  float: "left",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const queeningImageStyle = {
  width: PIECE_SIZE_PIXELS,
  height: PIECE_SIZE_PIXELS,
  zIndex: LAYER_PIECE,
};

const queeningImageBackgroundStyle = {
  width: "100%",
  height: "100%",
  opacity: "0.9",
  position: "absolute",
};

const queeningMenuStyle = {
  position: "absolute",
  width: "100%",
  height: "calc(4 * 100%)",
  zIndex: LAYER_QUEENING_MENU,
};

type QueeningMenuProps = {
  choices: QueeningMove[];
};

const QueeningMenu = ({ choices }: QueeningMenuProps) => {
  const { boardRotated } = useContext(GameStateContext);
  const { finishQueening } = useContext(MoveContext);

  const player = first(choices).start.piece.player;
  const isTop =
    (player === "white" && !boardRotated) ||
    (player === "black" && boardRotated);

  const menuStyle = useMemo(
    () => mergeAll([{}, queeningMenuStyle, isTop ? { top: 0 } : { bottom: 0 }]),
    [player, boardRotated]
  );

  const choiceOrder: QueeningMove[] = useMemo(
    () => (isTop ? choices : choices.reverse()),
    [choices, isTop]
  );

  return (
    <div style={menuStyle}>
      {choiceOrder.map((move: QueeningMove) => {
        return (
          <div key={move.chosenPiece} style={queeningButtonStyle}>
            <img
              style={queeningImageStyle}
              src={getPieceImage({ type: move.chosenPiece, player })}
              onClick={() => finishQueening(move)}
            />
            <img style={queeningImageBackgroundStyle} src={background} />
          </div>
        );
      })}
    </div>
  );
};

export default QueeningMenu;
