import React, { useState, useCallback, useEffect, useRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Eye, EyeOff, Minus, Sparkles, X } from "lucide-react";

import type {Resume as ResumeType} from '@/types/resume';

interface AIFloatingBarProps {
  onSave: (text: string) => void;
  onClose: () => void;
  fieldType: string;
  position: { top: number; left: number } | null;
  fieldId: string;
  send: (data: any) => void;
}


// AI Floating Bar Component
const AIFloatingBar = ({ onSave, onClose, fieldType, position, fieldId, send }:AIFloatingBarProps) => {
  const [editedText, setEditedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {

    if(!send) {
      console.log("WebSocket not connected");
      return;
    }
      setIsGenerating(true);
  try {
    const payload = {
      type: "chat",
      message: {
        field: fieldType,
        question: editedText,
        selection: editedText,
        fieldId,
      },
    };

    console.log("Payload:", payload);

    send(payload); 
  } catch (error) {
    console.error("Error generating text:", error);
  } finally {
    setTimeout(() => setIsGenerating(false), 1000);
  }
  };

  const handleSave = () => {
    onSave(editedText);
    onClose();
  };

  if (!position) return null;

  return (
    <div 
      className="absolute z-10 bg-white border rounded-lg shadow-lg p-2 flex flex-col gap-2 min-w-80"
      style={{ top: position.top, left: position.left }}
    >
      <div className="text-xs text-gray-500 mb-1">
        Editing: {fieldId}
      </div>
      <Textarea
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        placeholder="AI suggestions..."
        className="min-h-[80px]"
      />
      <div className="flex justify-end gap-2">
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          size="sm"
          className="flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

// Updated Types matching new schema
export interface Project {
  project_name: string | null;
  project_description: string | null;
  description_bullets: string[];
}

export interface WorkExperience {
  company_name: string | null;
  company_description: string | null;
  location: string | null;
  duration: string | null;
  designation: string | null;
  designation_description: string | null;
  projects: Project[];
}

export interface Internship {
  id?: string;
  company_name: string | null;
  company_description: string | null;
  location: string | null;
  designation: string | null;
  designation_description: string | null;
  duration: string | null;
  internship_work_description_bullets: string[];
  visible?: boolean;
}

export interface Education {
  id?: string;
  college: string | null;
  degree: string | null;
  start_year: number | null;
  end_year: number | null;
  cgpa: number | null;
  visible?: boolean;
}

export interface ScholasticAchievement {
  id?: string;
  title: string | null;
  awarding_body: string | null;
  year: number | null;
  description: string | null;
  visible?: boolean;
}

export interface PositionOfResponsibility {
  id?: string;
  role: string | null;
  role_description: string | null;
  organization: string | null;
  organization_description: string | null;
  location: string | null;
  duration: string | null;
  responsibilities: string[];
  visible?: boolean;
}

export interface ExtraCurricular {
  id?: string;
  activity: string | null;
  position: string | null;
  description: string | null;
  year: number | null;
  visible?: boolean;
}

export interface Certification {
  id?: string;
  certification: string | null;
  description: string | null;
  issuing_organization: string | null;
  time_of_certification: number | null;
  visible?: boolean;
}

export interface AcademicProject {
  id?: string;
  project_name: string | null;
  project_description: string | null;
  description_bullets: string[];
  duration: string | null;
  visible?: boolean;
}

export interface ResumeInput {
  input_text: string | null;
  audio_file: string | null;
  transcribed_text: string | null;
  submitted_at: string | null;
}

export interface Resume {
  id: string;
  title: string | null;
  summary: string | null;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  updatedAt: string;
  status: "new" | "in-progress" | "completed";

  skills: string[];
  interests: string[];
  languages: string[];
  external_links: string[];
  resume_inputs: ResumeInput[];

  education_entries: Education[];
  work_experiences: WorkExperience[];
  internships: Internship[];
  achievements: ScholasticAchievement[];
  positions_of_responsibility: PositionOfResponsibility[];
  extra_curriculars: ExtraCurricular[];
  certifications: Certification[];
  academic_projects: AcademicProject[];
}

interface SectionVisibility {
  summary: boolean;
  education: boolean;
  workExperience: boolean;
  internships: boolean;
  projects: boolean;
  achievements: boolean;
  certifications: boolean;
  pors: boolean;
  extraCurriculars: boolean;
  skills: boolean;
}

// Generate unique ID helper
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface ResumeFormProps {
  initialData: ResumeType;
  onChange: (data: ResumeType) => void;
  sectionVisibility: SectionVisibility;
  onSectionVisibilityChange: (visibility: SectionVisibility) => void;
  send: (data: any) => void;
}

export const ResumeForm = React.forwardRef<any, ResumeFormProps>(({ 
  initialData, 
  onChange, 
  sectionVisibility, 
  onSectionVisibilityChange ,
  send
}, ref) => {
  const personalInfoRef = useRef<HTMLDivElement>(null);
  const workExperienceRef = useRef<HTMLDivElement>(null);
  const internshipsRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const porsRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const certificationsRef = useRef<HTMLDivElement>(null);
  const extraCurricularsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    personalInfoRef,
    workExperienceRef,
    internshipsRef,
    educationRef,
    projectsRef,
    porsRef,
    achievementsRef,
    certificationsRef,
    extraCurricularsRef,
    skillsRef,
  }));

  // Local state for immediate updates
  const [formData, setFormData] = useState<Resume>(initialData);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [aiBar, setAiBar] = useState({
    isOpen: false,
    fieldType: '',
    fieldId: '',
    onSave: null,
    position: null
  });

  const openAiBar = (e, fieldType, fieldId, onSave) => {
    const rect = e.target.getBoundingClientRect();
    setAiBar({
      isOpen: true,
      fieldType,
      fieldId,
      onSave,
      position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX }
    });
  };

  const closeAiBar = () => {
    setAiBar({
      isOpen: false,
      fieldType: '',
      fieldId: '',
      onSave: null,
      position: null
    });
  };

  const handleFieldChange = (field: keyof Resume, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Sync with parent when initialData changes
  useEffect(() => {
    if (JSON.stringify(initialData) !== JSON.stringify(formData)) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Debounced onChange to prevent excessive updates
  const debouncedOnChange = useCallback((newData: Resume) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(newData);
    }, 100);
  }, [onChange]);

  // Update form data and trigger parent update
const updateFormData = useCallback((updater: (prev: Resume) => Resume) => {
  setFormData(prev => {
    const newData = updater(prev);
    debouncedOnChange(newData);
    return newData;
  });
}, [debouncedOnChange]);

// Toggle section visibility
const toggleSectionVisibility = useCallback((section: keyof SectionVisibility) => {
  const newVisibility = {
    ...sectionVisibility,
    [section]: !sectionVisibility[section],
  };
  onSectionVisibilityChange(newVisibility);
}, [sectionVisibility, onSectionVisibilityChange]);

// Personal Info Updates
const updatePersonalInfo = useCallback((field: keyof Resume, value: string) => {
  updateFormData(prev => ({
    ...prev,
    [field]: value
  }));
}, [updateFormData]);

// Education Updates
const updateEducation = useCallback((index: number, field: keyof Education, value: string | number) => {
  updateFormData(prev => ({
    ...prev,
    education_entries: [...(prev.education_entries ?? [])].map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    )
  }));
}, [updateFormData]);

