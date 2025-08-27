import { invoke } from '@tauri-apps/api/core'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './globals.css'

// Example app that comes with Tauri. Needs to be re-written for Fleet.
function App() {
  const [greetMsg, setGreetMsg] = useState('')
  const [name, setName] = useState('')

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke('greet', { name }))
  }

  return (
    <main className="container mx-auto">
      <h1>Welcome to Tauri + React</h1>

      <div className="grid grid-cols-3 gap-4">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="h-10 w-10" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="h-10 w-10" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="h-10 w-10" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          greet()
        }}
      >
        <input
          id="greet-input"
          className="rounded-md border-2 border-gray-300 p-2"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit" className="rounded-md bg-blue-500 p-2 text-white">
          Greet
        </button>
      </form>
      <p>{greetMsg}</p>
    </main>
  )
}

export default App
