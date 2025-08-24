import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

interface ResumeStartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeStartDialog({ isOpen, onClose }: ResumeStartDialogProps) {
  const [step, setStep] = useState('initial');

  const handleClose = () => {
    setStep('initial');
    onClose();
  };

  const renderInitialStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Create or Update Your Resume</DialogTitle>
        <DialogDescription>
          How would you like to proceed?
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4">
        <Button onClick={() => setStep('scratch')}>Start from Scratch</Button>
        <Button onClick={() => setStep('existing')}>Use Existing Resume</Button>
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );

  const renderScratchStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Start from Scratch</DialogTitle>
        <DialogDescription>
          Choose a foundation for your new resume.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col space-y-3 py-4">
        <Button asChild>
          <Link to="/templates" onClick={handleClose}>Choose a Template</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/editor/new?template=custom" onClick={handleClose}>Create Your Own (Blank)</Link>
        </Button>
      </div>
      <DialogFooter className="justify-between">
        <Button variant="ghost" onClick={() => setStep('initial')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );

  const renderExistingStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Use Existing Resume</DialogTitle>
        <DialogDescription>
          Select your existing resume and decide on a template.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col space-y-3 py-4">
         <Button asChild>
          <Link to="/resumes" onClick={handleClose}>Continue with Existing Template</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/templates" onClick={handleClose}>Choose a New Template</Link>
        </Button>
      </div>
      <DialogFooter className="justify-between">
        <Button variant="ghost" onClick={() => setStep('initial')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 'initial' && renderInitialStep()}
        {step === 'scratch' && renderScratchStep()}
        {step === 'existing' && renderExistingStep()}
      </DialogContent>
    </Dialog>
  );
}