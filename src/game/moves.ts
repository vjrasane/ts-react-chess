import {
  isEqual,
  flow,
  curry,
  values,
  flatMap,
  map,
  filter,
  compact,
  isNil,
  times,
  last,
  first,
  partition,
} from "lodash/fp";
import { GameState, CastlingSide, nextPlayer, Threat } from "./game";
import {
  BoardState,
  SquareContent,
  putContentAt,
  getContentAt,
  isSquareInCheck,
  isPlayerInCheck,
  somePiece,
  findPiece,
  getThreat,
} from "./board";
import {
  BoardCoordinates,
  toDirection,
  DIRECTIONS,
  CARDINAL_DIRECTIONS,
  KNIGHT_JUMP_DIRECTIONS,
  DIAGONAL_DIRECTIONS,
  multiply,
  getCoordinateNotation,
  columnToFile,
} from "../utils/coordinates";
import { getPieceNotation, Piece, PieceType, Player } from "./pieces";
import { take } from "lodash";

type SpecialMoveType =
  | "pawn_double_move"
  | "pawn_queening"
  | "pawn_enpassant"
  | "king_castling";

type MoveStart = {
  position: BoardCoordinates;
  piece: Piece;
};

type MoveTarget = {
  position: BoardCoordinates;
  content: SquareContent;
};

type MoveBase = {
  start: MoveStart;
  end: MoveTarget;
  specialType?: SpecialMoveType;
};

type EnpassantMove = {
  specialType: "pawn_enpassant";
  enpassantTarget: MoveTarget;
} & MoveBase;

type CastlingMove = {
  specialType: "king_castling";
  castlingSide: CastlingSide;
  castlingRookMove: Move;
} & MoveBase;

type QueeningMove = {
  specialType: "pawn_queening";
  chosenPiece: PieceType;
} & MoveBase;

type Move = MoveBase | EnpassantMove | CastlingMove | QueeningMove;

const getMovesInDirection = (
  current: BoardCoordinates,
  direction: BoardCoordinates,
  piece: Piece,
  board: BoardState,
  limit: number = Infinity
): BoardCoordinates[] => {
  if (!limit) return [];
  const next: BoardCoordinates = toDirection(current, direction);
  if (!isWithinBounds(board, next)) return [];
  const content: SquareContent = getContentAt(next, board);
  if (!content) {
    return [
      next,
      ...getMovesInDirection(next, direction, piece, board, limit - 1),
    ];
  }
  if (content.player === piece.player) return [];
  return [next];
};

const isWithinBounds = (board: BoardState, position: BoardCoordinates) => {
  const rows = board.length;
  if (position.row > rows - 1 || position.row < 0) return false;
  const cols = board[position.row].length;
  if (position.col > cols - 1 || position.col < 0) return false;
  return true;
};

const getLineMoves = (
  directions: BoardCoordinates[],
  moveStart: MoveStart,
  boardState: BoardState,
  limit: number = Infinity
): Move[] =>
  flow(
    flatMap((dir: BoardCoordinates): BoardCoordinates[] =>
      getMovesInDirection(
        moveStart.position,
        dir,
        moveStart.piece,
        boardState,
        limit
      )
    ),
    map(
      (position: BoardCoordinates): Move => ({
        start: moveStart,
        end: { position, content: getContentAt(position, boardState) },
      })
    )
  )(directions);

const getCastlingSide = (
  side: CastlingSide,
  moveStart: MoveStart,
  direction: BoardCoordinates,
  distance: number,
  boardState: BoardState
): CastlingMove | undefined => {
  const { position: startPos, piece } = moveStart;
  /* squares 1-2 and 1-3 need to be empty on the king and queen side, respectively */
  const emptySquares: BoardCoordinates[] = times(
    (n) => toDirection(startPos, multiply(direction, n + 1)),
    distance
  );
  if (emptySquares.some((pos) => !!getContentAt(pos, boardState))) return;
  /* squares 0-2 need to be unchecked regardless of castling side */
  const uncheckedSquares: BoardCoordinates[] = times(
    (n) => toDirection(startPos, multiply(direction, n)),
    3
  );

  if (
    uncheckedSquares.some((pos: BoardCoordinates) =>
      isSquareInCheck(pos, piece.player, boardState)
    )
  )
    return;

  const rookMoveStartPos: BoardCoordinates = toDirection(
    last(emptySquares),
    direction
  );
  const rookMove: Move = {
    start: {
      position: rookMoveStartPos,
      piece: getContentAt(rookMoveStartPos, boardState),
    },
    end: {
      position: first(emptySquares),
      content: null,
    },
  };
  return {
    specialType: "king_castling",
    start: moveStart,
    end: {
      position: last(uncheckedSquares),
      /* we have just checked this to be empty */
      content: null,
    },
    castlingSide: side,
    castlingRookMove: rookMove,
  };
};

