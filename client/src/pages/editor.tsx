import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
  ListOrdered
} from "lucide-react";

// Constants
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 3.7795275591; // Standard conversion ratio
const PAGE_PADDING_MM = 20; // 20mm padding on all sides
const USABLE_HEIGHT_MM = A4_HEIGHT_MM - (PAGE_PADDING_MM * 2); // 257mm usable height
const USABLE_HEIGHT_PX = USABLE_HEIGHT_MM * MM_TO_PX; // Convert to pixels

// Utility functions for font settings
const getFontFamily = (style) => {
  const fontMap = {
    'modern': 'Arial, sans-serif',
    'classic': 'Times New Roman, serif',
    'minimal': 'Courier New, monospace',
    'professional': 'Calibri, sans-serif'
  };
  return fontMap[style] || 'Arial, sans-serif';
};

const getFontSize = (size) => {
  const sizeMap = {
    'xs': '10px',
    'small': '12px',
    'medium': '14px',
    'large': '16px',
    'xl': '18px',
    '2xl': '20px'
  };
  return sizeMap[size] || '14px';
};

const getLineHeight = (lineHeight) => {
  const heightMap = {
    'tight': '1.25',
    'normal': '1.5',
    'relaxed': '1.75',
    'loose': '2'
  };
  return heightMap[lineHeight] || '1.5';
};

// Hook for page break logic
const usePageBreakLogic = (contentRef, fontSettings) => {
  const [pages, setPages] = useState([]);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    if (!contentRef.current) return;

    const container = contentRef.current;
    const maxHeight = USABLE_HEIGHT_PX;
    
    // Create a temporary measuring container
    const measuringContainer = document.createElement('div');
    measuringContainer.style.position = 'absolute';
    measuringContainer.style.top = '-9999px';
    measuringContainer.style.left = '-9999px';
    measuringContainer.style.width = `${(A4_WIDTH_MM - PAGE_PADDING_MM * 2) * MM_TO_PX}px`;
    measuringContainer.style.visibility = 'hidden';
    measuringContainer.style.fontFamily = getFontFamily(fontSettings.style);
    measuringContainer.style.fontSize = getFontSize(fontSettings.size);
    measuringContainer.style.lineHeight = getLineHeight(fontSettings.lineHeight);
    
    document.body.appendChild(measuringContainer);

    try {
      const sections = Array.from(container.children);
      const paginatedPages = [];
      let currentPage = [];
      let currentPageHeight = 0;

      sections.forEach((section) => {
        // Clone the section for measurement
        const tempSection = section.cloneNode(true);
        tempSection.style.cssText = measuringContainer.style.cssText;
        tempSection.style.position = 'static';
        tempSection.style.visibility = 'visible';
        measuringContainer.appendChild(tempSection);

        const sectionHeight = tempSection.offsetHeight;
        
        // Check if adding this section would exceed page height
        if (currentPageHeight + sectionHeight > maxHeight && currentPage.length > 0) {
          // Start a new page
          paginatedPages.push([...currentPage]);
          currentPage = [section];
          currentPageHeight = sectionHeight;
        } else {
          // Add to current page
          currentPage.push(section);
          currentPageHeight += sectionHeight;
        }

        // Clean up temp element
        measuringContainer.removeChild(tempSection);
      });

      // Add the last page if it has content
      if (currentPage.length > 0) {
        paginatedPages.push(currentPage);
      }

      setPages(paginatedPages);
      setPageCount(paginatedPages.length);
    } catch (error) {
      console.error('Page break calculation error:', error);
      // Fallback to single page
      setPages([Array.from(container.children)]);
      setPageCount(1);
    } finally {
      // Clean up measuring container
      if (document.body.contains(measuringContainer)) {
        document.body.removeChild(measuringContainer);
      }
    }
  }, [fontSettings]);

  return { pages, pageCount };
};

// Page Break Indicator Component
const PageBreakIndicator = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="flex items-center justify-center py-4 my-4">
      <div className="flex-1 border-t-2 border-dashed border-blue-400"></div>
      <div className="mx-4 px-3 py-1 bg-blue-50 border-2 border-blue-400 rounded-full text-xs font-medium text-blue-600">
        Page Break
      </div>
      <div className="flex-1 border-t-2 border-dashed border-blue-400"></div>
    </div>
  );
};

