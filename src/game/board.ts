import { times, isEqual } from "lodash/fp";
import { BoardCoordinates } from "../utils/coordinates";
import { GameState, Threat, ThreatType } from "./game";
import { getBasicMoves, hasLegalMoves, Move } from "./moves";
import { Player, PieceType, Piece } from "./pieces";

type BoardState = SquareContent[][];

type SquareContent = Piece | null;

const getOfficerRow = (player: Player): SquareContent[] => {
  const types: PieceType[] = [
    "rook",
    "knight",
    "bishop",
    "queen",
    "king",
    "bishop",
    "knight",
    "rook",
  ];
  return types.map((type) => ({ type, player }));
};

const getPawnRow = (player: Player): SquareContent[] =>
  times(() => ({ type: "pawn" as const, player }), 8);

const emptyRow: SquareContent[] = times((): null => null, 8);

const initialBoard = [
  getOfficerRow("white"),
  getPawnRow("white"),
  ...times(() => emptyRow, 4),
  getPawnRow("black"),
  getOfficerRow("black"),
];

const mapBoard = (
  mapper: (content: SquareContent, position: BoardCoordinates) => SquareContent,
  board: BoardState
): BoardState => {
  return board.map((rowContent: SquareContent[], row: number) =>
    rowContent.map((squareContent: SquareContent, col: number) =>
      mapper(squareContent, { row, col })
    )
  );
};

const boardToString = (board: BoardState): string => {
  return board
    .map((rowContent: SquareContent[]): string =>
      rowContent
        .map((squareContent: SquareContent): string =>
          squareContent ? `[${(squareContent as Piece).type.charAt(0)}]` : "[ ]"
        )
        .join(" ")
    )
    .join("\n");
};

const mapContentAt = (
  mapper: (content: SquareContent) => SquareContent,
  target: BoardCoordinates,
  board: BoardState
): BoardState => {
  return mapBoard(
    (current: SquareContent, position: BoardCoordinates) =>
      isEqual(target, position) ? mapper(current) : current,
    board
  );
};

const putContentAt = (
  content: SquareContent,
  target: BoardCoordinates,
  board: BoardState
): BoardState => {
  return mapContentAt(() => content, target, board);
};

const getContentAt = (
  target: BoardCoordinates,
  board: BoardState
): SquareContent => {
  return board[target.row][target.col];
};

const findSquare = (
  condition: (content: SquareContent, position: BoardCoordinates) => boolean,
  board: BoardState
): BoardCoordinates | undefined => {
  for (let rowNum = 0; rowNum < board.length; rowNum++) {
    const row: SquareContent[] = board[rowNum];
    for (let colNum = 0; colNum < row.length; colNum++) {
      const coords: BoardCoordinates = { row: rowNum, col: colNum };
      const square: SquareContent = row[colNum];
      if (condition(square, coords)) return coords;
    }
  }
};

const someSquare = (
  condition: (content: SquareContent, position: BoardCoordinates) => boolean,
  board: BoardState
): boolean => !!findSquare(condition, board);

const isSquareInCheck = (
  position: BoardCoordinates,
  player: Player,
  board: BoardState
): boolean => {
  const hasCheckingMove = (
    piece: Piece,
    piecePos: BoardCoordinates
  ): boolean => {
    if (piece.player === player) return false;
    const pieceMoves: Move[] = getBasicMoves(
      { position: piecePos, piece },
      board
    );
    return pieceMoves.some((move: Move) =>
      isEqual(move.end.position, position)
    );
  };
  return someSquare(
    (content, squarePos) => !!content && hasCheckingMove(content, squarePos),
    board
  );
};

const findPiece = (
  condition: (piece: Piece, position: BoardCoordinates) => boolean,
  board: BoardState
): BoardCoordinates =>
  findSquare(
    (content: SquareContent, position: BoardCoordinates) =>
      !!content && condition(content, position),
    board
  );

const somePiece = (
  condition: (piece: Piece, position: BoardCoordinates) => boolean,
  board: BoardState
) => !!findPiece(condition, board);

const findKing = (player: Player, board: BoardState): BoardCoordinates =>
  findPiece((piece: Piece) => isEqual(piece, { type: "king", player }), board);

const isPlayerInCheck = (player: Player, board: BoardState) => {
  const kingPos = findKing(player, board);
  return isSquareInCheck(kingPos, player, board);
};

const getThreat = (player: Player, gameState: GameState): Threat => {
  const { board } = gameState;
  const kingPos = findKing(player, board);
  const isInCheck: boolean = isSquareInCheck(kingPos, player, board);
  const hasMoves: boolean = hasLegalMoves(player, gameState);
  if (!isInCheck && hasMoves) return;
  if (isInCheck) {
    return { position: kingPos, type: hasMoves ? "check" : "checkmate" };
  }
  return { position: kingPos, type: "stalemate" };
};

export {
  Player,
  Piece,
  PieceType,
  initialBoard,
  SquareContent,
  BoardState,
  mapBoard,
  boardToString,
  putContentAt,
  getContentAt,
  mapContentAt,
  findSquare,
  isPlayerInCheck,
  isSquareInCheck,
  getThreat,
  findPiece,
  somePiece,
};
