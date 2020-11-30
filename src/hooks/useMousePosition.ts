import { useState, useEffect, useCallback } from "react";
import useEventListener from "./useEventListener";
type MousePosition = {
  x: number;
  y: number;
};

const useMousePosition = (): MousePosition => {
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });

  const updateMousePosition = useCallback(
    (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    },
    [setMousePosition]
  );

  useEventListener("mousemove", updateMousePosition);

  return mousePosition;
};

export { useMousePosition, MousePosition };