const getCastlingMoves = (
  moveStart: MoveStart,
  gameState: GameState
): Move[] => {
  const { piece } = moveStart;
  const { castling, board } = gameState;
  const kingside: Move =
    castling[piece.player].kingside &&
    getCastlingSide("kingside", moveStart, DIRECTIONS.right, 2, board);
  const queenside: Move =
    castling[piece.player].queenside &&
    getCastlingSide("queenside", moveStart, DIRECTIONS.left, 3, board);

  return compact([kingside, queenside]);
};

const getKnightMoves = (moveStart: MoveStart, boardState: BoardState): Move[] =>
  flow(
    map((dir: BoardCoordinates) => toDirection(moveStart.position, dir)),
    filter((pos: BoardCoordinates) => isWithinBounds(boardState, pos)),
    map((position: BoardCoordinates) => ({
      start: moveStart,
      end: { position, content: getContentAt(position, boardState) },
    })),
    filter((move: Move) => move.end.content?.player !== moveStart.piece.player)
  )(KNIGHT_JUMP_DIRECTIONS);

const getPawnProperties = (piece: Piece) => {
  const moveDir = piece.player === "white" ? DIRECTIONS.up : DIRECTIONS.down;
  const startRow = piece.player === "white" ? 1 : 6;
  const endRow = startRow + moveDir.row * 6;
  return { moveDir, startRow, endRow };
};

const getEnpassantMove = (
  moveStart: MoveStart,
  gameState: GameState
): EnpassantMove | undefined => {
  const { enpassantColumn } = gameState;
  const { position: startPos, piece } = moveStart;
  const { moveDir, startRow } = getPawnProperties(piece);
  if (isNil(enpassantColumn)) return;
  /* piece column must be exactly one away from enpassant column */
  if (Math.abs(startPos.col - enpassantColumn) !== 1) return;
  /* piece row must be exactly three rows away from its starting row */
  if (startRow + moveDir.row * 3 !== moveStart.position.row) return;
  const moveTargetPos: BoardCoordinates = {
    row: moveStart.position.row + moveDir.row,
    col: gameState.enpassantColumn,
  };
  const takeTargetPos: BoardCoordinates = {
    row: moveStart.position.row,
    col: gameState.enpassantColumn,
  };
  return {
    start: moveStart,
    specialType: "pawn_enpassant",
    enpassantTarget: {
      position: takeTargetPos,
      content: getContentAt(takeTargetPos, gameState.board),
    },
    end: {
      position: moveTargetPos,
      /* content cannot be anything but null
      due to the fact that a pawn has just moved through it*/
      content: null,
    },
  };
};

