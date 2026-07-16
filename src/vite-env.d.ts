/// <reference types="vite/client" />

interface Window {
  webkit?: {
    messageHandlers?: {
      hapticFeedback?: {
        postMessage: (message: string) => void;
      };
    };
  };
  Impactfeedback?: new (style: string) => {
    impactOccurred: () => void;
  };
}
