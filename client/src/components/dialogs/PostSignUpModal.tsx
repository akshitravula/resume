import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mic, MicOff, User, FileUp, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
  savedData = null,  // Accept previously saved data
  onSaveData = null  // Callback to save data to parent component
}) {
  // Initialize state with saved data or defaults
  const [industries, setIndustries] = useState(savedData?.industries || ["tech"]);
  const [level, setLevel] = useState(savedData?.level || "entry");
  const [brief, setBrief] = useState(savedData?.brief || "");
  const [fileName, setFileName] = useState(savedData?.fileName || "");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // Store final and interim transcripts separately
  const finalTranscriptRef = useRef(savedData?.brief || '');
  const audioChunks = useRef([]);

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

  // Auto-save data whenever any field changes
  useEffect(() => {
    const dataToSave = {
      industries,
      level,
      brief,
      fileName,
      lastUpdated: new Date().toISOString()
    };
    
    // Save data to parent component if callback is provided
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
      finalTranscriptRef.current = savedData.brief || '';
    }
  }, [isOpen, savedData]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.multi-select-container')) {
        // Close any open dropdowns
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startRecording = async () => {
    try {
      // Check if browser supports Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
        return;
      }

      console.log('Starting speech recognition...');
      
      const newRecognition = new SpeechRecognition();
      
      // Simple, working configuration
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = 'en-US';
      newRecognition.maxAlternatives = 1;

      newRecognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
      };

      newRecognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        // Simple processing - just get the latest results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // If we have final results, add them to our stored transcript
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }

        // Update the text field with all accumulated text plus interim
        const currentText = (finalTranscriptRef.current + interimTranscript).trim();
        setBrief(currentText);
      };

      newRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error === 'no-speech') {
          console.log('No speech detected, recognition stopped');
          return;
        }
        
        let errorMessage = 'Speech recognition error: ';
        switch(event.error) {
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
        
        if (event.error !== 'aborted') {
          alert(errorMessage);
        }
      };

      newRecognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        setRecognition(null);
        
        // Clean up the final result
        if (finalTranscriptRef.current.trim()) {
          const cleanText = finalTranscriptRef.current.trim().replace(/\s+/g, ' ');
          setBrief(cleanText);
          finalTranscriptRef.current = cleanText + ' '; // Keep for continuation
        }
      };

      newRecognition.start();
      setRecognition(newRecognition);
      
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99998] p-3">
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
              Provide some basic information to get started
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
                    Industry <span className="text-red-500">*</span>
                  </label>
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
                
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-500 mb-3">
                    Record or type your professional summary
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      size="lg"
                      className={`h-16 w-32 rounded-full transition-colors duration-200 shadow-lg text-sm font-medium ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                          : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200'
                      }`}
                      onClick={handleMicClick}
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
                        onClick={() => {
                          setBrief('');
                          finalTranscriptRef.current = '';
                        }}
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
                      <span className="text-xs font-medium">Recording...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <textarea
                    placeholder="Type your professional summary here or use the Record button above..."
                    className="flex-1 w-full p-3 border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none resize-none text-sm leading-5 min-h-[200px]"
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {isRecording ? 
                      'Speaking... The text will update in real-time' : 
                      brief ? 
                        'You can edit the text above or click Record to continue adding more' : 
                        'Click the Record button above to start voice input'
                    }
                  </p>
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

// Demo component to show how to use the persistent modal
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Demo</h1>
        
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
        
        <p className="text-sm text-gray-600">
          {savedFormData ? 
            'Your data has been saved! Reopen the modal to see your previous entries.' : 
            'Fill out the form and your data will be automatically saved.'
          }
        </p>
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