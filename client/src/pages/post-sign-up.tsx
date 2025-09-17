import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest,apiFileRequest } from "@/lib/queryClient";
import { FileText, Mic, Upload, MicOff, User, FileUp } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";

export default function PostSignUpPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [industries, setIndustries] = useState(["tech"]);
  const [level, setLevel] = useState("entry");
  const [brief, setBrief] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isRecording, setIsRecording] = useState({ brief: false });
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const { toast } = useToast();
  const audioChunks = useRef([]);

  const industryOptions = [
    { id: "consulting", label: "Consulting" },
    { id: "finance", label: "Finance" },
    { id: "product", label: "Product" },
    { id: "tech", label: "Tech" }
  ];

  const levelOptions = [
    { id: "entry", label: "Entry (0-2 years)" },
    { id: "mid", label: "Mid (3-5 years)" },
    { id: "senior", label: "Senior (5+ years)" }
  ];

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation("/auth");
    }
  }, [user, loading, setLocation]);

  // Fixed: Removed unused handleIndustryToggle function since we're using MultiSelect

  const startRecording = async (field) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      audioChunks.current = [];
      
      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const transcribedText = await simulateTranscription(audioBlob);
        
        if (field === 'brief') {
          setBrief(transcribedText);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(prev => ({ ...prev, [field]: true }));
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({ 
        title: "Microphone Error", 
        description: "Unable to access microphone. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording({ brief: false });
    }
  };

  const simulateTranscription = async (audioBlob) => {
    // Fixed: Added proper async handling
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const randomTexts = [
      "I am a software engineer with 5 years of experience in building web applications.",
      "I am a product manager with a passion for creating user-centric products.",
      "I am a recent graduate with a degree in computer science, looking for an entry-level role.",
      "I have a strong background in data analysis and machine learning.",
      "I am a marketing professional with a proven track record of successful campaigns."
    ];
    return randomTexts[Math.floor(Math.random() * randomTexts.length)];
  };

  const handleMicClick = (field) => {
    if (isRecording[field]) {
      stopRecording();
    } else {
      startRecording(field);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

   async function getUserPreferences() {
    if (!user) return;

    try {
      const response = await apiRequest("GET", `/api/user/get-preferences`);

      console.log(response);
      
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


  //  const handleFileChange = (e) => {
  //   const file = e.target.files[0]; // only one file
  //   if (file) {
  //     if (file.size > 10 * 1024 * 1024) { // 10 MB limit
  //       toast({
  //         title: "Validation Error",
  //         description: "File size exceeds 10 MB limit.",
  //         variant: "destructive"
  //       });
  //       e.target.value = ""; // reset input
  //       return;
  //     }
  //     console.log("Selected file:", file);
  //     setFileName(file.name);
  //     setFile(file);
  //   }
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

    toast({
      title: "Success",
      description: "Your preferences have been saved.",
    });
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
 

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <User className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Build Your Resume
          </h1>
          <p className="text-gray-600 text-sm">
            To build your resume, I would need some basic information from your side.
          </p>
        </div>

        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900">Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Industry Selection */}
              <div>
                <label className="font-semibold text-gray-700">
                  Industry you are in
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  So that I can make that resume for you.
                </p>
                
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
                <label className="font-semibold text-gray-700">
                  What is your experience level?
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  This will help me tailor the resume to your experience.
                </p>
                <div className="flex flex-wrap gap-2">
                  {levelOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setLevel(option.id)}
                      className={`cursor-pointer rounded-lg border-2 px-4 py-2 text-center font-medium transition-all duration-200 flex-1 min-w-fit ${
                        level === option.id
                          ? 'border-blue-400 bg-white text-blue-600'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Brief About You */}
              <div className="space-y-2">
                <label htmlFor="brief" className="font-semibold text-gray-700">
                  Brief about you
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Tell us about yourself using voice message
                </p>
                <div className="flex gap-4">
                  {/* Record Button in a Square */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4">
                      <Button
                        type="button"
                        size="lg"
                        className={`h-16 w-16 rounded-full transition-all duration-200 shadow-lg ${
                          isRecording.brief
                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-red-200'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200'
                        }`}
                        onClick={() => handleMicClick('brief')}
                        aria-label={isRecording.brief ? "Stop recording" : "Start recording"}
                      >
                        {isRecording.brief ? (
                          <MicOff className="h-8 w-8" />
                        ) : (
                          <Mic className="h-8 w-8" />
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        {isRecording.brief ? "Recording..." : "Record"}
                      </p>
                    </div>
                  </div>

                  {/* Content Box */}
                  <div className="flex-1 flex flex-col">
                    <textarea
                      id="brief"
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

              {/* File Upload */}
              <div>
                <label className="font-semibold text-gray-700">
                  Upload your cover letter or existing resume
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-6">
                  <div className="text-center">
                    <FileUp className="mx-auto h-10 w-10 text-gray-300" />
                    <div className="mt-2 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload-page"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-accent"
                      >
                        <span>{fileName || "Upload a file"}</span>
                        <input 
                          id="file-upload-page" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">PDF/DOCS up to 10MB</p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}