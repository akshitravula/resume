
import { EnhancedTemplates } from "@/components/templates/enhanced-templates";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ResumeData } from "@shared/schema";

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createResumeMutation = useMutation({
    mutationFn: async (data: ResumeData) => {
      console.log("Creating resume with data:", data);
      const response = await apiRequest("POST", "/api/resumes", {
        title: `${data.personalInfo.fullName}'s Resume`,
        data: data,
      });
      return await response.json();
    },
    onSuccess: (resume) => {
      toast({
        title: "Resume created!",
        description: "Template has been applied to your new resume.",
      });
      setLocation(`/editor/${resume.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create resume from template.",
        variant: "destructive",
      });
    },
  });

  const handleSelectTemplate = (data: ResumeData) => {
    console.log("Selected template data:", data);
    createResumeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedTemplates onSelectTemplate={handleSelectTemplate} />
      </main>
    </div>
  );
}
