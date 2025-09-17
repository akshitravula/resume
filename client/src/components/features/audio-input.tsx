import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Square, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioInputProps {
  onTranscription: (text: string) => void;
  isRecording?: boolean;
  placeholder?: string;
}

export function AudioInput({ onTranscription, placeholder = "Click to start recording..." }: AudioInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        transcribeAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Simulate transcription - in production, you'd send to a speech-to-text service
      // like Google Speech API, Azure Speech, or OpenAI Whisper
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transcription result
      const mockTranscriptions = [
        "I am a software engineer with 5 years of experience in React and Node.js development.",
        "I led a team of 8 developers and increased application performance by 40%.",
        "My core skills include JavaScript, Python, AWS, and project management.",
        "I have experience in agile development, code reviews, and mentoring junior developers.",
        "I am passionate about creating scalable applications and solving complex problems."
      ];
      
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      
      onTranscription(randomTranscription);
      
      toast({
        title: "Transcription complete",
        description: "Your speech has been converted to text"
      });
      
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: "Please try recording again",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <Badge variant="destructive">
                Recording {formatTime(recordingTime)}
              </Badge>
            </div>
          )}

          {/* Transcription Status */}
          {isTranscribing && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <Badge variant="secondary">
                Converting speech to text...
              </Badge>
            </div>
          )}

          {/* Main Controls */}
          <div className="flex items-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isTranscribing}
                className="flex items-center space-x-2"
                size="lg"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center space-x-2"
                size="lg"
              >
                <Square className="w-5 h-5" />
                <span>Stop Recording</span>
              </Button>
            )}

            {/* Playback Controls */}
            {audioBlob && !isRecording && (
              <div className="flex items-center space-x-2">
                {!isPlaying ? (
                  <Button
                    onClick={playRecording}
                    variant="outline"
                    size="sm"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={pausePlayback}
                    variant="outline"
                    size="sm"
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                )}
                <span className="text-sm text-gray-600">
                  Playback recording
                </span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-gray-600 max-w-md">
            {!isRecording && !audioBlob && (
              <p>{placeholder}</p>
            )}
            {isRecording && (
              <p>Speak clearly and naturally. Describe your experience, skills, or any resume content.</p>
            )}
            {audioBlob && !isTranscribing && (
              <p>Recording complete! The transcribed text will be added to your resume section.</p>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium text-blue-900 mb-1">Voice Input Tips:</h4>
            <ul className="text-blue-800 space-y-1">
              <li>• Speak in a quiet environment for best results</li>
              <li>• Describe your experience in detail</li>
              <li>• Include specific achievements and metrics</li>
              <li>• You can edit the transcribed text afterward</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}