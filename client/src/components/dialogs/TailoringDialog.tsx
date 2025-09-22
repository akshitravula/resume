import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Palette, 
  Edit, 
  CheckCircle, 
  Clock,
  Briefcase,
  Code,
  Heart,
  TrendingUp,
  GraduationCap,
  Calculator,
  Globe,
  Wrench,
  BookOpen,
  Users,
  Camera
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface TailoringDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File | null, industry: string) => void;
  templateName?: string;
  templateCategory?: string;
}

// Industry options mapping (same as in PostSignUpModal and TemplateSelectionDialog)
const INDUSTRY_OPTIONS = [
  { value: "consulting", label: "Consulting" },
  { value: "finance", label: "Finance" },
  { value: "product", label: "Product" },
  { value: "tech", label: "Tech" }
];

// Helper function to get the display label for an industry value
const getIndustryLabel = (industryValue: string) => {
  const industry = INDUSTRY_OPTIONS.find(opt => opt.value === industryValue);
  return industry ? industry.label : industryValue.charAt(0).toUpperCase() + industryValue.slice(1);
};

// Template Creation Preloader Component
const TemplateCreationPreloader = ({ 
  isVisible, 
  templateName, 
  templateCategory 
}: { 
  isVisible: boolean; 
  templateName: string; 
  templateCategory: string;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const steps = [
    { label: `Loading ${templateName} template`, icon: FileText, targetProgress: 20 },
    { label: "Processing your information", icon: Upload, targetProgress: 40 },
    { label: "Customizing template design", icon: Palette, targetProgress: 65 },
    { label: "Setting up editor workspace", icon: Edit, targetProgress: 85 },
    { label: "Finalizing your resume", icon: CheckCircle, targetProgress: 95 },
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    const startProgress = () => {
      stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1200);

      progressInterval = setInterval(() => {
        setProgress(prev => {
          const currentStepIndex = Math.min(currentStep, steps.length - 1);
          const targetProgress = steps[currentStepIndex]?.targetProgress || 95;
          
          if (prev < targetProgress) {
            const remaining = targetProgress - prev;
            const increment = remaining > 15 ? 1.5 : remaining > 8 ? 0.8 : 0.3;
            return Math.min(prev + increment, targetProgress);
          }
          return prev;
        });
      }, 120);
    };

    startProgress();

    return () => {
      if (stepInterval) clearInterval(stepInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isVisible, currentStep]);

  if (!isVisible) return null;

  const getCategoryIcon = () => {
    switch (templateCategory.toLowerCase()) {
      case 'professional': return Briefcase;
      case 'creative': return Palette;
      case 'technology': return Code;
      case 'healthcare': return Heart;
      case 'marketing': return TrendingUp;
      case 'education': return GraduationCap;
      case 'finance': return Calculator;
      case 'international': return Globe;
      case 'engineering': return Wrench;
      case 'entry level': return BookOpen;
      case 'sales': return Users;
      case 'media': return Camera;
      default: return FileText;
    }
  };

  const CategoryIcon = getCategoryIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <CategoryIcon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <FileText className="w-3 h-3 text-white" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Creating Your {templateName} Resume
          </h3>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {templateCategory}
            </Badge>
            <Badge variant="outline" className="text-xs">
              ATS-Friendly
            </Badge>
          </div>
          <p className="text-gray-600 text-sm">
            Tailoring your professional template with your information...
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                  isCompleted ? 'bg-green-50 border border-green-200 transform scale-[0.98]' : 
                  isCurrent ? 'bg-blue-50 border border-blue-200 shadow-sm' : 
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' : 
                  isCurrent ? 'bg-blue-500' : 
                  'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <StepIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <span className={`text-xs font-medium flex-1 text-left transition-colors duration-300 ${
                  isCompleted ? 'text-green-700' : 
                  isCurrent ? 'text-blue-700' : 
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
                
                {isCurrent && progress < 95 && (
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="text-green-600">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse"></div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 font-medium">{Math.round(progress)}% Complete</span>
            {progress >= 95 && (
              <span className="text-blue-600 font-semibold animate-pulse">
                Opening editor...
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700">
            Your resume will be automatically formatted and ready to edit
          </p>
        </div>
      </div>
    </div>
  );
};

export function TailoringDialog({
  isOpen,
  onClose,
  onConfirm,
  templateName = "Professional",
  templateCategory = "Professional",
}: TailoringDialogProps) {
  const { user, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [fetchedIndustries, setFetchedIndustries] = useState<string[]>([]);
  const [isCreatingResume, setIsCreatingResume] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

  // Fetch user preferences from API
  async function getUserPreferences() {
    if (!user) return;

    try {
      setIsLoadingPreferences(true);
      const response = await apiRequest("GET", `/api/user/get-preferences`);

      console.log("Fetched preferences:", response);
      
      if (response && response.industries) {
        // Filter industries to ensure they match INDUSTRY_OPTIONS
        const validIndustries = response.industries.filter((industry: string) => 
          INDUSTRY_OPTIONS.some(opt => opt.value === industry)
        );
        setFetchedIndustries(validIndustries);
        
        // Auto-select the first valid industry if none is selected
        if (validIndustries.length > 0 && !selectedIndustry) {
          setSelectedIndustry(validIndustries[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    } finally {
      setIsLoadingPreferences(false);
    }
  }

  // Fetch preferences when dialog opens and user is available
  useEffect(() => {
    if (isOpen && user && !loading) {
      getUserPreferences();
    }
  }, [isOpen, user, loading]);

  // Update selectedIndustry when fetchedIndustries changes
  useEffect(() => {
    if (fetchedIndustries.length > 0 && !selectedIndustry) {
      setSelectedIndustry(fetchedIndustries[0]);
    }
  }, [fetchedIndustries, selectedIndustry]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleConfirm = () => {
    const finalIndustry = selectedIndustry;
    if (finalIndustry) {
      setIsCreatingResume(true);
      resetForm();
      onClose();
      onConfirm(file, finalIndustry);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSelectedIndustry("");
  };

  const handleClose = () => {
    if (!isCreatingResume) {
      resetForm();
      onClose();
    }
  };

  // Use fetched industries if available, otherwise fall back to INDUSTRY_OPTIONS
  const availableOptions = fetchedIndustries.length > 0 
    ? fetchedIndustries.map(industry => ({
        value: industry,
        label: getIndustryLabel(industry)
      }))
    : INDUSTRY_OPTIONS;

  // Debug logging to verify industry fetching
  console.log('TailoringDialog - Fetched Industries:', fetchedIndustries);
  console.log('TailoringDialog - Available Options:', availableOptions);

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen && !isCreatingResume} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tailor Your Profile</DialogTitle>
            <DialogDescription>
              Select your target industry and optionally upload your resume for better tailoring.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Display fetched industries */}
            {fetchedIndustries.length > 0 && !isLoadingPreferences && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">
                  Your Selected Industries from Profile
                </h3>
                <p className="text-xs text-gray-500">
                  These are the industries saved in your profile
                </p>
                <div className="flex flex-wrap gap-2">
                  {fetchedIndustries.map((industry, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        industry === selectedIndustry
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {getIndustryLabel(industry)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Industry Selection Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900">
                Select Target Industry for This Resume
              </h3>
              <p className="text-xs text-gray-500">
                {fetchedIndustries.length > 0 
                  ? "Choose which of your saved industries to focus this resume on"
                  : "Choose your target industry"
                }
              </p>
              {isLoadingPreferences ? (
                <div className="w-full p-3 border rounded-lg text-sm text-center text-gray-500">
                  Loading your preferences...
                </div>
              ) : (
                <Select onValueChange={setSelectedIndustry} value={selectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      availableOptions.length > 0 
                        ? "Choose your target industry" 
                        : "No industries available"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOptions.length > 0 ? (
                      availableOptions.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No valid industries found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              
              {/* Show status of industry fetching */}
              {fetchedIndustries.length === 0 && !isLoadingPreferences && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    No industries found in your profile. Showing default options: {INDUSTRY_OPTIONS.map(opt => opt.label).join(', ')}
                  </p>
                </div>
              )}
              
              
            </div>

            {/* Optional Resume Upload Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900">
                Upload Resume <span className="text-gray-500">(Optional)</span>
              </h3>
              <div>
                <label
                  htmlFor="resume-upload"
                  className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
                >
                  <span className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">
                      {file ? file.name : "Click to upload your resume (optional)"}
                    </span>
                  </span>
                  <input
                    id="resume-upload"
                    name="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {file && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedIndustry || isLoadingPreferences}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Creation Preloader */}
      <TemplateCreationPreloader 
        isVisible={isCreatingResume} 
        templateName={templateName}
        templateCategory={templateCategory}
      />
    </>
  );
}