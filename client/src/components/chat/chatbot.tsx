import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, X, Mic, MicOff } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  text: string;
  type: "sent" | "received" | "system";
  timestamp: Date;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected";

// Mock Resume type for demo
interface Resume {
  id?: string;
  name?: string;
  // Add other resume fields as needed
}

interface ChatbotProps {
  resumeId: string | undefined;
  data: Resume;
  setData: (x: Resume) => void;
  wsRef: React.MutableRefObject<WebSocket | null>;
}

export function Chatbot({ resumeId, data, setData, wsRef }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: `${Date.now()}-${Math.random()}`,
      sender: "bot",
      text: "How may I help you today?",
      type: "received",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [username, setUsername] = useState<string>("User");

  // Position state - start at bottom right
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: window.innerHeight - 516 }); // 384px width + 16px margin, 500px height + 16px margin
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const chatbotRef = useRef<HTMLDivElement>(null);

  // Update position when window resizes to keep it in bottom right area
  useEffect(() => {
    const handleResize = () => {
      if (!isOpen) return;
      
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const chatbotHeight = 500; // Fixed height of the chat window
      const chatbotWidth = 384; // w-96 = 384px
      const margin = 16;
      
      // Keep it in the bottom right area when window resizes
      setPosition(prev => ({
        x: Math.max(margin, Math.min(prev.x, windowWidth - chatbotWidth - margin)),
        y: Math.max(margin, Math.min(prev.y, windowHeight - chatbotHeight - margin))
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Reset position to bottom right when opening
  const handleOpen = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const chatbotHeight = 500;
    const chatbotWidth = 384; // w-96 = 384px
    const margin = 16;
    
    setPosition({
      x: windowWidth - chatbotWidth - margin,
      y: windowHeight - chatbotHeight - margin
    });
    setIsOpen(true);
  };

  // Dragging functions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!chatbotRef.current) return;
    
    const rect = chatbotRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const chatbotWidth = chatbotRef.current?.offsetWidth || 384; // w-96 = 384px
    const chatbotHeight = chatbotRef.current?.offsetHeight || 500;
    
    const constrainedX = Math.max(0, Math.min(windowWidth - chatbotWidth, newX));
    const constrainedY = Math.max(0, Math.min(windowHeight - chatbotHeight, newY));
    
    setPosition({ x: constrainedX, y: constrainedY });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!wsRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "resume_update":
            if (message.resume) setData(message.resume);
            break;
          case "chat": {
            const text = message.message?.trim();
            if (!text) return;
            const sender = message.username?.trim() || "Agent";
            setIsTyping(false);
            addMessage(sender, text, "received");
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    wsRef.current.addEventListener("message", handleMessage);

    return () => {
      wsRef.current?.removeEventListener("message", handleMessage);
    };
  }, [wsRef, setData]);

  // ====== Speech Recognition Setup ======
  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setInterimTranscript("");
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscriptLocal = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscriptLocal += transcript;
            }
          }

          setInterimTranscript(interimTranscriptLocal);

          if (finalTranscript.trim()) {
            setInputValue(prev => {
              const newValue = prev + finalTranscript;
              return newValue;
            });
            setInterimTranscript("");
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setInterimTranscript("");
          
          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            addSystemMessage("Microphone access denied. Please allow microphone access and try again.");
          } else if (event.error === 'network') {
            addSystemMessage("Network error. Please check your internet connection.");
          } else if (event.error === 'no-speech') {
            addSystemMessage("No speech detected. Please try again.");
          } else {
            addSystemMessage(`Speech recognition error: ${event.error}`);
          }
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          setInterimTranscript("");
        };
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        addSystemMessage("Failed to start speech recognition. Please try again.");
      }
    } else if (!recognitionRef.current) {
      addSystemMessage("Speech recognition is not supported in your browser.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => {
          startListening();
        })
        .catch((error) => {
          console.error('Microphone access denied:', error);
          addSystemMessage("Microphone access is required for voice input. Please allow access and try again.");
        });
    }
  };

  const addMessage = (
    sender: string,
    text: string,
    type: Message["type"]
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender,
        text,
        type,
        timestamp: new Date(),
      },
    ]);
  };

  const addSystemMessage = (text: string) => {
    addMessage("System", text, "system");
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    addMessage(username, text.trim(), "sent");
    setIsTyping(true);
    
   

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: "chat",
        username,
        message: text.trim(),
        timestamp: new Date().toISOString(),
      };
      try {
        wsRef.current.send(JSON.stringify(payload));
      } catch (error) {
        console.error("Failed to send message:", error);
        addSystemMessage("Failed to send message");
      }
    }
  };

  const handleSendMessage = () => {
    const messageToSend = inputValue.trim();
    if (messageToSend) {
      sendMessage(messageToSend);
      setInputValue("");
      setInterimTranscript("");
      if (isListening) {
        stopListening();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const displayValue = inputValue + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <>
      {/* Floating button when closed - positioned at bottom right */}
      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 w-16 h-16 rounded-full shadow-xl z-50"
          onClick={handleOpen}
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      )}
      
      {/* Draggable chat window */}
      {isOpen && (
        <div 
          ref={chatbotRef}
          className={`fixed z-50 ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            userSelect: isDragging ? 'none' : 'auto'
          }}
        >
          <Card className="w-96 shadow-xl h-[500px]">
            <CardHeader 
              className={`flex flex-row items-center justify-between p-4 bg-primary text-white rounded-t-lg ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <CardTitle className="text-lg">Resume Assistant</CardTitle>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-blue-600"
                onClick={() => setIsOpen(false)}
                onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking close
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[calc(100%-72px)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "sent"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === "sent"
                            ? "bg-primary text-white"
                            : message.type === "system"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === "received" && (
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          {message.type === "sent" && (
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="text-sm whitespace-pre-line">
                            {message.text}
                          </div>
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input
                      value={displayValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        isListening 
                          ? "🎙️ Listening... Speak now" 
                          : "Type a message or use voice input..."
                      }
                      className={`flex-1 ${
                        isListening 
                          ? 'bg-red-50 border-red-200 focus:border-red-400' 
                          : interimTranscript 
                          ? 'bg-blue-50 border-blue-200' 
                          : ''
                      }`}
                      disabled={isListening}
                    />
                    {isListening && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="flex space-x-1">
                          <div className="w-1 h-4 bg-red-500 rounded"></div>
                          <div className="w-1 h-3 bg-red-400 rounded"></div>
                          <div className="w-1 h-5 bg-red-600 rounded"></div>
                          <div className="w-1 h-2 bg-red-300 rounded"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon"
                    disabled={!inputValue.trim() && !interimTranscript.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={toggleVoiceInput}
                    size="icon"
                    variant={isListening ? "default" : "outline"}
                    className={`transition-all duration-200 ${
                      isListening 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isListening && (
                  <div className="text-xs text-red-600 mt-1 text-center">
                    🎙️ Listening... Click the microphone or send button to stop
                  </div>
                )}
                {interimTranscript && !isListening && (
                  <div className="text-xs text-blue-600 mt-1 text-center">
                    Transcript: {interimTranscript}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}