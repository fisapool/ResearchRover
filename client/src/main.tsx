import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add additional global styles for extension popup
const style = document.createElement('style');
style.textContent = `
  body {
    font-family: 'Roboto', sans-serif;
    color: #212121;
    width: 400px;
    min-height: 500px;
    max-height: 600px;
    overflow: hidden;
  }
  .focus-visible:focus-visible {
    outline: 2px solid #1E88E5;
    outline-offset: 2px;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
