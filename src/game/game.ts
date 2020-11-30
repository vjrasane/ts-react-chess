import { BoardCoordinates } from "../utils/coordinates";
import { BoardState, initialBoard } from "./board";
import { Move } from "./moves";

type Player = "white" | "black";

type ThreatType = "check" | "checkmate" | "stalemate";

type Threat = {
  type: ThreatType;
  position: BoardCoordinates;
};

type CastlingSide = "kingside" | "queenside";

type Castling = {
  kingside: boolean;
  queenside: boolean;
};

type GameState = {
  playerInTurn: Player;
  enpassantColumn?: number;
  castling: {
    white: Castling;
    black: Castling;
  };
  board: BoardState;
  prevMove?: Move;
};

const initialGameState: GameState = {
  playerInTurn: "white",
  enpassantColumn: null,
  castling: {
    white: { kingside: true, queenside: true },
    black: { kingside: true, queenside: true },
  },
  board: initialBoard,
};

const nextPlayer = (player: Player) => {
  if (player === "white") return "black";
  return "white";
};

export {
  GameState,
  Player,
  nextPlayer,
  CastlingSide,
  Castling,
  Threat,
  ThreatType,
  initialGameState,
};
