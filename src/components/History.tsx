import React, { useCallback, useContext, useMemo } from "react";
import { tail, chunk, flow, mergeAll } from "lodash/fp";
import { HistoryContext } from "../context/history";
import { GameState } from "../game/game";
import { moveToNotation } from "../game/moves";

type MoveCellProps = {
  state: GameState;
};

const moveCellStyle = {
  color: "#747475",
  borderLeft: "solid 0.1px #dddddd",
  textAlign: "center",
  fontFamily: "Arial, Helvetica, sans-serif",
  cursor: "pointer"
};

const selectedStateStyle = {
  backgroundColor: "#d7e9fa",
};

const MoveCell = ({ state }: MoveCellProps) => {
  const { selectedState, setSelectedState } = useContext(HistoryContext);
  const notation = useMemo(() => moveToNotation(state.prevMove, state), [
    state,
  ]);

  const style = useMemo(
    () =>
      mergeAll([
        {},
        moveCellStyle,
        selectedState === state ? selectedStateStyle : {},
      ]),
    [selectedState, state]
  );

  const onClick = useCallback(() => setSelectedState(state), [
    state,
    setSelectedState,
  ]);
  return (
    <td style={style} onClick={onClick}>
      {notation}
    </td>
  );
};

type MoveRowProps = {
  whiteMove: GameState;
  blackMove: GameState;
  rowNum: number;
};

const tableRowStyle = {
  height: 30
};

const numCellStyle = {
  color: "#d1d1d1",
  backgroundColor: "#f8f8f8",
  borderleft: "solid 0.1px #cccccc",
  textAlign: "center",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const MoveRow = ({ whiteMove, blackMove, rowNum }: MoveRowProps) => (
  <tr style={tableRowStyle}>
    <td style={numCellStyle}>{rowNum}</td>
    <MoveCell state={whiteMove} />
    {blackMove && <MoveCell state={blackMove} />}
  </tr>
);

const movesContainerStyle = {
  width: "100%",
  borderLeft: "solid 0.1px #cccccc",
  borderRight: "solid 0.1px #cccccc",
  flexGrow: 1,
  overflowY: "auto",
};

const movesTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const headerRowStyle = {
  height: 30,
  borderLeft: "solid 0.1px #cccccc",
  borderRight: "solid 0.1px #cccccc",
  borderBottom: "solid 0.1px #cccccc",
  backgroundColor: "#eaeaea",
  color: "#7f7f7f",
};

const headerCellStyle = {
  textAlign: "center",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const movesTableHeadStyle = {
}

const movesTableBodyStyle = {
}

const History = () => {
  const { history } = useContext(HistoryContext);

  const plies: GameState[][] = useMemo(() => flow(tail, chunk(2))(history), [
    history,
  ]);

  return (
    <div style={movesContainerStyle}>
      <table style={movesTableStyle}>
        <thead style={movesTableHeadStyle}>
          <tr style={headerRowStyle}>
            <th style={headerCellStyle}>#</th>
            <th style={headerCellStyle}>White</th>
            <th style={headerCellStyle}>Black</th>
          </tr>
        </thead>
        <tbody style={movesTableBodyStyle}>
          {plies.map(([whiteMove, blackMove], index) => (
            <MoveRow
              key={index}
              whiteMove={whiteMove}
              blackMove={blackMove}
              rowNum={index + 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
