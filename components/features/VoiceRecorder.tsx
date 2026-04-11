"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2 } from "lucide-react"

export default function VoiceRecorder({ onAudioReady }: { onAudioReady: (blob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioReady(audioBlob);
        // Turn off the mic indicator in the browser tab
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied or failed:", error);
      alert("Could not access the microphone. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isRecording ? (
        <div className="flex items-center gap-3">
          <Button 
            onClick={stopRecording}
            variant="destructive" 
            size="icon" 
            className="rounded-full h-12 w-12 animate-pulse shadow-md shadow-red-500/20"
          >
            <Square className="h-5 w-5 fill-current" />
          </Button>
          <span className="text-sm font-medium text-destructive animate-pulse">
            Listening to your thoughts...
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Button 
            onClick={startRecording}
            variant="secondary" 
            size="icon" 
            className="rounded-full h-12 w-12 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            Tap to record
          </span>
        </div>
      )}
    </div>
  );
}