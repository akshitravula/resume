import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mic, MicOff, User, FileUp, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MultiSelect } from "@/components/ui/multi-select";

export function PostSignUpModal({ isOpen, onClose }) {
  const [industries, setIndustries] = useState(["tech"]);
  const [level, setLevel] = useState("entry");
  const [brief, setBrief] = useState("");
  const [fileName, setFileName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState('');
  const audioChunks = useRef([]);

  const industryOptions = [
    { id: "consulting", label: "Consulting" },
    { id: "finance", label: "Finance" },
    { id: "product", label: "Product" },
    { id: "tech", label: "Tech" }
  ];

  const levelOptions = [
    { id: "entry", label: "Entry (0-2y)" },
    { id: "mid", label: "Mid (3-5y)" },
    { id: "senior", label: "Senior (5y+)" }
  ];

  // Cleanup function
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const startRecording = async () => {
    try {
      // Check if browser supports Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
        return;
      }

      console.log('Starting speech recognition...');
      
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let finalTranscript = '';
      let interimTranscript = '';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        interimTranscript = '';
        finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the brief with current transcription
        const currentText = finalTranscript + interimTranscript;
        setTranscript(currentText);
        setBrief(currentText.trim());
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMessage = 'Speech recognition error: ';
        switch(event.error) {
          case 'no-speech':
            errorMessage += 'No speech detected. Please try speaking louder.';
            break;
          case 'audio-capture':
            errorMessage += 'No microphone found or permission denied.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage += 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage += event.error;
        }
        alert(errorMessage);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        setRecognition(null);
        
        // Finalize the transcript
        if (transcript.trim()) {
          setBrief(transcript.trim());
        }
      };

      recognition.start();
      setRecognition(recognition);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Error starting speech recognition: ' + error.message);
    }
  };

  const stopRecording = () => {
    console.log('Stopping speech recognition...');
    if (recognition) {
      recognition.stop();
    }
  };



  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    if (industries.length === 0) {
      alert("Please select at least one industry.");
      return;
    }

    // Close modal and pass the industries back to dashboard
    onClose(industries);
  };

  const handleClose = () => {
    // Stop recording if active
    if (isRecording && recognition) {
      recognition.stop();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="w-full max-w-4xl h-[95vh] flex flex-col">
        <Card className="relative shadow-xl flex-1 flex flex-col">


          {/* Header - Compact */}
          <CardHeader className="text-center pb-3 pt-6 px-6 flex-shrink-0">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <User className="text-white text-lg" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-1">
              Build Your Resume
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Provide some basic information to get started
            </p>
          </CardHeader>

          {/* Content - Flexible height */}
          <CardContent className="flex-1 px-6 pb-6 flex flex-col min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              
              {/* Left Column */}
              <div className="space-y-4">
                {/* Industry Selection */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2 text-sm">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <MultiSelect
                    options={industryOptions.map(i => ({ value: i.id, label: i.label }))}
                    onValueChange={setIndustries}
                    defaultValue={industries}
                    placeholder="Select industries..."
                    className="w-full"
                  />
                </div>

                {/* Level Selection */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2 text-sm">
                    Experience Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {levelOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setLevel(option.id)}
                        className={`p-2.5 rounded-lg border-2 font-medium transition-all duration-200 text-xs ${
                          level === option.id
                            ? 'border-blue-400 bg-blue-50 text-blue-600'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload - Optional */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2 text-sm">
                    Upload Cover Letter or Resume <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-4 py-4">
                    <div className="text-center">
                      <FileUp className="mx-auto h-6 w-6 text-gray-400" />
                      <div className="mt-1 text-xs text-gray-600">
                        <label
                          htmlFor="file-upload-modal"
                          className="cursor-pointer font-semibold text-blue-600 hover:text-blue-500"
                        >
                          {fileName || "Upload file"}
                          <input 
                            id="file-upload-modal" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx"
                          />
                        </label>
                        <span className="ml-1">or drag</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PDF/DOC up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Brief About You */}
              <div className="flex flex-col">
                <label className="block font-semibold text-gray-700 mb-2 text-sm">
                  Brief About You <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {/* Record Button in a Square */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4">
                      <Button
                        type="button"
                        size="lg"
                        className={`h-16 w-16 rounded-full transition-all duration-200 shadow-lg text-sm font-medium ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-200'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200'
                        }`}
                        onClick={handleMicClick}
                        aria-label={isRecording ? "Stop recording" : "Start recording"}
                      >
                        {isRecording ? (
                          <MicOff className="h-8 w-8" />
                        ) : (
                          <Mic className="h-8 w-8" />
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        {isRecording ? "Recording..." : "Record"}
                      </p>
                    </div>
                  </div>

                  {/* Content Box */}
                  <div className="flex-1 flex flex-col">
                    <textarea
                      placeholder="Type your professional summary here or use the Record button to the left..."
                      className="flex-1 w-full p-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none resize-none text-sm leading-5 min-h-[200px]"
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {brief ? 'You can edit the text above or use Record button to replace it' : 'Use the Record button to the left for voice input'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Only Continue button */}
            <div className="flex justify-center pt-4 mt-4 border-t border-gray-100 flex-shrink-0">
              <Button 
                type="button" 
                onClick={handleSubmit} 
                className="px-8 py-2"
                disabled={industries.length === 0 || !brief.trim()}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PostSignUpModal;