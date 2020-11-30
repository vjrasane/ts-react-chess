import React, { createContext, Context, useState, useCallback, useMemo } from "react";
import { noop, last } from "lodash/fp";
import { initialGameState, GameState } from "../game/game";

type HistoryContextType = {
  history: GameState[];
  presentState: GameState;
  appendHistory: (state: GameState) => void;
  selectedState: GameState;
  setSelectedState: (state: GameState) => void;
  isViewingHistory: boolean;
};

const HistoryContext: Context<HistoryContextType> = createContext({
  history: [],
  presentState: initialGameState,
  appendHistory: noop,
  selectedState: initialGameState,
  setSelectedState: noop,
  isViewingHistory: false as boolean
});

const HistoryProvider = ({ children }: React.HTMLAttributes<Element>) => {
  const [history, setHistory] = useState([initialGameState]);

  const presentState: GameState  = useMemo(() => last(history), [history])

  const [selectedState, setSelectedState] = useState(presentState);

  const appendHistory = useCallback(
    (state: GameState) => setHistory([...history, state]),
    [history, setHistory]
  );

  const isViewingHistory: boolean = presentState !== selectedState

  return (
    <HistoryContext.Provider
      value={{
        history,
        presentState,
        appendHistory,
        selectedState,
        setSelectedState,
        isViewingHistory
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export { HistoryContext, HistoryProvider };
