import { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from "react";
import html2pdf from "html2pdf.js";

import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  RotateCcw,
  Space,
  Type
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Constants for A4 dimensions
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 3.78; // Approximate conversion factor

// Updated Types based on new schema
interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
  summary: string;
}

interface Education {
  college: string | null;
  degree: string | null;
  start_year: number | null;
  end_year: number | null;
  cgpa: number | null;
}

interface Project {
  project_name: string | null;
  project_description: string | null;
  description_bullets: string[];
}

interface WorkExperience {
  company_name: string | null;
  company_description: string | null;
  location: string | null;
  duration: string | null;
  designation: string | null;
  designation_description: string | null;
  projects: Project[];
}

interface Internship {
  company_name: string | null;
  company_description: string | null;
  location: string | null;
  designation: string | null;
  designation_description: string | null;
  duration: string | null;
  internship_work_description_bullets: string[];
}

interface ScholasticAchievement {
  title: string | null;
  awarding_body: string | null;
  year: number | null;
  description: string | null;
}

interface PositionOfResponsibility {
  role: string | null;
  role_description: string | null;
  organization: string | null;
  organization_description: string | null;
  location: string | null;
  duration: string | null;
  responsibilities: string[];
}

interface ExtraCurricular {
  activity: string | null;
  position: string | null;
  description: string | null;
  year: number | null;
}

interface Certification {
  certification: string | null;
  description: string | null;
  issuing_organization: string | null;
  time_of_certification: number | null;
}

interface AcademicProject {
  project_name: string | null;
  project_description: string | null;
  description_bullets: string[];
  duration: string | null;
}

interface ResumeInput {
  input_text: string | null;
  audio_file: string | null;
  transcribed_text: string | null;
  submitted_at: string | null;
}

interface Resume {
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

interface StyleOptions {
  colorScheme: 'blue' | 'green' | 'purple' | 'red' | 'indigo';
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'sans' | 'serif' | 'mono';
  layout: 'modern' | 'classic' | 'minimal';
}

interface FontSettings {
  color?: string;
  style?: 'sans' | 'serif' | 'mono' | 'modern' | 'classic' | 'minimal' | 'professional';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
}

interface FieldFormat {
  color?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: string;
  letterSpacing?: string;
}

// Updated ResumeData interface to match component usage


interface SectionVisibility {
  summary: boolean;
  education_entries: boolean;
  work_experiences: boolean;
  academic_projects: boolean;
  internships: boolean;
  positions_of_responsibility: boolean;
  achievements: boolean;
  certifications: boolean;
  extra_curriculars: boolean;
  skills: boolean;
  languages: boolean;
  interests: boolean;
  external_links: boolean;
}

interface TextSelection {
  field: string;
  fieldIndex?: number;
  startIndex: number;
  endIndex: number;
  text: string;
}

interface ResumePreviewProps {
  data: any;
  template: string;
  pageNumber: number;
  totalPages: number;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  template,
  pageNumber,
  totalPages
}) => {
  return (
    <div className="relative min-h-full">
      <div className="resume-sections">
        {/* Your existing resume sections */}
      </div>
      
      <div 
        className="absolute bottom-2 right-2 text-xs text-gray-400"
        style={{ pointerEvents: 'none' }}
      >
        Page {pageNumber} of {totalPages}
      </div>
    </div>
  );
};



