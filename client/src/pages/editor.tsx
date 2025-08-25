import { ResumeForm } from "@/components/resume/resume-form";
import { ResumePreviewPanel } from "@/components/resume/resume-preview";
import { Chatbot } from "@/components/chat/chatbot";
import { FloatingFormatToolbar } from "@/components/resume/floating-format-toolbar";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button";
import { 
  Save, 
  Download, 
  FileText, 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Palette,
  RotateCcw,
  AlignVerticalSpaceAround,
  Minus,
  Plus,
  List,
  ListOrdered
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSub,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Add these constants at the top of the file after the imports
const A4_WIDTH_PX = 794;  // A4 width in pixels at 96 DPI
const A4_HEIGHT_PX = 1123; // A4 height in pixels at 96 DPI
const A4_WIDTH_MM = 210;  // A4 width in mm
const A4_HEIGHT_MM = 297; // A4 height in mm
const MM_TO_PX = 3.779528; // Conversion factor from mm to px at 96 DPI

// New Schema Types
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

// Legacy Schema Types (for backward compatibility)
export interface LegacyResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    summary: string;
  };
  workExperience: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    bullets?: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    technologies: string;
    duration: string;
    description: string;
  }>;
  pors: Array<{
    id: string;
    position: string;
    organization: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  skills: {
    technical: string;
    languages: string;
    frameworks: string;
    tools: string;
  };
}

// Schema conversion utilities
class SchemaConverter {
  static newToLegacy(resume: Resume): LegacyResumeData {
    return {
      personalInfo: {
        fullName: resume.name || "",
        jobTitle: "", // This field doesn't exist in new schema, could be derived from work experience
        email: resume.email || "",
        phone: resume.phone_number || "",
        summary: resume.summary || "",
      },
      workExperience: [
        // Convert work experiences - safely handle undefined/null arrays
        ...(resume.work_experiences || []).map((work, index) => ({
          id: `work_${index}`,
          title: work.designation || "",
          company: work.company_name || "",
          startDate: work.duration?.split(' - ')[0] || "",
          endDate: work.duration?.split(' - ')[1] || "",
          description: work.designation_description || "",
          bullets: (work.projects || []).flatMap(p => p.description_bullets || []),
        })),
        // Convert internships as work experience - safely handle undefined/null arrays
        ...(resume.internships || []).map((internship, index) => ({
          id: `intern_${index}`,
          title: internship.designation || "",
          company: internship.company_name || "",
          startDate: internship.duration?.split(' - ')[0] || "",
          endDate: internship.duration?.split(' - ')[1] || "",
          description: internship.designation_description || "",
          bullets: internship.internship_work_description_bullets || [],
        }))
      ],
      education: (resume.education_entries || []).map((edu, index) => ({
        id: `edu_${index}`,
        degree: edu.degree || "",
        institution: edu.college || "",
        year: edu.start_year && edu.end_year ? `${edu.start_year} - ${edu.end_year}` : "",
        gpa: edu.cgpa?.toString() || "",
      })),
      projects: (resume.academic_projects || []).map((project, index) => ({
        id: `proj_${index}`,
        title: project.project_name || "",
        technologies: "", // This would need to be derived or stored separately
        duration: project.duration || "",
        description: project.project_description || "",
      })),
      pors: (resume.positions_of_responsibility || []).map((por, index) => ({
        id: `por_${index}`,
        position: por.role || "",
        organization: por.organization || "",
        startDate: por.duration?.split(' - ')[0] || "",
        endDate: por.duration?.split(' - ')[1] || "",
        description: por.role_description || "",
      })),
      achievements: (resume.achievements || []).map((achievement, index) => ({
        id: `ach_${index}`,
        title: achievement.title || "",
        description: achievement.description || "",
        date: achievement.year?.toString() || "",
      })),
      certifications: (resume.certifications || []).map((cert, index) => ({
        id: `cert_${index}`,
        name: cert.certification || "",
        issuer: cert.issuing_organization || "",
        date: cert.time_of_certification?.toString() || "",
      })),
      skills: {
        technical: (resume.skills || []).join(", "),
        languages: (resume.languages || []).join(", "),
        frameworks: "", // Would need to be derived from skills
        tools: "", // Would need to be derived from skills
      },
    };
  }