const getPawnMoves = (moveStart: MoveStart, boardState: BoardState): Move[] => {
  const { moveDir, startRow, endRow } = getPawnProperties(moveStart.piece);
  const isStartRow = moveStart.position.row === startRow;
  const isEndRow = moveStart.position.row === endRow;
  const firstSquare: BoardCoordinates = toDirection(
    moveStart.position,
    moveDir
  );

  const regularMove: Move = !isEndRow
    ? {
        start: moveStart,
        end: {
          position: firstSquare,
          content: getContentAt(firstSquare, boardState),
        },
      }
    : undefined;

  const secondSquare: BoardCoordinates = toDirection(firstSquare, moveDir);
  const doubleMove: Move | undefined =
    isStartRow && !isEndRow
      ? {
          start: moveStart,
          specialType: "pawn_double_move",
          end: {
            position: secondSquare,
            content: getContentAt(secondSquare, boardState),
          },
        }
      : undefined;

  const moves: Move[] = flow(
    compact,
    filter((move: Move) => !move.end.content)
  )([regularMove, doubleMove]);

  const takes: Move[] = !isEndRow
    ? flow(
        map((takeDir: BoardCoordinates) => {
          const position = toDirection(moveStart.position, takeDir, moveDir);
          return {
            start: moveStart,
            end: { position, content: getContentAt(position, boardState) },
          };
        }),
        filter((move: Move) => {
          const { content } = move.end;
          return !!content && content.player !== moveStart.piece.player;
        })
      )([CARDINAL_DIRECTIONS.left, CARDINAL_DIRECTIONS.right])
    : [];

  const [lastRowMoves, regularMoves]: [Move[], Move[]] = partition(
    (move: Move) => move.end.position.row === endRow,
    [...moves, ...takes]
  );

  const queeningMoves: QueeningMove[] = flatMap(
    (move: Move) =>
      ["queen", "rook", "bishop", "knight"].map((pieceType: PieceType) => ({
        ...move,
        specialType: "pawn_queening" as const,
        chosenPiece: pieceType,
      })),
    lastRowMoves
  );

  return [...queeningMoves, ...regularMoves];
};

const getBasicMoves = (
  moveStart: MoveStart,
  boardState: BoardState
): Move[] => {
  switch (moveStart.piece.type) {
    case "king":
      return getLineMoves(values(DIRECTIONS), moveStart, boardState, 1);
    case "queen":
      return getLineMoves(values(DIRECTIONS), moveStart, boardState);
    case "rook":
      return getLineMoves(values(CARDINAL_DIRECTIONS), moveStart, boardState);
    case "bishop":
      return getLineMoves(values(DIAGONAL_DIRECTIONS), moveStart, boardState);
    case "knight":
      return getKnightMoves(moveStart, boardState);
    case "pawn":
      return getPawnMoves(moveStart, boardState);
    default:
      return [];
  }
};

const getMoveCandidates = (
  moveStart: MoveStart,
  gameState: GameState
): Move[] => {
  const basicMoves: Move[] = getBasicMoves(moveStart, gameState.board);
  switch (moveStart.piece.type) {
    case "king":
      return [...basicMoves, ...getCastlingMoves(moveStart, gameState)];
    case "pawn":
      return compact([...basicMoves, getEnpassantMove(moveStart, gameState)]);
    case "queen":
    case "rook":
    case "bishop":
    case "knight":
    default:
      return basicMoves;
  }
};

const getLegalMoves = (moveStart: MoveStart, gameState: GameState) => {
  const { board } = gameState;
  const { piece } = moveStart;
  const candidates: Move[] = getMoveCandidates(moveStart, gameState);
  return candidates.filter(
    (move: Move) => !isPlayerInCheck(piece.player, movePiece(move, board))
  );
};

const hasLegalMoves = (player: Player, gameState: GameState) =>
  somePiece(
    (piece: Piece, position: BoardCoordinates) =>
      piece.player === player &&
      !!getLegalMoves({ piece, position }, gameState).length,
    gameState.board
  );

const makeSpecialMove = (move: Move, board: BoardState): BoardState => {
  switch (move.specialType) {
    case "pawn_enpassant": {
      const { enpassantTarget } = move as EnpassantMove;
      return putContentAt(null, enpassantTarget.position, board);
    }
    case "pawn_queening": {
      const { chosenPiece } = move as QueeningMove;
      const queeningPiece = { ...move.start.piece, type: chosenPiece };
      return putContentAt(queeningPiece, move.end.position, board);
    }
    case "king_castling": {
      const { castlingRookMove } = move as CastlingMove;
      const { start, end } = castlingRookMove;
      return flow(
        curry(putContentAt)(null as SquareContent, start.position),
        curry(putContentAt)(start.piece, end.position)
      )(board);
    }
    default:
      return board;
  }
};

