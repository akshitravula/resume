import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

import PaginatedResumePreview from './PaginatedResumePreview'; // Add this import
import { ResumeForm } from "@/components/resume/resume-form";
import { ResumePreviewPanel } from "@/components/resume/resume-preview";
import { Chatbot } from "@/components/chat/chatbot";
import FloatingFormatToolbar from "@/components/resume/floating-format-toolbar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Education, WorkExperience, Project, Internship, ScholasticAchievement, PositionOfResponsibility, ExtraCurricular, Certification, AcademicProject, ResumeInput } from "@shared/schema";

import type { Resume } from "@/types/resume";
import { useResumeSocket } from "@/hooks/use-resume-ws";
import EditorPreloader from '@/components/ui/EditorPreloader';

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
  ListOrdered,
  Loader2
} from "lucide-react";

// Add Preloader Component
const ResumeEditorPreloader = ({ message = "Loading your resume..." }: { message?: string }) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Wait</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  </div>
);

// Add Loading Spinner Component
const LoadingSpinner = ({ size = "sm", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

// Constants
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 3.7795275591; // Standard conversion ratio

// Updated defaultResumeData to match new schema
const defaultResumeData: Resume = {
  id: "new",
  title: "Software Engineer Resume",
  personalInfo: {
    fullName: "Your Name",
    jobTitle: "Software Engineer",
    email: "your.email@example.com",
    phone: "123-456-7890",
  },
  summary: "A highly motivated and results-oriented software engineer with a passion for developing innovative solutions. Seeking a challenging role in a dynamic organization where I can leverage my skills in web development, cloud computing, and data structures to contribute to impactful projects.",
  name: "Your Name",
  email: "your.email@example.com",
  phone_number: "123-456-7890",
  updatedAt: new Date().toISOString(),
  status: "new",

  skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS"],
  interests: ["Open-source contributions", "Hiking", "Photography"],
  languages: ["English (Native)", "Spanish (Conversational)"],
  external_links: [
    {
      id: "1",
      url: "https://github.com/your-username",
      label: "GitHub"
    },
    {
      id: "2",
      url: "https://linkedin.com/in/your-username",
      label: "LinkedIn"
    }
  ],
  resume_inputs: [],

  education_entries: [
    {
      id: "edu1",
      degree: "Bachelor of Science in Computer Science",
      college: "University of Technology",
      start_year: "2020",
      end_year: "2024",
      cgpa: "3.8"
    }
  ],
  work_experiences: [
    {
      id: "work1",
      designation: "Software Engineer Intern",
      company_name: "Tech Solutions Inc.",
      duration: "Jun 2023 - Aug 2023",
      location: "San Francisco, CA",
      company_description: "A leading provider of cloud-based software solutions.",
      designation_description: "Worked on the core development team for the flagship product.",
      projects: [
        {
          id: "proj1",
          project_name: "Real-time Collaboration Feature",
          project_description: "Developed a new feature to allow multiple users to collaborate on documents in real-time.",
          description_bullets: [
            "Implemented a WebSocket-based solution for real-time data synchronization.",
            "Designed and built the front-end components using React and Redux.",
            "Wrote unit and integration tests to ensure code quality."
          ]
        }
      ]
    }
  ],
  internships: [],
  achievements: [],
  positions_of_responsibility: [],
  extra_curriculars: [],
  certifications: [],
  academic_projects: []
};

// Update the ResumePreview component
const ResumePreview = ({ 
  data, 
  sectionVisibility, 
  fontSettings, 
  fieldFormats, 
  getFieldFormatting, 
  onFieldClick,
  isLoading = false
}: {
  data: Resume;
  sectionVisibility: Record<string, boolean>;
  fontSettings: FontSettings;
  fieldFormats: Record<string, any>;
  getFieldFormatting: (field: string) => React.CSSProperties;
  onFieldClick: (section: string) => void;
  isLoading?: boolean;
}) => {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  const handleMouseEnter = (lineId: string) => {
    setHoveredLine(lineId);
  };

  const handleMouseLeave = () => {
    setHoveredLine(null);
  };

  const fontFamilies = [
    { value: 'arial', label: 'Arial', class: 'font-arial' },
    { value: 'times-new-roman', label: 'Times New Roman', class: 'font-times-new-roman' },
    { value: 'cambria', label: 'Cambria', class: 'font-cambria' },
    { value: 'georgia', label: 'Georgia', class: 'font-georgia' },
    { value: 'roboto', label: 'Roboto', class: 'font-roboto' },
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

  const renderFormattedText = (text: string, fieldName: string) => {
    if (!text) return null;

    return (
      <span 
        data-field={fieldName}
        style={{
          fontWeight: fontSettings.bold ? 'bold' : 'normal',
          fontStyle: fontSettings.italic ? 'italic' : 'normal',
          textDecoration: fontSettings.underline ? 'underline' : 'none',
          textAlign: fontSettings.alignment,
          color: fontSettings.color,
          lineHeight: lineHeights.find(l => l.value === fontSettings.lineHeight)?.label || '1.5',
          backgroundColor: hoveredLine === fieldName ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        }}
        onMouseEnter={() => handleMouseEnter(fieldName)}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

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
        className="border-b border-gray-200 pb-6 mb-6 resume-section"
        onClick={() => onFieldClick('personalInfo')}
      > 
        <h1 
          data-field="fullName" 
          className="text-3xl font-bold text-gray-900 mb-2 flex justify-center"
          style={getFieldFormatting('fullName')}
        >
          {renderFormattedText(data.name || "Your Name", "fullName")}
        </h1>
        <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
          {data.email && (
            <span 
              data-field="email" 
              style={getFieldFormatting('email')}
            >
              ✉ {renderFormattedText(data.email, "email")}
            </span>
          )}
          {data.phone_number && (
            <span 
              data-field="phone" 
              style={getFieldFormatting('phone')}
            >
              📞 {renderFormattedText(data.phone_number, "phone")}
            </span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {sectionVisibility.summary && data.summary && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('personalInfo')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Professional Summary
          </h2>
          <p 
            data-field="summary" 
            className="text-gray-700 leading-relaxed"
            style={getFieldFormatting('summary')}
          >
            {renderFormattedText(data.summary, "summary")}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {sectionVisibility.workExperience && (data.work_experiences?.length ?? 0) > 0 && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('workExperience')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Work Experience
          </h2>
          <div className="space-y-4">
            {(data.work_experiences ?? []).map((experience, index) => (
              <div key={index} className="resume-section"> 
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 
                      data-field={`workExperience.${index}.designation`}
                      className="font-semibold text-gray-900"
                      style={{
                        ...getFieldFormatting(`workExperience.${index}.designation`),
                        fontSize: fontSizes.find(f => f.value === fontSettings.size)?.label,
                        fontFamily: fontFamilies.find(f => f.value === fontSettings.style)?.class?.replace('font-', '') || 'sans-serif',
                      }}
                    >
                      {renderFormattedText(
                        experience.designation || "Job Title",
                        `workExperience.${index}.designation`
                      )}
                    </h3>
                    <p 
                      data-field={`workExperience.${index}.company_name`}
                      className="text-gray-600"
                      style={getFieldFormatting(`workExperience.${index}.company_name`)}
                    >
                      {renderFormattedText(experience.company_name || "Company Name", `workExperience.${index}.company_name`)}
                    </p>
                    {experience.location && (
                      <p className="text-sm text-gray-500">
                        {renderFormattedText(experience.location, `workExperience.${index}.location`)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {renderFormattedText(experience.duration, `workExperience.${index}.duration`)}
                  </span>
                </div>
                {experience.company_description && (
                  <p className="text-gray-700 text-sm ml-4 mb-2">
                    {renderFormattedText(experience.company_description, `workExperience.${index}.company_description`)}
                  </p>
                )}
                {experience.designation_description && (
                  <p className="text-gray-700 text-sm ml-4 mb-2">
                    {renderFormattedText(experience.designation_description, `workExperience.${index}.designation_description`)}
                  </p>
                )}
                {/* Projects under work experience */}
                {(experience.projects?.length ?? 0) > 0 && (
                  <div className="ml-4 mt-2">
                    <h4 className="font-medium text-gray-800 text-sm mb-1">Projects:</h4>
                    {(experience.projects ?? []).map((project, projIndex) => (
                      <div key={projIndex} className="mb-2 resume-section">
                        <h5 className="font-medium text-gray-700 text-sm">
                          {renderFormattedText(project.project_name, `workExperience.${index}.projects.${projIndex}.project_name`)}
                        </h5>
                        {project.project_description && (
                          <p className="text-gray-600 text-sm">
                            {renderFormattedText(project.project_description, `workExperience.${index}.projects.${projIndex}.project_description`)}
                          </p>
                        )}
                        {(project.description_bullets?.length ?? 0) > 0 && (
                          <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                            {(project.description_bullets ?? []).map((bullet, bulletIndex) => (
                              <li key={bulletIndex}>
                                {renderFormattedText(bullet, `workExperience.${index}.projects.${projIndex}.description_bullets.${bulletIndex}`)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internships */}
      {sectionVisibility.internships && (data.internships?.length ?? 0) > 0 && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('internships')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Internships
          </h2>
          <div className="space-y-4">
            {(data.internships ?? []).map((internship, index) => (
              <div key={index} className="resume-section"> 
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 
                      data-field={`internships.${index}.designation`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`internships.${index}.designation`)}
                    >
                      {renderFormattedText(internship.designation || "Intern Position", `internships.${index}.designation`)}
                    </h3>
                    <p 
                      data-field={`internships.${index}.company_name`}
                      className="text-gray-600"
                      style={getFieldFormatting(`internships.${index}.company_name`)}
                    >
                      {renderFormattedText(internship.company_name || "Company Name", `internships.${index}.company_name`)}
                    </p>
                    {internship.location && (
                      <p className="text-sm text-gray-500">
                        {renderFormattedText(internship.location, `internships.${index}.location`)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {renderFormattedText(internship.duration, `internships.${index}.duration`)}
                  </span>
                </div>
                {internship.company_description && (
                  <p className="text-gray-700 text-sm ml-4 mb-2">
                    {renderFormattedText(internship.company_description, `internships.${index}.company_description`)}
                  </p>
                )}
                {internship.designation_description && (
                  <p className="text-gray-700 text-sm ml-4 mb-2">
                    {renderFormattedText(internship.designation_description, `internships.${index}.designation_description`)}
                  </p>
                )}
                {(internship.internship_work_description_bullets?.length ?? 0) > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                    {internship.internship_work_description_bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>
                        {renderFormattedText(bullet, `internships.${index}.internship_work_description_bullets.${bulletIndex}`)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {sectionVisibility.education && (data.education_entries?.length ?? 0) > 0 && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('education')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {data.education_entries.map((education, index) => (
              <div key={index} className="resume-section"> 
                <div className="flex justify-between items-start">
                  <div>
                    <h3 
                      data-field={`education.${index}.degree`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`education.${index}.degree`)}
                    >
                      {renderFormattedText(education.degree || "Degree", `education.${index}.degree`)}
                    </h3>
                    <p 
                      data-field={`education.${index}.college`}
                      className="text-gray-600"
                      style={getFieldFormatting(`education.${index}.college`)}
                    >
                      {renderFormattedText(education.college || "Institution", `education.${index}.college`)}
                    </p>
                    {education.cgpa && (
                      <p 
                        data-field={`education.${index}.cgpa`}
                        className="text-sm text-gray-600 mt-1"
                        style={getFieldFormatting(`education.${index}.cgpa`)}
                      >
                        CGPA: {renderFormattedText(education.cgpa, `education.${index}.cgpa`)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {renderFormattedText(`${education.start_year} - ${education.end_year}`, `education.${index}.duration`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Projects */}
      {sectionVisibility.academicProjects && (data.academic_projects?.length ?? 0) > 0 && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('academicProjects')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Academic Projects
          </h2>
          <div className="space-y-4">
            {data.academic_projects.map((project, index) => (
              <div key={index} className="resume-section"> 
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 
                      data-field={`academicProjects.${index}.project_name`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`academicProjects.${index}.project_name`)}
                    >
                      {renderFormattedText(project.project_name || "Project Title", `academicProjects.${index}.project_name`)}
                    </h3>
                  </div>
                  {project.duration && (
                    <span className="text-sm text-gray-500">
                      {renderFormattedText(project.duration, `academicProjects.${index}.duration`)}
                    </span>
                  )}
                </div>
                {project.project_description && (
                  <p 
                    data-field={`academicProjects.${index}.project_description`}
                    className="text-gray-700 text-sm ml-4 mb-2"
                    style={getFieldFormatting(`academicProjects.${index}.project_description`)}
                  >
                    {renderFormattedText(project.project_description, `academicProjects.${index}.project_description`)}
                  </p>
                )}
                {project.description_bullets && project.description_bullets.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                    {project.description_bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>
                        {renderFormattedText(bullet, `academicProjects.${index}.description_bullets.${bulletIndex}`)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positions of Responsibility */}
      {sectionVisibility.pors && (data.positions_of_responsibility?.length ?? 0) > 0 && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('pors')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Positions of Responsibility
          </h2>
          <div className="space-y-4">
            {(data.positions_of_responsibility ?? []).map((por, index) => (
              <div key={index} className="resume-section"> 
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 
                      data-field={`pors.${index}.role`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`pors.${index}.role`)}
                    >
                      {renderFormattedText(por.role || "Position", `pors.${index}.role`)}
                    </h3>
                    <p 
                      data-field={`pors.${index}.organization`}
                      className="text-gray-600"
                      style={getFieldFormatting(`pors.${index}.organization`)}
                    >
                      {renderFormattedText(por.organization || "Organization", `pors.${index}.organization`)}
                    </p>
                    {por.location && (
                      <p className="text-sm text-gray-500">
                        {renderFormattedText(por.location, `pors.${index}.location`)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {renderFormattedText(por.duration, `pors.${index}.duration`)}
                  </span>
                </div>
                {por.role_description && (
                  <p className="text-gray-700 text-sm ml-4 mb-2">
                    {renderFormattedText(por.role_description, `pors.${index}.role_description`)}
                  </p>
                )}
                {por.organization_description && (
                  <p className="text-gray-700 text-sm ml-4 mb-2">
                    {renderFormattedText(por.organization_description, `pors.${index}.organization_description`)}
                  </p>
                )}
                {por.responsibilities && por.responsibilities.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                    {por.responsibilities.map((responsibility, respIndex) => (
                      <li key={respIndex}>
                        {renderFormattedText(responsibility, `pors.${index}.responsibilities.${respIndex}`)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {sectionVisibility.achievements && (data.achievements?.length ?? 0) > 0 && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('achievements')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Achievements
          </h2>
          <div className="space-y-3">
            {(data.achievements ?? []).map((achievement, index) => (
              <div key={index} className="resume-section"> 
                <div className="flex justify-between items-start">
                  <div>
                    <h3 
                      data-field={`achievements.${index}.title`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`achievements.${index}.title`)}
                    >
                      {renderFormattedText(achievement.title || "Achievement", `achievements.${index}.title`)}
                    </h3>
                    {achievement.awarding_body && (
                      <p className="text-gray-600 text-sm">
                        {renderFormattedText(achievement.awarding_body, `achievements.${index}.awarding_body`)}
                      </p>
                    )}
                    {achievement.description && (
                      <p 
                        data-field={`achievements.${index}.description`}
                        className="text-gray-700 text-sm mt-1"
                        style={getFieldFormatting(`achievements.${index}.description`)}
                      >
                        {renderFormattedText(achievement.description, `achievements.${index}.description`)}
                      </p>
                    )}
                  </div>
                  {achievement.year && (
                    <span className="text-sm text-gray-500">
                      {renderFormattedText(achievement.year, `achievements.${index}.year`)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {sectionVisibility.certifications && (data.certifications?.length ?? 0) > 0 && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('certifications')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Certifications
          </h2>
          <div className="space-y-3">
            {(data.certifications ?? []).map((cert, index) => (
              <div key={index} className="resume-section"> 
                <div className="flex justify-between items-start">
                  <div>
                    <h3 
                      data-field={`certifications.${index}.certification`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`certifications.${index}.certification`)}
                    >
                      {renderFormattedText(cert.certification || "Certification Name", `certifications.${index}.certification`)}
                    </h3>
                    {cert.issuing_organization && (
                      <p 
                        data-field={`certifications.${index}.issuing_organization`}
                        className="text-gray-600"
                        style={getFieldFormatting(`certifications.${index}.issuing_organization`)}
                      >
                        {renderFormattedText(cert.issuing_organization, `certifications.${index}.issuing_organization`)}
                      </p>
                    )}
                    {cert.description && (
                      <p 
                        data-field={`certifications.${index}.description`}
                        className="text-gray-700 text-sm mt-1"
                        style={getFieldFormatting(`certifications.${index}.description`)}
                      >
                        {renderFormattedText(cert.description, `certifications.${index}.description`)}
                      </p>
                    )}
                  </div>
                  {cert.time_of_certification && (
                    <span className="text-sm text-gray-500">
                      {renderFormattedText(cert.time_of_certification, `certifications.${index}.time_of_certification`)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extra Curricular Activities */}
      {sectionVisibility.extraCurricular && (data.extra_curriculars?.length ?? 0) > 0 && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('extraCurricular')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Extra Curricular Activities
          </h2>
          <div className="space-y-3">
            {(data.extra_curriculars ?? []).map((activity, index) => (
              <div key={index} className="resume-section"> 
                <div className="flex justify-between items-start">
                  <div>
                    <h3 
                      data-field={`extraCurricular.${index}.activity`}
                      className="font-semibold text-gray-900"
                      style={getFieldFormatting(`extraCurricular.${index}.activity`)}
                    >
                      {renderFormattedText(activity.activity || "Activity", `extraCurricular.${index}.activity`)}
                    </h3>
                    {activity.position && (
                      <p className="text-gray-600">
                        {renderFormattedText(activity.position, `extraCurricular.${index}.position`)}
                      </p>
                    )}
                    {activity.description && (
                      <p 
                        data-field={`extraCurricular.${index}.description`}
                        className="text-gray-700 text-sm mt-1"
                        style={getFieldFormatting(`extraCurricular.${index}.description`)}
                      >
                        {renderFormattedText(activity.description, `extraCurricular.${index}.description`)}
                      </p>
                    )}
                  </div>
                  {activity.year && (
                    <span className="text-sm text-gray-500">
                      {renderFormattedText(activity.year, `extraCurricular.${index}.year`)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {sectionVisibility.skills && (data.skills?.length ?? 0) > 0 && (
        <div 
          className="resume-section"
          onClick={() => onFieldClick('skills')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Skills
          </h2>
          <p 
            data-field="skills"
            className="text-gray-700 text-sm"
            style={getFieldFormatting('skills')}
          >
            {renderFormattedText((data.skills ?? []).join(", "), "skills")}
          </p>
        </div>
      )}

      {/* Languages */}
      {sectionVisibility.languages && (data.languages?.length ?? 0) > 0 && (
        <div 
          className="mb-6 resume-section"
          onClick={() => onFieldClick('languages')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Languages
          </h2>
          <p 
            data-field="languages"
            className="text-gray-700 text-sm"
            style={getFieldFormatting('languages')}
          >
            {renderFormattedText((data.languages ?? []).join(", "), "languages")}
          </p>
        </div>
      )}

      {/* Interests */}
      {sectionVisibility.interests && (data.interests?.length ?? 0) > 0 && (
        <div 
          className="resume-section"
          onClick={() => onFieldClick('interests')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Interests
          </h2>
          <p 
            data-field="interests"
            className="text-gray-700 text-sm"
            style={getFieldFormatting('interests')}
          >
            {renderFormattedText((data.interests ?? []).join(", "), "interests")}
          </p>
        </div>
      )}
    </div>
  );
}

// Combine the Editor functionality into the EditorPage component
export default function EditorPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [location, setLocation] = useLocation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [resumeData, setResumeData] = useState<Resume>(defaultResumeData);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({
    summary: true,
    workExperience: true,
    internships: true,
    education: true,
    academicProjects: true,
    pors: true,
    achievements: true,
    certifications: true,
    extraCurricular: true,
    skills: true,
    languages: true,
    interests: true,
  });
  const [fontSettings, setFontSettings] = useState<FontSettings>({
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

  const { wsRef, send } = useResumeSocket(id);
  const [fieldFormats, setFieldFormats] = useState<Record<string, any>>({});
  const [floatingFormats, setFloatingFormats] = useState({});
  const editorRef = useRef<HTMLDivElement>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    
    if (!selection || selection.isCollapsed) {
      setToolbarPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (rect.width > 0) {
      setToolbarPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top
      });
    }
  }, []);

  const applyStyleToBlock = (styleProperty: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    let block = range.startContainer.parentElement;

    while (block && window.getComputedStyle(block).display !== 'block') {
      block = block.parentElement;
    }

    if (block) {
      block.style[styleProperty] = value;
    }
  };

  const handleFormat = useCallback((styleProperty: string, value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    let command = styleProperty;
    let commandValue: any = value;

    if (styleProperty === 'fontWeight') {
      command = 'bold';
      commandValue = null;
    } else if (styleProperty === 'fontStyle') {
      command = 'italic';
      commandValue = null;
    } else if (styleProperty === 'textDecoration') {
      command = 'underline';
      commandValue = null;
    } else if (styleProperty === 'fontSize') {
      command = 'fontSize';
      const sizeMap = {
        '10pt': '1',
        '12pt': '2',
        '14pt': '3',
        '16pt': '4',
        '18pt': '5',
        '20pt': '6',
      };
      commandValue = sizeMap[value] || '3';
    } else if (styleProperty === 'fontFamily') {
      command = 'fontName';
    } else if (styleProperty === 'lineHeight' || styleProperty === 'marginBottom') {
      applyStyleToBlock(styleProperty, value);
      return;
    }

    document.execCommand(command, false, commandValue);
  }, []);

  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<any>(null);

  // Refs for the connection system
  const previewContentRef = useRef<HTMLDivElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const personalInfoRef = useRef<HTMLDivElement>(null);
  const workExperienceRef = useRef<HTMLDivElement>(null);
  const internshipsRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const academicProjectsRef = useRef<HTMLDivElement>(null);
  const porsRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const certificationsRef = useRef<HTMLDivElement>(null);
  const extraCurricularRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);
  const interestsRef = useRef<HTMLDivElement>(null);

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
    { value: 'arial', label: 'Arial', class: 'font-arial', css: 'Arial, sans-serif' },
    { value: 'times-new-roman', label: 'Times New Roman', class: 'font-times-new-roman', css: "'Times New Roman', serif" },
    { value: 'cambria', label: 'Cambria', class: 'font-cambria', css: 'Cambria, serif' },
    { value: 'georgia', label: 'Georgia', class: 'font-georgia', css: 'Georgia, serif' },
    { value: 'roboto', label: 'Roboto', class: 'font-roboto', css: 'Roboto, sans-serif' },
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
    queryKey: [`/api/user/get-resume/${id}`],
    enabled: !isNewResume,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Resume) => {
      const payload = {
        title: data.name || "Untitled Resume",
        data,
        status: "in-progress",
      };

      if (isNewResume) {
        return apiRequest("POST", "/api/user/create-resume", payload);
      } else {
        return apiRequest("PUT", `/api/user/save-resume/${id}`, payload);
      }
    },
    onSuccess: () => {
      toast({
        title: "Resume saved",
        description: "Your resume has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/get-all-resume"] });
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
    mutationFn: async (data: Resume) => {
      const payload = {
        title: data.name || "Untitled Resume",
        summary: data.summary,
        name: data.name,
        email: data.email,
        phone_number: data.phone_number,
        skills: data.skills,
        interests: data.interests,
        languages: data.languages,
        external_links: data.external_links,
        education_entries: data.education_entries,
        work_experiences: data.work_experiences,
        internships: data.internships,
        achievements: data.achievements,
        positions_of_responsibility: data.positions_of_responsibility,
        extra_curriculars: data.extra_curriculars,
        certifications: data.certifications,
        academic_projects: data.academic_projects,
        resume_inputs: data.resume_inputs,
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

    setIsPreviewLoading(true);

    try {
      const element = previewRef.current.cloneNode(true) as HTMLElement;
      
      const uElements = element.getElementsByTagName('u');
      Array.from(uElements).forEach(u => {
          const span = document.createElement('span');
          span.style.textDecoration = 'underline';
          span.innerHTML = u.innerHTML;
          if (u.parentNode) {
            u.parentNode.replaceChild(span, u);
          }
      });

      const opt = {
        margin:       [0, 0, 0, 0],
        filename:     `${resumeData.name || "resume"}.pdf`,
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(element).set(opt).save();

      if (!isNewResume && resumeData.id) {
        exportMutation.mutate(resumeData);
      }
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleFontSizeChange = (size: string) => {
    const fontSizeMap: Record<string, number> = {
      xs: 1,
      small: 2,
      medium: 3,
      large: 4,
      xl: 5,
      '2xl': 6,
    };
    document.execCommand('fontSize', false, fontSizeMap[size].toString());
  };

  const handleFontFamilyChange = (style: string) => {
    const fontFamily = fontFamilies.find(f => f.value === style)?.css;
    if (fontFamily) {
      document.execCommand('fontName', false, fontFamily);
    }
  };

  const handleLineHeightChange = (lineHeight: string) => {
    applyStyleToBlock('lineHeight', lineHeight);
  };

  const handleColorChange = (color: string) => {
    document.execCommand('foreColor', false, color);
  };

  const toggleBold = () => {
    document.execCommand('bold');
  };

  const toggleItalic = () => {
    document.execCommand('italic');
  };

  const toggleUnderline = () => {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('underline', false, null);
    document.execCommand('styleWithCSS', false, false);
  };

  const handleAlignmentChange = (alignment: string) => {
    let command = '';
    switch (alignment) {
      case 'left':
        command = 'justifyLeft';
        break;
      case 'center':
        command = 'justifyCenter';
        break;
      case 'right':
        command = 'justifyRight';
        break;
      case 'justify':
        command = 'justifyFull';
        break;
    }
    if (command) {
      document.execCommand(command);
    }
  };

  const resetFormatting = () => {
    document.execCommand('removeFormat');
    setFontSettings({
      size: 'medium',
      weight: 'normal',
      style: 'modern',
      bold: false,
      italic: false,
      underline: false,
      alignment: 'left',
      lineHeight: '1.5',
      color: '#000000',
      backgroundColor: '#ffffff',
      marginTop: '0px',
      marginBottom: '0px'
    });
    toast({
      title: "Formatting reset",
      description: "All formatting has been reset to default",
    });
  };

  const handleChangeTemplate = () => {
    console.log('Navigating to templates page...');
    window.location.href = '/templates';
  };

  // Handler for floating toolbar format changes
  type TextSelection = {
    field: string;
    start: number;
    end: number;
    text: string;
  };

  const handleFloatingFormatChange = (selection: TextSelection, format: string, value: any) => {
    if (!selection || !selection.field) {
      return;
    }

    setFieldFormats((prev) => {
      const newFormats = {
        ...prev,
        [selection.field]: {
          ...prev[selection.field],
          selections: {
            ...(prev[selection.field]?.selections || {}),
            [`${selection.start}-${selection.end}`]: {
              start: selection.start,
              end: selection.end,
              [format]: value
            }
          }
        }
      };
      return newFormats;
    });

    setFloatingFormats((prev) => ({ ...prev, [format]: value }));
  };

  // Function to get field-specific formatting
  const getFieldFormatting = (fieldName: string, textIndex?: number) => {
    const fieldFormat = fieldFormats[fieldName];
    if (!fieldFormat) return {};

    const styles: React.CSSProperties = {
      // Add default styles from global font settings
      fontWeight: fontSettings.bold ? 'bold' : 'normal',
      fontStyle: fontSettings.italic ? 'italic' : 'normal',
      textDecoration: fontSettings.underline ? 'underline' : 'none',
      textAlign: fontSettings.alignment as any,
      color: fontSettings.color,
    };
    
    // Add field-specific formatting
    if (fieldFormat.selections && textIndex !== undefined) {
      Object.values(fieldFormat.selections).forEach(selection => {
        if (textIndex >= selection.start && textIndex < selection.end) {
          if (selection.bold !== undefined) styles.fontWeight = selection.bold ? 'bold' : 'normal';
          if (selection.italic !== undefined) styles.fontStyle = selection.italic ? 'italic' : 'normal';
          if (selection.underline !== undefined) styles.textDecoration = selection.underline ? 'underline' : 'none';
        }
      });
    }

    return styles;
  };

  const handleSave = () => {
    try {
      if (resumeData.name?.trim()) {
        send({
          type: "save_resume",
          resume: resumeData
        });

        toast({
          title: "Resume Saved",
          description: "Your resume has been saved successfully.",
        });

        saveMutation.mutate(resumeData);
      } else {
        toast({
          title: "Please add your name",
          description: "Add your full name before saving the resume.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("Error saving resume:", error);
      toast({
        title: "Save Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scrollToSection = (section: string) => {
    if (formRef.current) {
      formRef.current[section + "Ref"].current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Updated effect to handle loading resume data from API
  useEffect(() => {
    if (resume && !isNewResume) {
      setResumeData(resume);
      setIsInitialLoading(false);
    } else if (isNewResume) {
      setIsInitialLoading(false);
    }
  }, [resume, isNewResume]);

  // Auto-save effect with debounce
  useEffect(() => {
    let saveTimer: NodeJS.Timeout;

    if (resumeData.name?.trim() && !isInitialLoading) {
      saveTimer = setTimeout(() => {
        console.log("Auto-saving resume...");
        send({
          type: "save_resume",
          resume: resumeData
        });
      }, 3000);
    }

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [resumeData, send, isInitialLoading]);

  // Show initial loading screen
  if ((isLoading && !isNewResume) || isInitialLoading) {
    return <ResumeEditorPreloader message="Loading your resume editor..." />;
  }
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

    .font-arial { font-family: Arial, sans-serif; }
    .font-times-new-roman { font-family: "Times New Roman", serif; }
    .font-cambria { font-family: Cambria, serif; }
    .font-georgia { font-family: Georgia, serif; }
    .font-roboto { font-family: 'Roboto', sans-serif; }
  ` }} />
);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <GlobalStyles />
      
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
                    {fontFamilies.find(f => f.value === fontSettings.style)?.label || 'Font Family'}
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
              {saveMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  Save
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={exportMutation.isPending || isPreviewLoading}
              className="px-3 py-1 text-xs h-8 border-green-300 text-green-600 hover:bg-green-50 flex items-center gap-1"
            >
              {(exportMutation.isPending || isPreviewLoading) ? (
                <>
                  <LoadingSpinner size="sm" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  Export PDF
                </>
              )}
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
            <div className="flex-1 overflow-y-auto" ref={formContentRef}>
              <div className="p-4">
                {isInitialLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <LoadingSpinner size="lg" className="mx-auto mb-4" />
                      <p className="text-gray-600">Loading form...</p>
                    </div>
                  </div>
                ) : (
                  <ResumeForm
                    ref={formRef}
                    initialData={resumeData}
                    onChange={setResumeData}
                    sectionVisibility={sectionVisibility}
                    onSectionVisibilityChange={setSectionVisibility}
                    send={send}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Resume Preview Section - 50% Static, no scrolling */}
        <div className={`${isSidebarVisible ? 'w-1/2' : 'w-full'} bg-white flex flex-col overflow-hidden`}> 
          {/* Preview Header - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50 flex items-center">
            <Button variant="outline" size="sm" onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="mr-4">
              {isSidebarVisible ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
              <p className="text-sm text-gray-600">See how your resume looks</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-100" ref={previewContentRef}>
            <LivePaginatedPreview
              data={resumeData}
              sectionVisibility={sectionVisibility}
              fontSettings={fontSettings}
              fieldFormats={fieldFormats}
              getFieldFormatting={getFieldFormatting}
              onFieldClick={handlePreviewFieldClick}
              handleSelection={handleSelection}
            />
          </div>
        </div>
      </div>

      {/* Chatbot positioned absolutely */}
      <Chatbot resumeId={id} data={resumeData} setData={setResumeData} wsRef={wsRef} />

      {/* Floating Format Toolbar */}
      <FloatingFormatToolbar
        position={toolbarPosition}
        onFormat={handleFormat}
        fontSizes={fontSizes}
        fontFamilies={fontFamilies}
      />

      {/* Debug: Show current field formats (remove in production) */}
      {process.env.NODE_ENV === 'development' && Object.keys(fieldFormats).length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs z-40">
          <h3 className="font-semibold mb-2">Field Formats:</h3>
          <div className="text-xs space-y-1">
            {Object.entries(fieldFormats).map(([field, formats]) => (
              <div key={field} className="border-b pb-1">
                <div className="font-medium">{field}:</div>
                <div className="text-gray-600">
                  {Object.entries(formats).map(([prop, value]) => (
                    <span key={prop} className="mr-2">
                      {prop}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        
      {/* Hidden div for PDF export */}
      <div style={{ position: "absolute", left: "-9999px", top: "0", visibility: "hidden" }}>
        <div 
          ref={previewRef} 
          className="bg-white"
          style={{ 
            width: `${A4_WIDTH_MM}mm`,
            minHeight: `${A4_HEIGHT_MM}mm`,
            padding: '20mm',
            position: 'relative'
          }}
        >
          <div 
            style={{
              width: '100%',
              position: 'relative',
              fontFamily: fontFamilies.find(f => f.value === fontSettings.style)?.class || 'sans-serif',
              fontSize: fontSizes.find(f => f.value === fontSettings.size)?.label || '14pt',
              lineHeight: lineHeights.find(l => l.value === fontSettings.lineHeight)?.label || '1.5',
              color: fontSettings.color
            }}
          >
            <ResumePreview 
              data={resumeData}
              sectionVisibility={sectionVisibility}
              fontSettings={fontSettings}
              fieldFormats={fieldFormats}
              getFieldFormatting={getFieldFormatting}
              onFieldClick={() => {}} // Disable click handler for export
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Add these interfaces near the top of the file
interface FontSetting {
  value: string;
  label: string;
  class: string;
}

interface FontSettings {
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
}

interface SectionHoverStates {
  personalInfo: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  // Add other sections as needed
}

// Add this constant before the ResumePreview component definition
const subtleHoverStyle = {
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out',
  padding: '8px',
  borderRadius: '4px',
  backgroundColor: 'transparent'
} as const;

const LivePaginatedPreview = React.memo(function LivePaginatedPreview({
  data,
  sectionVisibility,
  fontSettings,
  fieldFormats,
  getFieldFormatting,
  onFieldClick,
  handleSelection,
}: {
  data: Resume;
  sectionVisibility: Record<string, boolean>;
  fontSettings: FontSettings;
  fieldFormats: Record<string, any>;
  getFieldFormatting: (field: string) => React.CSSProperties;
  onFieldClick: (section: string) => void;
  handleSelection: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dividers, setDividers] = useState<number[]>([]);

  // Function to add dividers based on content height
  const addDividersBasedOnHeight = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const contentHeight = container.scrollHeight;
    
    // Calculate A4 height in pixels dynamically
    // 297mm A4 height converted to pixels (assuming 96 DPI: 1mm ≈ 3.78px)
    const a4HeightPx = 287.3 * 3.78;
    const pageHeight = a4HeightPx - 40; // Account for padding
    
    // Calculate how many pages we need
    const numberOfPages = Math.ceil(contentHeight / pageHeight);
    
    // Create divider positions
    const newDividers: number[] = [];
    for (let i = 1; i < numberOfPages; i++) {
      newDividers.push(i * pageHeight);
    }
    
    setDividers(newDividers);
  };

  // Use ResizeObserver to detect content changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce the divider calculation
      const timeoutId = setTimeout(addDividersBasedOnHeight, 100);
      return () => clearTimeout(timeoutId);
    });

    resizeObserver.observe(containerRef.current);

    // Initial calculation
    addDividersBasedOnHeight();

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, sectionVisibility, fontSettings, fieldFormats]);

  // Function to render dividers at specific positions
  const renderDividers = () => {
      return dividers.map((position, index) => (
      <div
        key={`divider-${index}`}
        className="a4-overflow-divider"
        style={{
          position: 'absolute',
          top: `${position}px`,
          left: '0',
          right: '0',
          height: '20px', // add a height to create a gap
          backgroundColor: '#f3f4f6', // same as the background color
          zIndex: 1000
        }}
      >
        <div className="divider-line"></div>
        <div className="divider-text">Page {index + 2}</div>
      </div>
    ));
  };

  

  return (
    <>
      <GlobalStyles />
      <div className="expandable-outer-live">
        <div
          ref={containerRef}
          className="expandable-a4-live"
          contentEditable={true}
          onMouseUp={handleSelection}
          onKeyUp={handleSelection}
          style={{ position: 'relative' }}
        >
          <ResumePreview
            data={data}
            sectionVisibility={sectionVisibility}
            fontSettings={fontSettings}
            fieldFormats={fieldFormats}
            getFieldFormatting={getFieldFormatting}
            onFieldClick={onFieldClick}
            isLoading={false}
          />
          {renderDividers()}
        </div>
      </div>
    </>
  );
});

// Enhanced Global Styles with improved divider positioning
const GlobalStyles = () => (
  <style>{`
    .resume-section {
      position: relative;
    }
    
    /* Outer container for live preview */
    .expandable-outer-live {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      background-color: #f3f4f6 !important;
      width: 100% !important;
      overflow: auto !important;
      padding: 2rem !important;
      gap: 2rem !important;
      min-height: 100vh !important;
      height: auto !important;
    }
    
    /* A4 page container for live preview */
    .expandable-a4-live {
      width: ${A4_WIDTH_MM}mm !important;
      min-height: ${A4_HEIGHT_MM}mm !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      position: relative !important;
      padding: 5mm !important;
      box-sizing: border-box !important;
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      background-color: white !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    }
    
    /* A4 overflow divider styles */
    .a4-overflow-divider {
      position: absolute;
      left: 0;
      right: 0;
      margin: 10px 0;
      text-align: center;
      pointer-events: none;
      z-index: 1000;
    }
    
    .divider-line {
      height: 3px;
      background: linear-gradient(90deg, transparent, #e74c3c, transparent);
      border: none;
      margin: 0;
      position: relative;
      width: 100%;
    }
    
    .divider-line::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 3px;
      background-color: #e74c3c;
      border-radius: 1.5px;
    }
    
    .divider-text {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background-color: white;
      padding: 4px 12px;
      font-size: 11px;
      color: #e74c3c;
      font-weight: 600;
      white-space: nowrap;
      border: 1px solid #e74c3c;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      pointer-events: none;
    }
    
    /* Override any existing a4-page-container restrictions */
    .a4-page-container {
      height: auto !important;
      min-height: ${A4_HEIGHT_MM}mm !important;
      max-height: none !important;
      overflow: visible !important;
    }
    
    /* New expandable container styles */
    .expandable-a4-container {
      height: auto !important;
      min-height: ${A4_HEIGHT_MM}mm !important;
      max-height: none !important;
      overflow: visible !important;
    }

    /* Ensure content doesn't interfere with dividers */
    .resume-section {
      position: relative;
      z-index: 1;
    }
    
    @media print {
      .resume-section {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .a4-page-container,
      .expandable-a4-container,
      .expandable-a4-live {
        page-break-after: always;
        height: auto !important;
        min-height: ${A4_HEIGHT_MM}mm !important;
        max-height: none !important;
        overflow: visible !important;
      }
      
      .expandable-outer-live {
        background-color: white !important;
        padding: 0 !important;
      }
      
      /* Hide divider in print */
      .a4-overflow-divider {
        display: none !important;
      }
    }

    /* Animation for smoother divider transitions */
    .a4-overflow-divider {
      transition: opacity 0.2s ease-in-out;
    }

    /* Loading spinner animation */
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translateY(0);
      }
      40%, 43% {
        transform: translateY(-8px);
      }
      70% {
        transform: translateY(-4px);
      }
      90% {
        transform: translateY(-2px);
      }
    }

    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    .animate-bounce {
      animation: bounce 1s ease-in-out infinite;
    }

    .animate-pulse {
      animation: pulse 2s ease-in-out infinite;
    }
  `}</style>
);