import { useState, useEffect, useCallback, useRef } from 'react';

export enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export interface WebSocketHook {
  lastMessage: WebSocketEventMap['message'] | null;
  readyState: ReadyState;
  sendMessage: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
}

export const useWebSocket = (url: string): WebSocketHook => {
  const [lastMessage, setLastMessage] = useState<WebSocketEventMap['message'] | null>(null);
  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.CONNECTING);
  const socketRef = useRef<WebSocket | null>(null);

  // Create WebSocket connection
  useEffect(() => {
    // Determine the protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}${url}`;
    
    console.log(`Connecting to WebSocket server at: ${wsUrl}`);
    
    // Create WebSocket
    const socket = new WebSocket(wsUrl);

    // Update ready state when it changes
    const setStateFromEvent = (event: Event) => {
      if (socket) {
        setReadyState(socket.readyState as ReadyState);
      }
    };

    // Handle messages
    const handleMessage = (event: MessageEvent) => {
      setLastMessage(event);
    };

    // Add event listeners
    socket.addEventListener('open', setStateFromEvent);
    socket.addEventListener('close', setStateFromEvent);
    socket.addEventListener('error', setStateFromEvent);
    socket.addEventListener('message', handleMessage);

    // Store the socket
    socketRef.current = socket;

    // Clean up
    return () => {
      socket.removeEventListener('open', setStateFromEvent);
      socket.removeEventListener('close', setStateFromEvent);
      socket.removeEventListener('error', setStateFromEvent);
      socket.removeEventListener('message', handleMessage);
      
      if (socket.readyState === ReadyState.OPEN) {
        socket.close();
      }
    };
  }, [url]);

  // Send message function
  const sendMessage = useCallback(
    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (socketRef.current && socketRef.current.readyState === ReadyState.OPEN) {
        socketRef.current.send(data);
      } else {
        console.error('WebSocket is not connected');
      }
    },
    []
  );

  return { lastMessage, readyState, sendMessage };
};

export default useWebSocket;