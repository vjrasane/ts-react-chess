import React, { useMemo } from "react";
import check from "../../images/indicators/orange_glow.png";
import checkmate from "../../images/indicators/red_glow.png";
import stalemate from "../../images/indicators/blue_glow.png";
import move from "../../images/indicators/green_dot.png";
import { mergeAll } from "lodash/fp";
import { ThreatType } from "../game/game";
import { LAYER_MOVE_INDICATOR, LAYER_SQUARE_STATE } from "../utils/constants";

type SquareState = "check" | "checkmate" | "stalemate";

const getSquareStateImage = (type: SquareState) => {
  switch (type) {
    case "check":
      return check;
    case "checkmate":
      return checkmate;
    case "stalemate":
      return stalemate;
  }
};

const stateIndicatorStyle = {
  opacity: 0.6,
  position: "absolute",
  height: "95%",
  width: "95%",
  top: "2.5%",
  left: "2.5%",
  MozUserSelect: "none",
  WebkitUserSelect: "none",
  msUserSelect: "none",
  zIndex: LAYER_SQUARE_STATE
};

type SquareStateIndicatorProps = {
  state: ThreatType;
};

const SquareStateIndicator = ({ state }: SquareStateIndicatorProps) => {
  return <img src={getSquareStateImage(state)} style={stateIndicatorStyle} />;
};

const moveIndicatorStyle = {
  opacity: 0.6,
  position: "absolute",
  height: "30%",
  width: "30%",
  top: "35%",
  left: "35%",
  userSelect: "none",
  MozUserSelect: "none",
  WebkitUserSelect: "none",
  msUserSelect: "none",
  pointerEvents: "none",
  zIndex: LAYER_MOVE_INDICATOR
}

const MoveIndicator = () => <img src={move} style={moveIndicatorStyle}/>;

export { MoveIndicator, SquareStateIndicator, SquareState };
