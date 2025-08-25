import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Edit, Download, Trash2, Palette, Briefcase, School, FileUp, Eye, Calendar, User, ArrowRight, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Resume } from "@shared/schema";
import { TemplateSelectionDialog } from "@/components/dialogs/TemplateSelectionDialog";
import { ResumeUpload } from "@/components/upload/resume-upload";
import { PostSignUpModal } from "@/components/dialogs/PostSignUpModal";

const templates = [
  { id: 1, name: "Modern", icon: Briefcase },
  { id: 2, name: "Creative", icon: Palette },
  { id: 3, name: "Academic", icon: School },
];

// Add this test function to debug the API call:
const testApiCall = async () => {
  try {
    console.log("Testing direct API call...");
    
    const testData = {
      title: "Test Resume",
      data: {
        personalInfo: {
          fullName: "",
          email: "",
          phone: "",
          linkedin: "",
          summary: ""
        },
        education: [],
        workExperience: [],
        projects: [],
        pors: [],
        achievements: [],
        certifications: [],
        skills: {
          technical: "",
          languages: "",
          frameworks: "",
          tools: ""
        }
      },
      status: "in-progress"
    };
    
    console.log("Sending data:", testData);
    
    const response = await fetch("/api/resumes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(testData),
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Test API Response:", result);
    console.log("Response ID:", result?.id);
    
    return result;
  } catch (error) {
    console.error("Test API Error:", error);
    throw error;
  }
};

export default function Dashboard() {
  const [isTemplateSelectionDialogOpen, setTemplateSelectionDialogOpen] = useState(false);
  const [isPostSignUpOpen, setIsPostSignUpOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showAllInProgress, setShowAllInProgress] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: resumes, isLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });
  
  const deleteResumeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/resumes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/resumes"]);
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

  // Mutation to create a new resume
  const createResumeMutation = useMutation({
    mutationFn: async (templateId: number) => {
      console.log("Creating resume with templateId:", templateId);
      
      const requestData = {
        title: `New ${templates.find(t => t.id === templateId)?.name || 'Resume'}`,
        data: {
          personalInfo: {
            fullName: "",
            email: "",
            phone: "",
            linkedin: "",
            summary: ""
          },
          education: [],
          workExperience: [],
          projects: [],
          pors: [],
          achievements: [],
          certifications: [],
          skills: {
            technical: "",
            languages: "",
            frameworks: "",
            tools: ""
          }
        },
        status: "in-progress"
      };
      
      console.log("Request data:", requestData);
      
      // Use apiRequest instead of direct fetch to handle authentication
      const response = await apiRequest("POST", "/api/resumes", requestData);
      const result = await response.json();
      console.log("API response:", result);
      return result;
    },
    onSuccess: (newResume) => {
      console.log("Success with resume:", newResume);
      
      if (!newResume?.id) {
        console.error("No ID in response:", newResume);
        toast({
          title: "Error",
          description: "Resume created but couldn't get ID. Please refresh the page.",
          variant: "destructive",
        });
        // Still try to refresh the page to show the new resume
        queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      localStorage.setItem("lastResumeId", newResume.id);
      
      toast({
        title: "Resume created",
        description: "New resume created successfully.",
      });
      
      setLocation(`/editor/${newResume.id}`);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: `Failed to create resume: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("new-user")) {
      setIsPostSignUpOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePostSignUpClose = (industries?: string[]) => {
    setIsPostSignUpOpen(false);
    if (industries) {
      setSelectedIndustries(industries);
    }
    setTemplateSelectionDialogOpen(true);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: number) => {
    console.log("Template selected:", templateId);
    console.log("Mutation loading state:", createResumeMutation.isLoading);
    
    if (createResumeMutation.isLoading) {
      console.log("Mutation already in progress, ignoring click");
      return;
    }
    
    createResumeMutation.mutate(templateId);
  };

  // Add this useEffect to test the API (remove after debugging):
  useEffect(() => {
    // Uncomment to test the API call
    // testApiCall();
  }, []);

  const inProgressResumes = resumes?.filter(r => r.status === "in-progress") || [];
  const completedResumes = resumes?.filter(r => r.status === "completed") || [];

  // Constants for pagination
  const INITIAL_DISPLAY_COUNT = 4;
  
  // Get displayed resumes based on show more state
  const displayedInProgressResumes = showAllInProgress 
    ? inProgressResumes 
    : inProgressResumes.slice(0, INITIAL_DISPLAY_COUNT);
    
  const displayedCompletedResumes = showAllCompleted 
    ? completedResumes 
    : completedResumes.slice(0, INITIAL_DISPLAY_COUNT);

  // Helper function to get template icon
  const getTemplateIcon = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    return template?.icon || FileText;
  };

  // Helper function to calculate progress percentage (mock calculation)
  const getProgressPercentage = (resume: Resume) => {
    // This is a mock calculation - you can implement actual progress logic
    const sections = ['personal', 'experience', 'education', 'skills'];
    const completedSections = sections.filter(section => {
      // Add your logic to check if section is completed
      return Math.random() > 0.3; // Mock completion
    });
    return Math.round((completedSections.length / sections.length) * 100);
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
              className="w-full h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all duration-300 relative z-0"
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
                  createResumeMutation.isLoading ? 'opacity-50 pointer-events-none' : ''
                }`}>
                  <template.icon className="h-12 w-12 text-primary mb-2" />
                  <p className="text-sm font-medium text-gray-800">{template.name}</p>
                </div>
                
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg ${
                  createResumeMutation.isLoading ? 'opacity-0' : ''
                }`}>
                  <div className="text-center text-white">
                    <Edit className="h-8 w-8" />
                    <p className="font-bold mt-2">Create & Edit</p>
                  </div>
                </div>
                
                {/* Loading overlay */}
                {createResumeMutation.isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Creating resume...</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* See More Templates Button */}
          <div className="flex justify-center mt-6">
            <Link href="/templates">
              <Button variant="outline" className="px-6 py-2">
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
                const progress = getProgressPercentage(resume);
                
                return (
                  <div key={resume.id} className="w-full h-80 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative z-0">
                    {/* Preview Header - 70% of total height */}
                    <div className="h-56 bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-gray-200 flex items-center justify-center relative">
                      <TemplateIcon className="h-16 w-16 text-primary" />
                      <Badge 
                        className="absolute top-3 right-3 text-xs"
                        variant={progress < 50 ? "destructive" : progress < 80 ? "secondary" : "default"}
                      >
                        {progress}%
                      </Badge>
                    </div>
                    
                    {/* Resume Info - 30% of total height */}
                    <div className="h-24 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate text-sm">{resume.title}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Updated {new Date(resume.updatedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <Link href={`/editor/${resume.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => localStorage.setItem("lastResumeId", resume.id)}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        </Link>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700" 
                            onClick={() => deleteResumeMutation.mutate(resume.id)}
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
                
                return (
                  <div key={resume.id} className="w-full h-80 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden relative z-0">
                    {/* Preview Header - 70% of total height */}
                    <div className="h-56 bg-gradient-to-br from-green-50 to-emerald-100 border-b border-gray-200 flex items-center justify-center relative">
                      <TemplateIcon className="h-16 w-16 text-green-600" />
                      <Badge className="absolute top-3 right-3 text-xs bg-green-600">
                        Complete
                      </Badge>
                    </div>
                    
                    {/* Resume Info - 30% of total height */}
                    <div className="h-24 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate text-sm">{resume.title}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Completed {new Date(resume.updatedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <Link href={`/editor/${resume.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => localStorage.setItem("lastResumeId", resume.id)}>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </Link>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700" 
                            onClick={() => deleteResumeMutation.mutate(resume.id)}
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
      
      <TemplateSelectionDialog
        isOpen={isTemplateSelectionDialogOpen}
        onClose={() => setTemplateSelectionDialogOpen(false)}
        selectedIndustries={selectedIndustries}
      />
      <ResumeUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />
      <PostSignUpModal isOpen={isPostSignUpOpen} onClose={handlePostSignUpClose} />
    </>
  );
}