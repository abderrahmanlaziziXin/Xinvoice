'use client'

import { useState } from 'react'

export default function TestInputPage() {
  const [testText, setTestText] = useState('')

  console.log('TestInputPage render, testText:', testText)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-4">Input Test Page</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <h2 className="font-semibold mb-2">Debug Info:</h2>
              <div>Current value: "{testText}"</div>
              <div>Length: {testText.length}</div>
              <div>Is empty: {testText.length === 0 ? 'true' : 'false'}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Input 1 (Basic)
              </label>
              <input
                type="text"
                value={testText}
                onChange={(e) => {
                  console.log('Input 1 onChange:', e.target.value)
                  setTestText(e.target.value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                placeholder="Type something here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Input 2 (Textarea)
              </label>
              <textarea
                value={testText}
                onChange={(e) => {
                  console.log('Textarea onChange:', e.target.value)
                  setTestText(e.target.value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                rows={3}
                placeholder="Type something here..."
              />
            </div>

            <div>
              <button
                onClick={() => setTestText('Button click test')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Set Text via Button
              </button>
              
              <button
                onClick={() => setTestText('')}
                className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear Text
              </button>
            </div>

            <div>
              <button
                disabled={testText.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test Button (Disabled when empty: {testText.length === 0 ? 'YES' : 'NO'})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
