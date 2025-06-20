import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chatbot from './ChatBot/Chatbot'; 

function App() {
  const [count, setCount] = useState(0)

  return (
    
    <Chatbot></Chatbot>
  )
}

export default App