const addEducation = useCallback(() => {
  updateFormData(prev => ({
    ...prev,
    education_entries: [...(prev.education_entries ?? []), {
      id: `edu-${Date.now()}`,
      college: null,
      degree: null,
      cgpa: null,
      start_year: null,
      end_year: null,
      visible: true
    }]
  }));
}, [updateFormData]);

const removeEducation = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    education_entries: [...(prev.education_entries ?? [])].filter((_, i) => i !== index)
  }));
}, [updateFormData]);

const toggleEducationVisibility = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    education_entries: [...(prev.education_entries ?? [])].map((edu, i) => 
      i === index ? { ...edu, visible: !edu.visible } : edu
    )
  }));
}, [updateFormData]);

// Work Experience Updates
const updateWorkExperience = useCallback((index: number, field: keyof WorkExperience, value: any) => {
  updateFormData(prev => ({
    ...prev,
    work_experiences: [...(prev.work_experiences ?? [])].map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    )
  }));
}, [updateFormData]);

const addWorkExperience = useCallback(() => {
  updateFormData(prev => ({
    ...prev,
    work_experiences: [...(prev.work_experiences ?? []), {
      company_name: null,
      company_description: null,
      location: null,
      duration: null,
      designation: null,
      designation_description: null,
      projects: [{
        project_name: null,
        project_description: null,
        description_bullets: ['']
      }]
    }]
  }));
}, [updateFormData]);

const removeWorkExperience = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    work_experiences: [...(prev.work_experiences ?? [])].filter((_, i) => i !== index)
  }));
}, [updateFormData]);

