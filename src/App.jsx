import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GoogleSheetData from './results/resultPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <GoogleSheetData/>
    </>
  )
}

export default App
