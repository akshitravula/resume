import React, { useState, useCallback, useEffect, useRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Eye, EyeOff, Minus, Sparkles } from "lucide-react";

// Types (unchanged)
interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  linkedin: string;
  summary: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  gpa: string;
  year: string;
  visible: boolean;
}

interface WorkExperience {
  id: string;
  designation: string;
  company: string;
  year: string;
  bullets: string[];
  visible: boolean;
}

interface Project {
  id: string;
  title: string;
  technologies: string;
  year: string;
  bullets: string[];
  visible: boolean;
}

interface POR {
  id: string;
  title: string;
  year: string;
  bullets: string[];
  visible: boolean;
}

interface Achievement {
  id: string;
  title: string;
  year: string;
  description: string;
  visible: boolean;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  visible: boolean;
}

interface Skills {
  technical: string;
  languages: string;
  frameworks: string;
  tools: string;
}

interface SectionVisibility {
  summary: boolean;
  education: boolean;
  workExperience: boolean;
  projects: boolean;
  pors: boolean;
  achievements: boolean;
  certifications: boolean;
  skills: boolean;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  pors: POR[];
  achievements: Achievement[];
  certifications: Certification[];
  skills: Skills;
}

// Generate unique ID helper (unchanged)
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface ResumeFormProps {
  initialData: ResumeData;
  onChange: (data: ResumeData) => void;
  sectionVisibility: SectionVisibility;
  onSectionVisibilityChange: (visibility: SectionVisibility) => void;
}

export const ResumeForm = React.forwardRef<any, ResumeFormProps>(({ 
  initialData, 
  onChange, 
  sectionVisibility, 
  onSectionVisibilityChange 
}, ref) => {
  const personalInfoRef = useRef<HTMLDivElement>(null);
  const workExperienceRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const porsRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const certificationsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    personalInfoRef,
    workExperienceRef,
    educationRef,
    projectsRef,
    porsRef,
    achievementsRef,
    certificationsRef,
    skillsRef,
  }));

  // Local state for immediate updates
  const [formData, setFormData] = useState<ResumeData>(initialData);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // In your ResumeForm component
