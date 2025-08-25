import { Link, useLocation } from "wouter";
import { FileText, Upload, Palette, Settings, Menu, User, LogOut, Home, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ResumeUpload } from "@/components/upload/resume-upload";
import { PostSignUpModal } from "@/components/dialogs/PostSignUpModal";
import { useAuth } from "@/hooks/use-auth";
import { TemplateSelectionDialog } from "@/components/dialogs/TemplateSelectionDialog";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const [showUpload, setShowUpload] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [showPostSignUpModal, setShowPostSignUpModal] = useState(false); // Changed to false initially
  const { user, signOut } = useAuth();

  const handleManageResumeClick = () => {
    if (location !== "/dashboard") {
      setLocation("/dashboard");
    }
    setTimeout(() => {
      const element = document.getElementById("in-progress-resumes");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleEditPreferencesClick = () => {
    // Open the PostSignUpModal when Edit Preferences is clicked
    setShowPostSignUpModal(true);
  };

  const handlePostSignUpClose = (industries: string[]) => {
    setShowPostSignUpModal(false);
    setShowTemplateSelection(true);
    setSelectedIndustries(industries);
  };

  const handleTemplateSelectionClose = () => {
    setShowTemplateSelection(false);
  };

  return (
    <>
      <aside className="w-64 bg-gray-50 border-r border-gray-200 fixed h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <FileText className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Career AI</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Button>
          </Link>
          <Link href="/templates">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            >
              <Palette className="w-5 h-5 mr-3" />
              Select Template
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            onClick={handleManageResumeClick}
          >
            <Menu className="w-5 h-5 mr-3" />
            Manage Resumes
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            onClick={handleEditPreferencesClick}
          >
            <Pencil className="w-5 h-5 mr-3" />
            Edit Preferences
          </Button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="text-gray-600" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-gray-600 hover:bg-gray-200">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Modals rendered outside the aside element with high z-index */}
      <div className="relative z-[9999]">
        <ResumeUpload isOpen={showUpload} onClose={() => setShowUpload(false)} />
        <PostSignUpModal
          isOpen={showPostSignUpModal}
          onClose={handlePostSignUpClose}
        />
        <TemplateSelectionDialog
          isOpen={showTemplateSelection}
          onClose={handleTemplateSelectionClose}
          selectedIndustries={selectedIndustries}
        />
      </div>
    </>
  );
}