// Work Experience Project Updates
const updateWorkProject = useCallback((workIndex: number, projectIndex: number, field: keyof Project, value: any) => {
  updateFormData(prev => ({
    ...prev,
    work_experiences: [...(prev.work_experiences ?? [])].map((exp, i) => 
      i === workIndex ? {
        ...exp,
        projects: [...(exp.projects ?? [])].map((project, j) =>
          j === projectIndex ? { ...project, [field]: value } : project
        )
      } : exp
    )
  }));
}, [updateFormData]);

const updateWorkProjectBullet = useCallback((workIndex: number, projectIndex: number, bulletIndex: number, value: string) => {
  updateFormData(prev => ({
    ...prev,
    work_experiences: [...(prev.work_experiences ?? [])].map((exp, i) => 
      i === workIndex ? {
        ...exp,
        projects: [...(exp.projects ?? [])].map((project, j) =>
          j === projectIndex ? {
            ...project,
            description_bullets: [...(project.description_bullets ?? [])].map((bullet, k) => k === bulletIndex ? value : bullet)
          } : project
        )
      } : exp
    )
  }));
}, [updateFormData]);

const addWorkProject = useCallback((workIndex: number) => {
  updateFormData(prev => ({
    ...prev,
    work_experiences: [...(prev.work_experiences ?? [])].map((exp, i) => 
      i === workIndex ? {
        ...exp,
        projects: [...(exp.projects ?? []), {
          project_name: null,
          project_description: null,
          description_bullets: ['']
        }]
      } : exp
    )
  }));
}, [updateFormData]);

const removeWorkProject = useCallback((workIndex: number, projectIndex: number) => {
  updateFormData(prev => ({
    ...prev,
    work_experiences: [...(prev.work_experiences ?? [])].map((exp, i) => 
      i === workIndex ? {
        ...exp,
        projects: [...(exp.projects ?? [])].filter((_, j) => j !== projectIndex)
      } : exp
    )
  }));
}, [updateFormData]);

const addWorkProjectBullet = useCallback((workIndex: number, projectIndex: number) => {
  updateFormData(prev => ({
    ...prev,
    work_experiences: [...(prev.work_experiences ?? [])].map((exp, i) => 
      i === workIndex ? {
        ...exp,
        projects: [...(exp.projects ?? [])].map((project, j) =>
          j === projectIndex ? {
            ...project,
            description_bullets: [...(project.description_bullets ?? []), '']
          } : project
        )
      } : exp
    )
  }));
}, [updateFormData]);

const removeWorkProjectBullet = useCallback((workIndex: number, projectIndex: number, bulletIndex: number) => {
  updateFormData(prev => ({
    ...prev,
    work_experiences: [...(prev.work_experiences ?? [])].map((exp, i) => 
      i === workIndex ? {
        ...exp,
        projects: [...(exp.projects ?? [])].map((project, j) =>
          j === projectIndex ? {
            ...project,
            description_bullets: [...(project.description_bullets ?? [])].filter((_, k) => k !== bulletIndex)
          } : project
        )
      } : exp
    )
  }));
}, [updateFormData]);

// Academic Projects Updates
const updateAcademicProject = useCallback((index: number, field: keyof AcademicProject, value: string | string[]) => {
  updateFormData(prev => ({
    ...prev,
    academic_projects: [...(prev.academic_projects ?? [])].map((project, i) => 
      i === index ? { ...project, [field]: value } : project
    )
  }));
}, [updateFormData]);

const updateProjectBullet = useCallback((projectIndex: number, bulletIndex: number, value: string) => {
  updateFormData(prev => ({
    ...prev,
    academic_projects: [...(prev.academic_projects ?? [])].map((project, i) => 
      i === projectIndex ? {
        ...project,
        description_bullets: [...(project.description_bullets ?? [])].map((bullet, j) => j === bulletIndex ? value : bullet)
      } : project
    )
  }));
}, [updateFormData]);

const addAcademicProject = useCallback(() => {
  updateFormData(prev => ({
    ...prev,
    academic_projects: [...(prev.academic_projects ?? []), {
      id: `project-${Date.now()}`,
      project_name: null,
      project_description: null,
      description_bullets: [''],
      duration: null,
      visible: true
    }]
  }));
}, [updateFormData]);

const removeAcademicProject = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    academic_projects: [...(prev.academic_projects ?? [])].filter((_, i) => i !== index)
  }));
}, [updateFormData]);

const addProjectBullet = useCallback((projectIndex: number) => {
  updateFormData(prev => ({
    ...prev,
    academic_projects: [...(prev.academic_projects ?? [])].map((project, i) => 
      i === projectIndex ? { 
        ...project, 
        description_bullets: [...(project.description_bullets ?? []), ''] 
      } : project
    )
  }));
}, [updateFormData]);

