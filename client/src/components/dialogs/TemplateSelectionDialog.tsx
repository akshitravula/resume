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
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Sparkles, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

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
  const { user, loading } = useAuth();
  const [selectedIndustry, setSelectedIndustry] = useState<string>(selectedIndustries[0] || "");
  
  // Add state for fetched data
  const [fetchedIndustries, setFetchedIndustries] = useState<string[]>([]);
  const [fetchedLevel, setFetchedLevel] = useState<string>("");
  const [fetchedBrief, setFetchedBrief] = useState<string>("");
  const [fetchedFileName, setFetchedFileName] = useState<string>("");
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

  // Industry options mapping (same as in PostSignUpModal)
  const industryOptions = [
    { value: "consulting", label: "Consulting" },
    { value: "finance", label: "Finance" },
    { value: "product", label: "Product" },
    { value: "tech", label: "Tech" }
  ];

  // Function to get user preferences (same as in PostSignUpModal)
  async function getUserPreferences() {
    if (!user) return;

    try {
      setIsLoadingPreferences(true);
      const response = await apiRequest("GET", `/api/user/get-preferences`);

      console.log("Fetched preferences:", response);
      
      if (response) {
        setFetchedIndustries(response.industries || []);
        setFetchedBrief(response.brief || "");
        setFetchedLevel(response.level || "entry");
        setFetchedFileName(response.fileName || "");
        
        // Set the first industry as selected if none is currently selected
        if (!selectedIndustry && response.industries && response.industries.length > 0) {
          setSelectedIndustry(response.industries[0]);
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

  // Use fetched industries if available, otherwise fall back to prop
  const industriesToDisplay = fetchedIndustries.length > 0 ? fetchedIndustries : selectedIndustries;

  // Helper function to get industry label
  const getIndustryLabel = (value: string) => {
    const option = industryOptions.find(opt => opt.value === value);
    return option ? option.label : value.charAt(0).toUpperCase() + value.slice(1);
  };

  const handleContinue = () => {
    // Logic to apply the selected template and navigate to the editor
    if (selectedIndustry) {
      // You can now also pass additional fetched data if needed
      const queryParams = new URLSearchParams({
        industry: selectedIndustry,
        level: fetchedLevel,
        // Add other params if needed
      });
      
      setLocation(`/editor/new?${queryParams.toString()}`);
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
            
            {isLoadingPreferences ? (
              <div className="w-full p-3 border rounded-lg text-sm text-center text-gray-500">
                Loading your preferences...
              </div>
            ) : (
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="" disabled>
                  Select an industry
                </option>
                {industriesToDisplay.length > 0 ? (
                  industriesToDisplay.map((industry) => (
                    <option key={industry} value={industry}>
                      {getIndustryLabel(industry)}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No industries available
                  </option>
                )}
              </select>
            )}

            {industriesToDisplay.length === 0 && !isLoadingPreferences && (
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
                {fetchedLevel && (
                  <span className="ml-1">
                    (Tailored for {fetchedLevel === 'entry' ? 'Entry Level' : fetchedLevel === 'mid' ? 'Mid Level' : 'Senior Level'})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Optional: Show additional fetched data for debugging */}
          {process.env.NODE_ENV === 'development' && fetchedBrief && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Brief:</strong> {fetchedBrief.substring(0, 100)}...
              </p>
              {fetchedFileName && (
                <p className="text-xs text-blue-700 mt-1">
                  <strong>File:</strong> {fetchedFileName}
                </p>
              )}
            </div>
          )}
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
            disabled={!selectedIndustry || isLoadingPreferences}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
            {isLoadingPreferences ? 'Loading...' : "Let's Continue! ✨"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}