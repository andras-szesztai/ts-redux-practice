import React from "react"

import Recorder from "../Recoder/Recorder"
import Calendar from "../Calendar/Calendar"

import "./App.css"

const App: React.FC = () => {
  return (
    <div className="App">
      <Recorder />
      <Calendar />
    </div>
  )
}

export default App
