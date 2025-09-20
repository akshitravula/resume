import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Resume } from "@shared/schema";
import { FileUp, FileText, Pencil, Sparkles, ArrowLeft } from "lucide-react";


interface AdvancedResumeStartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedResumeStartDialog({
  isOpen,
  onClose,
}: AdvancedResumeStartDialogProps) {
  const [step, setStep] = useState("initial");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: resumes } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
      setStep("existing-options");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetState = () => {
    setStep("initial");
    setFileName(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const renderInitialStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center">
          Start Your Masterpiece
        </DialogTitle>
        <DialogDescription className="text-center">
          How would you like to begin your resume journey?
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div
          className="p-6 border rounded-lg text-center hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setStep("scratch")}
        >
          <Sparkles className="h-12 w-12 mx-auto text-primary" />
          <h3 className="text-lg font-semibold mt-4">Start from Scratch</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Build a new resume from the ground up.
          </p>
        </div>
        <div
          className="p-6 border rounded-lg text-center hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setStep("existing")}
        >
          <FileText className="h-12 w-12 mx-auto text-primary" />
          <h3 className="text-lg font-semibold mt-4">Use Existing Resume</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload or select a resume to get started.
          </p>
        </div>
      </div>
    </>
  );

  const renderScratchStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center">
          Choose Your Path
        </DialogTitle>
        <DialogDescription className="text-center">
          Select a template or start with a blank canvas.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <a href="/templates">
            <div
              className="p-6 border rounded-lg text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Sparkles className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-lg font-semibold mt-4">Use a Template</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose from our library of professional templates.
              </p>
            </div>
          </a>
        <a href="/editor/new">
            <div
              className="p-6 border rounded-lg text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Pencil className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-lg font-semibold mt-4">Create Your Own</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start with a blank resume and build it your way.
              </p>
            </div>
          </a>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={() => setStep("initial")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </DialogFooter>
    </>
  );

  const renderExistingStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center">
          Upload Your Resume
        </DialogTitle>
        <DialogDescription className="text-center">
          Upload your existing resume to get started.
        </DialogDescription>
      </DialogHeader>
      <div className="p-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={handleUploadClick}
        >
          <FileUp className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-4 text-sm text-muted-foreground">
            Click to upload a file (PDF, DOCX)
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx"
        />
        {resumes && resumes.length > 0 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or select a recent resume
                </span>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setStep("existing-options")}
                >
                  {resume.title}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={() => setStep("initial")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </DialogFooter>
    </>
  );

  const renderExistingOptionsStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center">
          Resume Uploaded!
        </DialogTitle>
        <DialogDescription className="text-center">
          {fileName ? `${fileName} is ready.` : "Your resume is ready."} What's next?
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <a href="/editor/new">
            <div
              className="p-6 border rounded-lg text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Pencil className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-lg font-semibold mt-4">Edit Directly</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Make changes to your uploaded resume.
              </p>
            </div>
          </a>
        <a href="/templates">
            <div
              className="p-6 border rounded-lg text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Sparkles className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-lg font-semibold mt-4">Use New Template</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Apply a new look to your existing content.
              </p>
            </div>
          </a>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={() => setStep("existing")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </DialogFooter>
    </>
  );

  const renderContent = () => {
    switch (step) {
      case "initial":
        return renderInitialStep();
      case "scratch":
        return renderScratchStep();
      case "existing":
        return renderExistingStep();
      case "existing-options":
        return renderExistingOptionsStep();
      default:
        return renderInitialStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">{renderContent()}</DialogContent>
    </Dialog>
  );
}