import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Edit, Download, Trash2, Palette, Briefcase, School, FileUp, Eye, Calendar, User, ArrowRight, ChevronDown, CheckCircle, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, apiFileRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Resume } from "@shared/schema";
import { TemplateSelectionDialog } from "@/components/dialogs/TemplateSelectionDialog";
import { ResumeUpload } from "@/components/upload/resume-upload";
import { PostSignUpModal } from "@/components/dialogs/PostSignUpModal";
import { useAuth } from "@/hooks/use-auth";

const templates = [
  { id: 1, name: "Modern", icon: Briefcase },
  { id: 2, name: "Creative", icon: Palette },
  { id: 3, name: "Academic", icon: School },
];

interface ResumeCard {
  _id: string;
  title: string | null;
  summary?: string | null;
  status: "in-progress" | "completed";
  updated_at: string | null;
  templateId?: number;
  previewUrl?: string | null;
}

// Enhanced Preloader Component
const ResumeCreationPreloader = ({ isVisible, templateName }: { isVisible: boolean; templateName: string }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const steps = [
    { label: "Initializing template", icon: FileText, targetProgress: 25 },
    { label: "Setting up workspace", icon: Edit, targetProgress: 50 },
    { label: "Preparing editor", icon: Palette, targetProgress: 75 },
    { label: "Almost ready", icon: CheckCircle, targetProgress: 90 },
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
      }, 1000);

      progressInterval = setInterval(() => {
        setProgress(prev => {
          const currentStepIndex = Math.min(currentStep, steps.length - 1);
          const targetProgress = steps[currentStepIndex]?.targetProgress || 90;
          
          if (prev < targetProgress) {
            const remaining = targetProgress - prev;
            const increment = remaining > 10 ? 2 : remaining > 5 ? 1 : 0.5;
            return Math.min(prev + increment, targetProgress);
          }
          return prev;
        });
      }, 100);
    };

    startProgress();

    return () => {
      if (stepInterval) clearInterval(stepInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isVisible, currentStep]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Creating {templateName} Resume
          </h3>
          <p className="text-gray-600 text-sm">
            Please wait while we set up your resume editor...
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  isCompleted ? 'bg-green-50 border border-green-200' : 
                  isCurrent ? 'bg-blue-50 border border-blue-200' : 
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
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
                <span className={`text-sm font-medium ${
                  isCompleted ? 'text-green-700' : 
                  isCurrent ? 'text-blue-700' : 
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {isCurrent && progress < 90 && (
                  <div className="flex space-x-1 ml-auto">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {Math.round(progress)}% Complete
          {progress >= 90 && <span className="block mt-1 text-blue-600 font-medium">Opening editor...</span>}
        </p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [isTemplateSelectionDialogOpen, setTemplateSelectionDialogOpen] = useState(false);
  const [isPostSignUpOpen, setIsPostSignUpOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showAllInProgress, setShowAllInProgress] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [creatingTemplateId, setCreatingTemplateId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: resumes, isLoading } = useQuery<ResumeCard[]>({
    queryKey: ["/api/user/get-all-resume"],
    select: (data) => Array.isArray(data) ? data : [data],
  });

  const deleteResumeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/user/delete-resume/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/user/get-all-resume"]);
      toast({
        title: "Resume deleted",
        description: "The resume has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the resume.",
        variant: "destructive",
      });
    },
  });

  const createResumeMutation = useMutation({
    mutationFn: async (templateId: number) => {
      console.log("Creating resume with templateId:", templateId);
      
      const requestData = new FormData();
      requestData.append("template", "xyz");
      requestData.append("industry", `${user?.industries}` || "NONE");
      
      console.log("Request data:", requestData);
      
      const response = await apiFileRequest("POST", "/api/user/create-resume", requestData);
      return response;
    },
    onMutate: (templateId: number) => {
      setCreatingTemplateId(templateId);
    },
    onSuccess: (newResume) => {
      console.log("Success with resume:", newResume);
      
      if (!newResume?.resume_id) {
        console.error("No ID in response:", newResume);
        toast({
          title: "Error",
          description: "Resume created but couldn't get ID. Please refresh the page.",
          variant: "destructive",
        });
        setCreatingTemplateId(null);
        queryClient.invalidateQueries({ queryKey: ["/api/user/get-all-resume"] });
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/user/get-all-resume"] });
      localStorage.setItem("lastResumeId", newResume.resume_id);
      
      toast({
        title: "Resume created",
        description: "New resume created successfully.",
      });
      
      setTimeout(() => {
        setCreatingTemplateId(null);
        setLocation(`/editor/${newResume.resume_id}`);
      }, 500);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      setCreatingTemplateId(null);
      toast({
        title: "Error",
        description: `Failed to create resume: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(user?.industries || []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isNewUser = localStorage.getItem("isNewUser") === "true";
    
    if (searchParams.get("new-user") === "true" && isNewUser) {
      setIsPostSignUpOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      localStorage.removeItem("isNewUser");
    }
  }, []);

  const handlePostSignUpClose = (industries?: string[]) => {
    setIsPostSignUpOpen(false);
    if (industries) {
      setSelectedIndustries(industries);
    }
    setTemplateSelectionDialogOpen(true);
  };

  const handleTemplateSelect = (templateId: number) => {
    console.log("Template selected:", templateId);
    
    if (createResumeMutation.isLoading || creatingTemplateId !== null) {
      console.log("Mutation already in progress, ignoring click");
      return;
    }
    
    createResumeMutation.mutate(templateId);
  };

  const inProgressResumes = resumes?.filter(r => r.status === "in-progress") || [];
  const completedResumes = resumes?.filter(r => r.status === "completed") || [];

  const INITIAL_DISPLAY_COUNT = 4;
  
  const displayedInProgressResumes = showAllInProgress 
    ? inProgressResumes 
    : inProgressResumes.slice(0, INITIAL_DISPLAY_COUNT);
    
  const displayedCompletedResumes = showAllCompleted 
    ? completedResumes 
    : completedResumes.slice(0, INITIAL_DISPLAY_COUNT);

  const getTemplateIcon = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    return template?.icon || FileText;
  };

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-4 relative z-0">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const getCreatingTemplateName = () => {
    if (creatingTemplateId) {
      return templates.find(t => t.id === creatingTemplateId)?.name || 'Resume';
    }
    return '';
  };

  return (
    <>
      <div className="p-6 space-y-8 relative z-0">
        {/* Create Resume Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Create Resume</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div 
              className={`w-full h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all duration-300 relative z-0 ${
                creatingTemplateId !== null ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => setShowUpload(true)}
            >
              <FileUp className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">Edit your existing Resume</p>
            </div>
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="relative group cursor-pointer z-0"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className={`w-full h-64 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center text-center hover:shadow-lg hover:border-primary transition-all duration-300 ${
                  creatingTemplateId !== null ? 'opacity-50 pointer-events-none' : ''
                }`}>
                  <template.icon className="h-12 w-12 text-primary mb-2" />
                  <p className="text-sm font-medium text-gray-800">{template.name}</p>
                </div>
                
                <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg ${
                  creatingTemplateId !== null ? 'opacity-0 pointer-events-none' : ''
                }`}>
                  <div className="text-center text-white">
                    <Edit className="h-8 w-8" />
                    <p className="font-bold mt-2">Create & Edit</p>
                  </div>
                </div>
                
                {creatingTemplateId === template.id && (
                  <div className="absolute inset-0 bg-primary bg-opacity-10 flex items-center justify-center rounded-lg z-10 border-2 border-primary">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-primary mt-2 font-medium">Creating...</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <Link href="/templates">
              <Button 
                variant="outline" 
                className={`px-6 py-2 ${creatingTemplateId !== null ? 'opacity-50 pointer-events-none' : ''}`}
                disabled={creatingTemplateId !== null}
              >
                See More Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Section Divider */}
        <div className="border-t border-gray-200"></div>

        {/* In-Progress Resumes Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">In-Progress Resumes</h2>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                {inProgressResumes.length} resume{inProgressResumes.length !== 1 ? 's' : ''}
              </Badge>
              {inProgressResumes.length > INITIAL_DISPLAY_COUNT && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllInProgress(!showAllInProgress)}
                  className="text-sm px-3 py-1"
                  disabled={creatingTemplateId !== null}
                >
                  {showAllInProgress ? 'Show Less' : 'Show More'}
                  <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showAllInProgress ? 'rotate-180' : ''}`} />
                </Button>
              )}
            </div>
          </div>
          
          {inProgressResumes.length === 0 ? (
            <Card className="border-dashed relative z-0">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No in-progress resumes
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">Upload or select a template to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedInProgressResumes.map((resume) => {
                const TemplateIcon = getTemplateIcon(resume.templateId || 1);
                const hasPreview = !!resume.previewUrl;
                
                return (
                  <div key={resume._id} className={`w-full h-80 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative z-0 ${
                    creatingTemplateId !== null ? 'opacity-50' : ''
                  }`}>
                    {/* Preview Header - 70% of total height */}
                    <div className="h-56 border-b border-gray-200 relative overflow-hidden">
                      {hasPreview ? (
                        <img 
                          src={resume.previewUrl!} 
                          alt={`${resume.title || 'Resume'} preview`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full bg-gray-100 flex items-center justify-center relative">
                          <TemplateIcon className="h-16 w-16 text-gray-400" />
                          <p className="absolute bottom-2 text-xs text-gray-500">No preview available</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Resume Info - 30% of total height */}
                    <div className="h-24 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate text-sm">{resume.title || 'Untitled Resume'}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Updated {new Date(`${resume.updated_at}`).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <Link href={`/editor/${resume._id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs px-2" 
                            onClick={() => localStorage.setItem("lastResumeId", resume._id)}
                            disabled={creatingTemplateId !== null}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        </Link>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            disabled={creatingTemplateId !== null || !hasPreview}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700" 
                            onClick={() => deleteResumeMutation.mutate(resume._id)}
                            disabled={creatingTemplateId !== null}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Completed Resumes Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Completed Resumes</h2>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                {completedResumes.length} resume{completedResumes.length !== 1 ? 's' : ''}
              </Badge>
              {completedResumes.length > INITIAL_DISPLAY_COUNT && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllCompleted(!showAllCompleted)}
                  className="text-sm px-3 py-1"
                  disabled={creatingTemplateId !== null}
                >
                  {showAllCompleted ? 'Show Less' : 'Show More'}
                  <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showAllCompleted ? 'rotate-180' : ''}`} />
                </Button>
              )}
            </div>
          </div>
          
          {completedResumes.length === 0 ? (
            <Card className="border-dashed relative z-0">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No completed resumes
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">Complete a resume to see it here.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedCompletedResumes.map((resume) => {
                const TemplateIcon = getTemplateIcon(resume.templateId || 1);
                const hasPreview = !!resume.previewUrl;
                
                return (
                  <div key={resume._id} className={`w-full h-80 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative z-0 ${
                    creatingTemplateId !== null ? 'opacity-50' : ''
                  }`}>
                    {/* Preview Header - 70% of total height */}
                    <div className="h-56 border-b border-gray-200 relative overflow-hidden">
                      {hasPreview ? (
                        <img 
                          src={resume.previewUrl!} 
                          alt={`${resume.title || 'Resume'} preview`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full bg-gray-100 flex items-center justify-center relative">
                          <TemplateIcon className="h-16 w-16 text-gray-400" />
                          <p className="absolute bottom-2 text-xs text-gray-500">No preview available</p>
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 text-xs bg-green-600">
                        Complete
                      </Badge>
                    </div>
                    
                    {/* Resume Info - 30% of total height */}
                    <div className="h-24 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate text-sm">{resume.title || 'Untitled Resume'}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Completed {new Date(resume.updated_at as string).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <Link href={`/editor/${resume._id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs px-2" 
                            onClick={() => localStorage.setItem("lastResumeId", resume._id)}
                            disabled={creatingTemplateId !== null}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </Link>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            disabled={creatingTemplateId !== null || !hasPreview}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700" 
                            onClick={() => deleteResumeMutation.mutate(resume._id)}
                            disabled={creatingTemplateId !== null}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <ResumeCreationPreloader 
        isVisible={creatingTemplateId !== null} 
        templateName={getCreatingTemplateName()}
      />
      
      <TemplateSelectionDialog
        isOpen={isTemplateSelectionDialogOpen}
        onClose={() => setTemplateSelectionDialogOpen(false)}
        selectedIndustries={user?.industries || []}
      />
      <ResumeUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />
      <PostSignUpModal isOpen={isPostSignUpOpen} onClose={handlePostSignUpClose} />
    </>
  );
}