const removeProjectBullet = useCallback((projectIndex: number, bulletIndex: number) => {
  updateFormData(prev => ({
    ...prev,
    academic_projects: [...(prev.academic_projects ?? [])].map((project, i) => 
      i === projectIndex ? {
        ...project,
        description_bullets: [...(project.description_bullets ?? [])].filter((_, j) => j !== bulletIndex)
      } : project
    )
  }));
}, [updateFormData]);

const toggleProjectVisibility = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    academic_projects: [...(prev.academic_projects ?? [])].map((project, i) => 
      i === index ? { ...project, visible: !project.visible } : project
    )
  }));
}, [updateFormData]);

// POR Updates
const updatePOR = useCallback((index: number, field: keyof PositionOfResponsibility, value: string | string[]) => {
  updateFormData(prev => ({
    ...prev,
    positions_of_responsibility: [...(prev.positions_of_responsibility ?? [])].map((por, i) => 
      i === index ? { ...por, [field]: value } : por
    )
  }));
}, [updateFormData]);

const updatePORBullet = useCallback((porIndex: number, bulletIndex: number, value: string) => {
  updateFormData(prev => ({
    ...prev,
    positions_of_responsibility: [...(prev.positions_of_responsibility ?? [])].map((por, i) => 
      i === porIndex ? {
        ...por,
        responsibilities: [...(por.responsibilities ?? [])].map((bullet, j) => j === bulletIndex ? value : bullet)
      } : por
    )
  }));
}, [updateFormData]);

const addPOR = useCallback(() => {
  updateFormData(prev => ({
    ...prev,
    positions_of_responsibility: [...(prev.positions_of_responsibility ?? []), {
      id: `por-${Date.now()}`,
      role: null,
      role_description: null,
      organization: null,
      organization_description: null,
      location: null,
      duration: null,
      responsibilities: [''],
      visible: true
    }]
  }));
}, [updateFormData]);

const removePOR = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    positions_of_responsibility: [...(prev.positions_of_responsibility ?? [])].filter((_, i) => i !== index)
  }));
}, [updateFormData]);

const addPORBullet = useCallback((porIndex: number) => {
  updateFormData(prev => ({
    ...prev,
    positions_of_responsibility: [...(prev.positions_of_responsibility ?? [])].map((por, i) => 
      i === porIndex ? { ...por, responsibilities: [...(por.responsibilities ?? []), ''] } : por
    )
  }));
}, [updateFormData]);

const removePORBullet = useCallback((porIndex: number, bulletIndex: number) => {
  updateFormData(prev => ({
    ...prev,
    positions_of_responsibility: [...(prev.positions_of_responsibility ?? [])].map((por, i) => 
      i === porIndex ? {
        ...por,
        responsibilities: [...(por.responsibilities ?? [])].filter((_, j) => j !== bulletIndex)
      } : por
    )
  }));
}, [updateFormData]);

const togglePORVisibility = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    positions_of_responsibility: [...(prev.positions_of_responsibility ?? [])].map((por, i) => 
      i === index ? { ...por, visible: !por.visible } : por
    )
  }));
}, [updateFormData]);

// Achievement Updates
const updateAchievement = useCallback((index: number, field: keyof ScholasticAchievement, value: string | number) => {
  updateFormData(prev => ({
    ...prev,
    achievements: [...(prev.achievements ?? [])].map((achievement, i) => 
      i === index ? { ...achievement, [field]: value } : achievement
    )
  }));
}, [updateFormData]);

const addAchievement = useCallback(() => {
  updateFormData(prev => ({
    ...prev,
    achievements: [...(prev.achievements ?? []), {
      id: `achievement-${Date.now()}`,
      title: null,
      awarding_body: null,
      year: null,
      description: null,
      visible: true
    }]
  }));
}, [updateFormData]);

const removeAchievement = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    achievements: [...(prev.achievements ?? [])].filter((_, i) => i !== index)
  }));
}, [updateFormData]);

const toggleAchievementVisibility = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    achievements: [...(prev.achievements ?? [])].map((achievement, i) => 
      i === index ? { ...achievement, visible: !achievement.visible } : achievement
    )
  }));
}, [updateFormData]);

// Certification Updates
const updateCertification = useCallback((index: number, field: keyof Certification, value: string | number) => {
  updateFormData(prev => ({
    ...prev,
    certifications: [...(prev.certifications ?? [])].map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    )
  }));
}, [updateFormData]);

