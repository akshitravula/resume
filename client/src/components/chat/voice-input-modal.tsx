
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface VoiceInputModalProps {
  onTranscript: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceInputModal({ onTranscript, isOpen, onClose }: VoiceInputModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            onTranscript(finalTranscript);
            onClose();
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Voice recognition error",
            description: "Please try again or check your microphone permissions.",
            variant: "destructive",
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };
      }
    }
  }, [onTranscript, toast, onClose]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
        toast({
          title: "Voice input started",
          description: "Speak now to add content to your resume.",
        });
      } catch (error) {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Please try again - speech recognition may already be active",
          variant: "destructive"
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Voice Input</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center h-48">
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="lg"
            onClick={isListening ? stopListening : startListening}
            className="transition-all duration-200 w-48"
          >
            {isListening ? (
              <>
                <Square className="mr-2 h-6 w-6" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-6 w-6" />
                Start Recording
              </>
            )}
          </Button>
          {isListening && (
            <div className="flex items-center space-x-2 mt-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-500">Recording...</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
