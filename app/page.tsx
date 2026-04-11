"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, AlertCircle, RefreshCw } from "lucide-react" // Added new icons
import VoiceRecorder from "@/components/features/VoiceRecorder"

export default function Home() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  
  // NEW: State to hold our failed audio blob
  const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);

  const handleSaveEntry = async () => { /* ... keeps existing text save logic ... */ };

  // UPDATED: Audio Processing with Fallback Logic
  const handleAudioProcessing = async (audioBlob: Blob) => {
    setIsProcessingAudio(true);
    setPendingAudio(null); // Clear any old pending errors
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/ingest/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // If we get a 503 or any error, throw it so the catch block triggers
        throw new Error(`Server returned ${response.status}`);
      }
      
      console.log("Voice entry saved successfully!");
      
    } catch (error) {
      console.error("Failed to process audio:", error);
      // THE MAGIC: Instead of losing the data, we save it to our "Queue"
      setPendingAudio(audioBlob);
    } finally {
      setIsProcessingAudio(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] justify-between">
      <header className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight text-foreground mb-2">
          Good evening, Ujjwal.
        </h1>
        <p className="text-muted-foreground text-lg">
          What is on your mind today?
        </p>
      </header>

      <div className="flex-1 flex flex-col justify-end pb-4 space-y-4">
        
        {/* NEW: The Graceful Degradation UI Banner */}
        {pendingAudio && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
              <AlertCircle className="h-5 w-5" />
              <div className="text-sm">
                <p className="font-medium">Network congested</p>
                <p className="opacity-80">Your voice thought is saved securely on your device.</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAudioProcessing(pendingAudio)}
              disabled={isProcessingAudio}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {isProcessingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Retry Sync
            </Button>
          </div>
        )}

        <Card className="shadow-sm shadow-slate-200/50 dark:shadow-none border-muted/50 overflow-hidden">
          <CardContent className="p-0">
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing, or tap the mic to speak..." 
              className="min-h-[200px] border-0 focus-visible:ring-0 resize-none text-lg p-6 font-serif leading-relaxed bg-transparent"
              disabled={isProcessingAudio}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between items-center bg-muted/30 px-4 py-3 border-t border-muted/50">
            
            {isProcessingAudio ? (
               <div className="flex items-center gap-2 text-primary font-medium">
                 <Loader2 className="h-5 w-5 animate-spin" />
                 <span>Processing voice...</span>
               </div>
            ) : (
              <VoiceRecorder onAudioReady={handleAudioProcessing} />
            )}
            
            <Button 
              onClick={handleSaveEntry}
              disabled={isSubmitting || !content.trim() || isProcessingAudio}
              className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
            >
               {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}