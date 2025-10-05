import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import env from "@env";

function App() {
  const [message, setMessage] = useState<string>("");
  const [whisperTest, setWhisperTest] = useState<string>("");

  async function handleClick() {
    const result = await invoke<string>("hello_world");
    setMessage(result);
  }

  async function testWhisper() {
    try {
      const result = await invoke<string>("test_whisper");
      setWhisperTest(result);
    } catch (error) {
      setWhisperTest(`Error: ${error}`);
    }
  }

  return (
    <div className="container">
      <h1>Tauri Whisper App, running on {env.REACT_APP_NODE_ENV}</h1>
      <button onClick={handleClick}>Say Hello</button>
      {message && <p className="message">{message}</p>}

      <hr />

      <button onClick={testWhisper}>Test Whisper-RS</button>
      {whisperTest && <p className="message">{whisperTest}</p>}
    </div>
  );
}

export default App;
