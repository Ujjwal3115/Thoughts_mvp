"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Send, Loader2 } from "lucide-react"

export default function Home() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This is the function that will eventually send your data to our API route
  const handleSaveEntry = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: We will replace this timeout with an actual fetch call to /api/ingest
      console.log("Saving entry to database:", content);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Faking network latency
      
      // Clear the text box after saving
      setContent("");
      
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSubmitting(false);
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

      <div className="flex-1 flex flex-col justify-end pb-4">
        <Card className="shadow-sm shadow-slate-200/50 dark:shadow-none border-muted/50 overflow-hidden">
          <CardContent className="p-0">
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing, or tap the mic to speak..." 
              className="min-h-[200px] border-0 focus-visible:ring-0 resize-none text-lg p-6 font-serif leading-relaxed bg-transparent"
            />
          </CardContent>
          
          <CardFooter className="flex justify-between items-center bg-muted/30 px-4 py-3 border-t border-muted/50">
            <div className="flex items-center gap-2">
              <Button 
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
            
            <Button 
              onClick={handleSaveEntry}
              disabled={isSubmitting || !content.trim()}
              className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Saving... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
              ) : (
                <>Save Entry <Send className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}