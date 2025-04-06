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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create WebSocket connection
  useEffect(() => {
    // Function to create and connect WebSocket
    const connectWebSocket = () => {
      // In development, we'll use the current host (which includes port)
      // In production, we'd typically use a more sophisticated approach
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}${url}`;
      
      console.log(`Connecting to WebSocket server at: ${wsUrl}`);
      
      try {
        // Create WebSocket
        const socket = new WebSocket(wsUrl);
        
        // Update ready state when it changes
        const setStateFromEvent = (event: Event) => {
          setReadyState(socket.readyState as ReadyState);
        };

        // Handle messages
        const handleMessage = (event: MessageEvent) => {
          setLastMessage(event);
        };
        
        // Handle errors
        const handleError = (event: Event) => {
          console.error('WebSocket error:', event);
          setReadyState(ReadyState.CLOSED);
        };
        
        // Handle connection close
        const handleClose = (event: CloseEvent) => {
          console.log('WebSocket connection closed. Attempting to reconnect...');
          setReadyState(ReadyState.CLOSED);
          
          // Clear any existing reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Set a timeout to reconnect
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000); // Try to reconnect after 3 seconds
        };

        // Add event listeners
        socket.addEventListener('open', setStateFromEvent);
        socket.addEventListener('close', handleClose);
        socket.addEventListener('error', handleError);
        socket.addEventListener('message', handleMessage);

        // Store the socket
        socketRef.current = socket;
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        setReadyState(ReadyState.CLOSED);
        
        // Attempt to reconnect after error
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000); // Try to reconnect after 3 seconds
      }
    };
    
    // Initial connection
    connectWebSocket();

    // Clean up function
    return () => {
      // Clear any reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Close the socket if it exists
      if (socketRef.current) {
        const currentSocket = socketRef.current;
        
        // We can't remove the exact listeners we added, but we can close the socket
        // The socket will be garbage collected along with its event listeners
        
        // Close the connection if it's open or connecting
        if (currentSocket.readyState === ReadyState.OPEN || 
            currentSocket.readyState === ReadyState.CONNECTING) {
          currentSocket.close();
        }
        
        // Clear the reference
        socketRef.current = null;
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