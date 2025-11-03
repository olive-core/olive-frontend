import { useState } from "react";
import Counter from "./components/Counter"

function App() {
  const [value, setValue] = useState("");
  const [showText, setShowText] = useState(false);

  function handleChange(e) {
    setValue(e.target.value);
  }

  function handleKeyDown(e) {
    console.log(e.key);

    if (e.key === "Enter") {
      setShowText(!showText);
    }
  }

  return (
    <>
      <input type="text" value={value} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="type text" />

      {showText && <p>{value}</p>}
    </>
  )
}

export default App
