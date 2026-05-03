"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2, AlertCircle, RefreshCw, Mic, Square, ChevronDown } from "lucide-react"
import Navbar from "@/components/ui/Navbar"
import { PageDecorations, Heart } from "@/components/ui/Decorations"

export default function DiaryPage() {
  const [content, setContent] = useState("")
  const [diaryName, setDiaryName] = useState("Haven")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastEmotion, setLastEmotion] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  const handleSaveEntry = async () => {
    const trimmedContent = content.trim()
    if (!trimmedContent || isSubmitting || isProcessingAudio) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmedContent, modality: "text" }),
      })

      if (!response.ok) throw new Error(`Server returned ${response.status}`)
      
      const data = await response.json()
      setLastEmotion(data.entry?.dominant_emotion || null)
      setContent("")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        handleAudioProcessing(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Microphone access denied:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleAudioProcessing = async (audioBlob: Blob) => {
    setIsProcessingAudio(true)
    setPendingAudio(null)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.webm')
      const response = await fetch('/api/ingest/audio', { method: 'POST', body: formData })
      if (!response.ok) throw new Error(`Server returned ${response.status}`)
      
      const data = await response.json()
      setLastEmotion(data.entry?.dominant_emotion || null)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to process audio:", error)
      setPendingAudio(audioBlob)
    } finally {
      setIsProcessingAudio(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSaveEntry()
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-pink-bg)' }}
    >
      {/* Decorations */}
      <PageDecorations />

      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-3xl flex flex-col gap-6">

          {/* Success toast */}
          {showSuccess && (
            <div 
              className="sketch-box-thin p-4 flex items-center gap-3 animate-slide-up"
              style={{ background: '#E8F5E9', borderColor: '#4CAF50' }}
            >
              <span className="text-xl">✨</span>
              <div style={{ fontFamily: "'Courier New', monospace" }}>
                <p className="text-sm font-bold text-green-800">Thought saved successfully!</p>
                {lastEmotion && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Detected mood: <strong>{lastEmotion}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Retry banner for failed audio */}
          {pendingAudio && (
            <div 
              className="sketch-box-thin p-4 flex items-center justify-between animate-slide-up"
              style={{ background: '#FFF3E0', borderColor: '#FF9800' }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-orange-700" />
                <div style={{ fontFamily: "'Courier New', monospace" }}>
                  <p className="text-sm font-bold text-orange-800">Network congested</p>
                  <p className="text-xs text-orange-600">Your voice thought is saved on your device.</p>
                </div>
              </div>
              <button 
                className="sketch-btn-outline text-xs flex items-center gap-1"
                onClick={() => handleAudioProcessing(pendingAudio)}
                disabled={isProcessingAudio}
                style={{ padding: '6px 14px' }}
              >
                {isProcessingAudio ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Retry
              </button>
            </div>
          )}

          {/* The main diary card — styled like the mockup */}
          <div className="sketch-box-thick overflow-hidden">
            
            {/* Retro title bar */}
            <div className="retro-titlebar">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400 border border-red-600"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400 border border-green-600"></div>
                </div>
                <span>{diaryName}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <span className="text-[11px]">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Diary name editor */}
            <div 
              className="px-6 pt-4 pb-2 flex items-center gap-2"
              style={{ background: 'var(--color-cream)' }}
            >
              <input
                type="text"
                value={diaryName}
                onChange={(e) => setDiaryName(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none outline-none w-full"
                style={{ 
                  fontFamily: "var(--font-sketch, 'Courier New', monospace)",
                  color: '#1a1a1a'
                }}
                placeholder="Name your diary..."
              />
            </div>

            {/* Notebook area with ruled lines */}
            <div 
              className="notebook-lines px-6 py-2"
              style={{ 
                background: 'var(--color-cream)',
                minHeight: '300px'
              }}
            >
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share Your Feelings with Me..."
                disabled={isProcessingAudio}
                className="w-full bg-transparent border-none outline-none resize-none text-base leading-[32px]"
                style={{
                  fontFamily: "'Courier New', monospace",
                  minHeight: '256px',
                  lineHeight: '32px',
                  paddingTop: '0px',
                  color: '#1a1a1a'
                }}
              />
            </div>

            {/* Bottom toolbar */}
            <div 
              className="flex items-center justify-between px-6 py-3 border-t-2"
              style={{ 
                background: 'var(--color-cream-dark)',
                borderColor: '#1a1a1a'
              }}
            >
              {/* Voice recorder */}
              <div className="flex items-center gap-3">
                {isProcessingAudio ? (
                  <div className="flex items-center gap-2" style={{ fontFamily: "'Courier New', monospace" }}>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm font-bold">Processing voice...</span>
                  </div>
                ) : isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2 animate-pulse"
                    style={{ 
                      background: '#FFEBEE', 
                      border: '2px solid #EF5350',
                      fontFamily: "'Courier New', monospace",
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Square size={14} fill="#EF5350" color="#EF5350" />
                    Stop Recording
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 sketch-btn-outline"
                    style={{ padding: '6px 16px', fontSize: '13px' }}
                  >
                    <Mic size={14} />
                    Voice Entry
                  </button>
                )}
              </div>

              {/* Submit button */}
              <div className="flex items-center gap-3">
                {content.trim() && (
                  <span 
                    className="text-xs text-foreground/40 hidden sm:block"
                    style={{ fontFamily: "'Courier New', monospace" }}
                  >
                    Ctrl+Enter to save
                  </span>
                )}
                <button
                  onClick={handleSaveEntry}
                  disabled={isSubmitting || !content.trim() || isProcessingAudio}
                  className="sketch-btn flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {isSubmitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </div>
          </div>

          {/* Decorative footer */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Heart size={12} color="#FF8A80" />
            <span 
              className="text-[10px] text-foreground/40"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              your thoughts are private & encrypted
            </span>
            <Heart size={12} color="#FF8A80" />
          </div>
        </div>
      </div>
    </div>
  )
}
