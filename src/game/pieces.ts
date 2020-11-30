import { toUpper } from "lodash/fp";
import getBlackPieceImage from "../utils/pieces-black";
import getWhitePieceImage from "../utils/pieces-white";
import { Player } from "../game/game";

type PieceType = "king" | "queen" | "bishop" | "knight" | "rook" | "pawn";

type Piece = {
  type: PieceType;
  player: Player;
};

const getPieceImage = (piece: Piece): string => {
  switch (piece.player) {
    case "white":
      return getWhitePieceImage(piece.type);
    case "black":
      return getBlackPieceImage(piece.type);
  }
};

const getPieceNotation = (piece: PieceType): string => {
  switch (piece) {
    case "knight":
      return "N";
    case "pawn":
      return "";
    case "king":
    case "queen":
    case "rook":
    case "bishop":
    default:
      return toUpper(piece.charAt(0));
  }
};

export { Piece, PieceType, Player, getPieceImage, getPieceNotation };
