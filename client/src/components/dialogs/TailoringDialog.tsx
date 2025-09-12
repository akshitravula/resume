import { useState } from "react";
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
import { Upload } from "lucide-react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

interface TailoringDialogProps {
  isOpen: boolean;
  industries: string[];
  onClose: () => void;
  onConfirm: (file: File | null, industry: string) => void;
}

// Industry options from PostSignUpModal
const INDUSTRY_OPTIONS = [
  { id: "consulting", label: "Consulting" },
  { id: "finance", label: "Finance" },
  { id: "product", label: "Product" },
  { id: "tech", label: "Tech" },
  { id: "other", label: "Other" }
];

export function TailoringDialog({
  isOpen,
  onClose,
  onConfirm,
}: TailoringDialogProps) {
  const { user, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState(user?.industries?.[0] || "");
  const [customIndustry, setCustomIndustry] = useState(user?.industries || "");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleConfirm = () => {
    const finalIndustry = selectedIndustry === "other" ? customIndustry : selectedIndustry;
    if (finalIndustry) {
      onConfirm(file, finalIndustry);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSelectedIndustry("");
    setCustomIndustry("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tailor Your Profile</DialogTitle>
          <DialogDescription>
            Select your target industry and optionally upload your resume for better tailoring.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Industry Selection Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">
              Select Industry
            </h3>
            <Select onValueChange={setSelectedIndustry} value={selectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((industry) => (
                  <SelectItem key={industry.id} value={industry.id}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Industry Input */}
          {selectedIndustry === "other" && (
            <div className="space-y-2">
              <Input
                placeholder="Enter your specific industry"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
              />
            </div>
          )}

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
            disabled={!selectedIndustry || (selectedIndustry === "other" && !customIndustry)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}