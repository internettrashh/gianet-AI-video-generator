"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Video, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


// Import the video file

export default function Component() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [processLogs, setProcessLogs] = useState<string[]>([])
  const logContainerRef = useRef<HTMLDivElement>(null)

  const suggestedPrompts = [
    "Serene lake at sunset",
    "Cityscape with flying cars",
    "Magical glowing forest",
    "Colorful coral reef"
  ]

  const agentProcesses = [
    "Spawning Frame Agent 1...",
    "Spawning Frame Agent 2...",
    "Spawning Frame Agent 3...",
    "Spawning Frame Agent 4...",
    "Spawning Frame Agent 5...",
    "Spawning Audio Agent 1...",
    "Spawning Audio Agent 2...",
    "Spawning Audio Agent 3...",
    "Spawning Audio Agent 4...",
    "Spawning Audio Agent 5...",
    "Combining video frames...",
    "Synchronizing audio...",
    "Adding captions...",
    "Finalizing video..."
  ]

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [processLogs])

  const streamProcess = async () => {
    for (const process of agentProcesses) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 5000))
      setProcessLogs(prev => [...prev, process])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setVideoReady(false)
    setProcessLogs([])
    
    try {
      await streamProcess()
      await new Promise(resolve => setTimeout(resolve, 1000))
      setVideoReady(true)
    } catch (error) {
      console.error("Error generating video:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    const videoFile = 'src/assets/Signal video Aug 1.mp4';

    link.href = videoFile;
    link.download = 'Signal video Aug 1.mp4'; // Set the download file name
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link); // Clean up the element
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 flex items-center justify-center">
            AI Video Generator <span className="ml-2">🎥✨</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">Enter your prompt and watch the magic happen! 🪄</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Label htmlFor="prompt" className="sr-only">
              Video Prompt
            </Label>
            <Input
              id="prompt"
              name="prompt"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-700 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 sm:text-sm bg-white"
              placeholder="Enter your video prompt 💡"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((suggestedPrompt, index) => (
                <button
                  key={index}
                  type="button"
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200 ease-in-out"
                  onClick={() => setPrompt(suggestedPrompt)}
                >
                  {suggestedPrompt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  Generating...
                </span>
              ) : (
                <span className="flex items-center">
                  Generate Video <Video className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              className="w-20 h-20 border-t-4 border-b-4 border-blue-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="text-gray-800 text-lg font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Generating your video... 🎬
            </motion.div>
            <motion.div className="flex space-x-2 mt-4">
              {["🎨", "🎵", "🌟"].map((emoji, index) => (
                <motion.div
                  key={index}
                  className="text-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                >
                  {emoji}
                </motion.div>
              ))}
            </motion.div>
            <div 
              ref={logContainerRef}
              className="mt-4 w-full max-h-40 overflow-y-auto text-left bg-gray-100 p-2 rounded-md"
            >
              <AnimatePresence>
                {processLogs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-green-600 text-sm mb-1"
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {videoReady && (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-green-600 font-semibold mb-4">Video generated successfully! 🎉</p>
            <Button
              onClick={handleDownload}
              className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <span className="flex items-center">
                Download Video <Download className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}