const getPlayerCastlingRights = (
  player: Player,
  kingPos: BoardCoordinates,
  board: BoardState,
  prevState: GameState
) => {
  const { castling } = prevState;
  const kingIntact: boolean = isEqual(getContentAt(kingPos, board), {
    type: "king",
    player,
  });
  const queensideRookIntact = isEqual(
    getContentAt({ row: kingPos.row, col: 0 }, board),
    { type: "rook", player }
  );
  const kingsideRookIntact = isEqual(
    getContentAt({ row: kingPos.row, col: 7 }, board),
    { type: "rook", player }
  );
  return {
    kingside: castling[player].kingside && kingIntact && kingsideRookIntact,
    queenside: castling[player].queenside && kingIntact && queensideRookIntact,
  };
};

const getCastlingRights = (board: BoardState, prevState: GameState) => ({
  white: getPlayerCastlingRights("white", { row: 0, col: 4 }, board, prevState),
  black: getPlayerCastlingRights("black", { row: 7, col: 4 }, board, prevState),
});

const movePiece = (move: Move, board: BoardState): BoardState => {
  const { start, end } = move;
  return flow(
    curry(putContentAt)(null as SquareContent, start.position),
    curry(putContentAt)(start.piece, end.position),
    curry(makeSpecialMove)(move)
  )(board);
};

const makeMove = (move: Move, state: GameState): GameState => {
  const { start, end } = move;
  const movedBoard: BoardState = movePiece(move, state.board);
  const enpassantColumn =
    start.piece.type === "pawn" && move.specialType === "pawn_double_move"
      ? end.position.col
      : undefined;

  return {
    playerInTurn: nextPlayer(start.piece.player),
    castling: getCastlingRights(movedBoard, state),
    board: movedBoard,
    enpassantColumn,
    prevMove: move,
  };
};

const getBaseNotation = (move: Move, board: BoardState): string => {
  if (move.specialType === "king_castling") {
    const { castlingSide } = move as CastlingMove;
    return castlingSide === "kingside" ? "O-O" : "O-O-O";
  }

  const { position: startPosition, piece: movePiece } = move.start;
  const { position: targetPosition, content: targetContent } = move.end;
  const pieceNotation: string = getPieceNotation(movePiece.type);
  const targetSquareNotation: string = getCoordinateNotation(targetPosition);

  let takesNotation: string = "";
  if (!!targetContent) {
    if (movePiece.type === "pawn") {
      takesNotation = `${columnToFile(startPosition.col)}x`;
    } else {
      takesNotation = "x";
    }
  }

  const duplicateSource: BoardCoordinates = findPiece(
    (otherPiece: Piece, otherStart: BoardCoordinates) => {
      if (otherPiece.player !== movePiece.player) return false;
      if (otherPiece.type !== movePiece.type) return false;
      if (isEqual(otherStart, targetPosition)) return false;
      const otherMoves: Move[] = getBasicMoves(
        { position: otherStart, piece: otherPiece },
        putContentAt(null, targetPosition, board)
      );
      if (
        !otherMoves.some((otherMove: Move) =>
          isEqual(otherMove.end.position, targetPosition)
        )
      )
        return false;
      return true;
    },
    board
  );
  let sourceNotation: string = "";
  if (!!duplicateSource) {
    if (duplicateSource.col === startPosition.col) {
      sourceNotation = `${startPosition.row}`;
    } else {
      sourceNotation = columnToFile(startPosition.col);
    }
  }

  let queeningNotation: string = "";
  if (move.specialType === "pawn_queening") {
    const { chosenPiece } = move as QueeningMove;
    queeningNotation = `=${getPieceNotation(chosenPiece)}`;
  }

  return [
    pieceNotation,
    sourceNotation,
    takesNotation,
    targetSquareNotation,
    queeningNotation,
  ].join("");
};

const moveToNotation = (move: Move, state: GameState): string => {
  const { player } = move.start.piece;
  const baseNotation: string = getBaseNotation(move, state.board);
  const threat = getThreat(nextPlayer(player), state);
  if (threat?.type === "check") return `${baseNotation}+`;
  if (threat?.type === "checkmate") return `${baseNotation}#`;
  return baseNotation;
};

export {
  makeMove,
  movePiece,
  moveToNotation,
  Move,
  MoveStart,
  SpecialMoveType,
  MoveTarget,
  getLegalMoves,
  getBasicMoves,
  hasLegalMoves,
  QueeningMove,
};
