import React, { useContext, useCallback } from "react";
import { MoveContext } from "../context/move";
import { useMousePosition, MousePosition } from "../hooks/useMousePosition";
import { LAYER_GHOST_PIECE, PIECE_SIZE_PIXELS } from "../utils/constants";
import { getPieceImage } from "../game/pieces";

const getPieceStyle = ({ x, y }: MousePosition) => ({
  position: "fixed",
  top: y,
  left: x,
  transform: "translate(-50%, -50%)",
  height: PIECE_SIZE_PIXELS,
  width: PIECE_SIZE_PIXELS,
  pointerEvents: "none",
  zIndex: LAYER_GHOST_PIECE
});

const GhostPiece = () => {
  const mousePosition: MousePosition = useMousePosition();
  const { moveStart } = useContext(MoveContext);

  if(!moveStart) return null;
  return (
    <img
      style={getPieceStyle(mousePosition)}
      draggable={false}
      src={getPieceImage(moveStart.piece)}
      alt=""
    />
  );
};

export default GhostPiece;