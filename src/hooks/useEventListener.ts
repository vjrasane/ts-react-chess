import { useEffect } from "react";

const useEventListener = (
  event: string,
  callback: EventListenerOrEventListenerObject
): void => {
  useEffect(() => {
    window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, [event, callback]);
};

export default useEventListener;
