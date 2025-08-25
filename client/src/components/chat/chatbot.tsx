import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, X, Mic } from "lucide-react";
import { VoiceInputModal } from "./voice-input-modal";
import type { Resume } from "@/types/resume";

interface Message {
  id: string;
  sender: string;
  text: string;
  type: "sent" | "received" | "system";
  timestamp: Date;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface ChatbotProps {
  resumeId: string | undefined;
  data: Resume;
  setData: (x: Resume) => void;
}

export function Chatbot({ resumeId, data, setData }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: `${Date.now()}-${Math.random()}`,
      sender: "bot",
      text: "How may I help you today?",
      type: "received",
      timestamp: new Date(),
    },
  ]);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    "disconnected"
  );
  const [username, setUsername] = useState<string>("User");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    isMounted.current = true;
    connectWebSocket();
    return () => {
      isMounted.current = false;
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== WebSocket Handling ======>
  const connectWebSocket = () => {
    if (!resumeId) return;

    const WS_URL = `${BASE_URL}/resume-chat-ws/${resumeId}`;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus("connecting");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      if (wsRef.current) wsRef.current.close(1000, "Reconnecting");

      wsRef.current = new WebSocket(`${WS_URL}?token=${token}`);

      wsRef.current.onopen = () => {
        setConnectionStatus("connected");
        addSystemMessage("Connected to chat server");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "resume_update":
              if (message.resume) {
                setData(message.resume);
              }
              break;
            default: {
              const text = message.message?.trim();
              if (!text) return;
              const sender = message.username?.trim() || "Agent";
              setIsTyping(false);
              addMessage(sender, text, "received");
              break;
            }
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      wsRef.current.onclose = (event: CloseEvent) => {
        setConnectionStatus("disconnected");
        if (event.code !== 1000 && isMounted.current) {
          addSystemMessage(
            `Connection closed: ${event.reason || "Unknown reason"}`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              addSystemMessage("Attempting to reconnect...");
              connectWebSocket();
            }
          }, 3000);
        } else {
          addSystemMessage("Disconnected from chat server");
        }
      };

      wsRef.current.onerror = () => {
        setConnectionStatus("disconnected");
        addSystemMessage("Connection error occurred");
      };
    } catch {
      setConnectionStatus("disconnected");
      addSystemMessage("Failed to connect to server");
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
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
    if (!text.trim() || connectionStatus !== "connected") return;

    const messageData = {
      type: "chat",
      username,
      message: text.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      wsRef.current?.send(JSON.stringify(messageData));
      addMessage(username, text.trim(), "sent");
      setIsTyping(true);
    } catch {
      addSystemMessage("Failed to send message");
    }
  };

  const updateResume = () => {
    if (connectionStatus !== "connected") return;

    const messageData = {
      type: "save_resume",
      resume: data,
    };

    try {
      wsRef.current?.send(JSON.stringify(messageData));
    } catch (err) {
      console.error("Failed to send WebSocket message:", err);
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim()) {
      sendMessage(transcript.trim());
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 w-16 h-16 rounded-full shadow-xl z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="h-8 w-8" />
      </Button>
      {isOpen && (
        <div className="fixed z-50 bottom-4 right-4">
          <Card className={`w-96 shadow-xl h-[500px]`}>
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <CardTitle className="text-lg">Resume Assistant</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-blue-600"
                onClick={() => setIsOpen(false)}
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
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSuggestionClick("Improve my summary")
                    }
                  >
                    Improve summary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSuggestionClick(
                        "Find ATS keywords for this job description"
                      )
                    }
                  >
                    ATS keywords
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSuggestionClick("Suggest action verbs")
                    }
                  >
                    Action verbs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSuggestionClick("Review my work experience")
                    }
                  >
                    Review experience
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about resume writing..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setIsVoiceModalOpen(true)}
                    size="icon"
                    variant="outline"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <VoiceInputModal
                isOpen={isVoiceModalOpen}
                onClose={() => setIsVoiceModalOpen(false)}
                onTranscript={handleVoiceInput}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