// FloatingFormatToolbar component
const FloatingFormatToolbar: React.FC<{
  onFormatChange: (selection: TextSelection, format: string, value: any) => void;
  currentFormats: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    fontSize: string;
    fontFamily: string;
    alignment: string;
    letterSpacing?: string;
    lineHeight?: string;
  };
}> = ({ onFormatChange, currentFormats }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [textSelection, setTextSelection] = useState<TextSelection | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout>();

  const fontSizes = [
    { value: 'xs', label: '10' },
    { value: 'sm', label: '12' },
    { value: 'base', label: '14' },
    { value: 'lg', label: '16' },
    { value: 'xl', label: '18' },
    { value: '2xl', label: '20' },
    { value: '3xl', label: '24' },
  ];

  const fontFamilies = [
    { value: 'sans', label: 'Sans' },
    { value: 'serif', label: 'Serif' },
    { value: 'mono', label: 'Mono' },
  ];

  const letterSpacings = [
    { value: 'tighter', label: 'Tighter' },
    { value: 'tight', label: 'Tight' },
    { value: 'normal', label: 'Normal' },
    { value: 'wide', label: 'Wide' },
    { value: 'wider', label: 'Wider' },
    { value: 'widest', label: 'Widest' },
  ];

  const lineHeights = [
    { value: 'tight', label: '1.25' },
    { value: 'snug', label: '1.375' },
    { value: 'normal', label: '1.5' },
    { value: 'relaxed', label: '1.625' },
    { value: 'loose', label: '2' },
  ];

  const startInteraction = useCallback(() => {
    setIsInteracting(true);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
  }, []);

  const endInteraction = useCallback(() => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 200);
  }, []);

  const identifySelectedField = (): TextSelection | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const selectedText = selection.toString().trim();
    if (selectedText.length === 0) return null;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;

    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode;
    }

    if (!element) return null;

    const fieldElement = (element as HTMLElement).closest('[data-field]') || element as HTMLElement;
    const field = fieldElement.getAttribute('data-field') || 'text';
    const fieldIndex = fieldElement.getAttribute('data-index') ? 
      parseInt(fieldElement.getAttribute('data-index') || '0') : undefined;

    return {
      field,
      fieldIndex,
      startIndex: 0,
      endIndex: selectedText.length,
      text: selectedText
    };
  };

  const applyFormatting = (format: string, value: any) => {
    console.log('applyFormatting', format, value);
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    
    try {
      const selectedContent = range.extractContents();
      console.log('selectedContent', selectedContent);
      
      if (format === 'bold') {
        const strongElement = document.createElement('strong');
        strongElement.appendChild(selectedContent);
        range.insertNode(strongElement);
      } else if (format === 'italic') {
        const emElement = document.createElement('em');
        emElement.appendChild(selectedContent);
        range.insertNode(emElement);
      } else if (format === 'underline') {
        const uElement = document.createElement('u');
        uElement.appendChild(selectedContent);
        range.insertNode(uElement);
      } else if (format === 'fontSize') {
        const span = document.createElement('span');
        span.className = `text-${value}`;
        span.appendChild(selectedContent);
        range.insertNode(span);
      } else if (format === 'fontFamily') {
        const span = document.createElement('span');
        span.className = `font-${value}`;
        span.appendChild(selectedContent);
        range.insertNode(span);
      } else if (format === 'letterSpacing') {
        const span = document.createElement('span');
        span.className = `tracking-${value}`;
        span.appendChild(selectedContent);
        range.insertNode(span);
      } else if (format === 'lineHeight') {
        const span = document.createElement('span');
        span.className = `leading-${value}`;
        span.appendChild(selectedContent);
        range.insertNode(span);
      } else if (format === 'alignment') {
        const span = document.createElement('span');
        span.className = `text-${value}`;
        span.appendChild(selectedContent);
        range.insertNode(span);
      } else if (format === 'clear') {
        const textContent = selectedContent.textContent || '';
        const textNode = document.createTextNode(textContent);
        range.insertNode(textNode);
      }
      
      const editableElement = (range.commonAncestorContainer as HTMLElement)?.closest('[contenteditable]');
      if (editableElement) {
        const event = new Event('input', { bubbles: true });
        editableElement.dispatchEvent(event);
      }
      
    } catch (error) {
      console.warn('Error applying formatting:', error);
    }
  };

  const handleFormatChange = (format: string, value: any) => {
    if (!textSelection) return;
    
    applyFormatting(format, value);
    onFormatChange(textSelection, format, value);
    
    const keepOpen = ['fontSize', 'fontFamily', 'letterSpacing', 'lineHeight', 'alignment'];
    if (!keepOpen.includes(format)) {
      setTimeout(() => {
        setIsVisible(false);
        setTextSelection(null);
      }, 100);
    }
  };

  const expandToWords = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    selection.modify('extend', 'backward', 'word');
    selection.modify('extend', 'forward', 'word');
    
    const newText = selection.toString();
    if (newText && textSelection) {
      setTextSelection({
        ...textSelection,
        text: newText,
        endIndex: textSelection.startIndex + newText.length
      });
    }
  };

  const calculatePosition = (rect: DOMRect) => {
    const toolbarWidth = 680;
    const toolbarHeight = 48;
    const margin = 10;

    let x = Math.max(margin, Math.min(
      rect.left + rect.width / 2 - toolbarWidth / 2,
      window.innerWidth - toolbarWidth - margin
    ));

    let y = rect.top - toolbarHeight - margin;
    if (y < margin) {
      y = rect.bottom + margin;
    }

    return { x, y };
  };

  const handleSelectionChange = useCallback(() => {
    if (isInteracting) return;

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      if (rect.width > 0) {
        const fieldInfo = identifySelectedField();
        if (fieldInfo) {
          setTextSelection(fieldInfo);
          setPosition(calculatePosition(rect));
          setIsVisible(true);
          return;
        }
      }
    }
    
    if (!isInteracting) {
      setIsVisible(false);
      setTextSelection(null);
    }
  }, [isInteracting]);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (toolbarRef.current?.contains(e.target as Node)) {
        return;
      }
      setTimeout(handleSelectionChange, 10);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isInteracting || toolbarRef.current?.contains(e.target as Node)) {
        return;
      }
      setIsVisible(false);
      setTextSelection(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleFormatChange('bold', !currentFormats.bold);
            break;
          case 'i':
            e.preventDefault();
            handleFormatChange('italic', !currentFormats.italic);
            break;
          case 'u':
            e.preventDefault();
            handleFormatChange('underline', !currentFormats.underline);
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setIsVisible(false);
        setTextSelection(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectionchange', handleSelectionChange);
      
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [isVisible, currentFormats, handleSelectionChange, isInteracting]);

  if (!isVisible || !textSelection) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex items-center gap-2"
      style={{
        left: position.x,
        top: position.y,
      }}
      onMouseEnter={startInteraction}
      onMouseLeave={endInteraction}
    >
      <Select
        value={currentFormats.fontFamily}
        onValueChange={(value) => handleFormatChange('fontFamily', value)}
        onOpenChange={(open) => {
          if (open) startInteraction();
          else endInteraction();
        }}
      >
        <SelectTrigger 
          className="w-16 h-8 text-xs border-gray-300"
          onMouseDown={startInteraction}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent onMouseEnter={startInteraction} onMouseLeave={endInteraction}>
          {fontFamilies.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFormats.fontSize}
        onValueChange={(value) => handleFormatChange('fontSize', value)}
        onOpenChange={(open) => {
          if (open) startInteraction();
          else endInteraction();
        }}
      >
        <SelectTrigger 
          className="w-12 h-8 text-xs border-gray-300"
          onMouseDown={startInteraction}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent onMouseEnter={startInteraction} onMouseLeave={endInteraction}>
          {fontSizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-5 bg-gray-300" />

      <Button
        variant={currentFormats.bold ? "default" : "outline"}
        size="sm"
        onClick={() => handleFormatChange('bold', !currentFormats.bold)}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
      >
        <Bold className="w-3 h-3" />
      </Button>

      <Button
        variant={currentFormats.italic ? "default" : "outline"}
        size="sm"
        onClick={() => handleFormatChange('italic', !currentFormats.italic)}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
      >
        <Italic className="w-3 h-3" />
      </Button>

      <Button
        variant={currentFormats.underline ? "default" : "outline"}
        size="sm"
        onClick={() => handleFormatChange('underline', !currentFormats.underline)}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
      >
        <Underline className="w-3 h-3" />
      </Button>

      <div className="w-px h-5 bg-gray-300" />

      <div className="flex items-center gap-1">
        <Space className="w-3 h-3 text-gray-500" />
        <Select
          value={currentFormats.letterSpacing || 'normal'}
          onValueChange={(value) => handleFormatChange('letterSpacing', value)}
          onOpenChange={(open) => {
            if (open) startInteraction();
            else endInteraction();
          }}
        >
          <SelectTrigger 
            className="w-16 h-8 text-xs border-gray-300"
            onMouseDown={startInteraction}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent onMouseEnter={startInteraction} onMouseLeave={endInteraction}>
            {letterSpacings.map((spacing) => (
              <SelectItem key={spacing.value} value={spacing.value}>
                {spacing.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex flex-col w-3 h-3 justify-between">
          <div className="w-full h-px bg-gray-500"></div>
          <div className="w-full h-px bg-gray-500"></div>
          <div className="w-full h-px bg-gray-500"></div>
        </div>
        <Select
          value={currentFormats.lineHeight || 'normal'}
          onValueChange={(value) => handleFormatChange('lineHeight', value)}
          onOpenChange={(open) => {
            if (open) startInteraction();
            else endInteraction();
          }}
        >
          <SelectTrigger 
            className="w-14 h-8 text-xs border-gray-300"
            onMouseDown={startInteraction}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent onMouseEnter={startInteraction} onMouseLeave={endInteraction}>
            {lineHeights.map((height) => (
              <SelectItem key={height.value} value={height.value}>
                {height.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-px h-5 bg-gray-300" />

      <Button
        variant={currentFormats.alignment === 'left' ? "default" : "outline"}
        size="sm"
        onClick={() => handleFormatChange('alignment', 'left')}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
      >
        <AlignLeft className="w-3 h-3" />
      </Button>
      
      <Button
        variant={currentFormats.alignment === 'center' ? "default" : "outline"}
        size="sm"
        onClick={() => handleFormatChange('alignment', 'center')}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
      >
        <AlignCenter className="w-3 h-3" />
      </Button>
      
      <Button
        variant={currentFormats.alignment === 'right' ? "default" : "outline"}
        size="sm"
        onClick={() => handleFormatChange('alignment', 'right')}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
      >
        <AlignRight className="w-3 h-3" />
      </Button>
      
      <Button
        variant={currentFormats.alignment === 'justify' ? "default" : "outline"}
        size="sm"
        onClick={() => handleFormatChange('alignment', 'justify')}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
      >
        <AlignJustify className="w-3 h-3" />
      </Button>

      <div className="w-px h-5 bg-gray-300" />

      <Button
        variant="outline"
        size="sm"
        onClick={expandToWords}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
        title="Select whole words"
      >
        <Type className="w-3 h-3" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleFormatChange('clear', true)}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
        title="Clear formatting"
      >
        <RotateCcw className="w-3 h-3" />
      </Button>

      <div className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-600 max-w-20 truncate">
        "{textSelection.text.length > 12 ? textSelection.text.substring(0, 12) + '…' : textSelection.text}"
      </div>
    </div>
  );
};

// RenderEditableText component
const RenderEditableText = ({
  content,
  className,
  onClick,
  editMode = false,
  onTextChange,
  section,
  field,
  index
}: {
  content: string;
  className: string;
  onClick?: () => void;
  editMode?: boolean;
  onTextChange?: (section: string, field: string, value: string, index?: number) => void;
  section: string;
  field: string;
  index?: number;
}) => {
  const editableRef = useRef<HTMLDivElement>(null);

  console.log('RenderEditableText', { content, innerHTML: editableRef.current?.innerHTML });

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (onTextChange && editMode) {
      onTextChange(section, field, e.currentTarget.innerHTML, index);
    }
  };

  const handleBlur = () => {
    // The onTextChange is already called onInput, so we don't need to do anything here.
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editableRef.current) {
        editableRef.current.blur();
      }
    }
  };

  useEffect(() => {
    if (editableRef.current && content !== editableRef.current.innerHTML) {
      editableRef.current.innerHTML = content;
    }
  }, [content]);

  if (editMode) {
    return (
      <div
        ref={editableRef}
        contentEditable
        className={className + " focus:outline-none"}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div
      className={className}
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// ResumePreview component
export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({
    data,
    sectionVisibility,
    styleOptions,
    fontSettings,
    fieldFormats,
    getFieldFormatting,
    onSectionClick,
    className = "",
    isMobileView = false,
    editMode = false,
    onTextChange,
    onFieldClick
  }, ref) => {
    const [pageCount, setPageCount] = useState(1);
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Calculate page count based on content height
    useEffect(() => {
      const calculatePageCount = () => {
        if (!contentRef.current) return;
        
        const contentHeight = contentRef.current.scrollHeight;
        const pageHeightPx = A4_HEIGHT_MM * MM_TO_PX;
        const calculatedPages = Math.ceil(contentHeight / pageHeightPx);
        
        setPageCount(Math.max(1, calculatedPages));
      };
      
      calculatePageCount();
      
      // Recalculate on window resize
      window.addEventListener('resize', calculatePageCount);
      return () => window.removeEventListener('resize', calculatePageCount);
    }, [data, sectionVisibility, styleOptions, fontSettings]);

    const defaultSectionVisibility: SectionVisibility = {
      summary: true,
      education_entries: true,
      work_experiences: true,
      academic_projects: true,
      internships: true,
      positions_of_responsibility: true,
      achievements: true,
      certifications: true,
      extra_curriculars: true,
      skills: true,
      languages: true,
      interests: true,
      external_links: true
    };

    const visibility = sectionVisibility || defaultSectionVisibility;

    const colorSchemes = {
      blue: { primary: 'text-blue-600', border: 'border-blue-500', accent: 'text-blue-500' },
      green: { primary: 'text-green-600', border: 'border-green-500', accent: 'text-green-500' },
      purple: { primary: 'text-purple-600', border: 'border-purple-500', accent: 'text-purple-500' },
      red: { primary: 'text-red-600', border: 'border-red-500', accent: 'text-red-500' },
      indigo: { primary: 'text-indigo-600', border: 'border-indigo-500', accent: 'text-indigo-500' }
    };

    const fontSizes = {
      small: {
        name: 'text-lg sm:text-xl',
        section: 'text-sm',
        content: 'text-xs',
        mobile: { name: 'text-base', section: 'text-xs', content: 'text-xs' }
      },
      medium: {
        name: 'text-2xl sm:text-3xl',
        section: 'text-base sm:text-lg',
        content: 'text-sm sm:text-base',
        mobile: { name: 'text-lg', section: 'text-sm', content: 'text-xs' }
      },
      large: {
        name: 'text-3xl sm:text-4xl',
        section: 'text-lg sm:text-xl',
        content: 'text-base sm:text-lg',
        mobile: { name: 'text-xl', section: 'text-base', content: 'text-sm' }
      }
    };

    const fontFamilies = {
      sans: 'font-sans',
      serif: 'font-serif',
      mono: 'font-mono',
      modern: 'font-sans',
      classic: 'font-serif',
      minimal: 'font-mono',
      professional: 'font-sans'
    };

    // Apply global font settings
    const getGlobalStyles = () => {
      if (!fontSettings) return {};
      
      const styles: React.CSSProperties = {};
      
      if (fontSettings.color) {
        styles.color = fontSettings.color;
      }
      
      return styles;
    };

    // Get combined font classes
    const getFontClasses = () => {
      if (!fontSettings) return '';
      
      let classes = '';
      
      // Font family
      if (fontSettings.style && fontFamilies[fontSettings.style as keyof typeof fontFamilies]) {
        classes += ` ${fontFamilies[fontSettings.style as keyof typeof fontFamilies]}`;
      }
      
      // Global formatting
      if (fontSettings.bold) classes += ' font-bold';
      if (fontSettings.italic) classes += ' italic';
      if (fontSettings.underline) classes += ' underline';
      
      // Alignment
      if (fontSettings.alignment) {
        switch (fontSettings.alignment) {
          case 'center': classes += ' text-center'; break;
          case 'right': classes += ' text-right'; break;
          case 'justify': classes += ' text-justify'; break;
          default: classes += ' text-left'; break;
        }
      }
      
      // Line height
      if (fontSettings.lineHeight) {
        switch (fontSettings.lineHeight) {
          case 'tight': classes += ' leading-tight'; break;
          case 'relaxed': classes += ' leading-relaxed'; break;
          case 'loose': classes += ' leading-loose'; break;
          default: classes += ' leading-normal'; break;
        }
      }
      
      return classes;
    };

    const colors = styleOptions ? colorSchemes[styleOptions.colorScheme] : colorSchemes.blue;
    const fonts = styleOptions ? fontSizes[styleOptions.fontSize] : fontSizes.medium;
    const fontFamily = styleOptions ? fontFamilies[styleOptions.fontFamily] : fontFamilies.sans;

    // Combine base classes with global font settings
    const baseClasses = `bg-white shadow-lg mx-auto ${className} ${fontFamily} ${getFontClasses()}`;
    const responsiveClasses = isMobileView
      ? "p-5 max-w-full w-full"
      : "p-4 sm:p-6 lg:p-8 max-w-full sm:max-w-2xl w-full rounded-lg";

    const hasContent = (section: string) => {
      if (!data) return false;

      switch (section) {
        case 'summary':
          return data.summary?.trim() !== '';
        case 'education_entries':
          return data.education_entries?.some(edu => (edu.college || edu.degree)) || false;
        case 'work_experiences':
          return data.work_experiences?.some(work => (work.designation || work.company_name)) || false;
        case 'academic_projects':
          return data.academic_projects?.some(project => (project.project_name || project.project_description)) || false;
        case 'internships':
          return data.internships?.some(internship => (internship.designation || internship.company_name)) || false;
        case 'positions_of_responsibility':
          return data.positions_of_responsibility?.some(por => por.role) || false;
        case 'achievements':
          return data.achievements?.some(achievement => achievement.title) || false;
        case 'certifications':
          return data.certifications?.some(cert => cert.certification) || false;
        case 'extra_curriculars':
          return data.extra_curriculars?.some(activity => activity.activity) || false;
        case 'skills':
          return data.skills?.length > 0 || false;
        case 'languages':
          return data.languages?.length > 0 || false;
        case 'interests':
          return data.interests?.length > 0 || false;
        case 'external_links':
          return data.external_links?.length > 0 || false;
        default:
          return false;
      }
    };

    // Enhanced RenderEditableText component that applies field-specific formatting
    const RenderEditableTextWithFormatting = ({ content, className, onClick, editMode, onTextChange, section, field, index }: any) => {
      const fieldKey = index !== undefined ? `${section}_${field}_${index}` : `${section}_${field}`;
      const fieldStyles = getFieldFormatting ? getFieldFormatting(fieldKey) : {};
      const globalStyles = getGlobalStyles();
      
      // Combine field-specific styles with global styles
      const combinedStyles = { ...globalStyles, ...fieldStyles };
      
      return (
        <RenderEditableText
          content={content}
          className={className}
          onClick={onClick}
          editMode={editMode}
          onTextChange={onTextChange}
          section={section}
          field={field}
          index={index}
        />
      );
    };

    return (
      <div className="relative">
        <A4PreviewContainer pageCount={pageCount}>
          <div 
            ref={contentRef}
            className={`${baseClasses} ${responsiveClasses}`}
            style={{
              width: `${A4_WIDTH_MM}mm`,
              minHeight: `${A4_HEIGHT_MM}mm`,
              ...getGlobalStyles()
            }}
          >
            {/* Personal Info Header */}
            <div className="text-center border-b border-gray-200 pb-6 mb-6">
              <RenderEditableTextWithFormatting
                content={data.name || "YOUR NAME"}
                className={`font-bold ${colors.primary} mb-1 ${isMobileView ? fonts.mobile.name : fonts.name} cursor-pointer hover:opacity-75 transition-opacity`}
                onClick={() => onSectionClick && onSectionClick('personalInfo')}
                editMode={editMode}
                onTextChange={onTextChange}
                section="personalInfo"
                field="name"
              />
              <div
                className={`flex flex-col items-center space-y-1 ${isMobileView ? 'text-xs' : 'sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0 text-xs sm:text-sm'} ${colors.accent} cursor-pointer hover:opacity-75 transition-opacity`}
                onClick={() => onSectionClick && onSectionClick('personalInfo')}
              >
                {data.phone_number && <span>{data.phone_number}</span>}
                {data.phone_number && (data.email || data.external_links?.[0]) && <span className="hidden sm:inline">| </span>}
                {data.email && <span className="break-all">{data.email}</span>}
                {data.external_links?.[0] && (
                  <>
                    {(data.phone_number || data.email) && <span className="hidden sm:inline">| </span>}
                    <a
                      href={data.external_links[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      LinkedIn
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Summary Section */}
            {visibility.summary && hasContent('summary') && (
              <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
                <h2
                  className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
                  onClick={() => onSectionClick && onSectionClick('summary')}
                >
                  Summary
                </h2>
                <RenderEditableTextWithFormatting
                  content={data.summary || ''}
                  className={`text-gray-700 leading-relaxed ${isMobileView ? fonts.mobile.content : fonts.content} cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors`}
                  onClick={() => onSectionClick && onSectionClick('summary')}
                  editMode={editMode}
                  onTextChange={onTextChange}
                  section="summary"
                  field="summary"
                />
              </div>
            )}

            {/* Education Section */}
            {visibility.education_entries && hasContent('education_entries') && (
              <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
                <h2
                  className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
                  onClick={() => onSectionClick && onSectionClick('education_entries')}
                >
                  Education
                </h2>
                <div className={isMobileView ? "space-y-1" : "space-y-2 sm:space-y-3"}>
                  {(data.education_entries || []).map((education, index) => (
                    <div
                      key={index}
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => onSectionClick && onSectionClick('education_entries', index)}
                    >
                      <div className={`${isMobileView ? 'block space-y-0' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'}`}>
                        <div className="flex-1 min-w-0">
                          <RenderEditableTextWithFormatting
                            content={education.college || "Institution"}
                            className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                            editMode={editMode}
                            onTextChange={onTextChange}
                            section="education_entries"
                            field="college"
                            index={index}
                          />
                          <RenderEditableTextWithFormatting
                            content={education.degree || "Degree"}
                            className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                            editMode={editMode}
                            onTextChange={onTextChange}
                            section="education_entries"
                            field="degree"
                            index={index}
                          />
                          {education.cgpa && (
                            <p className={`text-gray-600 mt-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                              CGPA: {education.cgpa}
                            </p>
                          )}
                        </div>
                        {(education.start_year || education.end_year) && (
                          <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs inline ml-2' : 'text-xs sm:text-sm block sm:ml-4'}`}>
                            {education.start_year && education.end_year 
                              ? `${education.start_year} - ${education.end_year}`
                              : education.start_year || education.end_year}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {visibility.certifications && hasContent('certifications') && (
              <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
                <h2
                  className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
                  onClick={() => onSectionClick && onSectionClick('certifications')}
                >
                  Certifications
                </h2>
                <div className={isMobileView ? "space-y-1" : "space-y-2 sm:space-y-3"}>
                  {(data.certifications || []).map((certification, index) => (
                    <div
                      key={index}
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => onSectionClick && onSectionClick('certifications', index)}
                    >
                      <div className={`${isMobileView ? 'block space-y-0' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'}`}>
                        <div className="flex-1 min-w-0">
                          <RenderEditableTextWithFormatting
                            content={certification.certification || "Certification Name"}
                            className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                            editMode={editMode}
                            onTextChange={onTextChange}
                            section="certifications"
                            field="certification"
                            index={index}
                          />
                          {certification.issuing_organization && (
                            <RenderEditableTextWithFormatting
                              content={certification.issuing_organization}
                              className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                              editMode={editMode}
                              onTextChange={onTextChange}
                              section="certifications"
                              field="issuing_organization"
                              index={index}
                            />
                          )}
                          {certification.description && (
                            <RenderEditableTextWithFormatting
                              content={certification.description}
                              className={`text-gray-700 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} mt-1`}
                              editMode={editMode}
                              onTextChange={onTextChange}
                              section="certifications"
                              field="description"
                              index={index}
                            />
                          )}
                        </div>
                        {certification.time_of_certification && (
                          <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs inline ml-2' : 'text-xs sm:text-sm block sm:ml-4'}`}>
                            {certification.time_of_certification}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Curricular Activities Section */}
            {visibility.extra_curriculars && hasContent('extra_curriculars') && (
              <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
                <h2
                  className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
                  onClick={() => onSectionClick && onSectionClick('extra_curriculars')}
                >
                  Extra Curricular Activities
                </h2>
                <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
                  {(data.extra_curriculars || []).map((activity, index) => (
                    <div
                      key={index}
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => onSectionClick && onSectionClick('extra_curriculars', index)}
                    >
                      <div className={`${isMobileView ? 'block space-y-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'} mb-1`}>
                        <div className="flex-1 min-w-0">
                          <RenderEditableTextWithFormatting
                            content={activity.activity || "Activity"}
                            className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                            editMode={editMode}
                            onTextChange={onTextChange}
                            section="extra_curriculars"
                            field="activity"
                            index={index}
                          />
                          {activity.position && (
                            <RenderEditableTextWithFormatting
                              content={activity.position}
                              className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                              editMode={editMode}
                              onTextChange={onTextChange}
                              section="extra_curriculars"
                              field="position"
                              index={index}
                            />
                          )}
                          {activity.description && (
                            <RenderEditableTextWithFormatting
                              content={activity.description}
                              className={`text-gray-700 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} mt-1`}
                              editMode={editMode}
                              onTextChange={onTextChange}
                              section="extra_curriculars"
                              field="description"
                              index={index}
                            />
                          )}
                        </div>
                        {activity.year && (
                          <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobileView ? 'block' : 'sm:ml-4'}`}>
                            {activity.year}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {visibility.skills && hasContent('skills') && (
              <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
                <h2
                  className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
                  onClick={() => onSectionClick && onSectionClick('skills')}
                >
                  Skills
                </h2>
                <div
                  className={`${isMobileView ? "space-y-1" : "space-y-2"} cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors`}
                  onClick={() => onSectionClick && onSectionClick('skills')}
                >
                  <RenderEditableTextWithFormatting
                    content={data.skills ? data.skills.join(', ') : ''}
                    className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                    editMode={editMode}
                    onTextChange={onTextChange}
                    section="skills"
                    field="skills"
                  />
                </div>
              </div>
            )}

            {/* Languages Section */}
            {visibility.languages && hasContent('languages') && (
              <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
                <h2
                  className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
                  onClick={() => onSectionClick && onSectionClick('languages')}
                >
                  Languages
                </h2>
                <div
                  className={`${isMobileView ? "space-y-1" : "space-y-2"} cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors`}
                  onClick={() => onSectionClick && onSectionClick('languages')}
                >
                  <RenderEditableTextWithFormatting
                    content={data.languages ? data.languages.join(', ') : ''}
                    className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                    editMode={editMode}
                    onTextChange={onTextChange}
                    section="languages"
                    field="languages"
                  />
                </div>
              </div>
            )}

            {/* Interests Section */}
            {visibility.interests && hasContent('interests') && (
              <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
                <h2
                  className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
                  onClick={() => onSectionClick && onSectionClick('interests')}
                >
                  Interests
                </h2>
                <div
                  className={`${isMobileView ? "space-y-1" : "space-y-2"} cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors`}
                  onClick={() => onSectionClick && onSectionClick('interests')}
                >
                  <RenderEditableTextWithFormatting
                    content={data.interests ? data.interests.join(', ') : ''}
                    className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                    editMode={editMode}
                    onTextChange={onTextChange}
                    section="interests"
                    field="interests"
                  />
                </div>
              </div>
            )}

            {/* External Links Section */}
            {visibility.external_links && hasContent('external_links') && (
              <div>
                <h2
                  className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
                  onClick={() => onSectionClick && onSectionClick('external_links')}
                >
                  Links
                </h2>
                <div
                  className={`${isMobileView ? "space-y-1" : "space-y-2"} cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors`}
                  onClick={() => onSectionClick && onSectionClick('external_links')}
                >
                  <RenderEditableTextWithFormatting
                    content={data.external_links ? data.external_links.join(', ') : ''}
                    className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                    editMode={editMode}
                    onTextChange={onTextChange}
                    section="external_links"
                    field="external_links"
                  />
                </div>
              </div>
            )}
          </div>
        </A4PreviewContainer>
        
        {/* Page count indicator */}
        {pageCount > 1 && (
          <div className="text-center text-sm text-gray-500 mt-2">
            {pageCount} page{pageCount > 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";

// Updated test data with new schema
const testData: Resume = {
  id: "test-resume",
  title: "John Doe's Resume",
  name: "John Doe",
  phone_number: "+1 (555) 123-4567",
  email: "john.doe@email.com",
  summary: "Experienced software developer with a passion for creating innovative solutions and leading development teams.",
  updatedAt: new Date().toISOString(),
  status: "completed",
  resume_inputs: [],
  education_entries: [
    {
      college: "University of Technology",
      degree: "Bachelor of Computer Science",
      start_year: 2020,
      end_year: 2024,
      cgpa: 3.8
    }
  ],
  work_experiences: [
    {
      company_name: "Tech Solutions Inc.",
      company_description: "A leading tech solutions provider.",
      location: "San Francisco, CA",
      duration: "2022-Present",
      designation: "Senior Software Developer",
      designation_description: "Responsible for developing and maintaining web applications.",
      projects: [
        {
          project_name: "Project A",
          project_description: "Description of Project A",
          description_bullets: ["Built with React and Node.js", "Implemented real-time features"]
        }
      ]
    }
  ],
  academic_projects: [
    {
      project_name: "E-commerce Platform",
      project_description: "A scalable e-commerce platform built with modern technologies.",
      description_bullets: [
        "Built with React, Node.js, and MongoDB",
        "Features real-time inventory management",
        "Implemented payment gateway integration"
      ],
      duration: "Jan 2023 - May 2023"
    }
  ],
  positions_of_responsibility: [
    {
      role: "Team Lead - University Coding Club",
      role_description: "Led the university coding club and organized events.",
      organization: "University Coding Club",
      organization_description: "A club for students to learn and collaborate on coding projects.",
      location: "University Campus",
      duration: "2023-2024",
      responsibilities: [
        "Organized weekly coding workshops",
        "Led a team of 8 members",
        "Coordinated hackathon events"
      ]
    }
  ],
  achievements: [
    {
      title: "Best Innovation Award",
      awarding_body: "Tech Innovation Conference",
      year: 2023,
      description: "Received recognition for developing an AI-powered code review tool"
    }
  ],
  certifications: [
    {
      certification: "AWS Certified Solutions Architect",
      description: "Professional certification for cloud architecture",
      issuing_organization: "Amazon Web Services",
      time_of_certification: 2023
    }
  ],
  internships: [
    {
      company_name: "StartupXYZ",
      company_description: "A fintech startup",
      location: "Remote",
      designation: "Software Engineering Intern",
      designation_description: "Worked on frontend development",
      duration: "Summer 2022",
      internship_work_description_bullets: [
        "Developed React components",
        "Implemented responsive designs",
        "Collaborated with design team"
      ]
    }
  ],
  extra_curriculars: [
    {
      activity: "Basketball Team",
      position: "Captain",
      description: "Led the university basketball team to regional championships",
      year: 2023
    }
  ],
  skills: ["JavaScript", "TypeScript", "Python", "React", "Node.js", "AWS", "Docker"],
  languages: ["English", "Spanish", "French"],
  interests: ["Machine Learning", "Photography", "Travel", "Basketball"],
  external_links: ["github.com/johndoe", "portfolio.johndoe.com"]
};

// Updated ResumePreviewPanel component
export function ResumePreviewPanel({
  data = testData,
  sectionVisibility,
  styleOptions = {
    colorScheme: 'blue',
    fontSize: 'medium',
    fontFamily: 'sans',
    layout: 'modern'
  },
  fontSettings,
  fieldFormats,
  getFieldFormatting,
  onSectionClick = () => {},
  editMode = false,
  onTextChange = () => {},
  onFieldClick = () => {}
}: {
  data?: Resume;
  sectionVisibility?: SectionVisibility;
  styleOptions?: StyleOptions;
  fontSettings?: FontSettings;
  fieldFormats?: Record<string, FieldFormat>;
  getFieldFormatting?: (fieldKey: string) => FieldFormat;
  onSectionClick?: (section: string, index?: number) => void;
  editMode?: boolean;
  onTextChange?: (section: string, field: string, value: string, index?: number) => void;
  onFieldClick?: (field: string, index?: number) => void;
}) {
  const previewContentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  
  // Calculate page count based on content height
  useEffect(() => {
    const calculatePageCount = () => {
      if (!contentRef.current) return;
      
      const contentHeight = contentRef.current.scrollHeight;
      const pageHeightPx = A4_HEIGHT_MM * MM_TO_PX;
      const calculatedPages = Math.ceil(contentHeight / pageHeightPx);
      
      setPageCount(Math.max(1, calculatedPages));
    };
    
    calculatePageCount();
    
    // Recalculate when data changes
    const observer = new MutationObserver(calculatePageCount);
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
    
    window.addEventListener('resize', calculatePageCount);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculatePageCount);
    };
  }, [data]);
  
  const handlePreviewFieldClick = (field: string, index?: number) => {
    onFieldClick(field, index);
  };

  const exportToPDF = async () => {
    if (!contentRef.current) return;

    try {
      const opt = {
        margin: 10,
        filename: `${data.name || "resume"}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      // For multi-page content, we need to handle each page separately
      if (pageCount > 1) {
        const pdf = new (html2pdf as any)(opt);
        
        // For each page, add it to the PDF
        for (let i = 0; i < pageCount; i++) {
          const pageElement = contentRef.current.cloneNode(true) as HTMLElement;
          
          // Apply page-specific styles
          pageElement.style.transform = `translateY(-${i * A4_HEIGHT_MM * MM_TO_PX}px)`;
          pageElement.style.height = `${A4_HEIGHT_MM * MM_TO_PX}px`;
          pageElement.style.overflow = 'hidden';
          
          document.body.appendChild(pageElement);
          
          if (i > 0) {
            pdf.addPage();
          }
          
          const canvas = await (html2pdf as any).canvas(pageElement, {
            scale: 2,
            useCORS: true,
            height: A4_HEIGHT_MM * MM_TO_PX,
            width: A4_WIDTH_MM * MM_TO_PX,
            scrollY: 0
          });
          
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
          
          document.body.removeChild(pageElement);
        }
        
        pdf.save();
      } else {
        // Single page export
        await (html2pdf as any)().from(contentRef.current).set(opt).save();
      }

    } catch (error) {
      console.error('PDF Export Error:', error);
      // Handle error
    }
  };
  
  // Convert ResumeData to Resume format
  const resumeData = data;
  
  const defaultSectionVisibility: SectionVisibility = {
    summary: true,
    education_entries: true,
    work_experiences: true,
    academic_projects: true,
    internships: true,
    positions_of_responsibility: true,
    achievements: true,
    certifications: true,
    extra_curriculars: true,
    skills: true,
    languages: true,
    interests: true,
    external_links: true
  };

  return (
    <div className="w-full bg-gray-100 p-6">
      {editMode && <FloatingFormatToolbar 
        onFormatChange={() => {}}
        currentFormats={{
          bold: false,
          italic: false,
          underline: false,
          fontSize: 'base',
          fontFamily: 'sans',
          alignment: 'left'
        }}
      />}
      {editMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Edit Mode Active:</strong> Select any text to format it with bold, italic, underline, font size, alignment, spacing, and more using the floating toolbar.
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Resume Preview</h2>
        <button 
          onClick={exportToPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export PDF ({pageCount} page{pageCount > 1 ? 's' : ''})
        </button>
      </div>
      
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex-1 overflow-y-auto bg-gray-100" ref={previewContentRef}>
          <A4PreviewContainer pageCount={pageCount}>
            <div ref={contentRef} className="h-full p-8">
              <ResumePreview 
                data={resumeData}
                sectionVisibility={sectionVisibility || defaultSectionVisibility}
                styleOptions={styleOptions}
                fontSettings={fontSettings}
                fieldFormats={fieldFormats}
                getFieldFormatting={getFieldFormatting}
                onSectionClick={onSectionClick}
                editMode={editMode}
                onTextChange={onTextChange}
                onFieldClick={handlePreviewFieldClick}
              />
            </div>
          </A4PreviewContainer>
        </div>
      </div>
    </div>
  );
}