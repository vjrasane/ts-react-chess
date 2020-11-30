import React, { useCallback, useContext, useMemo } from "react";
import { isEqual, mergeAll } from "lodash/fp";
import { MoveContext } from "../context/move";
import { SquareContent } from "../game/board";
import {
  SQUARE_SIZE_PIXELS,
  PIECE_SIZE_PIXELS,
  WHITE_SQUARE_BACKGROUND,
  BLACK_SQUARE_BACKGROUND,
  LAYER_PIECE,
} from "../utils/constants";
import { BoardCoordinates, getCoordinateNotation } from "../utils/coordinates";
import { getPieceImage } from "../game/pieces";
import { SquareStateIndicator, MoveIndicator } from "./Indicators";
import { Move } from "../game/moves";
import { GameStateContext } from "../context/game-state";
import { Threat } from "../game/game";
import QueeningMenu from "./QueeningMenu";
import { HistoryContext } from "../context/history";

const getSquareColor = ({ col, row }: BoardCoordinates): string => {
  const squareParity: 0 | 1 = ((col + row) % 2) as 0 | 1;
  return [WHITE_SQUARE_BACKGROUND, BLACK_SQUARE_BACKGROUND][squareParity];
};

const getSquareStyle = (position: BoardCoordinates) => ({
  height: SQUARE_SIZE_PIXELS,
  width: SQUARE_SIZE_PIXELS,
  float: "left",
  position: "relative",
  background: getSquareColor(position),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const pieceStyle = {
  height: PIECE_SIZE_PIXELS,
  width: PIECE_SIZE_PIXELS,
  userSelect: "none",
  MozUserSelect: "none",
  WebkitUserSelect: "none",
  msUserSelect: "none",
  zIndex: LAYER_PIECE,
};

type SquareProps = {
  content: SquareContent;
  position: BoardCoordinates;
};

const Square = ({ content, position }: SquareProps) => {
  const style = useMemo(() => getSquareStyle(position), []);

  const { presentState, isViewingHistory } = useContext(HistoryContext);
  const { isTemporaryState } = useContext(MoveContext);
  const {
    moveStart,
    legalMoves,
    beginMove,
    queeningChoices,
    setChosenMoves,
  } = useContext(MoveContext);
  const { threats } = useContext(
    GameStateContext
  );

  const isQueeningSquare: boolean = useMemo(() => {
    if (position.row < 7 && position.row > 0) return false;
    if (!queeningChoices.length) return false;
    return queeningChoices.some((move: Move) =>
      isEqual(move.end.position, position)
    );
  }, [queeningChoices, position]);

  const threat: Threat | undefined = useMemo(
    () =>
      threats.find(({ position: threatTarget }: Threat) =>
        isEqual(threatTarget, position)
      ),
    [threats, position]
  );

  const moveCandidates: Move[] = useMemo(
    () => legalMoves.filter(({ end }: Move) => isEqual(end.position, position)),
    [legalMoves, position]
  );

  const onMoveBegin = useCallback(() => {
    if (isViewingHistory) return;
    if (isTemporaryState) return;
    if (!content) return;
    if (content.player !== presentState.playerInTurn) return;
    beginMove(position, content);
  }, [content, position, beginMove]);

  const onMouseOver = useCallback(() => {
    if (!moveStart) setChosenMoves([]);
    setChosenMoves(moveCandidates);
  }, [position, content, moveStart, moveCandidates, setChosenMoves]);

  const contentImage = useMemo(() => {
    if (!content) return null;
    const opacity: number = isEqual(moveStart?.position, position) ? 0.4 : 1;
    const style = mergeAll([{}, pieceStyle, { opacity }]);
    return (
      <img
        style={style}
        draggable={false}
        src={getPieceImage(content)}
        onMouseDown={onMoveBegin}
        onDragStart={(ev) => ev.preventDefault()}
        alt=""
      />
    );
  }, [content, position, moveStart]);

  return (
    <div
      id={getCoordinateNotation(position)}
      style={style}
      onMouseOver={onMouseOver}
    >
      {!!threat && <SquareStateIndicator state={threat.type} />}
      {contentImage}
      {!!moveCandidates.length && <MoveIndicator />}
      {!!isQueeningSquare && <QueeningMenu choices={queeningChoices} />}
    </div>
  );
};

export default Square;
