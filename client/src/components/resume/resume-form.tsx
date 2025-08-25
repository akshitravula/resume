import React, { useState, useCallback, useEffect, useRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Eye, EyeOff, Minus, Sparkles } from "lucide-react";
import { AIEditDialog } from "./ai-edit-dialog";

// Updated Types based on new schema
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
  company_name: string | null;
  company_description: string | null;
  location: string | null;
  designation: string | null;
  designation_description: string | null;
  duration: string | null;
  internship_work_description_bullets: string[];
}

export interface Education {
  college: string | null;
  degree: string | null;
  start_year: number | null;
  end_year: number | null;
  cgpa: number | null;
}

export interface ScholasticAchievement {
  title: string | null;
  awarding_body: string | null;
  year: number | null;
  description: string | null;
}

export interface PositionOfResponsibility {
  role: string | null;
  role_description: string | null;
  organization: string | null;
  organization_description: string | null;
  location: string | null;
  duration: string | null;
  responsibilities: string[];
}

export interface ExtraCurricular {
  activity: string | null;
  position: string | null;
  description: string | null;
  year: number | null;
}

export interface Certification {
  certification: string | null;
  description: string | null;
  issuing_organization: string | null;
  time_of_certification: number | null;
}

export interface AcademicProject {
  project_name: string | null;
  project_description: string | null;
  description_bullets: string[];
  duration: string | null;
}

interface SectionVisibility {
  summary: boolean;
  education: boolean;
  workExperience: boolean;
  internships: boolean;
  academicProjects: boolean;
  achievements: boolean;
  positionsOfResponsibility: boolean;
  extraCurriculars: boolean;
  certifications: boolean;
  skills: boolean;
  interests: boolean;
  languages: boolean;
  externalLinks: boolean;
}

interface ResumeData {
  name: string | null;
  email: string | null;
  phone_number: string | null;
  summary: string | null;
  skills: string[];           // Remove optional
  interests: string[];        // Remove optional
  languages: string[];        // Remove optional
  external_links: string[];   // Remove optional
  education_entries: Education[];      // Remove optional
  work_experiences: WorkExperience[];  // Remove optional
  internships: Internship[];          // Remove optional
  achievements: ScholasticAchievement[]; // Remove optional
  positions_of_responsibility: PositionOfResponsibility[]; // Remove optional
  extra_curriculars: ExtraCurricular[]; // Remove optional
  certifications: Certification[];     // Remove optional
  academic_projects: AcademicProject[]; // Remove optional
}

interface ResumeFormProps {
  initialData: ResumeData;
  onChange: (data: ResumeData) => void;
  sectionVisibility: SectionVisibility;
  onSectionVisibilityChange: (visibility: SectionVisibility) => void;
}

// Helper function to ensure array fields are always arrays
const normalizeResumeData = (data: any): ResumeData => ({
  ...data,
  skills: Array.isArray(data.skills) ? data.skills : [],
  interests: Array.isArray(data.interests) ? data.interests : [],
  languages: Array.isArray(data.languages) ? data.languages : [],
  external_links: Array.isArray(data.external_links) ? data.external_links : [],
  education_entries: Array.isArray(data.education_entries) ? data.education_entries : [],
  work_experiences: Array.isArray(data.work_experiences) ? data.work_experiences : [],
  internships: Array.isArray(data.internships) ? data.internships : [],
  achievements: Array.isArray(data.achievements) ? data.achievements : [],
  positions_of_responsibility: Array.isArray(data.positions_of_responsibility) ? data.positions_of_responsibility : [],
  extra_curriculars: Array.isArray(data.extra_curriculars) ? data.extra_curriculars : [],
  certifications: Array.isArray(data.certifications) ? data.certifications : [],
  academic_projects: Array.isArray(data.academic_projects) ? data.academic_projects : []
});

