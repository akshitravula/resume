import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2, Mic } from "lucide-react";
import { VoiceInputModal } from "./voice-input-modal";


interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  onSuggestion?: (suggestion: string) => void;
  onClose: () => void;
}

export function Chatbot({ onSuggestion, onClose }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "How may I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };



  const getBotResponse = async (userMessage: string): Promise<string> => {
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const message = userMessage.toLowerCase();
    
    // Enhanced responses with more comprehensive advice
    if (message.includes('summary') || message.includes('objective') || message.includes('about me')) {
      return "Professional Summary Guide:\n\nYour summary is the first thing recruiters see! Here's how to make it powerful:\n\n• Structure (3-4 lines): Your title + years of experience, key achievements, core skills, career goals\n• Use numbers and metrics where possible\n• Include keywords from job descriptions\n• Keep it conversational yet professional\n• Avoid generic phrases like 'hard-working'\n\nExample: 'Experienced Software Engineer with 5+ years developing scalable web applications. Led teams of 8+ developers, delivering projects 20% ahead of schedule. Expert in React, Node.js, and cloud architecture. Seeking to leverage technical leadership skills in a senior engineering role.'\n\nWant me to help you craft a specific summary for your industry?";
    }
    
    if (message.includes('experience') || message.includes('work history') || message.includes('job description')) {
      return "Work Experience Mastery:\n\nMake your experience section irresistible with the STAR method:\n\n• Situation: Set the context\n• Task: Describe your responsibility\n• Action: Explain what you did\n• Result: Quantify the outcome\n\nPower verbs to use:\n• Leadership: Led, Managed, Directed, Coordinated\n• Achievement: Achieved, Exceeded, Delivered, Accomplished\n• Innovation: Developed, Created, Designed, Implemented\n• Problem-solving: Resolved, Optimized, Streamlined, Enhanced\n\nQuantify everything:\n• 'Managed team' → 'Led team of 12 developers'\n• 'Increased sales' → 'Boosted sales by 35% in 6 months'\n• 'Improved process' → 'Reduced processing time by 40%'\n\nBest practices:\n• 3-5 bullet points per role\n• Start each with an action verb\n• Focus on achievements, not duties\n• Include relevant technologies/tools\n\nNeed help rewriting a specific job description?";
    }
    
    if (message.includes('skills') || message.includes('technical') || message.includes('abilities')) {
      return "Skills Section Strategies:\n\nOrganize your skills strategically to catch recruiters' attention:\n\nTechnical Skills Categories:\n• Programming Languages: Python, JavaScript, Java\n• Frameworks/Libraries: React, Angular, Node.js\n• Databases: PostgreSQL, MongoDB, Redis\n• Cloud/DevOps: AWS, Docker, Kubernetes\n• Tools: Git, JIRA, Figma, Slack\n\nSoft Skills (Include 3-5):\n• Leadership & Team Management\n• Cross-functional Collaboration\n• Problem-solving & Analytical Thinking\n• Communication & Presentation\n• Project Management & Planning\n\nIndustry-Specific Skills:\n• Tech: Agile, CI/CD, API Design, Microservices\n• Marketing: SEO, Google Analytics, A/B Testing\n• Finance: Financial Modeling, Risk Analysis, Excel\n• Healthcare: Patient Care, HIPAA Compliance, EMR\n\nPro Tips:\n• Match skills to job requirements (80% overlap)\n• Rate proficiency levels (Expert, Advanced, Intermediate)\n• Group similar skills together\n• Put most relevant skills first\n\nWhat industry are you targeting? I can suggest specific skills!";
    }
    
    if (message.includes('format') || message.includes('template') || message.includes('layout') || message.includes('design')) {
      return "Resume Format & Design Guide:\n\nChoose the right format to showcase your strengths:\n\nFormat Types:\n• Chronological: Best for consistent career progression\n• Functional: Highlights skills over work history\n• Combination: Balances skills and experience\n• Creative: For design/marketing roles only\n\nATS-Friendly Formatting:\n• Standard fonts: Arial, Calibri, Times New Roman\n• Font size: 10-12pt for body, 14-16pt for headings\n• Margins: 0.5-1 inch on all sides\n• File format: PDF (preserves formatting)\n• Length: 1-2 pages maximum\n\nSection Order:\n1. Contact Information\n2. Professional Summary\n3. Core Skills/Technical Skills\n4. Work Experience\n5. Education\n6. Additional Sections (Certifications, Projects)\n\nDesign Elements:\n• Use consistent spacing and alignment\n• Add subtle color accents (1-2 colors max)\n• Include white space for readability\n• Use bullet points for easy scanning\n• Bold section headers and company names\n\nAvoid: Tables, graphics, images, fancy fonts, multiple columns, headers/footers\n\nWant recommendations for your specific industry?";
    }
    
    if (message.includes('ats') || message.includes('applicant tracking') || message.includes('keywords')) {
      return "ATS Optimization Guide:\n\nBeat the robots and get your resume seen by humans:\n\nKeyword Strategy:\n• Extract 10-15 keywords from job descriptions\n• Use exact phrases when possible\n• Include industry-specific terminology\n• Add skill variations (e.g., 'JavaScript' and 'JS')\n• Incorporate keywords naturally throughout\n\nATS-Friendly Elements:\n• Standard section headings ('Experience' not 'Professional Journey')\n• Chronological format with clear dates\n• Company names, job titles, and locations\n• Simple bullet points (• or -)\n• Plain text formatting\n\nKeyword Placement Priority:\n1. Professional Summary (most important)\n2. Skills Section (exact matches)\n3. Job Descriptions (contextual usage)\n4. Job Titles (when accurate)\n\nIndustry Examples:\n• Tech: Agile, Scrum, API, Git, React, Python\n• Marketing: SEO, SEM, Google Analytics, CRM\n• Sales: Lead Generation, CRM, B2B, Pipeline\n• Finance: Financial Analysis, Excel, SQL, Tableau\n\nATS Testing:\n• Use simple file names: 'FirstName_LastName_Resume.pdf'\n• Test readability by copying/pasting text\n• Check that all text is selectable\n• Avoid images with embedded text\n\nPaste a job description and I'll identify key terms!";
    }
    
    if (message.includes('help') || message.includes('improve') || message.includes('what can you')) {
      return "I'm Your Complete Resume & Career Assistant!\n\nI can help you with everything from resume writing to landing your dream job:\n\nResume Building:\n• Professional summary optimization\n• Work experience enhancement with STAR method\n• Skills section organization and keyword optimization\n• ATS-friendly formatting and design advice\n• Industry-specific template recommendations\n\nJob Search Strategy:\n• Keyword analysis for job descriptions\n• Cover letter writing and customization\n• LinkedIn profile optimization\n• Application tracking and follow-up strategies\n\nInterview Preparation:\n• Common interview questions and STAR responses\n• Technical interview preparation\n• Behavioral interview strategies\n• Questions to ask interviewers\n• Body language and presentation tips\n\nCareer Advancement:\n• Salary negotiation tactics and scripts\n• Career transition planning\n• Professional development recommendations\n• Networking strategies\n\nTechnical Assistance:\n• ATS optimization and keyword matching\n• Industry-specific advice for Tech, Healthcare, Finance, Marketing, etc.\n• Resume scoring and improvement suggestions\n• Template selection based on your field\n\nJust Ask Me:\n• 'Help me write a summary for [your role]'\n• 'How do I describe [specific experience]?'\n• 'What skills should I include for [industry]?'\n• 'Review my resume for [job title]'\n• 'Prepare me for [company] interview'\n\nQuick Commands:\nType 'summary help', 'experience tips', 'interview prep', 'salary advice', or describe your specific situation!\n\nWhat would you like to work on first?";
    }
    
    // Default response with more personality
    return "Interesting question! I'd love to give you targeted advice! Here are some ways I can help you:\n\nQuick Wins:\n• Paste a job description for keyword analysis\n• Share your current summary for improvement suggestions\n• Ask about specific resume sections (experience, skills, etc.)\n• Get industry-specific advice\n• Practice interview responses\n\nPopular Topics:\n• 'How do I write a professional summary?'\n• 'Help me describe my work experience better'\n• 'What skills should I include?'\n• 'How can I make my resume ATS-friendly?'\n• 'Prepare me for interviews'\n\nPro Tip: The more specific your question, the better I can help!\n\nWhat specific aspect of your job search would you like to tackle first?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    addMessage(userMessage, 'user');
    setIsTyping(true);

    try {
      const botResponse = await getBotResponse(userMessage);
      addMessage(botResponse, 'bot');
    } catch (error) {
      addMessage("I'm sorry, I encountered an error. Please try again.", 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim()) {
      setInputValue(transcript.trim());
      // Auto-send voice input
      setTimeout(() => {
        if (transcript.trim()) {
          addMessage(transcript.trim(), 'user');
          setIsTyping(true);
          getBotResponse(transcript.trim()).then(response => {
            addMessage(response, 'bot');
            setIsTyping(false);
          });
        }
      }, 100);
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
              <CardHeader className="handle flex flex-row items-center justify-between p-4 bg-primary text-white rounded-t-lg cursor-move">
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
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                            {message.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                            <div className="text-sm whitespace-pre-line">{message.content}</div>
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
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                    <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Improve my summary")}>Improve summary</Button>
                    <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Find ATS keywords for this job description")}>ATS keywords</Button>
                    <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Suggest action verbs")}>Action verbs</Button>
                    <Button variant="outline" size="sm" onClick={() => handleSuggestionClick("Review my work experience")}>Review experience</Button>
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
                    <Button onClick={() => setIsVoiceModalOpen(true)} size="icon" variant="outline">
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