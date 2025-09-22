import { EnhancedTemplates } from "@/components/templates/enhanced-templates";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFileRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { TailoringDialog } from "@/components/dialogs/TailoringDialog"; // Added comment to force re-compilation

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTailoringDialog, setShowTailoringDialog] = useState(false);
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);

  const createResumeMutation = useMutation({
    mutationFn: async (template: any) => {
      const formData = new FormData();
      formData.append("template", template.name);
      formData.append("industry", template.industry);
      if (template.file) {
        formData.append("file", template.file);
      }

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
    setSelectedTemplateData(data);
    setShowTailoringDialog(true);
  };

  const handleTailoringConfirm = (file: File | null, industry: string) => {
    setShowTailoringDialog(false);
    if (selectedTemplateData) {
      createResumeMutation.mutate({ ...selectedTemplateData, file, industry });
    }
  };

  const handleTailoringClose = () => {
    setShowTailoringDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedTemplates onSelectTemplate={handleSelectTemplate} />
      </main>
      <TailoringDialog
        isOpen={showTailoringDialog}
        onClose={handleTailoringClose}
        onConfirm={handleTailoringConfirm}
      />
    </div>
  );
}