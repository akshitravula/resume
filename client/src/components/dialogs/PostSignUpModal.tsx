import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mic, MicOff, User, FileUp, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest,apiFileRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Custom MultiSelect component with working cross buttons
function MultiSelect({ options, onValueChange, defaultValue, placeholder, className }) {
  const [selectedValues, setSelectedValues] = useState(defaultValue || []);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (defaultValue) {
      setSelectedValues(defaultValue);
    }
  }, [defaultValue]);

  const handleToggleOption = (optionValue) => {
    let newValues;
    if (selectedValues.includes(optionValue)) {
      newValues = selectedValues.filter(v => v !== optionValue);
    } else {
      newValues = [...selectedValues, optionValue];
    }
    setSelectedValues(newValues);
    onValueChange(newValues);
  };

  const handleRemoveItem = (valueToRemove, e) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    setSelectedValues(newValues);
    onValueChange(newValues);
  };

  const getSelectedLabels = () => {
    return options
      .filter(option => selectedValues.includes(option.value))
      .map(option => option.label);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected items display */}
      <div
        className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2 flex-1">
          {selectedValues.length === 0 ? (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          ) : (
            selectedValues.map((value) => {
              const option = options.find(opt => opt.value === value);
              return (
                <span
                  key={value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                >
                  {option?.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveItem(value, e)}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown options with very high z-index */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[99999] mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${
                selectedValues.includes(option.value) ? 'bg-blue-50 text-blue-700' : ''
              }`}
              onClick={() => handleToggleOption(option.value)}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => {}} // Controlled by onClick
                className="rounded border-gray-300"
              />
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PostSignUpModal({ 
  isOpen, 
  onClose, 
  savedData = null,
  onSaveData = null
}) {
  // Initialize state with saved data or defaults
  const { user, loading } = useAuth();
  const [industries, setIndustries] = useState(savedData?.industries || ["tech"]);
  const [level, setLevel] = useState(savedData?.level || "entry");
  const [brief, setBrief] = useState(savedData?.brief || "");
  const [fileName, setFileName] = useState(savedData?.fileName || "");
  const [isRecording, setIsRecording] = useState(false);
  const [file, setFile] = useState(null);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Refs for speech recognition
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const isRecordingRef = useRef(false);
    const { toast } = useToast();

  const industryOptions = [
    { value: "consulting", label: "Consulting" },
    { value: "finance", label: "Finance" },
    { value: "product", label: "Product" },
    { value: "tech", label: "Tech" }
  ];

  const levelOptions = [
    { id: "entry", label: "Entry (0-2y)" },
    { id: "mid", label: "Mid (3-5y)" },
    { id: "senior", label: "Senior (5y+)" }
  ];

  // Show notification
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };


  async function getUserPreferences() {
      if (!user) return;
  
      try {
        const response = await apiRequest("GET", `/api/user/get-preferences`);
  
        // console.log(response);
        
        if (response) {
          setIndustries(response.industries || []);
          setBrief(response.brief || "");
          setLevel(response.level || "entry");
          setFileName(response.fileName || "");
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    }
  
    useEffect(() => {
      getUserPreferences();
    }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSpeechSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        showNotification('Listening... Speak now!', 'success');
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = transcriptRef.current;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        transcriptRef.current = finalTranscript;
        const fullText = finalTranscript + interimTranscript;
        setBrief(fullText.trim());
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsListening(false);
        isRecordingRef.current = false;
        
        let errorMessage = 'Speech recognition error occurred.';
        switch(event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during speech recognition.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        showNotification(errorMessage, 'error');
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (isRecordingRef.current) {
          // If we're still supposed to be recording, restart
          setTimeout(() => {
            if (isRecordingRef.current) {
              recognition.start();
            }
          }, 100);
        }
      };
      
      recognitionRef.current = recognition;
      setSpeechRecognition(recognition);
    } else {
      setSpeechSupported(false);
      showNotification('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.', 'error');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Auto-save data whenever any field changes
  useEffect(() => {
    const dataToSave = {
      industries,
      level,
      brief,
      fileName,
      lastUpdated: new Date().toISOString()
    };
    
    if (onSaveData) {
      onSaveData(dataToSave);
    }
  }, [industries, level, brief, fileName, onSaveData]);

  // Load saved data when modal opens
  useEffect(() => {
    if (isOpen && savedData) {
      setIndustries(savedData.industries || ["tech"]);
      setLevel(savedData.level || "entry");
      setBrief(savedData.brief || "");
      setFileName(savedData.fileName || "");
      transcriptRef.current = savedData.brief || '';
    }
  }, [isOpen, savedData]);

  // Start/Stop Recording
  const handleMicClick = () => {
    if (!speechSupported) {
      showNotification('Speech recognition is not supported in this browser.', 'error');
      return;
    }

    if (isRecording) {
      // Stop recording
      isRecordingRef.current = false;
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      showNotification('Recording stopped.', 'info');
    } else {
      // Start recording
      isRecordingRef.current = true;
      setIsRecording(true);
      transcriptRef.current = brief; // Keep existing text
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error starting recognition:', error);
          setIsRecording(false);
          isRecordingRef.current = false;
          showNotification('Failed to start recording. Please try again.', 'error');
        }
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10 MB limit
        showNotification('File size exceeds 10 MB limit.', 'error');
        e.target.value = "";
        return;
      }
      console.log("Selected file:", selectedFile);
      setFileName(selectedFile.name);
      setFile(selectedFile);
      showNotification(`File "${selectedFile.name}" uploaded successfully.`, 'success');
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (industries.length === 0) {
  //     showNotification('Please select at least one industry.', 'error');
  //     return;
  //   }

  //   if (!brief.trim()) {
  //     showNotification('Please provide a brief about yourself.', 'error');
  //     return;
  //   }

  //   // Stop recording if still active
  //   if (isRecording) {
  //     isRecordingRef.current = false;
  //     setIsRecording(false);
  //     if (recognitionRef.current) {
  //       recognitionRef.current.stop();
  //     }
  //   }

  //   showNotification('Your preferences have been saved successfully!', 'success');
    
  //   // Simulate saving and navigation
  //   setTimeout(() => {
  //     if (onClose) {
  //       onClose({
  //         industries,
  //         level,
  //         brief,
  //         fileName,
  //         file
  //       });
  //     }
  //   }, 1500);
  // };


   const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (industries.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please select at least one industry.",
          variant: "destructive"
        });
        return;
      }
  
     if (user) {
    try {
      const payload: Record<string, unknown> = {};
  
      if (industries && industries.length > 0) payload.industries = industries;
      if (brief && brief.length > 0) payload.brief = brief;
      if (level && level.trim().length > 0) payload.level = level;
      
      
      // build FormData
      const formData = new FormData();
      formData.append("preferences", JSON.stringify(payload)); // send JSON as string
      if (file) formData.append("file", file);
      
      // console.log("Form :", [...formData.entries()]);
      await apiFileRequest("PATCH", `/api/user/set-preference`, formData);
  
      showNotification('Your preferences have been saved successfully!', 'success');

       if (onClose) {
        onClose({
          industries,
          level,
          brief,
          fileName,
          file
        })}
    

      // setLocation("/dashboard?new-user=true");
    } catch (error) {
      console.error("Error updating user info:", error);
      toast({
        title: "Error",
        description: "Failed to save your information.",
        variant: "destructive",
      });
    }
  }
  
    };

  const clearBrief = () => {
    setBrief('');
    transcriptRef.current = '';
    if (isRecording) {
      isRecordingRef.current = false;
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
    showNotification('Text cleared.', 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99998] p-3">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-[99999] space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm max-w-sm ${
              notification.type === 'error' ? 'bg-red-500' :
              notification.type === 'success' ? 'bg-green-500' :
              'bg-blue-500'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <div className="w-full max-w-4xl h-[95vh] flex flex-col z-[99999]">
        <Card className="relative shadow-xl flex-1 flex flex-col">
          {/* Header - Compact */}
          <CardHeader className="text-center pb-3 pt-6 px-6 flex-shrink-0">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <User className="text-white text-lg" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-1">
              Build Your Resume
            </CardTitle>
            <p className="text-gray-600 text-sm">
              To build your resume, I would need some basic information from your side.
            </p>
          </CardHeader>

          {/* Content - Flexible height */}
          <CardContent className="flex-1 px-6 pb-6 flex flex-col min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              
              {/* Left Column */}
              <div className="space-y-4">
                {/* Industry Selection */}
                <div className="multi-select-container">
                  <label className="block font-semibold text-gray-700 mb-2 text-sm">
                    Industry you are in <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    So that I can make that resume for you.
                  </p>
                  <MultiSelect
                    options={industryOptions}
                    onValueChange={setIndustries}
                    defaultValue={industries}
                    placeholder="Select industries..."
                    className="w-full"
                  />
                </div>

                {/* Level Selection */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2 text-sm">
                    What is your experience level? <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    This will help me tailor the resume to your experience.
                  </p>
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
                    Upload your cover letter or existing resume <span className="text-gray-400 font-normal">(Optional)</span>
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
                  Brief about you <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Tell us about yourself using voice message or type below
                </p>
                
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      size="lg"
                      className={`h-16 w-32 rounded-full transition-colors duration-200 shadow-lg text-sm font-medium ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200 animate-pulse'
                          : speechSupported
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200'
                            : 'bg-gray-400 cursor-not-allowed text-white'
                      }`}
                      onClick={handleMicClick}
                      disabled={!speechSupported}
                      aria-label={isRecording ? "Stop recording" : "Start recording"}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-5 w-5 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Mic className="h-5 w-5 mr-2" />
                          Record
                        </>
                      )}
                    </Button>
                    
                    {brief && !isRecording && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearBrief}
                        className="text-xs px-3 py-2"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  {/* Recording Status */}
                  {isRecording && (
                    <div className="flex items-center justify-center space-x-2 text-red-500 mt-3">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-xs font-medium">
                        {isListening ? 'Listening...' : 'Starting...'}
                      </span>
                    </div>
                  )}

                  {/* Speech Recognition Status */}
                  {!speechSupported && (
                    <p className="text-xs text-red-500 mt-2">
                      Speech recognition not supported. Please type your response below.
                    </p>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <textarea
                    placeholder="Type your professional summary here or use the Record button above to speak..."
                    className="flex-1 w-full p-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none resize-none text-sm leading-5 min-h-[200px]"
                    value={brief}
                    onChange={(e) => {
                      setBrief(e.target.value);
                      transcriptRef.current = e.target.value;
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {isRecording ? 
                      'Recording... Speak now and your words will appear above' : 
                      brief ? 
                        'You can edit the text above or use Record button to add more' : 
                        'Use the Record button above for voice input or type directly here'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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

// Demo component to show how to use the modal
function DemoDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [savedFormData, setSavedFormData] = useState(null);

  const handleModalClose = (submittedData) => {
    console.log('Form submitted with data:', submittedData);
    setIsModalOpen(false);
  };

  const handleSaveData = (data) => {
    setSavedFormData(data);
    console.log('Data auto-saved:', data);
  };

  const reopenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Resume Builder Demo</h1>
        
        {savedFormData && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Saved Data Preview:</h3>
            <div className="text-left text-sm text-gray-600">
              <p><strong>Industries:</strong> {savedFormData.industries?.join(', ')}</p>
              <p><strong>Level:</strong> {savedFormData.level}</p>
              <p><strong>Brief:</strong> {savedFormData.brief?.substring(0, 100)}...</p>
              <p><strong>File:</strong> {savedFormData.fileName || 'None'}</p>
              <p><strong>Last Updated:</strong> {savedFormData.lastUpdated ? new Date(savedFormData.lastUpdated).toLocaleString() : 'Never'}</p>
            </div>
          </div>
        )}
        
        <Button onClick={reopenModal} className="mb-4">
          {savedFormData ? 'Edit Resume Data' : 'Open Resume Builder'}
        </Button>
        
        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">How to use Speech Recognition:</h4>
          <ul className="text-left space-y-1">
            <li>• Click the "Record" button to start speaking</li>
            <li>• Speak clearly and at normal pace</li>
            <li>• Your speech will appear as text in real-time</li>
            <li>• Click "Stop" to finish recording</li>
            <li>• You can edit the text or record again to add more</li>
            <li>• Works best in Chrome, Edge, or Safari browsers</li>
          </ul>
        </div>
      </div>

      <PostSignUpModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        savedData={savedFormData}
        onSaveData={handleSaveData}
      />
    </div>
  );
}

export default DemoDashboard;