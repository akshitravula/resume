import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Sparkles, FileText } from "lucide-react";

interface TemplateSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIndustries: string[];
}

export function TemplateSelectionDialog({
  isOpen,
  onClose,
  selectedIndustries = [],
}: TemplateSelectionDialogProps) {
  const [, setLocation] = useLocation();
  const [selectedIndustry, setSelectedIndustry] = useState<string>(selectedIndustries[0] || ""); // State for selected industry

  const handleContinue = () => {
    // Logic to apply the selected template and navigate to the editor
    if (selectedIndustry) {
      setLocation(`/editor/new?industry=${selectedIndustry}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="text-center space-y-4 pt-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
            Perfect Template Selected!
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 font-medium">
            I've crafted a personalized resume template just for you
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Tailored for your industry:</h3>
            </div>
            
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="" disabled>
                Select an industry
              </option>
              {selectedIndustries.length > 0 ? (
                selectedIndustries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry.charAt(0).toUpperCase() + industry.slice(1)}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No industries available
                </option>
              )}
            </select>

            {selectedIndustries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No specific industries selected</p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium">
                Your resume template is ready and optimized for maximum impact
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between w-full px-6 pb-6 gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200 py-3 rounded-xl font-medium"
          >
            Maybe Later
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedIndustry} // Disable if no industry is selected
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Let's Continue! ✨
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}