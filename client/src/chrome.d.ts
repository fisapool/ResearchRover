// Type definitions for Chrome extension APIs

interface Chrome {
  runtime: {
    onMessage: {
      addListener: (
        callback: (
          message: any,
          sender: chrome.runtime.MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ) => void;
    };
    sendMessage: (
      message: any,
      responseCallback?: (response: any) => void
    ) => void;
    lastError?: Error;
  };
  tabs: {
    query: (
      queryInfo: {
        active?: boolean;
        currentWindow?: boolean;
      },
      callback: (tabs: chrome.tabs.Tab[]) => void
    ) => void;
    sendMessage: (
      tabId: number,
      message: any,
      responseCallback?: (response: any) => void
    ) => void;
  };
  storage: {
    local: {
      get: (
        keys: string | string[] | Record<string, any>,
        callback: (items: Record<string, any>) => void
      ) => void;
      set: (
        items: Record<string, any>,
        callback?: () => void
      ) => void;
    };
  };
}

interface Window {
  chrome: Chrome;
}

declare namespace chrome {
  namespace runtime {
    interface MessageSender {
      tab?: tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      tlsChannelId?: string;
      origin?: string;
    }
  }
  
  namespace tabs {
    interface Tab {
      id?: number;
      index: number;
      pinned: boolean;
      highlighted: boolean;
      windowId: number;
      active: boolean;
      incognito: boolean;
      selected: boolean;
      discarded: boolean;
      autoDiscardable: boolean;
      url?: string;
      title?: string;
      favIconUrl?: string;
      status?: string;
      width?: number;
      height?: number;
    }
  }
}

declare var chrome: Chrome;