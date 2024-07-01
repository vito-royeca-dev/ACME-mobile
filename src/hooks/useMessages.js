import { useState, useEffect } from "react";
import { NEW_MESSAGE } from "../types/eventTypes";
import { socket } from "../socket";

export const useMessages = () => {
  const [messages, setMessages] = useState([]);

  const initializeMessages = () => setMessages([]);

  useEffect(() => {
    const socketListener = socket.on(NEW_MESSAGE, async ({data}) => {
      setMessages(prev => [
        ...prev,
        data
      ]);
    });

    return () => {
      socket.off(NEW_MESSAGE, socketListener);
    };
  }, []);

  return [messages, initializeMessages];
}