  static legacyToNew(legacyData: LegacyResumeData): Partial<Resume> {
    const workExperiences: WorkExperience[] = [];
    const internships: Internship[] = [];

    // Separate work experiences from internships based on ID prefix or other criteria
    (legacyData.workExperience || []).forEach(work => {
      if (work.id.startsWith('intern_')) {
        internships.push({
          company_name: work.company,
          company_description: null,
          location: null,
          designation: work.title,
          designation_description: work.description,
          duration: work.startDate && work.endDate ? `${work.startDate} - ${work.endDate}` : null,
          internship_work_description_bullets: work.bullets || [],
        });
      } else {
        workExperiences.push({
          company_name: work.company,
          company_description: null,
          location: null,
          duration: work.startDate && work.endDate ? `${work.startDate} - ${work.endDate}` : null,
          designation: work.title,
          designation_description: work.description,
          projects: [{
            project_name: null,
            project_description: work.description,
            description_bullets: work.bullets || [],
          }],
        });
      }
    });

    return {
      name: legacyData.personalInfo?.fullName || "",
      email: legacyData.personalInfo?.email || "",
      phone_number: legacyData.personalInfo?.phone || "",
      summary: legacyData.personalInfo?.summary || "",
      skills: legacyData.skills?.technical ? legacyData.skills.technical.split(',').map(s => s.trim()).filter(Boolean) : [],
      languages: legacyData.skills?.languages ? legacyData.skills.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
      interests: [],
      external_links: [],
      education_entries: (legacyData.education || []).map(edu => ({
        college: edu.institution,
        degree: edu.degree,
        start_year: edu.year ? parseInt(edu.year.split(' - ')[0]) : null,
        end_year: edu.year ? parseInt(edu.year.split(' - ')[1]) : null,
        cgpa: edu.gpa ? parseFloat(edu.gpa) : null,
      })),
      work_experiences: workExperiences,
      internships: internships,
      achievements: (legacyData.achievements || []).map(ach => ({
        title: ach.title,
        awarding_body: null,
        year: ach.date ? parseInt(ach.date) : null,
        description: ach.description,
      })),
      positions_of_responsibility: (legacyData.pors || []).map(por => ({
        role: por.position,
        role_description: por.description,
        organization: por.organization,
        organization_description: null,
        location: null,
        duration: por.startDate && por.endDate ? `${por.startDate} - ${por.endDate}` : null,
        responsibilities: [],
      })),
      extra_curriculars: [],
      certifications: (legacyData.certifications || []).map(cert => ({
        certification: cert.name,
        description: null,
        issuing_organization: cert.issuer,
        time_of_certification: cert.date ? parseInt(cert.date) : null,
      })),
      academic_projects: (legacyData.projects || []).map(proj => ({
        project_name: proj.title,
        project_description: proj.description,
        description_bullets: [],
        duration: proj.duration,
      })),
      resume_inputs: [],
    };
  }
}

const subtleHoverStyle = {
  transition: 'background-color 0.2s ease-in-out',
};

const hoverEffect = {
  backgroundColor: 'rgba(135, 206, 235, 0.2)', // Subtle sky blue
};

const defaultResumeData: LegacyResumeData = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    summary: "",
  },
  workExperience: [],
  education: [],
  projects: [],
  pors: [],
  achievements: [],
  certifications: [],
  skills: {
    technical: "",
    languages: "",
    frameworks: "",
    tools: "",
  },
};

