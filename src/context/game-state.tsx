import React, {
  Context,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { compact, first, noop } from "lodash/fp";
import { BoardState, getThreat, initialBoard, Player } from "../game/board";
import { GameState, initialGameState, Threat, ThreatType } from "../game/game";
import { HistoryContext } from "./history";
import { MoveContext } from "./move";

type GameStateContextType = {
  threats: Threat[];
  board: BoardState;
  boardRotated: boolean;
  gameStatus?: ThreatType;
  playerInTurn: Player;
  isGameOver: boolean;

};

const GameStateContext: Context<GameStateContextType> = createContext({
  threats: [],
  board: initialBoard,
  boardRotated: false as boolean,
  playerInTurn: "white" as Player,
  isGameOver: false as boolean,
});

const GameStateProvider = ({ children }: React.HTMLAttributes<Element>) => {
  const { presentState, selectedState } = useContext(HistoryContext);
  const { temporaryBoardState } = useContext(MoveContext);
  const [boardRotated, setBoardRotated] = useState(false);

  const threats: Threat[] = useMemo(
    () =>
      compact([
        getThreat("white", selectedState),
        getThreat("black", selectedState),
      ]),
    [selectedState]
  );

  const board: BoardState = temporaryBoardState || selectedState.board;

  const gameStatus: ThreatType = useMemo(() => first(threats)?.type, [threats]);

  const { playerInTurn } = presentState;
  const isGameOver = useMemo(() => {
    switch (gameStatus) {
      case "checkmate":
      case "stalemate":
        return true;
      default:
        return false;
    }
  }, [gameStatus]);

  return (
    <GameStateContext.Provider
      value={{
        threats,
        board,
        boardRotated,
        gameStatus,
        playerInTurn,
        isGameOver,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export { GameStateContext, GameStateProvider };
