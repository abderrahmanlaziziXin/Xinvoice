"use client";

import { useState } from "react";

export default function SimpleInvoicePage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  console.log("SimpleInvoicePage render, prompt:", prompt);

  const handleGenerate = async () => {
    console.log("Generate clicked with prompt:", prompt);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          documentType: "invoice",
        }),
      });

      const data = await response.json();
      console.log("API response:", data);
      alert("Generation successful! Check console for details.");
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Generation failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-4">Simple Invoice Generator</h1>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <h2 className="font-semibold mb-2">Debug Info:</h2>
              <div>Current prompt: &quot;{prompt}&quot;</div>
              <div>Length: {prompt.length}</div>
              <div>Trimmed length: {prompt.trim().length}</div>
              <div>Is generating: {isGenerating ? "true" : "false"}</div>
              <div>
                Button should be disabled:{" "}
                {prompt.trim().length === 0 || isGenerating ? "true" : "false"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Description
              </label>
              <textarea
                value={prompt}
                onChange={(e) => {
                  console.log("onChange fired:", e.target.value);
                  setPrompt(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                rows={4}
                placeholder="Invoice ACME Corp $1500 for web design..."
                disabled={isGenerating}
              />
            </div>

            <div>
              <button
                onClick={handleGenerate}
                disabled={prompt.trim().length === 0 || isGenerating}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
