
import { EnhancedTemplates } from "@/components/templates/enhanced-templates";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, apiFileRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// import type { ResumeDa } from "@shared/schema";
// import type { Resume } from "@/types/resume";


export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createResumeMutation = useMutation({
    mutationFn: async (template: any) => {
      const formData = new FormData();
      formData.append("template", template.name);
      formData.append("industry", template.industry[0]);

      const response = await apiFileRequest("POST", "/api/user/create-resume", formData);
      return response;
    },
    onSuccess: (newResume) => {
      if (!newResume?.resume_id) {
        toast({
          title: "Error",
          description: "Could not create resume.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Resume created!",
        description: "Template has been applied to your new resume.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setLocation(`/editor/${newResume.resume_id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create resume from template.",
        variant: "destructive",
      });
      console.log("Error creating resume:", error);
    },
  });

  const handleSelectTemplate = (data) => {
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
