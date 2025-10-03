import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Crypto & Stocks Dashboard
        </h1>
        <div className="mb-6">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Count is {count}
          </button>
        </div>
        <p className="text-gray-600">
          TailwindCSS is working! Ready to build the dashboard.
        </p>
      </div>
    </div>
  )
}

export default App
