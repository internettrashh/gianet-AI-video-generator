"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Video, Download, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


export default function Component() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [processLogs, setProcessLogs] = useState<string[]>([])
  const [agentStatus, setAgentStatus] = useState<{
    script: string;
    audio: string[];
    image: string[];
  }>({
    script: "idle",
    audio: ["idle", "idle", "idle", "idle", "idle"],
    image: ["idle", "idle", "idle", "idle", "idle"]
  });
  const logContainerRef = useRef<HTMLDivElement>(null)
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const areAllProcessesCompleted = (status: typeof agentStatus, compilerStatus: string[]) => {
    return status.script === "completed" &&
      status.audio.every(s => s === "completed") &&
      status.image.every(s => s === "completed") &&
      compilerStatus.every(s => s === "completed");
  };

  const suggestedPrompts = [
    "Serene lake at sunset",
    "Cityscape with flying cars",
    "Magical glowing forest",
    "Colorful coral reef"
  ]

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [processLogs])

  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
    }
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('https://vmi1968527.contaboserver.net/gaianet/status')
      const data = await response.json()
      setAgentStatus(data.agentStatus)
      updateProcessLogs(data.agentStatus, data.compilerStatus)
  
      if (areAllProcessesCompleted(data.agentStatus, data.compilerStatus)) {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
        setVideoReady(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const updateProcessLogs = (status: typeof agentStatus, compilerStatus: string[]) => {
    const newLogs: string[] = [];
    if (status.script !== "idle") newLogs.push(`Script Agent: ${status.script}`);
    status.audio.forEach((audioStatus, index) => {
      if (audioStatus !== "idle") newLogs.push(`Audio Agent ${index + 1}: ${audioStatus}`);
    });
    status.image.forEach((imageStatus, index) => {
      if (imageStatus !== "idle") newLogs.push(`Image Agent ${index + 1}: ${imageStatus}`);
    });
    compilerStatus.forEach((status, index) => {
      if (status !== "pending") newLogs.push(`Video Compilation Scene ${index + 1}: ${status}`);
    });
    if (newLogs.length > 0) {
      setProcessLogs(prev => [...prev, ...newLogs]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setVideoReady(false)
    setProcessLogs([])
  
    try {
      const generateResponse = await fetch('https://vmi1968527.contaboserver.net/gaianet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })
  
      if (!generateResponse.ok) {
        throw new Error('Failed to start video generation')
      }
  
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      statusIntervalRef.current = setInterval(fetchStatus, 10000)
  
    } catch (error) {
      console.error("Error generating video:", error)
      setIsLoading(false)
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current)
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('https://vmi1968527.contaboserver.net/gaianet/video')
      if (!response.ok) throw new Error('Failed to download video')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'generated-video.mp4'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading video:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 flex items-center justify-center">
            AI Video Generator <span className="ml-2">🎥✨</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">Enter your prompt and watch the magic happen! 🪄</p>
        </div>

        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription>
            <p>video generation takes time and you may be placed in a queue.</p>
            <p>Video generation can take up to 5-10 minutes.</p>
            <p className="font-bold">Please do not refresh or leave the page during the process.</p>
            <p>If the generate button doesn't respond, you may be in a queue. Please wait and try again later.</p>
          </AlertDescription>
        </Alert>

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