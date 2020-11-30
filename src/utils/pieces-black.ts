import bishop from "../../images/pieces/black/bishop.png";
import king from "../../images/pieces/black/king.png";
import queen from "../../images/pieces/black/queen.png";
import rook from "../../images/pieces/black/rook.png";
import knight from "../../images/pieces/black/knight.png";
import pawn from "../../images/pieces/black/pawn.png";

import { PieceType } from "../game/pieces";

export default (type: PieceType) => {
  switch (type) {
    case "king":
      return king;
    case "queen":
      return queen;
    case "rook":
      return rook;
    case "bishop":
      return bishop;
    case "knight":
      return knight;
    case "pawn":
      return pawn;
  }
};