// Resume Page Component
const ResumePage = ({ children, pageNumber, totalPages, isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <>
      <div
        className="bg-white shadow-lg mb-4 a4-page-container"
        style={{
          width: `${A4_WIDTH_MM}mm`,
          minHeight: `${A4_HEIGHT_MM}mm`,
          maxHeight: `${A4_HEIGHT_MM}mm`,
          maxWidth: '100%',
          margin: '0 auto',
          position: 'relative',
          padding: `${PAGE_PADDING_MM}mm`,
          overflow: 'hidden',
          pageBreakAfter: pageNumber === totalPages ? 'auto' : 'always',
        }}
      >
        <div style={{ 
          height: `${USABLE_HEIGHT_MM}mm`,
          overflow: 'hidden'
        }}>
          {children}
        </div>
        
        {/* Page number */}
        <div className="absolute bottom-4 right-6 text-xs text-gray-400">
          Page {pageNumber} of {totalPages}
        </div>
      </div>
      
      {/* Only show page break if not the last page */}
      <PageBreakIndicator show={pageNumber < totalPages} />
    </>
  );
};

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

// Updated Preview wrapper component for maintaining A4 proportions with page break support
const A4PreviewContainer = ({ children, pages, pageCount, fontSettings }) => {
  // Force multi-page for testing - you can toggle this
  const FORCE_MULTI_PAGE = true; // Set to true to test multi-page layout
  
  if (pages.length === 0) {
    // Fallback to single page when no pages calculated yet
    return (
      <div className="flex flex-col items-center bg-gray-100 w-full h-full overflow-auto p-8 gap-8">
        <ResumePage pageNumber={1} totalPages={1}>
          {children}
        </ResumePage>
      </div>
    );
  }

  // Force multi-page for testing
  if (FORCE_MULTI_PAGE && pages.length === 1) {
    console.log('Forcing multi-page layout for testing');
    const singlePageSections = pages[0];
    const midPoint = Math.ceil(singlePageSections.length / 2);
    const forcedPages = [
      singlePageSections.slice(0, midPoint),
      singlePageSections.slice(midPoint)
    ].filter(page => page.length > 0); // Remove empty pages
    
    return (
      <div className="flex flex-col items-center bg-gray-100 w-full h-full overflow-auto p-8 gap-8">
        <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded mb-4 border border-orange-200">
          Testing Mode: Multi-page layout ({forcedPages.length} pages)
        </div>
        {forcedPages.map((pageContent, pageIndex) => (
          <ResumePage 
            key={pageIndex}
            pageNumber={pageIndex + 1}
            totalPages={forcedPages.length}
          >
            {pageContent.map((section, sectionIndex) => {
              return React.cloneElement(section, {
                key: `${pageIndex}-${sectionIndex}`
              });
            })}
          </ResumePage>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gray-100 w-full h-full overflow-auto p-8 gap-8">
      {pages.map((pageContent, pageIndex) => (
        <ResumePage 
          key={pageIndex}
          pageNumber={pageIndex + 1}
          totalPages={pageCount}
        >
          {pageContent.map((section, sectionIndex) => {
            return React.cloneElement(section, {
              key: `${pageIndex}-${sectionIndex}`
            });
          })}
        </ResumePage>
      ))}
    </div>
  );
};

// Update the ResumePreview component with section wrapping
const ResumePreview = ({ 
  data, 
  sectionVisibility, 
  fontSettings, 
  fieldFormats, 
  getFieldFormatting, 
  onFieldClick 
}: {
  data: Resume;
  sectionVisibility: Record<string, boolean>;
  fontSettings: FontSettings;
  fieldFormats: Record<string, any>;
  getFieldFormatting: (field: string) => React.CSSProperties;
  onFieldClick: (section: string) => void;
}) => {
  const [hoverStates, setHoverStates] = useState({
    personalInfo: false,
    experience: false,
    education: false,
    skills: false,
    achievements: false,
    certifications: false,
    languages: false,
    interests: false
  });

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
        }}
      >
        {text}
      </span>
    );
  };

  const handleMouseEnter = (section: string) => {
    setHoverStates(prev => ({
      ...prev,
      [section]: true
    }));
  };

  const handleMouseLeave = (section: string) => {
    setHoverStates(prev => ({
      ...prev,
      [section]: false
    }));
  };

  const renderSections = () => {
    const sections = [];

    // Each section wrapped in a div for page break logic
    
    // Header
    sections.push(
      <div 
        key="header"
        className="border-b border-gray-200 pb-6 mb-6 resume-section"
        onClick={() => onFieldClick('personalInfo')}
        style={{
          cursor: 'pointer',
          transition: 'background-color 0.2s ease-in-out',
          backgroundColor: hoverStates['personalInfo'] ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          padding: '8px',
          borderRadius: '4px'
        }}
        onMouseEnter={() => handleMouseEnter('personalInfo')}
        onMouseLeave={() => handleMouseLeave('personalInfo')}
      > 
        <h1 
          data-field="fullName" 
          className="text-3xl font-bold text-gray-900 mb-2 flex justify-center"
          style={getFieldFormatting('fullName')}
        >
          {data.name || "Your Name"}
        </h1>
        <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
          {data.email && (
            <span 
              data-field="email" 
              style={getFieldFormatting('email')}
            >
              ✉ {data.email}
            </span>
          )}
          {data.phone_number && (
            <span 
              data-field="phone" 
              style={getFieldFormatting('phone')}
            >
              📞 {data.phone_number}
            </span>
          )}
        </div>
      </div>
    );

    // Professional Summary
    if (sectionVisibility.summary && data.summary) {
      sections.push(
        <div 
          key="summary"
          className="mb-6 resume-section"
          onClick={() => onFieldClick('personalInfo')}
          style={{
            cursor: 'pointer',
            transition: 'background-color 0.2s ease-in-out',
            backgroundColor: hoverStates['personalInfo'] ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            padding: '8px',
            borderRadius: '4px'
          }}
          onMouseEnter={() => handleMouseEnter('personalInfo')}
          onMouseLeave={() => handleMouseLeave('personalInfo')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Professional Summary
          </h2>
          <p 
            data-field="summary" 
            className="text-gray-700 leading-relaxed"
            style={getFieldFormatting('summary')}
          >
            {data.summary}
          </p>
        </div>
      );
    }

    // Work Experience
    if (sectionVisibility.workExperience && (data.work_experiences?.length ?? 0) > 0) {
      sections.push(
        <div 
          key="workExperience"
          className="mb-6 resume-section"
          onClick={() => onFieldClick('workExperience')}
          style={{
            cursor: 'pointer',
            transition: 'background-color 0.2s ease-in-out',
            backgroundColor: hoverStates['workExperience'] ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            padding: '8px',
            borderRadius: '4px'
          }}
          onMouseEnter={() => handleMouseEnter('workExperience')}
          onMouseLeave={() => handleMouseLeave('workExperience')}
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
                      style={getFieldFormatting(`workExperience.${index}.designation`)}
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
                      {experience.company_name || "Company Name"}
                    </p>
                    {experience.location && (
                      <p className="text-sm text-gray-500">{experience.location}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {experience.duration}
                  </span>
                </div>
                {experience.company_description && (
                  <p className="text-gray-700 text-sm ml-4 mb-2">
                    {experience.company_description}
                  </p>
                )}
                {experience.designation_description && (
                  <p className="text-gray-700 text-sm ml-4 mb-2">
                    {experience.designation_description}
                  </p>
                )}
                {/* Projects under work experience */}
                {(experience.projects?.length ?? 0) > 0 && (
                  <div className="ml-4 mt-2">
                    <h4 className="font-medium text-gray-800 text-sm mb-1">Projects:</h4>
                    {(experience.projects ?? []).map((project, projIndex) => (
                      <div key={projIndex} className="mb-2 resume-section">
                        <h5 className="font-medium text-gray-700 text-sm">
                          {project.project_name}
                        </h5>
                        {project.project_description && (
                          <p className="text-gray-600 text-sm">{project.project_description}</p>
                        )}
                        {(project.description_bullets?.length ?? 0) > 0 && (
                          <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                            {(project.description_bullets ?? []).map((bullet, bulletIndex) => (
                              <li key={bulletIndex}>{bullet}</li>
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
      );
    }

    // Education (adding more sections following the same pattern...)
    if (sectionVisibility.education && (data.education_entries?.length ?? 0) > 0) {
      sections.push(
        <div 
          key="education"
          className="mb-6 resume-section"
          onClick={() => onFieldClick('education')}
          style={{
            cursor: 'pointer',
            transition: 'background-color 0.2s ease-in-out',
            backgroundColor: hoverStates['education'] ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            padding: '8px',
            borderRadius: '4px'
          }}
          onMouseEnter={() => handleMouseEnter('education')}
          onMouseLeave={() => handleMouseLeave('education')}
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
                      {education.degree || "Degree"}
                    </h3>
                    <p 
                      data-field={`education.${index}.college`}
                      className="text-gray-600"
                      style={getFieldFormatting(`education.${index}.college`)}
                    >
                      {education.college || "Institution"}
                    </p>
                    {education.cgpa && (
                      <p 
                        data-field={`education.${index}.cgpa`}
                        className="text-sm text-gray-600 mt-1"
                        style={getFieldFormatting(`education.${index}.cgpa`)}
                      >
                        CGPA: {education.cgpa}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {education.start_year} - {education.end_year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Skills
    if (sectionVisibility.skills && (data.skills?.length ?? 0) > 0) {
      sections.push(
        <div 
          key="skills"
          className="resume-section"
          onClick={() => onFieldClick('skills')}
          style={{
            cursor: 'pointer',
            transition: 'background-color 0.2s ease-in-out',
            backgroundColor: hoverStates['skills'] ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            padding: '8px',
            borderRadius: '4px'
          }}
          onMouseEnter={() => handleMouseEnter('skills')}
          onMouseLeave={() => handleMouseLeave('skills')}
        > 
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            Skills
          </h2>
          <p 
            data-field="skills"
            className="text-gray-700 text-sm"
            style={getFieldFormatting('skills')}
          >
            {(data.skills ?? []).join(", ")}
          </p>
        </div>
      );
    }

    return sections;
  };

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
      {renderSections()}
    </div>
  );
}

// Main Editor Component with page break integration
export default function EditorPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [location, setLocation] = useLocation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [resumeData, setResumeData] = useState<Resume>(defaultResumeData);
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
  const measureRef = useRef<HTMLDivElement>(null);

  // Page break logic hook
  const { pages, pageCount } = usePageBreakLogic(measureRef, fontSettings);

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
    { value: 'modern', label: 'Modern (Sans-serif)', class: 'font-sans', css: 'sans-serif' },
    { value: 'classic', label: 'Classic (Serif)', class: 'font-serif', css: 'serif' },
    { value: 'minimal', label: 'Minimal (Mono)', class: 'font-mono', css: 'monospace' },
    { value: 'professional', label: 'Professional (Arial)', class: 'font-sans', css: 'Arial, sans-serif' },
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
      // Configure html2pdf options for multi-page support
      const opt = {
        margin: 10,
        filename: `${resumeData.name || "resume"}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          width: A4_WIDTH_MM * MM_TO_PX,
          height: A4_HEIGHT_MM * MM_TO_PX,
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      // Create a clone of all pages for PDF export
      const pdfContainer = document.createElement('div');
      
      if (pages.length > 0) {
        // Multi-page export
        pages.forEach((pageContent, pageIndex) => {
          const pageDiv = document.createElement('div');
          pageDiv.style.width = `${A4_WIDTH_MM}mm`;
          pageDiv.style.minHeight = `${A4_HEIGHT_MM}mm`;
          pageDiv.style.backgroundColor = 'white';
          pageDiv.style.position = 'relative';
          pageDiv.style.padding = `${PAGE_PADDING_MM}mm`;
          pageDiv.style.pageBreakAfter = pageIndex < pages.length - 1 ? 'always' : 'auto';
          
          // Clone page content
          pageContent.forEach(section => {
            const clonedSection = section.cloneNode(true);
            pageDiv.appendChild(clonedSection);
          });
          
          pdfContainer.appendChild(pageDiv);
        });
      } else {
        // Fallback single page
        const pageDiv = document.createElement('div');
        pageDiv.style.width = `${A4_WIDTH_MM}mm`;
        pageDiv.style.minHeight = `${A4_HEIGHT_MM}mm`;
        pageDiv.style.backgroundColor = 'white';
        pageDiv.style.position = 'relative';
        pageDiv.style.padding = `${PAGE_PADDING_MM}mm`;
        
        const clonedContent = previewRef.current.cloneNode(true);
        pageDiv.appendChild(clonedContent);
        pdfContainer.appendChild(pageDiv);
      }

      // Temporarily append to document
      document.body.appendChild(pdfContainer);

      try {
        // Generate PDF
        await html2canvas(pdfContainer, opt.html2canvas).then(canvas => {
          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          const pdf = new jsPDF(opt.jsPDF.orientation, opt.jsPDF.unit, opt.jsPDF.format);
          
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save(opt.filename);
        });

        // Update resume status if not a new resume
        if (!isNewResume && resumeData.id) {
          exportMutation.mutate(resumeData);
        }
      } finally {
        // Clean up: remove the temporary element
        document.body.removeChild(pdfContainer);
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
  };

  const handleFontFamilyChange = (style: string) => {
    setFontSettings(prev => ({ ...prev, style }));
  };

  const handleLineHeightChange = (lineHeight: string) => {
    setFontSettings(prev => ({ ...prev, lineHeight }));
  };

  const handleColorChange = (color: string) => {
    setFontSettings(prev => ({ ...prev, color }));
  };

  const toggleBold = () => {
    setFontSettings(prev => ({ ...prev, bold: !prev.bold }));
  };

  const toggleItalic = () => {
    setFontSettings(prev => ({ ...prev, italic: !prev.italic }));
  };

  const toggleUnderline = () => {
    setFontSettings(prev => ({ ...prev, underline: !prev.underline }));
  };

  const handleAlignmentChange = (alignment: string) => {
    setFontSettings(prev => ({ ...prev, alignment }));
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
    try{
      if (resumeData.name?.trim()) {
        send({
          type:"save_resume",
          resume: resumeData
        })

        toast({
          title: "Resume Saved",
          description: "Your resume has been saved successfully.",
        })

        saveMutation.mutate(resumeData);
      } else {
        toast({
          title: "Please add your name",
          description: "Add your full name before saving the resume.",
          variant: "destructive",
        });
      }
    } catch(error){
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
    }
  }, [resume, isNewResume]);

  // Auto-save effect with debounce
  useEffect(() => {
    let saveTimer: NodeJS.Timeout;

    if (resumeData.name?.trim()) {
      saveTimer = setTimeout(() => {
        console.log("Auto-saving resume...");
        send({
          type:"save_resume",
          resume: resumeData
        });
      }, 3000);
    }

    // Cleanup the timer on component unmount or when dependencies change
    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [resumeData, send]);

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
            <div className="flex-1 overflow-y-auto" ref={formContentRef}>
              <div className="p-4">
                <ResumeForm
                  ref={formRef}
                  initialData={resumeData}
                  onChange={setResumeData}
                  sectionVisibility={sectionVisibility}
                  onSectionVisibilityChange={setSectionVisibility}
                  send={send}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Resume Preview Section with Page Break Support */}
        <div className={`${isSidebarVisible ? 'w-1/2' : 'w-full'} bg-white flex flex-col overflow-hidden`}> 
          {/* Preview Header - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="outline" size="sm" onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="mr-4">
                {isSidebarVisible ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                <p className="text-sm text-gray-600">See how your resume looks</p>
              </div>
            </div>
            {/* Page count indicator */}
            {pageCount > 1 && (
              <div className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
                {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
              </div>
            )}
          </div>
          
          {/* Preview Content with Page Break Logic */}
          <div className="flex-1 overflow-y-auto bg-gray-100" ref={previewContentRef}>
            {/* Hidden measuring container for page break calculations */}
            <div 
              ref={measureRef}
              style={{ 
                position: 'absolute', 
                left: '-9999px', 
                width: `${(A4_WIDTH_MM - PAGE_PADDING_MM * 2) * MM_TO_PX}px`,
                fontFamily: getFontFamily(fontSettings.style),
                fontSize: getFontSize(fontSettings.size),
                lineHeight: getLineHeight(fontSettings.lineHeight),
                visibility: 'hidden'
              }}
            >
              <ResumePreview 
                data={resumeData}
                sectionVisibility={sectionVisibility}
                fontSettings={fontSettings}
                fieldFormats={fieldFormats}
                getFieldFormatting={getFieldFormatting}
                onFieldClick={() => {}} // Disable click handler for measuring
              />
            </div>

            {/* Visible paginated preview */}
            <A4PreviewContainer 
              pages={pages} 
              pageCount={pageCount} 
              fontSettings={fontSettings}
            >
              <div 
                className="h-full"
                ref={contentRef}
                onMouseUp={handleSelection}
                onKeyUp={handleSelection}
                onBlur={() => setTimeout(() => setToolbarPosition(null), 200)}
                contentEditable={true}
                suppressContentEditableWarning={true}
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
            </A4PreviewContainer>
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

      {/* Hidden div for PDF export with multi-page support */}
      <div style={{ position: "absolute", left: "-9999px", top: "0", visibility: "hidden" }}>
        <div 
          ref={previewRef} 
          className="bg-white"
          style={{ 
            width: `${A4_WIDTH_MM}mm`,
            minHeight: `${A4_HEIGHT_MM}mm`,
            padding: `${PAGE_PADDING_MM}mm`,
            position: 'relative'
          }}
        >
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              fontFamily: getFontFamily(fontSettings.style),
              fontSize: getFontSize(fontSettings.size),
              lineHeight: getLineHeight(fontSettings.lineHeight),
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

const GlobalStyles = () => (
  <style>{`
    .resume-section {
      break-inside: avoid-page;
      page-break-inside: avoid;
      orphans: 2;
      widows: 2;
    }
    
    .a4-page-container {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    @media print {
      .a4-page-container {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
      }
      
      .a4-page-container:last-child {
        page-break-after: auto;
      }
      
      .resume-section {
        page-break-inside: avoid;
      }
    }
  `}</style>
);