const addCertification = useCallback(() => {
  updateFormData(prev => ({
    ...prev,
    certifications: [...(prev.certifications ?? []), {
      id: `cert-${Date.now()}`,
      certification: null,
      description: null,
      issuing_organization: null,
      time_of_certification: null,
      visible: true
    }]
  }));
}, [updateFormData]);

const removeCertification = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    certifications: [...(prev.certifications ?? [])].filter((_, i) => i !== index)
  }));
}, [updateFormData]);

const toggleCertificationVisibility = useCallback((index: number) => {
  updateFormData(prev => ({
    ...prev,
    certifications: [...(prev.certifications ?? [])].map((cert, i) => 
      i === index ? { ...cert, visible: !cert.visible } : cert
    )
  }));
}, [updateFormData]);

// Skills Updates
const updateSkills = useCallback((value: string[]) => {
  updateFormData(prev => ({
    ...prev,
    skills: [...(value ?? [])]
  }));
}, [updateFormData]);


  return (
    <div className="w-full max-w-4xl mx-auto bg-white min-h-screen">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-4" ref={personalInfoRef}>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => updatePersonalInfo('name', e.target.value)}
            placeholder="NAME"
            className="text-3xl font-bold text-blue-600 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-3 py-2 bg-white"
          />
          <div className="flex items-center gap-2 text-blue-500">
            <Input
              id="phone"
              value={formData.phone_number || ''}
              onChange={(e) => updatePersonalInfo('phone_number', e.target.value)}
              placeholder="Phone"
              className="flex-1 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-2 py-1 bg-white"
            />
            <span className="text-blue-500">|</span>
            <Input
              id="email"
              value={formData.email || ''}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder="Mail"
              className="flex-1 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-2 py-1 bg-white"
            />
            <span className="text-blue-500">|</span>
            <Input
              id="linkedin"
              value={formData.external_links?.[0] || ''}
              onChange={(e) => {
                const newLinks = [...(formData.external_links || [])];
                newLinks[0] = e.target.value;
                updatePersonalInfo('external_links', newLinks);
              }}
              placeholder="LinkedIn"
              className="flex-1 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-2 py-1 bg-white"
            />
          </div>
        </div>

        <hr className="border-blue-500 border-t-2" />

        {/* Summary Section */}
        <div className={`space-y-3 ${!sectionVisibility.summary ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Summary</h2>
              <button
                onClick={() => toggleSectionVisibility('summary')}
                className="text-gray-400 hover:text-gray-600"
              >
                {sectionVisibility.summary ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {sectionVisibility.summary && (
            <div className="relative">
              <Textarea
                id="summary-field"
                value={formData.summary || ''}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                placeholder="Enter Summary"
                className="border-2 border-blue-300 rounded-lg focus:border-blue-500 min-h-[100px] p-3"
              />
              <button 
                onClick={(e) => openAiBar(e, 'summary', 'Summary Section', (text) => updatePersonalInfo('summary', text))}
                className="absolute top-2 right-2 p-1 text-orange-500 hover:text-orange-600"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Education Section */}
<div className={`space-y-4 ${!sectionVisibility.education ? 'opacity-50' : ''}`} ref={educationRef}>
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-semibold text-blue-600">Education</h2>
      <button
        onClick={() => toggleSectionVisibility('education')}
        className="text-gray-400 hover:text-gray-600"
      >
        {sectionVisibility.education ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
    {sectionVisibility.education && (
      <button
        onClick={addEducation}
        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
      >
        Add Field
      </button>
    )}
  </div>
  {sectionVisibility.education && (formData?.education_entries || []).map((edu, index) => (
    <div key={edu.id || index} className={`space-y-2 ${!edu.visible ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleEducationVisibility(index)}
          className="text-gray-400 hover:text-gray-600"
        >
          {edu.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        {(formData?.education_entries?.length || 0) > 1 && (
          <button
            onClick={() => removeEducation(index)}
            className="text-gray-400 hover:text-red-500"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <Input
            value={edu.college || ''}
            onChange={(e) => updateEducation(index, 'college', e.target.value)}
            placeholder="College/University"
            className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
          />
          <Input
            value={edu.degree || ''}
            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
            placeholder="Degree"
            className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
          />
          <Input
            value={edu.cgpa || ''}
            onChange={(e) => updateEducation(index, 'cgpa', parseFloat(e.target.value) || null)}
            placeholder="CGPA"
            className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
          />
          <div className="flex gap-2">
            <Input
              value={edu.start_year || ''}
              onChange={(e) => updateEducation(index, 'start_year', parseInt(e.target.value) || null)}
              placeholder="Start Year"
              className="border-2 border-blue-300 rounded-lg focus:border-blue-500 w-24"
            />
            <Input
              value={edu.end_year || ''}
              onChange={(e) => updateEducation(index, 'end_year', parseInt(e.target.value) || null)}
              placeholder="End Year"
              className="border-2 border-blue-300 rounded-lg focus:border-blue-500 w-24"
            />
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

        {/* Work Experience Section */}
<div className={`space-y-4 ${!sectionVisibility.workExperience ? 'opacity-50' : ''}`} ref={workExperienceRef}>
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-semibold text-blue-600">Work Experience</h2>
      <button
        onClick={() => toggleSectionVisibility('workExperience')}
        className="text-gray-400 hover:text-gray-600"
      >
        {sectionVisibility.workExperience ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
    {sectionVisibility.workExperience && (
      <button
        onClick={addWorkExperience}
        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
      >
        Add Field
      </button>
    )}
  </div>
  {sectionVisibility.workExperience && (formData?.work_experiences || []).map((work, workIndex) => (
    <div key={workIndex} className="space-y-3 border-l-2 border-gray-200 pl-4">
      <div className="flex items-center gap-2">
        {(formData?.work_experiences?.length || 0) > 1 && (
          <button
            onClick={() => removeWorkExperience(workIndex)}
            className="text-gray-400 hover:text-red-500"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Input
              value={work.designation || ''}
              onChange={(e) => updateWorkExperience(workIndex, 'designation', e.target.value)}
              placeholder="Designation"
              className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
            />
            <span className="text-gray-400">|</span>
            <Input
              value={work.company_name || ''}
              onChange={(e) => updateWorkExperience(workIndex, 'company_name', e.target.value)}
              placeholder="Company name"
              className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
            />
            <Input
              value={work.duration || ''}
              onChange={(e) => updateWorkExperience(workIndex, 'duration', e.target.value)}
              placeholder="Duration"
              className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white w-32"
            />
          </div>
          <Input
            value={work.location || ''}
            onChange={(e) => updateWorkExperience(workIndex, 'location', e.target.value)}
            placeholder="Location"
            className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
          />
        </div>
      </div>

      {/* Work Experience Projects */}
      <div className="ml-6 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-blue-600">Projects</h4>
          <button
            onClick={() => addWorkProject(workIndex)}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            Add Project
          </button>
        </div>
        
        {(work.projects || []).map((project, projectIndex) => (
          <div key={projectIndex} className="space-y-2 border-l-2 border-orange-200 pl-4">
            <div className="flex items-center gap-2">
              {(work.projects?.length || 0) > 1 && (
                <button
                  onClick={() => removeWorkProject(workIndex, projectIndex)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
              <Input
                value={project.project_name || ''}
                onChange={(e) => updateWorkProject(workIndex, projectIndex, 'project_name', e.target.value)}
                placeholder="Project Name"
                className="border-2 border-blue-300 rounded-lg focus:border-blue-500 flex-1"
              />
            </div>

            {(project.description_bullets || []).map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-center gap-2 ml-6">
                {(project.description_bullets?.length || 0) > 1 && (
                  <button
                    onClick={() => removeWorkProjectBullet(workIndex, projectIndex, bulletIndex)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={bullet}
                    onChange={(e) => updateWorkProjectBullet(workIndex, projectIndex, bulletIndex, e.target.value)}
                    placeholder="Project bullet point"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <button 
                    onClick={(e) => openAiBar(e, 'bullet', `Work Experience ${workIndex + 1} - Project ${projectIndex + 1} - Bullet ${bulletIndex + 1}`, (text) => updateWorkProjectBullet(workIndex, projectIndex, bulletIndex, text))}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => addWorkProjectBullet(workIndex, projectIndex)}
              className="ml-6 text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              Add Bullet
            </button>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>

        {/* Academic Projects Section */}
<div className={`space-y-4 ${!sectionVisibility.projects ? 'opacity-50' : ''}`} ref={projectsRef}>
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-semibold text-blue-600">Academic Projects</h2>
      <button
        onClick={() => toggleSectionVisibility('projects')}
        className="text-gray-400 hover:text-gray-600"
      >
        {sectionVisibility.projects ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
    {sectionVisibility.projects && (
      <button
        onClick={addAcademicProject}
        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
      >
        Add Field
      </button>
    )}
  </div>

  {sectionVisibility.projects && (formData.academic_projects ?? []).map((project, projectIndex) => (
    <div key={project.id || projectIndex} className={`space-y-3 border-l-2 border-gray-200 pl-4 ${!project.visible ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleProjectVisibility(projectIndex)}
          className="text-gray-400 hover:text-gray-600"
        >
          {project.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        {(formData.academic_projects ?? []).length > 1 && (
          <button
            onClick={() => removeAcademicProject(projectIndex)}
            className="text-gray-400 hover:text-red-500"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Input
              value={project.project_name || ''}
              onChange={(e) => updateAcademicProject(projectIndex, 'project_name', e.target.value)}
              placeholder="Project Name"
              className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
            />
            <Input
              value={project.duration || ''}
              onChange={(e) => updateAcademicProject(projectIndex, 'duration', e.target.value)}
              placeholder="Duration"
              className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white w-32"
            />
          </div>
        </div>
      </div>

      {(project.description_bullets ?? []).map((bullet, bulletIndex) => (
        <div key={bulletIndex} className="flex items-center gap-2 ml-6">
          {(project.description_bullets ?? []).length > 1 && (
            <button
              onClick={() => removeProjectBullet(projectIndex, bulletIndex)}
              className="text-gray-400 hover:text-red-500"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={bullet}
              onChange={(e) => updateProjectBullet(projectIndex, bulletIndex, e.target.value)}
              placeholder="Bullet"
              className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
            />
            <button 
              onClick={(e) => openAiBar(e, 'bullet', `Academic Project ${projectIndex + 1} - Bullet ${bulletIndex + 1}`, (text) => updateProjectBullet(projectIndex, bulletIndex, text))}
              className="text-orange-500 hover:text-orange-600"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => addProjectBullet(projectIndex)}
        className="ml-6 text-orange-500 hover:text-orange-600 text-sm font-medium"
      >
        Add Bullet
      </button>
    </div>
  ))}
</div>


        {/* Positions of Responsibility Section */}
        <div className={`space-y-4 ${!sectionVisibility.pors ? 'opacity-50' : ''}`} ref={porsRef}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Positions of Responsibility</h2>
              <button
                onClick={() => toggleSectionVisibility('pors')}
                className="text-gray-400 hover:text-gray-600"
              >
                {sectionVisibility.pors ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {sectionVisibility.pors && (
              <button
                onClick={addPOR}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Field
              </button>
            )}
          </div>
          {sectionVisibility.pors && (formData?.positions_of_responsibility || []).map((por, porIndex) => (
            <div key={por.id || porIndex} className={`space-y-3 border-l-2 border-gray-200 pl-4 ${!por.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePORVisibility(porIndex)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {por.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {(formData?.positions_of_responsibility?.length || 0) > 1 && (
                  <button
                    onClick={() => removePOR(porIndex)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={por.role || ''}
                      onChange={(e) => updatePOR(porIndex, 'role', e.target.value)}
                      placeholder="Role"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <Input
                      value={por.organization || ''}
                      onChange={(e) => updatePOR(porIndex, 'organization', e.target.value)}
                      placeholder="Organization"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <Input
                      value={por.duration || ''}
                      onChange={(e) => updatePOR(porIndex, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white w-32"
                    />
                  </div>
                  <Input
                    value={por.location || ''}
                    onChange={(e) => updatePOR(porIndex, 'location', e.target.value)}
                    placeholder="Location"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                  />
                </div>
              </div>
              {(por.responsibilities || []).map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex items-center gap-2 ml-6">
                  {(por.responsibilities?.length || 0) > 1 && (
                    <button
                      onClick={() => removePORBullet(porIndex, bulletIndex)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={bullet}
                      onChange={(e) => updatePORBullet(porIndex, bulletIndex, e.target.value)}
                      placeholder="Responsibility"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <button 
                      onClick={(e) => openAiBar(e, 'bullet', `POR ${porIndex + 1} - Responsibility ${bulletIndex + 1}`, (text) => updatePORBullet(porIndex, bulletIndex, text))}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addPORBullet(porIndex)}
                className="ml-6 text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Responsibility
              </button>
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        <div className={`space-y-4 ${!sectionVisibility.achievements ? 'opacity-50' : ''}`} ref={achievementsRef}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Achievements</h2>
              <button
                onClick={() => toggleSectionVisibility('achievements')}
                className="text-gray-400 hover:text-gray-600"
              >
                {sectionVisibility.achievements ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {sectionVisibility.achievements && (
              <button
                onClick={addAchievement}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Field
              </button>
            )}
          </div>
          {sectionVisibility.achievements && (formData?.achievements || []).map((achievement, index) => (
            <div key={achievement.id || index} className={`space-y-3 border-l-2 border-gray-200 pl-4 ${!achievement.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAchievementVisibility(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {achievement.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {(formData?.achievements?.length || 0) > 1 && (
                  <button
                    onClick={() => removeAchievement(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={achievement.title || ''}
                      onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                      placeholder="Achievement title"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <Input
                      value={achievement.awarding_body || ''}
                      onChange={(e) => updateAchievement(index, 'awarding_body', e.target.value)}
                      placeholder="Awarding Body"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <Input
                      value={achievement.year || ''}
                      onChange={(e) => updateAchievement(index, 'year', parseInt(e.target.value) || null)}
                      placeholder="Year"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white w-24"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Textarea
                      value={achievement.description || ''}
                      onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                      placeholder="Achievement description"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                      rows={2}
                    />
                    <button 
                      onClick={(e) => openAiBar(e, 'achievement', `Achievement ${index + 1} Description`, (text) => updateAchievement(index, 'description', text))}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Certifications Section */}
        <div className={`space-y-4 ${!sectionVisibility.certifications ? 'opacity-50' : ''}`} ref={certificationsRef}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Certifications</h2>
              <button
                onClick={() => toggleSectionVisibility('certifications')}
                className="text-gray-400 hover:text-gray-600"
              >
                {sectionVisibility.certifications ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {sectionVisibility.certifications && (
              <button
                onClick={addCertification}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Field
              </button>
            )}
          </div>
          {sectionVisibility.certifications && (formData?.certifications || []).map((cert, index) => (
            <div key={cert.id || index} className={`space-y-2 ${!cert.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCertificationVisibility(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {cert.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {(formData?.certifications?.length || 0) > 1 && (
                  <button
                    onClick={() => removeCertification(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                  <Input
                    value={cert.certification || ''}
                    onChange={(e) => updateCertification(index, 'certification', e.target.value)}
                    placeholder="Certification name"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    value={cert.issuing_organization || ''}
                    onChange={(e) => updateCertification(index, 'issuing_organization', e.target.value)}
                    placeholder="Issuing organization"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    value={cert.time_of_certification || ''}
                    onChange={(e) => updateCertification(index, 'time_of_certification', parseInt(e.target.value) || null)}
                    placeholder="Year"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

       {/* Skills Section */}
<div className={`space-y-4 ${!sectionVisibility.skills ? 'opacity-50' : ''}`} ref={skillsRef}>
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-semibold text-blue-600">Skills</h2>
      <button
        onClick={() => toggleSectionVisibility('skills')}
        className="text-gray-400 hover:text-gray-600"
      >
        {sectionVisibility.skills ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
    {sectionVisibility.skills && (
      <button
        onClick={() => updateSkills([...(formData.skills ?? []), ''])}
        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
      >
        Add Field
      </button>
    )}
  </div>

  {sectionVisibility.skills && (formData.skills ?? []).map((skill, index) => (
    <div key={index} className="flex items-center gap-2">
      <Input
        value={skill || ''}
        placeholder="Skill"
        onChange={(e) => {
          const newSkills = [...(formData.skills ?? [])];
          newSkills[index] = e.target.value;
          updateSkills(newSkills);
        }}
        className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none flex-1"
      />
      <button 
        onClick={(e) => openAiBar(e, 'skill', `Skill ${index + 1}`, (text) => {
          const newSkills = [...(formData.skills ?? [])];
          newSkills[index] = text;
          updateSkills(newSkills);
        })}
        className="text-orange-500 hover:text-orange-600"
      >
        <Sparkles className="w-4 h-4" />
      </button>
      {(formData.skills ?? []).length > 1 && (
        <button
          onClick={() => {
            const newSkills = (formData.skills ?? []).filter((_, i) => i !== index);
            updateSkills(newSkills);
          }}
          className="text-gray-400 hover:text-red-500"
        >
          <Minus className="w-4 h-4" />
        </button>
      )}
    </div>
  ))}
</div>

        
      </div>

      {/* AI Floating Bar */}
      {aiBar.isOpen && (
        <AIFloatingBar
          onSave={aiBar.onSave}
          onClose={closeAiBar}
          fieldType={aiBar.fieldType}
          fieldId={aiBar.fieldId}
          position={aiBar.position}
          send={send}
        />
      )}
      
    </div>
  );
});

ResumeForm.displayName = 'ResumeForm';

export default ResumeForm;