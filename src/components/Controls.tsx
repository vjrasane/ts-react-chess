import React, { useCallback, useContext, useMemo } from "react";
import { first, last } from "lodash/fp";
import { HistoryContext } from "../context/history";
import forward from "../../images/buttons/forward.png";
import backward from "../../images/buttons/backward.png";
import backwardDouble from "../../images/buttons/backward_double.png";
import forwardDouble from "../../images/buttons/forward_double.png";

import { GameStateContext } from "../context/game-state";
import { GameState } from "../game/game";

const controlButtonStyle = {
  height: "100%",
  width: "23%",
  border: "solid 0.5px #CCCCCC",
  borderRadius: 3,
  flexShrink: 1,
};

const controlButtonIconStyle = {
  height: "84%",
  display: "block",
  margin: "0 auto",
  marginTop: "5%",
  opacity: "0.4",
};
const controlButtonsContainerStyle = {
  height: "7%",
  minHeight: 25,
  width: "100%",

  marginTop: 3,
  display: "flex",
  justifyContent: "space-evenly",
  alignItems: "center",
};

const Controls = () => {
  const { history, selectedState, setSelectedState } = useContext(
    HistoryContext
  );

  const next = useCallback(
    (): GameState =>
      history[Math.min(history.indexOf(selectedState) + 1, history.length - 1)],
    [history, selectedState]
  );
  const prev = useCallback(
    (): GameState => history[Math.max(history.indexOf(selectedState) - 1, 0)],
    [history, selectedState]
  );

  const button = useCallback(
    (image: string, getState: () => GameState) => (
      <div
        className="control-button"
        style={controlButtonStyle}
        onClick={() => setSelectedState(getState())}
      >
        <style>
          {`
        .control-button:hover{background-color: #e4e4e4}
        .control-button:active{background-color: #7F7F7F}
        `}
        </style>
        <img src={image} style={controlButtonIconStyle} />
      </div>
    ),
    [setSelectedState]
  );
  return (
    <div style={controlButtonsContainerStyle}>
      {button(backwardDouble, () => first(history))}
      {button(backward, prev)}
      {button(forward, next)}
      {button(forwardDouble, () => last(history))}
    </div>
  );
};

export default Controls;