export const ResumeForm = React.forwardRef<any, ResumeFormProps>(({ 
  initialData, 
  onChange, 
  sectionVisibility, 
  onSectionVisibilityChange 
}, ref) => {
  const personalInfoRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const workExperienceRef = useRef<HTMLDivElement>(null);
  const internshipsRef = useRef<HTMLDivElement>(null);
  const academicProjectsRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const positionsOfResponsibilityRef = useRef<HTMLDivElement>(null);
  const extraCurricularsRef = useRef<HTMLDivElement>(null);
  const certificationsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    personalInfoRef,
    educationRef,
    workExperienceRef,
    internshipsRef,
    academicProjectsRef,
    achievementsRef,
    positionsOfResponsibilityRef,
    extraCurricularsRef,
    certificationsRef,
    skillsRef,
  }));

  const [formData, setFormData] = useState<ResumeData>(() => normalizeResumeData(initialData));
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setFormData(normalizeResumeData(initialData));
  }, [initialData]);

  const debouncedOnChange = useCallback((newData: ResumeData) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(newData);
    }, 100);
  }, [onChange]);

  const updateFormData = useCallback((updater: (prev: ResumeData) => ResumeData) => {
    setFormData(prev => {
      const newData = updater(prev);
      debouncedOnChange(newData);
      return newData;
    });
  }, [debouncedOnChange]);

  const toggleSectionVisibility = useCallback((section: keyof SectionVisibility) => {
    const newVisibility = {
      ...sectionVisibility,
      [section]: !sectionVisibility[section],
    };
    onSectionVisibilityChange(newVisibility);
  }, [sectionVisibility, onSectionVisibilityChange]);

  // Uniform Visibility Toggle Component
  const VisibilityToggle = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="text-gray-400 hover:text-gray-400 p-1 rounded focus:outline-none focus:text-gray-400"
      title={visible ? "Hide" : "Show"}
      style={{ color: '#9CA3AF' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
    >
      {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  );

  // Uniform AI Edit Button Component
  const AIEditButton = ({ currentContent, section, onUpdate }: { 
    currentContent: string; 
    section: string;
    onUpdate: (content: string) => void;
  }) => (
    <AIEditDialog
      currentContent={currentContent}
      section={section}
      onUpdate={onUpdate}
      trigger={
        <button 
          className="text-orange-500 hover:text-orange-600 p-1 rounded transition-colors"
          title="Edit with AI"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      }
    />
  );

  // Personal Info Updates
  const updatePersonalInfo = useCallback((field: 'name' | 'email' | 'phone_number' | 'summary', value: string) => {
    updateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [updateFormData]);

  // Education Updates
  const updateEducation = useCallback((index: number, field: keyof Education, value: string | number) => {
    updateFormData(prev => ({
      ...prev,
      education_entries: prev.education_entries.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  }, [updateFormData]);

  const addEducation = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      education_entries: [...prev.education_entries, {
        college: null,
        degree: null,
        start_year: null,
        end_year: null,
        cgpa: null
      }]
    }));
  }, [updateFormData]);

  const removeEducation = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      education_entries: prev.education_entries.filter((_, i) => i !== index)
    }));
  }, [updateFormData]);

  // Work Experience Updates
  const updateWorkExperience = useCallback((index: number, field: keyof WorkExperience, value: string) => {
    updateFormData(prev => ({
      ...prev,
      work_experiences: prev.work_experiences.map((work, i) => 
        i === index ? { ...work, [field]: value } : work
      )
    }));
  }, [updateFormData]);

  const addWorkExperience = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      work_experiences: [...prev.work_experiences, {
        company_name: null,
        company_description: null,
        location: null,
        duration: null,
        designation: null,
        designation_description: null,
        projects: []
      }]
    }));
  }, [updateFormData]);

  const removeWorkExperience = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      work_experiences: prev.work_experiences.filter((_, i) => i !== index)
    }));
  }, [updateFormData]);

  // Work Project Updates
  const addWorkProject = useCallback((workIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      work_experiences: prev.work_experiences.map((work, i) => 
        i === workIndex ? {
          ...work,
          projects: [...work.projects, {
            project_name: null,
            project_description: null,
            description_bullets: []
          }]
        } : work
      )
    }));
  }, [updateFormData]);

  const removeWorkProject = useCallback((workIndex: number, projectIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      work_experiences: prev.work_experiences.map((work, i) => 
        i === workIndex ? {
          ...work,
          projects: work.projects.filter((_, j) => j !== projectIndex)
        } : work
      )
    }));
  }, [updateFormData]);

  const updateWorkProject = useCallback((
    workIndex: number, 
    projectIndex: number, 
    field: keyof Project, 
    value: string
  ) => {
    updateFormData(prev => ({
      ...prev,
      work_experiences: prev.work_experiences.map((work, i) => 
        i === workIndex ? {
          ...work,
          projects: work.projects.map((project, j) => 
            j === projectIndex ? { ...project, [field]: value } : project
          )
        } : work
      )
    }));
  }, [updateFormData]);

  const addWorkProjectBullet = useCallback((workIndex: number, projectIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      work_experiences: prev.work_experiences.map((work, i) => 
        i === workIndex ? {
          ...work,
          projects: work.projects.map((project, j) => 
            j === projectIndex ? {
              ...project,
              description_bullets: [...project.description_bullets, '']
            } : project
          )
        } : work
      )
    }));
  }, [updateFormData]);

  const updateWorkProjectBullet = useCallback((
    workIndex: number, 
    projectIndex: number, 
    bulletIndex: number, 
    value: string
  ) => {
    updateFormData(prev => ({
      ...prev,
      work_experiences: prev.work_experiences.map((work, i) => 
        i === workIndex ? {
          ...work,
          projects: work.projects.map((project, j) => 
            j === projectIndex ? {
              ...project,
              description_bullets: project.description_bullets.map((bullet, k) => 
                k === bulletIndex ? value : bullet
              )
            } : project
          )
        } : work
      )
    }));
  }, [updateFormData]);

  const removeWorkProjectBullet = useCallback((
    workIndex: number, 
    projectIndex: number, 
    bulletIndex: number
  ) => {
    updateFormData(prev => ({
      ...prev,
      work_experiences: prev.work_experiences.map((work, i) => 
        i === workIndex ? {
          ...work,
          projects: work.projects.map((project, j) => 
            j === projectIndex ? {
              ...project,
              description_bullets: project.description_bullets.filter((_, k) => k !== bulletIndex)
            } : project
          )
        } : work
      )
    }));
  }, [updateFormData]);

  // Internships Updates
  const updateInternship = useCallback((index: number, field: keyof Internship, value: string) => {
    updateFormData(prev => ({
      ...prev,
      internships: prev.internships.map((internship, i) => 
        i === index ? { ...internship, [field]: value } : internship
      )
    }));
  }, [updateFormData]);

  const addInternship = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      internships: [...prev.internships, {
        company_name: null,
        company_description: null,
        location: null,
        designation: null,
        designation_description: null,
        duration: null,
        internship_work_description_bullets: []
      }]
    }));
  }, [updateFormData]);

  const removeInternship = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      internships: prev.internships.filter((_, i) => i !== index)
    }));
  }, [updateFormData]);

  const addInternshipBullet = useCallback((internshipIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      internships: prev.internships.map((internship, i) => 
        i === internshipIndex ? {
          ...internship,
          internship_work_description_bullets: [...internship.internship_work_description_bullets, '']
        } : internship
      )
    }));
  }, [updateFormData]);

  const updateInternshipBullet = useCallback((
    internshipIndex: number, 
    bulletIndex: number, 
    value: string
  ) => {
    updateFormData(prev => ({
      ...prev,
      internships: prev.internships.map((internship, i) => 
        i === internshipIndex ? {
          ...internship,
          internship_work_description_bullets: internship.internship_work_description_bullets.map((bullet, j) => 
            j === bulletIndex ? value : bullet
          )
        } : internship
      )
    }));
  }, [updateFormData]);

  const removeInternshipBullet = useCallback((internshipIndex: number, bulletIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      internships: prev.internships.map((internship, i) => 
        i === internshipIndex ? {
          ...internship,
          internship_work_description_bullets: internship.internship_work_description_bullets.filter((_, j) => j !== bulletIndex)
        } : internship
      )
    }));
  }, [updateFormData]);

  // Academic Projects Updates
  const updateAcademicProject = useCallback((index: number, field: keyof AcademicProject, value: string) => {
    updateFormData(prev => ({
      ...prev,
      academic_projects: prev.academic_projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  }, [updateFormData]);

  const addAcademicProject = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      academic_projects: [...prev.academic_projects, {
        project_name: null,
        project_description: null,
        description_bullets: [],
        duration: null
      }]
    }));
  }, [updateFormData]);

  const removeAcademicProject = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      academic_projects: prev.academic_projects.filter((_, i) => i !== index)
    }));
  }, [updateFormData]);

  const addAcademicProjectBullet = useCallback((projectIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      academic_projects: prev.academic_projects.map((project, i) => 
        i === projectIndex ? {
          ...project,
          description_bullets: [...project.description_bullets, '']
        } : project
      )
    }));
  }, [updateFormData]);

  const updateAcademicProjectBullet = useCallback((
    projectIndex: number, 
    bulletIndex: number, 
    value: string
  ) => {
    updateFormData(prev => ({
      ...prev,
      academic_projects: prev.academic_projects.map((project, i) => 
        i === projectIndex ? {
          ...project,
          description_bullets: project.description_bullets.map((bullet, j) => 
            j === bulletIndex ? value : bullet
          )
        } : project
      )
    }));
  }, [updateFormData]);

  const removeAcademicProjectBullet = useCallback((projectIndex: number, bulletIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      academic_projects: prev.academic_projects.map((project, i) => 
        i === projectIndex ? {
          ...project,
          description_bullets: project.description_bullets.filter((_, j) => j !== bulletIndex)
        } : project
      )
    }));
  }, [updateFormData]);

  // Skills, Interests, Languages, External Links Updates
  const updateStringArray = useCallback((
    field: 'skills' | 'interests' | 'languages' | 'external_links',
    index: number,
    value: string
  ) => {
    updateFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  }, [updateFormData]);

  const addStringArrayItem = useCallback((field: 'skills' | 'interests' | 'languages' | 'external_links') => {
    updateFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  }, [updateFormData]);

  const removeStringArrayItem = useCallback((
    field: 'skills' | 'interests' | 'languages' | 'external_links',
    index: number
  ) => {
    updateFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, [updateFormData]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white min-h-screen">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-4" ref={personalInfoRef}>
          <Input
            value={formData.name || ''}
            onChange={(e) => updatePersonalInfo('name', e.target.value)}
            placeholder="NAME"
            className="text-3xl font-bold text-blue-600 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-3 py-2 bg-white"
          />
          <div className="flex items-center gap-2 text-blue-500">
            <Input
              value={formData.phone_number || ''}
              onChange={(e) => updatePersonalInfo('phone_number', e.target.value)}
              placeholder="Phone"
              className="flex-1 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-2 py-1 bg-white"
            />
            <span className="text-blue-500">|</span>
            <Input
              value={formData.email || ''}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder="Mail"
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
              <VisibilityToggle
                visible={sectionVisibility.summary}
                onToggle={() => toggleSectionVisibility('summary')}
              />
            </div>
          </div>
          {sectionVisibility.summary && (
            <div className="relative">
              <Textarea
                value={formData.summary || ''}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                placeholder="Enter Summary"
                className="border-2 border-blue-300 rounded-lg focus:border-blue-500 min-h-[100px] p-3 pr-10"
              />
              <div className="absolute top-2 right-2">
                <AIEditButton
                  currentContent={formData.summary || ''}
                  section="summary"
                  onUpdate={(newContent) => updatePersonalInfo('summary', newContent)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Education Section */}
        <div className={`space-y-4 ${!sectionVisibility.education ? 'opacity-50' : ''}`} ref={educationRef}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Education</h2>
              <VisibilityToggle
                visible={sectionVisibility.education}
                onToggle={() => toggleSectionVisibility('education')}
              />
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
          {sectionVisibility.education && formData.education_entries.map((edu, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                {formData.education_entries.length > 1 && (
                  <button
                    onClick={() => removeEducation(index)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 flex-1">
                  <Input
                    value={edu.college || ''}
                    onChange={(e) => updateEducation(index, 'college', e.target.value)}
                    placeholder="College"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    value={edu.degree || ''}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Degree"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    type="number"
                    value={edu.start_year || ''}
                    onChange={(e) => updateEducation(index, 'start_year', parseInt(e.target.value) || null)}
                    placeholder="Start Year"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    type="number"
                    value={edu.end_year || ''}
                    onChange={(e) => updateEducation(index, 'end_year', parseInt(e.target.value) || null)}
                    placeholder="End Year"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={edu.cgpa || ''}
                    onChange={(e) => updateEducation(index, 'cgpa', parseFloat(e.target.value) || null)}
                    placeholder="CGPA"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
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
              <VisibilityToggle
                visible={sectionVisibility.workExperience}
                onToggle={() => toggleSectionVisibility('workExperience')}
              />
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
          {sectionVisibility.workExperience && formData.work_experiences.map((work, workIndex) => (
            <div key={workIndex} className="space-y-3 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center gap-2">
                {formData.work_experiences.length > 1 && (
                  <button
                    onClick={() => removeWorkExperience(workIndex)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      value={work.company_name || ''}
                      onChange={(e) => updateWorkExperience(workIndex, 'company_name', e.target.value)}
                      placeholder="Company name"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <Input
                      value={work.designation || ''}
                      onChange={(e) => updateWorkExperience(workIndex, 'designation', e.target.value)}
                      placeholder="Designation"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <Input
                      value={work.duration || ''}
                      onChange={(e) => updateWorkExperience(workIndex, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      value={work.location || ''}
                      onChange={(e) => updateWorkExperience(workIndex, 'location', e.target.value)}
                      placeholder="Location"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <div className="relative">
                      <Input
                        value={work.company_description || ''}
                        onChange={(e) => updateWorkExperience(workIndex, 'company_description', e.target.value)}
                        placeholder="Company description"
                        className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                      />
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                        <AIEditButton
                          currentContent={work.company_description || ''}
                          section={`work-${workIndex}-company-desc`}
                          onUpdate={(newContent) => updateWorkExperience(workIndex, 'company_description', newContent)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={work.designation_description || ''}
                      onChange={(e) => updateWorkExperience(workIndex, 'designation_description', e.target.value)}
                      placeholder="Role description"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                      rows={3}
                    />
                    <div className="absolute top-2 right-2">
                      <AIEditButton
                        currentContent={work.designation_description || ''}
                        section={`work-${workIndex}-designation-desc`}
                        onUpdate={(newContent) => updateWorkExperience(workIndex, 'designation_description', newContent)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects within Work Experience */}
              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Projects</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addWorkProject(workIndex)}
                    className="h-7"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Project
                  </Button>
                </div>
                
                {(work?.projects || []).map((project, projectIndex) => (
                  <div key={projectIndex} className="space-y-2 pl-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeWorkProject(workIndex, projectIndex)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={project.project_name || ''}
                          onChange={(e) => updateWorkProject(workIndex, projectIndex, 'project_name', e.target.value)}
                          placeholder="Project name"
                          className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                        />
                        <div className="relative">
                          <Textarea
                            value={project.project_description || ''}
                            onChange={(e) => updateWorkProject(workIndex, projectIndex, 'project_description', e.target.value)}
                            placeholder="Project description"
                            className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                            rows={2}
                          />
                          <div className="absolute top-2 right-2">
                            <AIEditButton
                              currentContent={project.project_description || ''}
                              section={`work-${workIndex}-project-${projectIndex}-desc`}
                              onUpdate={(newContent) => updateWorkProject(workIndex, projectIndex, 'project_description', newContent)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project Bullets */}
                    <div className="space-y-1 pl-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Project Details</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addWorkProjectBullet(workIndex, projectIndex)}
                          className="h-6 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Detail
                        </Button>
                      </div>
                      {(project?.description_bullets || []).map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className="flex items-center gap-2">
                          {project.description_bullets.length > 1 && (
                            <button
                              onClick={() => removeWorkProjectBullet(workIndex, projectIndex, bulletIndex)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                          <div className="flex-1 relative">
                            <Input
                              value={bullet}
                              onChange={(e) => updateWorkProjectBullet(workIndex, projectIndex, bulletIndex, e.target.value)}
                              placeholder="Project detail"
                              className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10 text-sm"
                            />
                            <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                              <AIEditButton
                                currentContent={bullet}
                                section={`work-${workIndex}-project-${projectIndex}-bullet-${bulletIndex}`}
                                onUpdate={(newContent) => updateWorkProjectBullet(workIndex, projectIndex, bulletIndex, newContent)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Internships Section */}
        <div className={`space-y-4 ${!sectionVisibility.internships ? 'opacity-50' : ''}`} ref={internshipsRef}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Internships</h2>
              <VisibilityToggle
                visible={sectionVisibility.internships}
                onToggle={() => toggleSectionVisibility('internships')}
              />
            </div>
            {sectionVisibility.internships && (
              <button
                onClick={addInternship}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Field
              </button>
            )}
          </div>
          {sectionVisibility.internships && formData.internships.map((internship, internshipIndex) => (
            <div key={internshipIndex} className="space-y-3 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center gap-2">
                {formData.internships.length > 1 && (
                  <button
                    onClick={() => removeInternship(internshipIndex)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      value={internship.company_name || ''}
                      onChange={(e) => updateInternship(internshipIndex, 'company_name', e.target.value)}
                      placeholder="Company name"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <Input
                      value={internship.designation || ''}
                      onChange={(e) => updateInternship(internshipIndex, 'designation', e.target.value)}
                      placeholder="Designation"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <Input
                      value={internship.duration || ''}
                      onChange={(e) => updateInternship(internshipIndex, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      value={internship.location || ''}
                      onChange={(e) => updateInternship(internshipIndex, 'location', e.target.value)}
                      placeholder="Location"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <div className="relative">
                      <Input
                        value={internship.company_description || ''}
                        onChange={(e) => updateInternship(internshipIndex, 'company_description', e.target.value)}
                        placeholder="Company description"
                        className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                      />
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                        <AIEditButton
                          currentContent={internship.company_description || ''}
                          section={`internship-${internshipIndex}-company-desc`}
                          onUpdate={(newContent) => updateInternship(internshipIndex, 'company_description', newContent)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={internship.designation_description || ''}
                      onChange={(e) => updateInternship(internshipIndex, 'designation_description', e.target.value)}
                      placeholder="Role description"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                      rows={3}
                    />
                    <div className="absolute top-2 right-2">
                      <AIEditButton
                        currentContent={internship.designation_description || ''}
                        section={`internship-${internshipIndex}-designation-desc`}
                        onUpdate={(newContent) => updateInternship(internshipIndex, 'designation_description', newContent)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Internship Work Description Bullets */}
              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Work Description</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addInternshipBullet(internshipIndex)}
                    className="h-7"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Detail
                  </Button>
                </div>
                {internship.internship_work_description_bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-center gap-2">
                    {internship.internship_work_description_bullets.length > 1 && (
                      <button
                        onClick={() => removeInternshipBullet(internshipIndex, bulletIndex)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex-1 relative">
                      <Input
                        value={bullet}
                        onChange={(e) => updateInternshipBullet(internshipIndex, bulletIndex, e.target.value)}
                        placeholder="Work description"
                        className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                      />
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                        <AIEditButton
                          currentContent={bullet}
                          section={`internship-${internshipIndex}-bullet-${bulletIndex}`}
                          onUpdate={(newContent) => updateInternshipBullet(internshipIndex, bulletIndex, newContent)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Academic Projects Section */}
        <div className={`space-y-4 ${!sectionVisibility.academicProjects ? 'opacity-50' : ''}`} ref={academicProjectsRef}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Academic Projects</h2>
              <VisibilityToggle
                visible={sectionVisibility.academicProjects}
                onToggle={() => toggleSectionVisibility('academicProjects')}
              />
            </div>
            {sectionVisibility.academicProjects && (
              <button
                onClick={addAcademicProject}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Field
              </button>
            )}
          </div>
          {sectionVisibility.academicProjects && formData.academic_projects.map((project, projectIndex) => (
            <div key={projectIndex} className="space-y-3 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center gap-2">
                {formData.academic_projects.length > 1 && (
                  <button
                    onClick={() => removeAcademicProject(projectIndex)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      value={project.project_name || ''}
                      onChange={(e) => updateAcademicProject(projectIndex, 'project_name', e.target.value)}
                      placeholder="Project name"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <Input
                      value={project.duration || ''}
                      onChange={(e) => updateAcademicProject(projectIndex, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <Textarea
                      value={project.project_description || ''}
                      onChange={(e) => updateAcademicProject(projectIndex, 'project_description', e.target.value)}
                      placeholder="Project description"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                      rows={3}
                    />
                    <div className="absolute top-2 right-2">
                      <AIEditButton
                        currentContent={project.project_description || ''}
                        section={`academic-project-${projectIndex}-desc`}
                        onUpdate={(newContent) => updateAcademicProject(projectIndex, 'project_description', newContent)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Project Bullets */}
              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Project Details</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addAcademicProjectBullet(projectIndex)}
                    className="h-7"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Detail
                  </Button>
                </div>
                {(project?.description_bullets || []).map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-center gap-2">
                    {project.description_bullets.length > 1 && (
                      <button
                        onClick={() => removeAcademicProjectBullet(projectIndex, bulletIndex)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex-1 relative">
                      <Input
                        value={bullet}
                        onChange={(e) => updateAcademicProjectBullet(projectIndex, bulletIndex, e.target.value)}
                        placeholder="Project detail"
                        className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                      />
                      <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                        <AIEditButton
                          currentContent={bullet}
                          section={`academic-project-${projectIndex}-bullet-${bulletIndex}`}
                          onUpdate={(newContent) => updateAcademicProjectBullet(projectIndex, bulletIndex, newContent)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className={`space-y-4 ${!sectionVisibility.skills ? 'opacity-50' : ''}`} ref={skillsRef}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Skills</h2>
              <VisibilityToggle
                visible={sectionVisibility.skills}
                onToggle={() => toggleSectionVisibility('skills')}
              />
            </div>
            {sectionVisibility.skills && (
              <button
                onClick={() => addStringArrayItem('skills')}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Skill
              </button>
            )}
          </div>
          {sectionVisibility.skills && (
            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  {formData.skills.length > 1 && (
                    <button
                      onClick={() => removeStringArrayItem('skills', index)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex-1 relative">
                    <Input
                      value={skill}
                      onChange={(e) => updateStringArray('skills', index, e.target.value)}
                      placeholder="Skill"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                    />
                    <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                      <AIEditButton
                        currentContent={skill}
                        section={`skill-${index}`}
                        onUpdate={(newContent) => updateStringArray('skills', index, newContent)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interests Section */}
        <div className={`space-y-4 ${!sectionVisibility.interests ? 'opacity-50' : ''}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Interests</h2>
              <VisibilityToggle
                visible={sectionVisibility.interests}
                onToggle={() => toggleSectionVisibility('interests')}
              />
            </div>
            {sectionVisibility.interests && (
              <button
                onClick={() => addStringArrayItem('interests')}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Interest
              </button>
            )}
          </div>
          {sectionVisibility.interests && (
            <div className="space-y-2">
              {formData.interests.map((interest, index) => (
                <div key={index} className="flex items-center gap-2">
                  {formData.interests.length > 1 && (
                    <button
                      onClick={() => removeStringArrayItem('interests', index)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex-1 relative">
                    <Input
                      value={interest}
                      onChange={(e) => updateStringArray('interests', index, e.target.value)}
                      placeholder="Interest"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                    />
                    <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                      <AIEditButton
                        currentContent={interest}
                        section={`interest-${index}`}
                        onUpdate={(newContent) => updateStringArray('interests', index, newContent)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Languages Section */}
        <div className={`space-y-4 ${!sectionVisibility.languages ? 'opacity-50' : ''}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Languages</h2>
              <VisibilityToggle
                visible={sectionVisibility.languages}
                onToggle={() => toggleSectionVisibility('languages')}
              />
            </div>
            {sectionVisibility.languages && (
              <button
                onClick={() => addStringArrayItem('languages')}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Language
              </button>
            )}
          </div>
          {sectionVisibility.languages && (
            <div className="space-y-2">
              {formData.languages.map((language, index) => (
                <div key={index} className="flex items-center gap-2">
                  {formData.languages.length > 1 && (
                    <button
                      onClick={() => removeStringArrayItem('languages', index)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex-1 relative">
                    <Input
                      value={language}
                      onChange={(e) => updateStringArray('languages', index, e.target.value)}
                      placeholder="Language"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 pr-10"
                    />
                    <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                      <AIEditButton
                        currentContent={language}
                        section={`language-${index}`}
                        onUpdate={(newContent) => updateStringArray('languages', index, newContent)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* External Links Section */}
        <div className={`space-y-4 ${!sectionVisibility.externalLinks ? 'opacity-50' : ''}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">External Links</h2>
              <VisibilityToggle
                visible={sectionVisibility.externalLinks}
                onToggle={() => toggleSectionVisibility('externalLinks')}
              />
            </div>
            {sectionVisibility.externalLinks && (
              <button
                onClick={() => addStringArrayItem('external_links')}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Link
              </button>
            )}
          </div>
          {sectionVisibility.externalLinks && (
            <div className="space-y-2">
              {formData.external_links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  {formData.external_links.length > 1 && (
                    <button
                      onClick={() => removeStringArrayItem('external_links', index)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                  <Input
                    value={link}
                    onChange={(e) => updateStringArray('external_links', index, e.target.value)}
                    placeholder="External link (e.g., LinkedIn, GitHub, Portfolio)"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Default export
export default ResumeForm;