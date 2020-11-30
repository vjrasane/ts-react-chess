import { Dictionary } from "lodash";

type BoardCoordinates = {
  row: number;
  col: number;
};

const columnToFile = (col: number): string => String.fromCharCode(97 + col);

const getCoordinateNotation = (coords: BoardCoordinates): string =>
  columnToFile(coords.col) + (coords.row + 1);

const toDirection = (
  start: BoardCoordinates,
  ...directions: BoardCoordinates[]
): BoardCoordinates => {
  if (!directions.length) return start;
  const [direction, ...rest] = directions;
  const next: BoardCoordinates = sumCoordinates(start, direction);
  return toDirection(next, ...rest);
};

const sumCoordinates = (first: BoardCoordinates, second: BoardCoordinates) => ({
  col: first.col + second.col,
  row: first.row + second.row,
});

const multiply = (coords: BoardCoordinates, scalar: number) => ({
  col: coords.col * scalar,
  row: coords.row * scalar,
});

const CARDINAL_DIRECTIONS: Dictionary<BoardCoordinates> = {
  up: { col: 0, row: 1 },
  down: { col: 0, row: -1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

const DIAGONAL_DIRECTIONS: Dictionary<BoardCoordinates> = {
  up_right: { col: 1, row: 1 },
  down_right: { col: 1, row: -1 },
  down_left: { col: -1, row: -1 },
  up_left: { col: -1, row: 1 },
};

const DIRECTIONS: Dictionary<BoardCoordinates> = {
  ...CARDINAL_DIRECTIONS,
  ...DIAGONAL_DIRECTIONS,
};

const KNIGHT_JUMP_DIRECTIONS: BoardCoordinates[] = [
  toDirection(CARDINAL_DIRECTIONS.up, DIAGONAL_DIRECTIONS.up_right),
  toDirection(CARDINAL_DIRECTIONS.up, DIAGONAL_DIRECTIONS.up_left),
  toDirection(CARDINAL_DIRECTIONS.down, DIAGONAL_DIRECTIONS.down_right),
  toDirection(CARDINAL_DIRECTIONS.down, DIAGONAL_DIRECTIONS.down_left),
  toDirection(CARDINAL_DIRECTIONS.left, DIAGONAL_DIRECTIONS.up_left),
  toDirection(CARDINAL_DIRECTIONS.left, DIAGONAL_DIRECTIONS.down_left),
  toDirection(CARDINAL_DIRECTIONS.right, DIAGONAL_DIRECTIONS.up_right),
  toDirection(CARDINAL_DIRECTIONS.right, DIAGONAL_DIRECTIONS.down_right),
];

export {
  BoardCoordinates,
  CARDINAL_DIRECTIONS,
  DIAGONAL_DIRECTIONS,
  DIRECTIONS,
  KNIGHT_JUMP_DIRECTIONS,
  columnToFile,
  getCoordinateNotation,
  toDirection,
  multiply,
};
