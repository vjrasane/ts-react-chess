import bishop from "../../images/pieces/white/bishop.png";
import king from "../../images/pieces/white/king.png";
import queen from "../../images/pieces/white/queen.png";
import rook from "../../images/pieces/white/rook.png";
import knight from "../../images/pieces/white/knight.png";
import pawn from "../../images/pieces/white/pawn.png";

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
