import React, {
  Context,
  createContext,
  useState,
  useCallback,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { first, noop } from "lodash/fp";
import { BoardCoordinates } from "../utils/coordinates";
import { BoardState, Piece } from "../game/board";
import { HistoryContext } from "./history";
import {
  Move,
  MoveStart,
  MoveTarget,
  makeMove,
  movePiece,
  getLegalMoves,
  QueeningMove,
} from "../game/moves";
import useEventListener from "../hooks/useEventListener";

type MoveContextType = {
  chosenMoves: Move[];
  setChosenMoves: (moves: Move[]) => void;
  moveStart?: MoveStart | undefined;
  legalMoves: Move[];
  beginMove: (position: BoardCoordinates, piece: Piece) => void;
  endMove: () => void;
  temporaryBoardState?: BoardState;
  queeningChoices: QueeningMove[];
  finishQueening: (move: QueeningMove) => void;
  cancelQueening: () => void;
  isTemporaryState: boolean;
};

const MoveContext: Context<MoveContextType> = createContext({
  chosenMoves: [],
  queeningChoices: [],
  setChosenMoves: noop,
  beginMove: noop,
  endMove: noop,
  legalMoves: [],
  finishQueening: noop,
  cancelQueening: noop,
  isTemporaryState: false as boolean,
});

const MoveProvider = ({ children }: React.HTMLAttributes<Element>) => {
  const { presentState, appendHistory, setSelectedState, isViewingHistory } = useContext(HistoryContext);

  const [moveStart, setMoveStart] = useState<MoveStart>(undefined);
  const [chosenMoves, setChosenMoves] = useState<Move[]>([]);
  const [temporaryBoardState, setTemporaryBoardState] = useState<BoardState>(
    undefined
  );
  const [queeningChoices, setQueeningChoices] = useState([]);

  const isTemporaryState: boolean = !!temporaryBoardState;

  const legalMoves: Move[] = useMemo(
    () => (moveStart ? getLegalMoves(moveStart, presentState) : []),
    [moveStart, presentState]
  );

  useEffect(() => {
    if(isViewingHistory) {
      setMoveStart(undefined);
      setTemporaryBoardState(undefined);
      setQueeningChoices([]);
    }
  }, [isViewingHistory])

  const beginMove = useCallback(
    (position: BoardCoordinates, piece: Piece) => {
      setMoveStart({ position, piece });
      setTemporaryBoardState(undefined);
      setQueeningChoices([]);
    },
    [setMoveStart, setTemporaryBoardState, setQueeningChoices]
  );

  const promptChosenMove = useCallback(
    (moves: Move[]): void => {
      const { start, end }: Move = first(moves);
      const { board } = presentState;
      const temporaryBoard: BoardState = movePiece({ start, end }, board);
      setTemporaryBoardState(temporaryBoard);
      setQueeningChoices(moves);
    },
    [presentState, temporaryBoardState, setTemporaryBoardState]
  );

  const endMove = useCallback(() => {
    setMoveStart(undefined);
    setChosenMoves([]);
    if(isViewingHistory) return;
    if(isTemporaryState) return;
    if (!moveStart || !chosenMoves.length) return;
    if (chosenMoves.length > 1) {
      return promptChosenMove(chosenMoves);
    }
    setTemporaryBoardState(undefined);
    setQueeningChoices([]);
    const move: Move = first(chosenMoves);
    const movedState = makeMove(move, presentState);
    appendHistory(movedState);
    setSelectedState(movedState);
  }, [
    moveStart,
    chosenMoves,
    presentState,
    setMoveStart,
    setChosenMoves,
    appendHistory,
    promptChosenMove,
    setTemporaryBoardState,
    setQueeningChoices,
    setSelectedState,
    isTemporaryState,
    isViewingHistory
  ]);

  const cancelQueening = useCallback(() => {
    setMoveStart(undefined);
    setChosenMoves([]);
    setTemporaryBoardState(undefined);
    setQueeningChoices([]);
  }, [
    setMoveStart,
    setChosenMoves,
    setTemporaryBoardState,
    setQueeningChoices,
  ]);

  const finishQueening = useCallback(
    (move: QueeningMove) => {
      setMoveStart(undefined);
      setChosenMoves([]);
      setTemporaryBoardState(undefined);
      setQueeningChoices([]);
      const movedState = makeMove(move, presentState);
      appendHistory(movedState);
      setSelectedState(movedState);
    },
    [
      setMoveStart,
      setChosenMoves,
      setTemporaryBoardState,
      setQueeningChoices,
      appendHistory,
      presentState,
      setSelectedState
    ]
  );

  useEventListener("mouseup", endMove);

  return (
    <MoveContext.Provider
      value={{
        chosenMoves,
        setChosenMoves,
        queeningChoices,
        moveStart,
        beginMove,
        endMove,
        legalMoves,
        temporaryBoardState,
        finishQueening,
        cancelQueening,
        isTemporaryState
      }}
    >
      {children}
    </MoveContext.Provider>
  );
};

export { MoveContext, MoveProvider, MoveStart, MoveTarget };