const handleFieldChange = (field: string, value: any) => {
  const updatedData = { ...initialData, [field]: value };
  onChange(updatedData); // This is crucial!
};

  // Sync with parent when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Debounced onChange to prevent excessive updates
  const debouncedOnChange = useCallback((newData: ResumeData) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(newData);
    }, 100); // 100ms debounce
  }, [onChange]);

  // Update form data and trigger parent update
  const updateFormData = useCallback((updater: (prev: ResumeData) => ResumeData) => {
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
  const updatePersonalInfo = useCallback((field: keyof PersonalInfo, value: string) => {
    updateFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  }, [updateFormData]);

  // Education Updates
  const updateEducation = useCallback((index: number, field: keyof Education, value: string) => {
    updateFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  }, [updateFormData]);

  const addEducation = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: `edu-${Date.now()}`,
        institution: '',
        degree: '',
        gpa: '',
        year: '',
        visible: true
      }]
    }));
  }, [updateFormData]);

  const removeEducation = useCallback((id: string) => {
    updateFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  }, [updateFormData]);

  const toggleEducationVisibility = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, visible: !edu.visible } : edu
      )
    }));
  }, [updateFormData]);

  // Work Experience Updates
  const updateWorkExperience = useCallback((index: number, field: keyof WorkExperience, value: string) => {
    updateFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) => 
        i === index ? { ...work, [field]: value } : work
      )
    }));
  }, [updateFormData]);

  const updateWorkBullet = useCallback((workIndex: number, bulletIndex: number, value: string) => {
    updateFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) => 
        i === workIndex ? {
          ...work,
          bullets: work.bullets.map((bullet, j) => j === bulletIndex ? value : bullet)
        } : work
      )
    }));
  }, [updateFormData]);

  const addWorkExperience = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        id: `work-${Date.now()}`,
        designation: '',
        company: '',
        year: '',
        bullets: [''],
        visible: true
      }]
    }));
  }, [updateFormData]);

  const removeWorkExperience = useCallback((id: string) => {
    updateFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(work => work.id !== id)
    }));
  }, [updateFormData]);

  const addWorkBullet = useCallback((workIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) => 
        i === workIndex ? { ...work, bullets: [...work.bullets, ''] } : work
      )
    }));
  }, [updateFormData]);

  const removeWorkBullet = useCallback((workIndex: number, bulletIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) => 
        i === workIndex ? {
          ...work,
          bullets: work.bullets.filter((_, j) => j !== bulletIndex)
        } : work
      )
    }));
  }, [updateFormData]);

  const toggleWorkVisibility = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) => 
        i === index ? { ...work, visible: !work.visible } : work
      )
    }));
  }, [updateFormData]);

  // Project Updates
  const updateProject = useCallback((index: number, field: keyof Project, value: string) => {
    updateFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  }, [updateFormData]);

  const updateProjectBullet = useCallback((projectIndex: number, bulletIndex: number, value: string) => {
    updateFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex ? {
          ...project,
          bullets: project.bullets.map((bullet, j) => j === bulletIndex ? value : bullet)
        } : project
      )
    }));
  }, [updateFormData]);

  const addProject = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: `project-${Date.now()}`,
        title: '',
        technologies: '',
        year: '',
        bullets: [''],
        visible: true
      }]
    }));
  }, [updateFormData]);

  const removeProject = useCallback((id: string) => {
    updateFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  }, [updateFormData]);

  const addProjectBullet = useCallback((projectIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex ? { ...project, bullets: [...project.bullets, ''] } : project
      )
    }));
  }, [updateFormData]);

  const removeProjectBullet = useCallback((projectIndex: number, bulletIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex ? {
          ...project,
          bullets: project.bullets.filter((_, j) => j !== bulletIndex)
        } : project
      )
    }));
  }, [updateFormData]);

  const toggleProjectVisibility = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, visible: !project.visible } : project
      )
    }));
  }, [updateFormData]);

  // POR Updates
  const updatePOR = useCallback((index: number, field: keyof POR, value: string) => {
    updateFormData(prev => ({
      ...prev,
      pors: prev.pors.map((por, i) => 
        i === index ? { ...por, [field]: value } : por
      )
    }));
  }, [updateFormData]);

  const updatePORBullet = useCallback((porIndex: number, bulletIndex: number, value: string) => {
    updateFormData(prev => ({
      ...prev,
      pors: prev.pors.map((por, i) => 
        i === porIndex ? {
          ...por,
          bullets: por.bullets.map((bullet, j) => j === bulletIndex ? value : bullet)
        } : por
      )
    }));
  }, [updateFormData]);

  const addPOR = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      pors: [...prev.pors, {
        id: `por-${Date.now()}`,
        title: '',
        year: '',
        bullets: [''],
        visible: true
      }]
    }));
  }, [updateFormData]);

  const removePOR = useCallback((id: string) => {
    updateFormData(prev => ({
      ...prev,
      pors: prev.pors.filter(por => por.id !== id)
    }));
  }, [updateFormData]);

  const addPORBullet = useCallback((porIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      pors: prev.pors.map((por, i) => 
        i === porIndex ? { ...por, bullets: [...por.bullets, ''] } : por
      )
    }));
  }, [updateFormData]);

  const removePORBullet = useCallback((porIndex: number, bulletIndex: number) => {
    updateFormData(prev => ({
      ...prev,
      pors: prev.pors.map((por, i) => 
        i === porIndex ? {
          ...por,
          bullets: por.bullets.filter((_, j) => j !== bulletIndex)
        } : por
      )
    }));
  }, [updateFormData]);

  const togglePORVisibility = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      pors: prev.pors.map((por, i) => 
        i === index ? { ...por, visible: !por.visible } : por
      )
    }));
  }, [updateFormData]);

  // Achievement Updates
  const updateAchievement = useCallback((index: number, field: keyof Achievement, value: string) => {
    updateFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? { ...achievement, [field]: value } : achievement
      )
    }));
  }, [updateFormData]);

  const addAchievement = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, {
        id: `achievement-${Date.now()}`,
        title: '',
        year: '',
        description: '',
        visible: true
      }]
    }));
  }, [updateFormData]);

  const removeAchievement = useCallback((id: string) => {
    updateFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement.id !== id)
    }));
  }, [updateFormData]);

  const toggleAchievementVisibility = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? { ...achievement, visible: !achievement.visible } : achievement
      )
    }));
  }, [updateFormData]);

  // Certification Updates
  const updateCertification = useCallback((index: number, field: keyof Certification, value: string) => {
    updateFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  }, [updateFormData]);

  const addCertification = useCallback(() => {
    updateFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: `cert-${Date.now()}`,
        name: '',
        issuer: '',
        year: '',
        visible: true
      }]
    }));
  }, [updateFormData]);

  const removeCertification = useCallback((id: string) => {
    updateFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  }, [updateFormData]);

  const toggleCertificationVisibility = useCallback((index: number) => {
    updateFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, visible: !cert.visible } : cert
      )
    }));
  }, [updateFormData]);

  // Skills Updates
  const updateSkills = useCallback((field: keyof Skills, value: string) => {
    updateFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [field]: value
      }
    }));
  }, [updateFormData]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white min-h-screen">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-4" ref={personalInfoRef}>
          <Input
            id="fullName"
            value={formData.personalInfo.fullName}
            onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            placeholder="NAME"
            className="text-3xl font-bold text-blue-600 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-3 py-2 bg-white"
          />
          <div className="flex items-center gap-2 text-blue-500">
            <Input
              id="phone"
              value={formData.personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder="Phone"
              className="flex-1 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-2 py-1 bg-white"
            />
            <span className="text-blue-500">|</span>
            <Input
              id="email"
              value={formData.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder="Mail"
              className="flex-1 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-2 py-1 bg-white"
            />
            <span className="text-blue-500">|</span>
            <Input
              id="linkedin"
              value={formData.personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
              placeholder="LinkedIn"
              className="flex-1 border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none px-2 py-1 bg-white"
            />
          </div>
        </div>

        <hr className="border-blue-500 border-t-2" />

        {/* Summary Section */}
        <div className={`space-y-3 ${!sectionVisibility.summary ? 'opacity-50' : ''}`} ref={personalInfoRef}>
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
                id="summary"
                value={formData.personalInfo.summary}
                onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                placeholder="Enter Summary"
                className="border-2 border-blue-300 rounded-lg focus:border-blue-500 min-h-[100px] p-3"
              />
              <button className="absolute top-2 right-2 p-1 text-orange-500 hover:text-orange-600">
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
          {sectionVisibility.education && formData.education.map((edu, index) => (
            <div key={edu.id} className={`space-y-2 ${!edu.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleEducationVisibility(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {edu.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {formData.education.length > 1 && (
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
                  <Input
                    id={`edu-institution-${edu.id}`}
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    placeholder="Insti name"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    id={`edu-degree-${edu.id}`}
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Degree"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    id={`edu-gpa-${edu.id}`}
                    value={edu.gpa}
                    onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                    placeholder="GPA"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    id={`edu-year-${edu.id}`}
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    placeholder="Year"
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
              <h2 className="text-xl font-semibold text-blue-600">Work ex</h2>
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
          {sectionVisibility.workExperience && formData.workExperience.map((work, workIndex) => (
            <div key={work.id} className={`space-y-3 border-l-2 border-gray-200 pl-4 ${!work.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWorkVisibility(workIndex)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {work.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {formData.workExperience.length > 1 && (
                  <button
                    onClick={() => removeWorkExperience(work.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id={`work-designation-${work.id}`}
                      value={work.designation}
                      onChange={(e) => updateWorkExperience(workIndex, 'designation', e.target.value)}
                      placeholder="Designation"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <span className="text-gray-400">|</span>
                    <Input
                      id={`work-company-${work.id}`}
                      value={work.company}
                      onChange={(e) => updateWorkExperience(workIndex, 'company', e.target.value)}
                      placeholder="Company name"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <Input
                      id={`work-year-${work.id}`}
                      value={work.year}
                      onChange={(e) => updateWorkExperience(workIndex, 'year', e.target.value)}
                      placeholder="Year"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white w-24"
                    />
                  </div>
                </div>
              </div>
              {work.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex items-center gap-2 ml-6">
                  {work.bullets.length > 1 && (
                    <button
                      onClick={() => removeWorkBullet(workIndex, bulletIndex)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      id={`work-bullet-${work.id}-${bulletIndex}`}
                      value={bullet}
                      onChange={(e) => updateWorkBullet(workIndex, bulletIndex, e.target.value)}
                      placeholder="Bullet"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <button className="text-orange-500 hover:text-orange-600">
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addWorkBullet(workIndex)}
                className="ml-6 text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Bullet
              </button>
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div className={`space-y-4 ${!sectionVisibility.projects ? 'opacity-50' : ''}`} ref={projectsRef}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">Projects</h2>
              <button
                onClick={() => toggleSectionVisibility('projects')}
                className="text-gray-400 hover:text-gray-600"
              >
                {sectionVisibility.projects ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {sectionVisibility.projects && (
              <button
                onClick={addProject}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Field
              </button>
            )}
          </div>
          {sectionVisibility.projects && formData.projects.map((project, projectIndex) => (
            <div key={project.id} className={`space-y-3 border-l-2 border-gray-200 pl-4 ${!project.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleProjectVisibility(projectIndex)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {project.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {formData.projects.length > 1 && (
                  <button
                    onClick={() => removeProject(project.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id={`project-title-${project.id}`}
                      value={project.title}
                      onChange={(e) => updateProject(projectIndex, 'title', e.target.value)}
                      placeholder="Project title"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <span className="text-gray-400">|</span>
                    <Input
                      id={`project-technologies-${project.id}`}
                      value={project.technologies}
                      onChange={(e) => updateProject(projectIndex, 'technologies', e.target.value)}
                      placeholder="Technologies used"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <Input
                      id={`project-year-${project.id}`}
                      value={project.year}
                      onChange={(e) => updateProject(projectIndex, 'year', e.target.value)}
                      placeholder="Year"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white w-24"
                    />
                  </div>
                </div>
              </div>
              {project.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex items-center gap-2 ml-6">
                  {project.bullets.length > 1 && (
                    <button
                      onClick={() => removeProjectBullet(projectIndex, bulletIndex)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      id={`project-bullet-${project.id}-${bulletIndex}`}
                      value={bullet}
                      onChange={(e) => updateProjectBullet(projectIndex, bulletIndex, e.target.value)}
                      placeholder="Bullet"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <button className="text-orange-500 hover:text-orange-600">
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

        {/* PORs Section */}
        <div className={`space-y-4 ${!sectionVisibility.pors ? 'opacity-50' : ''}`} ref={porsRef}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-blue-600">PORs</h2>
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
          {sectionVisibility.pors && formData.pors.map((por, porIndex) => (
            <div key={por.id} className={`space-y-3 border-l-2 border-gray-200 pl-4 ${!por.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePORVisibility(porIndex)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {por.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {formData.pors.length > 1 && (
                  <button
                    onClick={() => removePOR(por.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id={`por-title-${por.id}`}
                      value={por.title}
                      onChange={(e) => updatePOR(porIndex, 'title', e.target.value)}
                      placeholder="POR title"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <Input
                      id={`por-year-${por.id}`}
                      value={por.year}
                      onChange={(e) => updatePOR(porIndex, 'year', e.target.value)}
                      placeholder="Year"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white w-24"
                    />
                  </div>
                </div>
              </div>
              {por.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex items-center gap-2 ml-6">
                  {por.bullets.length > 1 && (
                    <button
                      onClick={() => removePORBullet(porIndex, bulletIndex)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      id={`por-bullet-${por.id}-${bulletIndex}`}
                      value={bullet}
                      onChange={(e) => updatePORBullet(porIndex, bulletIndex, e.target.value)}
                      placeholder="Bullet"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                    />
                    <button className="text-orange-500 hover:text-orange-600">
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addPORBullet(porIndex)}
                className="ml-6 text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                Add Bullet
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
          {sectionVisibility.achievements && formData.achievements.map((achievement, index) => (
            <div key={achievement.id} className={`space-y-3 border-l-2 border-gray-200 pl-4 ${!achievement.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAchievementVisibility(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {achievement.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {formData.achievements.length > 1 && (
                  <button
                    onClick={() => removeAchievement(achievement.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id={`achievement-title-${achievement.id}`}
                      value={achievement.title}
                      onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                      placeholder="Achievement title"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white"
                    />
                    <Input
                      id={`achievement-year-${achievement.id}`}
                      value={achievement.year}
                      onChange={(e) => updateAchievement(index, 'year', e.target.value)}
                      placeholder="Year"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500 shadow-none bg-white w-24"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Textarea
                      id={`achievement-description-${achievement.id}`}
                      value={achievement.description}
                      onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                      placeholder="Achievement description"
                      className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                      rows={2}
                    />
                    <button className="text-orange-500 hover:text-orange-600">
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
          {sectionVisibility.certifications && formData.certifications.map((cert, index) => (
            <div key={cert.id} className={`space-y-2 ${!cert.visible ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCertificationVisibility(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {cert.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                {formData.certifications.length > 1 && (
                  <button
                    onClick={() => removeCertification(cert.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                  <Input
                    id={`cert-name-${cert.id}`}
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    placeholder="Certification name"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    id={`cert-issuer-${cert.id}`}
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    placeholder="Issuing organization"
                    className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                  />
                  <Input
                    id={`cert-year-${cert.id}`}
                    value={cert.year}
                    onChange={(e) => updateCertification(index, 'year', e.target.value)}
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
          </div>
          {sectionVisibility.skills && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  id="skills-technical"
                  value={formData.skills.technical}
                  onChange={(e) => updateSkills('technical', e.target.value)}
                  placeholder="Technical Skills (e.g., Python, Java, React)"
                  className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                />
                <button className="text-orange-500 hover:text-orange-600">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="skills-languages"
                  value={formData.skills.languages}
                  onChange={(e) => updateSkills('languages', e.target.value)}
                  placeholder="Programming Languages (e.g., JavaScript, Python, C++)"
                  className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                />
                <button className="text-orange-500 hover:text-orange-600">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="skills-frameworks"
                  value={formData.skills.frameworks}
                  onChange={(e) => updateSkills('frameworks', e.target.value)}
                  placeholder="Frameworks & Libraries (e.g., React, Node.js, Django)"
                  className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                />
                <button className="text-orange-500 hover:text-orange-600">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="skills-tools"
                  value={formData.skills.tools}
                  onChange={(e) => updateSkills('tools', e.target.value)}
                  placeholder="Tools & Technologies (e.g., Git, Docker, AWS)"
                  className="border-2 border-blue-300 rounded-lg focus:border-blue-500"
                />
                <button className="text-orange-500 hover:text-orange-600">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* More sections placeholder */}
        <div className="text-center py-8">
          <p className="text-blue-600 font-medium">More sections below...</p>
        </div>
      </div>
    </div>
  );
});



// Default export
export default ResumeForm;