const ResumePreview = ({ 
  data, 
  sectionVisibility, 
  fontSettings, 
  fieldFormats, 
  getFieldFormatting, 
  onFieldClick 
}: {
  data: LegacyResumeData;
  sectionVisibility: Record<string, boolean>;
  fontSettings: {
    size: string;
    weight: string;
    style: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    alignment: string;
    lineHeight: string;
    color: string;
    backgroundColor: string;
    marginTop: string;
    marginBottom: string;
  };
  fieldFormats: Record<string, any>;
  getFieldFormatting: (field: string) => React.CSSProperties;
  onFieldClick: (section: string) => void;
}) => {
  const [originalBackgroundColor, setOriginalBackgroundColor] = useState<string | null>(null);

  const fontFamilies = [
    { value: 'modern', label: 'Modern (Sans-serif)', class: 'font-sans' },
    { value: 'classic', label: 'Classic (Serif)', class: 'font-serif' },
    { value: 'minimal', label: 'Minimal (Mono)', class: 'font-mono' },
    { value: 'professional', label: 'Professional (Arial)', class: 'font-sans' },
  ];

  const fontSizes = [
    { value: 'xs', label: '10pt', class: 'text-xs' },
    { value: 'small', label: '12pt', class: 'text-sm' },
    { value: 'medium', label: '14pt', class: 'text-base' },
    { value: 'large', label: '16pt', class: 'text-lg' },
    { value: 'xl', label: '18pt', class: 'text-xl' },
    { value: '2xl', label: '20pt', class: 'text-2xl' },
  ];

  const lineHeights = [
    { value: 'tight', label: 'Tight (1.25)', class: 'leading-tight' },
    { value: 'normal', label: 'Normal (1.5)', class: 'leading-normal' },
    { value: 'relaxed', label: 'Relaxed (1.75)', class: 'leading-relaxed' },
    { value: 'loose', label: 'Loose (2)', class: 'leading-loose' },
  ];

  return (
    <div 
      className={`${ 
        fontSizes.find(f => f.value === fontSettings.size)?.class || 'text-base'
      } ${ 
        fontSettings.bold ? 'font-bold' : 'font-normal'
      } ${ 
        fontSettings.italic ? 'italic' : ''
      } ${ 
        fontSettings.underline ? 'underline' : ''
      } ${ 
        fontSettings.alignment === 'center' ? 'text-center' :
        fontSettings.alignment === 'right' ? 'text-right' :
        fontSettings.alignment === 'justify' ? 'text-justify' : 'text-left'
      } ${ 
        fontFamilies.find(f => f.value === fontSettings.style)?.class || 'font-sans'
      } ${ 
        lineHeights.find(l => l.value === fontSettings.lineHeight)?.class || 'leading-normal'
      }`}
      style={{ color: fontSettings.color }}
    >
      {/* Header */}
      <div 
        className="text-center border-b border-gray-200 pb-6 mb-6"
        onClick={() => onFieldClick('personalInfo')}
        style={subtleHoverStyle}
        onMouseEnter={(e) => {
          setOriginalBackgroundColor(e.currentTarget.style.backgroundColor);
          e.currentTarget.style.backgroundColor = hoverEffect.backgroundColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = originalBackgroundColor;
        }}
      > 
        <h1 
          data-field="fullName" 
          className="text-3xl font-bold text-gray-900 mb-2"
          style={getFieldFormatting('fullName')}
        >
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <p 
          data-field="jobTitle" 
          className="text-xl text-gray-600 mb-3"
          style={getFieldFormatting('jobTitle')}
        >
          {data.personalInfo.jobTitle || "Your Job Title"}
        </p>
        <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
          {data.personalInfo.email && (
            <span 
              data-field="email" 
              style={getFieldFormatting('email')}
            >
              ✉ {data.personalInfo.email}
            </span>
          )}
          {data.personalInfo.phone && (
            <span 
              data-field="phone" 
              style={getFieldFormatting('phone')}
            >
              📞 {data.personalInfo.phone}
            </span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {sectionVisibility.summary && data.personalInfo.summary && (
        <div 
          className="mb-6"
          onClick={() => onFieldClick('personalInfo')}
          style={subtleHoverStyle}
          onMouseEnter={(e) => {
            setOriginalBackgroundColor(e.currentTarget.style.backgroundColor);
            e.currentTarget.style.backgroundColor = hoverEffect.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = originalBackgroundColor;
          }}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Professional Summary
          </h2>
          <p 
            data-field="summary" 
            className="text-gray-700 leading-relaxed"
            style={getFieldFormatting('summary')}
          >
            {data.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {sectionVisibility.workExperience && data.workExperience.length > 0 && (
        <div 
          className="mb-6"
          onClick={() => onFieldClick('workExperience')}
          style={subtleHoverStyle}
          onMouseEnter={(e) => {
            setOriginalBackgroundColor(e.currentTarget.style.backgroundColor);
            e.currentTarget.style.backgroundColor = hoverEffect.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = originalBackgroundColor;
          }}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Work Experience
          </h2>
          <div className="space-y-4">
            {data.workExperience.map((experience) => (
              <div key={experience.id}> 
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 
                      data-field={`workExperience.${experience.id}.title`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`workExperience.${experience.id}.title`)}
                    >
                      {experience.title || "Job Title"}
                    </h3>
                    <p 
                      data-field={`workExperience.${experience.id}.company`}
                      className="text-gray-600"
                      style={getFieldFormatting(`workExperience.${experience.id}.company`)}
                    >
                      {experience.company || "Company Name"}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {experience.startDate} - {experience.endDate}
                  </span>
                </div>
                {experience.description && (
                  <div className="text-gray-700 text-sm ml-4">
                    {experience.description.split('\n').map((line, index) => (
                      <p 
                        key={index} 
                        data-field={`workExperience.${experience.id}.description.${index}`}
                        className="mb-1"
                        style={getFieldFormatting(`workExperience.${experience.id}.description.${index}`)}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {sectionVisibility.education && data.education.length > 0 && (
        <div 
          className="mb-6"
          onClick={() => onFieldClick('education')}
          style={subtleHoverStyle}
          onMouseEnter={(e) => {
            setOriginalBackgroundColor(e.currentTarget.style.backgroundColor);
            e.currentTarget.style.backgroundColor = hoverEffect.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = originalBackgroundColor;
          }}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((education) => (
              <div key={education.id}> 
                <div className="flex justify-between items-start">
                  <div>
                    <h3 
                      data-field={`education.${education.id}.degree`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`education.${education.id}.degree`)}
                    >
                      {education.degree || "Degree"}
                    </h3>
                    <p 
                      data-field={`education.${education.id}.institution`}
                      className="text-gray-600"
                      style={getFieldFormatting(`education.${education.id}.institution`)}
                    >
                      {education.institution || "Institution"}
                    </p>
                    {education.gpa && (
                      <p 
                        data-field={`education.${education.id}.gpa`}
                        className="text-sm text-gray-600 mt-1"
                        style={getFieldFormatting(`education.${education.id}.gpa`)}
                      >
                        GPA: {education.gpa}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {education.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {sectionVisibility.projects && data.projects.length > 0 && (
        <div 
          className="mb-6"
          onClick={() => onFieldClick('projects')}
          style={subtleHoverStyle}
          onMouseEnter={(e) => {
            setOriginalBackgroundColor(e.currentTarget.style.backgroundColor);
            e.currentTarget.style.backgroundColor = hoverEffect.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = originalBackgroundColor;
          }}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Projects
          </h2>
          <div className="space-y-4">
            {data.projects.map((project) => (
              <div key={project.id}> 
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 
                      data-field={`projects.${project.id}.title`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`projects.${project.id}.title`)}
                    >
                      {project.title || "Project Title"}
                    </h3>
                    {project.technologies && (
                      <p 
                        data-field={`projects.${project.id}.technologies`}
                        className="text-sm text-gray-600"
                        style={getFieldFormatting(`projects.${project.id}.technologies`)}
                      >
                        Technologies: {project.technologies}
                      </p>
                    )}
                  </div>
                  {project.duration && (
                    <span className="text-sm text-gray-500">
                      {project.duration}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p 
                    data-field={`projects.${project.id}.description`}
                    className="text-gray-700 text-sm ml-4"
                    style={getFieldFormatting(`projects.${project.id}.description`)}
                  >
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positions of Responsibility */}
      {sectionVisibility.pors && data.pors.length > 0 && (
        <div 
          className="mb-6"
          onClick={() => onFieldClick('pors')}
          style={subtleHoverStyle}
          onMouseEnter={(e) => {
            setOriginalBackgroundColor(e.currentTarget.style.backgroundColor);
            e.currentTarget.style.backgroundColor = hoverEffect.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = originalBackgroundColor;
          }}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Positions of Responsibility
          </h2>
          <div className="space-y-4">
            {data.pors.map((por) => (
              <div key={por.id}> 
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 
                      data-field={`pors.${por.id}.position`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`pors.${por.id}.position`)}
                    >
                      {por.position || "Position"}
                    </h3>
                    <p 
                      data-field={`pors.${por.id}.organization`}
                      className="text-gray-600"
                      style={getFieldFormatting(`pors.${por.id}.organization`)}
                    >
                      {por.organization || "Organization"}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {por.startDate} - {por.endDate}
                  </span>
                </div>
                {por.description && (
                  <p 
                    data-field={`pors.${por.id}.description`}
                    className="text-gray-700 text-sm ml-4"
                    style={getFieldFormatting(`pors.${por.id}.description`)}
                  >
                    {por.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {sectionVisibility.achievements && data.achievements.length > 0 && (
        <div 
          className="mb-6"
          onClick={() => onFieldClick('achievements')}
          style={subtleHoverStyle}
          onMouseEnter={(e) => {
            setOriginalBackgroundColor(e.currentTarget.style.backgroundColor);
            e.currentTarget.style.backgroundColor = hoverEffect.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = originalBackgroundColor;
          }}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Achievements
          </h2>
          <div className="space-y-3">
            {data.achievements.map((achievement) => (
              <div key={achievement.id}> 
                <div className="flex justify-between items-start">
                  <div>
                    <h3 
                      data-field={`achievements.${achievement.id}.title`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`achievements.${achievement.id}.title`)}
                    >
                      {achievement.title || "Achievement"}
                    </h3>
                    {achievement.description && (
                      <p 
                        data-field={`achievements.${achievement.id}.description`}
                        className="text-gray-700 text-sm mt-1"
                        style={getFieldFormatting(`achievements.${achievement.id}.description`)}
                      >
                        {achievement.description}
                      </p>
                    )}
                  </div>
                  {achievement.date && (
                    <span className="text-sm text-gray-500">
                      {achievement.date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {sectionVisibility.certifications && data.certifications.length > 0 && (
        <div 
          className="mb-6"
          onClick={() => onFieldClick('certifications')}
          style={subtleHoverStyle}
          onMouseEnter={(e) => {
            setOriginalBackgroundColor(e.currentTarget.style.backgroundColor);
            e.currentTarget.style.backgroundColor = hoverEffect.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = originalBackgroundColor;
          }}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Certifications
          </h2>
          <div className="space-y-3">
            {data.certifications.map((certification) => (
              <div key={certification.id}> 
                <div className="flex justify-between items-start">
                  <div>
                    <h3 
                      data-field={`certifications.${certification.id}.name`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`certifications.${certification.id}.name`)}
                    >
                      {certification.name || "Certification"}
                    </h3>
                    <p 
                      data-field={`certifications.${certification.id}.issuer`}
                      className="text-gray-600"
                      style={getFieldFormatting(`certifications.${certification.id}.issuer`)}
                    >
                      {certification.issuer || "Issuing Organization"}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {certification.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {sectionVisibility.skills && data.skills && (
        <div 
          onClick={() => onFieldClick('skills')}
          style={subtleHoverStyle}
          onMouseEnter={(e) => {
            setOriginalBackgroundColor(e.currentTarget.style.backgroundColor);
            e.currentTarget.style.backgroundColor = hoverEffect.backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = originalBackgroundColor;
          }}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Skills
          </h2>
          <div className="space-y-2">
            {data.skills.technical && (
              <div>
                <p className="font-medium text-gray-900 text-sm mb-1">Technical Skills:</p>
                <p 
                  data-field="skills.technical"
                  className="text-gray-700 text-sm"
                  style={getFieldFormatting('skills.technical')}
                >
                  {data.skills.technical}
                </p>
              </div>
            )}
            {data.skills.languages && (
              <div>
                <p className="font-medium text-gray-900 text-sm mb-1">Programming Languages:</p>
                <p 
                  data-field="skills.languages"
                  className="text-gray-700 text-sm"
                  style={getFieldFormatting('skills.languages')}
                >
                  {data.skills.languages}
                </p>
              </div>
            )}
            {data.skills.frameworks && (
              <div>
                <p className="font-medium text-gray-900 text-sm mb-1">Frameworks & Libraries:</p>
                <p 
                  data-field="skills.frameworks"
                  className="text-gray-700 text-sm"
                  style={getFieldFormatting('skills.frameworks')}
                >
                  {data.skills.frameworks}
                </p>
              </div>
            )}
            {data.skills.tools && (
              <div>
                <p className="font-medium text-gray-900 text-sm mb-1">Tools & Technologies:</p>
                <p 
                  data-field="skills.tools"
                  className="text-gray-700 text-sm"
                  style={getFieldFormatting('skills.tools')}
                >
                  {data.skills.tools}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function EditorPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [resumeData, setResumeData] = useState<LegacyResumeData>(defaultResumeData);
  
  // Section visibility state
  const [sectionVisibility, setSectionVisibility] = useState({
     summary: true,
  education: true,
  workExperience: true,
  projects: true,
  pors: true,
  achievements: true,
  certifications: true,
  skills: true,
  internships: true,
  academicProjects: true,
  extraCurriculars: true,
  interests: true,
  languages: true,
  externalLinks: true
  });

  const [fontSettings, setFontSettings] = useState({
    size: 'medium',
    weight: 'normal',
    style: 'modern',
    bold: false,
    italic: false,
    underline: false,
    alignment: 'left',
    lineHeight: 'normal',
    color: '#000000',
    backgroundColor: '#ffffff',
    marginTop: 'normal',
    marginBottom: 'normal'
  });

  // State for floating formatting toolbar
  const [floatingFormats, setFloatingFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 'base',
    fontFamily: 'sans',
    alignment: 'left'
  });

  // State for field-specific formatting
  const [fieldFormats, setFieldFormats] = useState<Record<string, {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: string;
    fontFamily?: string;
    alignment?: string;
  }>>({});

  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<any>(null);

  // Refs for the connection system
  const previewContentRef = useRef<HTMLDivElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const personalInfoRef = useRef<HTMLDivElement>(null);
  const workExperienceRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const porsRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const certificationsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  const handlePreviewFieldClick = (section: string) => {
    if (formRef.current) {
      const sectionRef = formRef.current[section + "Ref"];
      if (sectionRef && sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isNewResume = id === "new";

  // Font families for resume styling
  const fontFamilies = [
    { value: 'modern', label: 'Modern (Sans-serif)', class: 'font-sans' },
    { value: 'classic', label: 'Classic (Serif)', class: 'font-serif' },
    { value: 'minimal', label: 'Minimal (Mono)', class: 'font-mono' },
    { value: 'professional', label: 'Professional (Arial)', class: 'font-sans' },
  ];

  const fontSizes = [
    { value: 'xs', label: '10pt', class: 'text-xs' },
    { value: 'small', label: '12pt', class: 'text-sm' },
    { value: 'medium', label: '14pt', class: 'text-base' },
    { value: 'large', label: '16pt', class: 'text-lg' },
    { value: 'xl', label: '18pt', class: 'text-xl' },
    { value: '2xl', label: '20pt', class: 'text-2xl' },
  ];

  const lineHeights = [
    { value: 'tight', label: 'Tight (1.25)', class: 'leading-tight' },
    { value: 'normal', label: 'Normal (1.5)', class: 'leading-normal' },
    { value: 'relaxed', label: 'Relaxed (1.75)', class: 'leading-relaxed' },
    { value: 'loose', label: 'Loose (2)', class: 'leading-loose' },
  ];

  const resumeColors = [
    { value: '#000000', label: 'Black', preview: '#000000' },
    { value: '#1f2937', label: 'Gray', preview: '#1f2937' },
    { value: '#1e40af', label: 'Blue', preview: '#1e40af' },
    { value: '#059669', label: 'Green', preview: '#059669' },
    { value: '#dc2626', label: 'Red', preview: '#dc2626' },
    { value: '#7c2d12', label: 'Brown', preview: '#7c2d12' },
    { value: '#581c87', label: 'Purple', preview: '#581c87' },
  ];

  const { data: resume, isLoading } = useQuery<Resume>({
    queryKey: ["/api/resumes", id],
    enabled: !isNewResume,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: LegacyResumeData) => {
      // Convert legacy data to new schema before saving
      const newSchemaData = SchemaConverter.legacyToNew(data);
      
      const payload = {
        title: data.personalInfo.fullName || "Untitled Resume",
        data: newSchemaData,
        status: "in-progress",
      };

      if (isNewResume) {
        return apiRequest("POST", "/api/resumes", payload);
      } else {
        return apiRequest("PUT", `/api/resumes/${id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Resume saved",
        description: "Your resume has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (data: LegacyResumeData) => {
      // Convert legacy data to new schema before saving
      const newSchemaData = SchemaConverter.legacyToNew(data);
      
      const payload = {
        title: data.personalInfo.fullName || "Untitled Resume",
        data: newSchemaData,
        status: "completed",
      };

      if (!isNewResume) {
        return apiRequest("PUT", `/api/resumes/${id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Resume exported",
        description: "Your resume has been exported and marked as completed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to export resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportToPDF = async () => {
    if (!previewRef.current) return;

    try {
      // Configure html2pdf options for proper A4 sizing
      const opt = {
        margin: 10, // 10mm margin
        filename: `${resumeData.personalInfo.fullName || "resume"}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          width: A4_WIDTH_PX,
          height: A4_HEIGHT_PX,
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      // Create a clone of the preview content for PDF export
      const element = previewRef.current.cloneNode(true) as HTMLElement;
      
      // Reset any transform applied for preview scaling
      element.style.transform = 'none';
      element.style.width = `${A4_WIDTH_PX}px`;
      element.style.minHeight = `${A4_HEIGHT_PX}px`;
      element.style.padding = '40px';
      element.style.backgroundColor = 'white';
      element.style.position = 'relative';
      element.style.boxSizing = 'border-box';

      // Temporarily append the clone to the document
      document.body.appendChild(element);
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';

      try {
        // Generate PDF
        await html2pdf().from(element).set(opt).save();

        // Update resume status if not a new resume
        if (!isNewResume) {
          exportMutation.mutate(resumeData);
        }
      } finally {
        // Clean up: remove the temporary element
        document.body.removeChild(element);
      }

    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSettings(prev => ({ ...prev, size }));
    toast({
      title: "Font size updated",
      description: `Font size changed to ${fontSizes.find(f => f.value === size)?.label}`,
    });
  };

  const handleFontFamilyChange = (style: string) => {
    setFontSettings(prev => ({ ...prev, style }));
    toast({
      title: "Font family updated",
      description: `Font changed to ${fontFamilies.find(f => f.value === style)?.label}`,
    });
  };

  const handleLineHeightChange = (lineHeight: string) => {
    setFontSettings(prev => ({ ...prev, lineHeight }));
    toast({
      title: "Line spacing updated",
      description: `Line spacing changed to ${lineHeights.find(l => l.value === lineHeight)?.label}`,
    });
  };

  const handleColorChange = (color: string) => {
    setFontSettings(prev => ({ ...prev, color }));
    toast({
      title: "Text color updated",
      description: "Text color has been changed",
    });
  };

  const toggleBold = () => {
    setFontSettings(prev => ({ ...prev, bold: !prev.bold }));
    toast({
      title: "Bold toggled",
      description: `Bold ${fontSettings.bold ? 'disabled' : 'enabled'}`,
    });
  };

  const toggleItalic = () => {
    setFontSettings(prev => ({ ...prev, italic: !prev.italic }));
    toast({
      title: "Italic toggled", 
      description: `Italic ${fontSettings.italic ? 'disabled' : 'enabled'}`,
    });
  };

  const toggleUnderline = () => {
    setFontSettings(prev => ({ ...prev, underline: !prev.underline }));
    toast({
      title: "Underline toggled",
      description: `Underline ${fontSettings.underline ? 'disabled' : 'enabled'}`,
    });
  };

  const handleAlignmentChange = (alignment: string) => {
    setFontSettings(prev => ({ ...prev, alignment }));
    toast({
      title: "Alignment changed",
      description: `Text aligned to ${alignment}`,
    });
  };

  const resetFormatting = () => {
    setFontSettings({
      size: 'medium',
      weight: 'normal',
      style: 'modern',
      bold: false,
      italic: false,
      underline: false,
      alignment: 'left',
      lineHeight: 'normal',
      color: '#000000',
      backgroundColor: '#ffffff',
      marginTop: 'normal',
      marginBottom: 'normal'
    });
    toast({
      title: "Formatting reset",
      description: "All formatting has been reset to default",
    });
  };

  const handleChangeTemplate = () => {
    console.log('Changing template...');
    toast({
      title: "Coming Soon", 
      description: "Template selection will be available soon.",
    });
  };

  // Handler for floating toolbar format changes
  const handleFloatingFormatChange = (selection: any, format: string, value: any) => {
    if (!selection || !selection.field) {
      return;
    }

    setFieldFormats(prev => ({
      ...prev,
      [selection.field]: {
        ...prev[selection.field],
        [format]: value
      }
    }));

    setFloatingFormats(prev => ({ ...prev, [format]: value }));
  };

  // Function to get field-specific formatting
  const getFieldFormatting = (fieldName: string) => {
    const fieldFormat = fieldFormats[fieldName];
    if (!fieldFormat) return {};

    const styles: React.CSSProperties = {};

    if (fieldFormat.bold !== undefined) {
      styles.fontWeight = fieldFormat.bold ? 'bold' : 'normal';
    }
    if (fieldFormat.italic !== undefined) {
      styles.fontStyle = fieldFormat.italic ? 'italic' : 'normal';
    }
    if (fieldFormat.underline !== undefined) {
      styles.textDecoration = fieldFormat.underline ? 'underline' : 'none';
    }
    if (fieldFormat.fontSize) {
      const fontSize = fontSizes.find(f => f.value === fieldFormat.fontSize);
      if (fontSize) {
        // Convert Tailwind classes to actual CSS values
        switch (fontSize.value) {
          case 'xs': styles.fontSize = '0.75rem'; break;
          case 'sm': styles.fontSize = '0.875rem'; break;
          case 'base': styles.fontSize = '1rem'; break;
          case 'lg': styles.fontSize = '1.125rem'; break;
          case 'xl': styles.fontSize = '1.25rem'; break;
          case '2xl': styles.fontSize = '1.5rem'; break;
        }
      }
    }
    if (fieldFormat.fontFamily) {
      const fontFamily = fontFamilies.find(f => f.value === fieldFormat.fontFamily);
      if (fontFamily) {
        switch (fontFamily.value) {
          case 'sans': styles.fontFamily = 'ui-sans-serif, system-ui, sans-serif'; break;
          case 'serif': styles.fontFamily = 'ui-serif, Georgia, serif'; break;
          case 'mono': styles.fontFamily = 'ui-monospace, SFMono-Regular, monospace'; break;
        }
      }
    }
    if (fieldFormat.alignment) {
      styles.textAlign = fieldFormat.alignment as any;
    }

    return styles;
  };

  const handleSave = () => {
    if (resumeData.personalInfo.fullName.trim()) {
      saveMutation.mutate(resumeData);
    } else {
      toast({
        title: "Please add your name",
        description: "Add your full name before saving the resume.",
        variant: "destructive",
      });
    }
  };

  const scrollToSection = (section: string) => {
    if (formRef.current) {
      formRef.current[section + "Ref"].current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Effect handles loading resume data from API with new schema conversion
  useEffect(() => {
    if (resume && !isNewResume) {
      // Convert new schema data to legacy format for internal use
      const legacyData = SchemaConverter.newToLegacy(resume);
      
      const mergedData = {
        ...defaultResumeData,
        ...legacyData,
      };
      
      // Ensure workExperience has bullets property
      mergedData.workExperience = mergedData.workExperience.map((work) => ({
        ...work,
        bullets: work.bullets || [],
      }));
      
      setResumeData(mergedData);
    }
  }, [resume, isNewResume]);

  if (isLoading && !isNewResume) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header - Word-like Ribbon */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left side - Comprehensive Formatting Options */}
          <div className="flex items-center gap-1">
            {/* Font Family Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[120px] justify-between text-xs h-8 px-2"
                >
                  <span className="truncate">
                    {fontFamilies.find(f => f.value === fontSettings.style)?.label || 'Modern'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Font Family</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {fontFamilies.map((font) => (
                  <DropdownMenuItem 
                    key={font.value}
                    onClick={() => handleFontFamilyChange(font.value)}
                    className={font.class}
                  >
                    {font.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Font Size Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-16 justify-center text-xs h-8 px-2"
                >
                  {fontSizes.find(f => f.value === fontSettings.size)?.label?.replace('pt', '') || '14'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Font Size</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {fontSizes.map((size) => (
                  <DropdownMenuItem 
                    key={size.value}
                    onClick={() => handleFontSizeChange(size.value)}
                  >
                    {size.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Bold, Italic, Underline */}
            <Button
              variant={fontSettings.bold ? "default" : "outline"}
              size="sm"
              onClick={toggleBold}
              className="h-8 w-8 p-0"
            >
              <Bold className="w-3 h-3" />
            </Button>

            <Button
              variant={fontSettings.italic ? "default" : "outline"}
              size="sm"
              onClick={toggleItalic}
              className="h-8 w-8 p-0"
            >
              <Italic className="w-3 h-3" />
            </Button>

            <Button
              variant={fontSettings.underline ? "default" : "outline"}
              size="sm"
              onClick={toggleUnderline}
              className="h-8 w-8 p-0"
            >
              <Underline className="w-3 h-3" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Text Color */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <div className="flex flex-col items-center">
                    <Type className="w-3 h-3" />
                    <div 
                      className="w-3 h-1 mt-0.5" 
                      style={{ backgroundColor: fontSettings.color }}
                    />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Text Color</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid grid-cols-4 gap-1 p-2">
                  {resumeColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorChange(color.value)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.preview }}
                      title={color.label}
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment Buttons */}
            <div className="flex items-center gap-0.5">
              <Button
                variant={fontSettings.alignment === 'left' ? "default" : "outline"}
                size="sm"
                onClick={() => handleAlignmentChange('left')}
                className="h-8 w-8 p-0"
              >
                <AlignLeft className="w-3 h-3" />
              </Button>
              
              <Button
                variant={fontSettings.alignment === 'center' ? "default" : "outline"}
                size="sm"
                onClick={() => handleAlignmentChange('center')}
                className="h-8 w-8 p-0"
              >
                <AlignCenter className="w-3 h-3" />
              </Button>
              
              <Button
                variant={fontSettings.alignment === 'right' ? "default" : "outline"}
                size="sm"
                onClick={() => handleAlignmentChange('right')}
                className="h-8 w-8 p-0"
              >
                <AlignRight className="w-3 h-3" />
              </Button>
              
              <Button
                variant={fontSettings.alignment === 'justify' ? "default" : "outline"}
                size="sm"
                onClick={() => handleAlignmentChange('justify')}
                className="h-8 w-8 p-0"
              >
                <AlignJustify className="w-3 h-3" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Line Height */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <AlignVerticalSpaceAround className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Line Spacing</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {lineHeights.map((height) => (
                  <DropdownMenuItem 
                    key={height.value}
                    onClick={() => handleLineHeightChange(height.value)}
                  >
                    {height.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Formatting */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFormatting}
              className="h-8 w-8 p-0"
              title="Clear Formatting"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleChangeTemplate}
              className="px-3 py-1 text-xs h-8 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Change Template
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-3 py-1 text-xs h-8 bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            
            <Button
              variant="outline"
              onClick={exportToPDF}
              className="px-3 py-1 text-xs h-8 border-green-300 text-green-600 hover:bg-green-50 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Static layout with form scrolling independently */}
      <div className="flex flex-1 overflow-hidden">
        {isSidebarVisible && (
          <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Form Header - Fixed */}
            <div className="flex-shrink-0 p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Resume Details</h2>
              <p className="text-sm text-gray-600">Fill in your information below</p>
            </div>
            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <ResumeForm
                ref={formRef}
                initialData={resumeData}
                onChange={setResumeData}
                sectionVisibility={sectionVisibility}
                onSectionVisibilityChange={setSectionVisibility}
              />
            </div>
          </div>
        )}

        {/* Preview Panel */}
        <div className="w-1/2 bg-gray-50 flex flex-col overflow-hidden">
          {/* Preview Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
            <p className="text-sm text-gray-600">See how your resume looks</p>
          </div>

          {/* Preview Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
            <div className="flex justify-center">
              <div 
                ref={previewRef}
                className="bg-white shadow-lg border border-gray-300"
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  minHeight: `${A4_HEIGHT_PX}px`,
                  padding: '40px',
                  transform: 'scale(0.75)',
                  transformOrigin: 'top center',
                  marginBottom: '20px',
                  boxSizing: 'border-box'
                }}
              >
                <ResumePreview 
                  data={resumeData}
                  sectionVisibility={sectionVisibility}
                  fontSettings={fontSettings}
                  fieldFormats={fieldFormats}
                  getFieldFormatting={getFieldFormatting}
                  onFieldClick={handlePreviewFieldClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Format Toolbar */}
      <FloatingFormatToolbar
        formats={floatingFormats}
        onFormatChange={handleFloatingFormatChange}
      />
    </div>
  );
}