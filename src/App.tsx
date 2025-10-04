import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import env from "./env";
function App() {
  const [message, setMessage] = useState<string>("");

  async function handleClick() {
    const result = await invoke<string>("hello_world");
    setMessage(result);
  }

  return (
    <div className="container">
      <h1>Tauri Whisper App, running on {env.REACT_APP_NODE_ENV}</h1>
      <button onClick={handleClick}>Say Hello</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;
