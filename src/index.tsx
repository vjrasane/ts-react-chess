import React, { ReactElement } from "react";
import ReactDOM from "react-dom";

import Game from "./components/Game";

import check from "../images/indicators/orange_glow.png";
import checkmate from "../images/indicators/red_glow.png";
import stalemate from "../images/indicators/blue_glow.png";
import move from "../images/indicators/green_dot.png";
import Preload from "./components/Preload";
import { HistoryProvider } from "./context/history";
import { MoveProvider } from "./context/move";
import { GameStateProvider } from "./context/game-state";

const render = (component: ReactElement) =>
  ReactDOM.render(component, document.getElementById("root"));

render(
  <div>
    <HistoryProvider>
      <MoveProvider>
        <GameStateProvider>
          <Game />
        </GameStateProvider>
      </MoveProvider>
    </HistoryProvider>
    <Preload images={[check, checkmate, stalemate, move]} />
  </div>
);
