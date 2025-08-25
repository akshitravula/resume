import { forwardRef, useState, useRef, useEffect, useCallback } from "react";
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

// Updated Types based on new schema
interface Project {
  id: string;
  project_name: string | null;
  project_description: string | null;
  description_bullets: string[];
  visible: boolean;
}

interface WorkExperience {
  id: string;
  company_name: string | null;
  company_description: string | null;
  location: string | null;
  duration: string | null;
  designation: string | null;
  designation_description: string | null;
  projects: Project[];
  visible: boolean;
}

interface Internship {
  id: string;
  company_name: string | null;
  company_description: string | null;
  location: string | null;
  designation: string | null;
  designation_description: string | null;
  duration: string | null;
  internship_work_description_bullets: string[];
  visible: boolean;
}

interface Education {
  id: string;
  college: string | null;
  degree: string | null;
  start_year: number | null;
  end_year: number | null;
  cgpa: number | null;
  visible: boolean;
}

interface ScholasticAchievement {
  id: string;
  title: string | null;
  awarding_body: string | null;
  year: number | null;
  description: string | null;
  visible: boolean;
}

interface PositionOfResponsibility {
  id: string;
  role: string | null;
  role_description: string | null;
  organization: string | null;
  organization_description: string | null;
  location: string | null;
  duration: string | null;
  responsibilities: string[];
  visible: boolean;
}

interface ExtraCurricular {
  id: string;
  activity: string | null;
  position: string | null;
  description: string | null;
  year: number | null;
  visible: boolean;
}

interface Certification {
  id: string;
  certification: string | null;
  description: string | null;
  issuing_organization: string | null;
  time_of_certification: number | null;
  visible: boolean;
}

interface AcademicProject {
  id: string;
  project_name: string | null;
  project_description: string | null;
  description_bullets: string[];
  duration: string | null;
  visible: boolean;
}

interface PersonalInfo {
  name: string | null;
  phone_number: string | null;
  email: string | null;
  summary: string | null;
}

interface Skills {
  skills: string[];
  languages: string[];
  interests: string[];
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

// Updated ResumeData interface
interface ResumeData {
  personalInfo: PersonalInfo;
  education_entries: Education[];
  work_experiences: WorkExperience[];
  internships: Internship[];
  academic_projects: AcademicProject[];
  positions_of_responsibility: PositionOfResponsibility[];
  achievements: ScholasticAchievement[];
  extra_curriculars: ExtraCurricular[];
  certifications: Certification[];
  skills: Skills;
  external_links: string[];
}

interface SectionVisibility {
  summary: boolean;
  education: boolean;
  workExperience: boolean;
  internships: boolean;
  projects: boolean;
  academicProjects: boolean;
  pors: boolean;
  achievements: boolean;
  extraCurriculars: boolean;
  certifications: boolean;
  skills: boolean;
  externalLinks: boolean;
}

interface TextSelection {
  field: string;
  fieldIndex?: number;
  startIndex: number;
  endIndex: number;
  text: string;
}

interface ResumePreviewProps {
  data: ResumeData;
  sectionVisibility?: SectionVisibility;
  styleOptions: StyleOptions;
  fontSettings: FontSettings;  // Make this required, not optional
  fieldFormats?: Record<string, FieldFormat>;
  getFieldFormatting?: (fieldKey: string) => FieldFormat;
  onSectionClick: (section: string, index?: number) => void;
  className?: string;
  isMobileView?: boolean;
  editMode?: boolean;
  onTextChange?: (section: string, field: string, value: string, index?: number) => void;
}

// FloatingFormatToolbar component (unchanged)
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
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    
    try {
      const selectedContent = range.extractContents();
      
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
        range.insertNode(selectedContent);
        let element = range.commonAncestorContainer;
        while (element && element.nodeType !== Node.ELEMENT_NODE) {
          element = element.parentNode;
        }
        
        if (element) {
          const blockElement = (element as HTMLElement).closest('div[contenteditable], p, h1, h2, h3, h4, h5, h6, td, th, li');
          if (blockElement) {
            blockElement.className = blockElement.className.replace(/tracking-\w+/g, '').trim();
            if (value !== 'normal') {
              blockElement.className += ` tracking-${value}`;
            }
          }
        }
      } else if (format === 'lineHeight') {
        range.insertNode(selectedContent);
        let element = range.commonAncestorContainer;
        while (element && element.nodeType !== Node.ELEMENT_NODE) {
          element = element.parentNode;
        }
        
        if (element) {
          const blockElement = (element as HTMLElement).closest('div[contenteditable], p, h1, h2, h3, h4, h5, h6, td, th, li');
          if (blockElement) {
            blockElement.className = blockElement.className.replace(/leading-\w+/g, '').trim();
            if (value !== 'normal') {
              blockElement.className += ` leading-${value}`;
            }
          }
        }
      } else if (format === 'alignment') {
        range.insertNode(selectedContent);
        let element = range.commonAncestorContainer;
        while (element && element.nodeType !== Node.ELEMENT_NODE) {
          element = element.parentNode;
        }
        
        if (element) {
          const blockElement = (element as HTMLElement).closest('div[contenteditable], p, h1, h2, h3, h4, h5, h6, td, th, li');
          if (blockElement) {
            blockElement.className = blockElement.className.replace(/text-(left|center|right|justify)/g, '').trim();
            blockElement.className += ` text-${value}`;
          }
        }
      } else if (format === 'clear') {
        const textContent = selectedContent.textContent || '';
        const textNode = document.createTextNode(textContent);
        range.insertNode(textNode);
        
        let element = range.commonAncestorContainer;
        while (element && element.nodeType !== Node.ELEMENT_NODE) {
          element = element.parentNode;
        }
        
        if (element) {
          const blockElement = (element as HTMLElement).closest('div[contenteditable], p, h1, h2, h3, h4, h5, h6, td, th, li');
          if (blockElement) {
            blockElement.className = blockElement.className
              .replace(/text-(left|center|right|justify)/g, '')
              .replace(/leading-\w+/g, '')
              .replace(/tracking-\w+/g, '')
              .trim();
          }
        }
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
    
    const newText = selection.toString().trim();
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
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setLocalContent(newContent);
    
    if (onTextChange && editMode) {
      onTextChange(section, field, newContent, index);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onTextChange && editMode) {
      onTextChange(section, field, localContent, index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editableRef.current) {
        editableRef.current.blur();
      }
    }
  };

  if (editMode) {
    return (
      <div
        ref={editableRef}
        contentEditable
        className={className + " focus:outline-none"}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: localContent }}
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

// Main ResumePreview component with updated schema
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
    onTextChange
  }, ref) => {
    const defaultSectionVisibility: SectionVisibility = {
      summary: true,
      education: true,
      workExperience: true,
      internships: true,
      projects: true,
      academicProjects: true,
      pors: true,
      achievements: true,
      extraCurriculars: true,
      certifications: true,
      skills: true,
      externalLinks: true
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

    const getGlobalStyles = () => {
      if (!fontSettings) return {};
      
      const styles: React.CSSProperties = {};
      
      if (fontSettings.color) {
        styles.color = fontSettings.color;
      }
      
      return styles;
    };

    const getFontClasses = () => {
      if (!fontSettings) return '';
      
      let classes = '';
      
      if (fontSettings.style && fontFamilies[fontSettings.style as keyof typeof fontFamilies]) {
        classes += ` ${fontFamilies[fontSettings.style as keyof typeof fontFamilies]}`;
      }
      
      if (fontSettings.bold) classes += ' font-bold';
      if (fontSettings.italic) classes += ' italic';
      if (fontSettings.underline) classes += ' underline';
      
      if (fontSettings.alignment) {
        switch (fontSettings.alignment) {
          case 'center': classes += ' text-center'; break;
          case 'right': classes += ' text-right'; break;
          case 'justify': classes += ' text-justify'; break;
          default: classes += ' text-left'; break;
        }
      }
      
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

    const baseClasses = `bg-white shadow-lg mx-auto ${className} ${fontFamily} ${getFontClasses()}`;
    const responsiveClasses = isMobileView
      ? "p-5 max-w-full w-full"
      : "p-4 sm:p-6 lg:p-8 max-w-full sm:max-w-2xl w-full rounded-lg";

    const hasContent = (section: string) => {
      if (!data) return false;

      switch (section) {
        case 'summary':
          return data.personalInfo?.summary?.trim() !== '';
        case 'education':
          return data.education_entries?.some(edu => (edu.college || edu.degree) && edu.visible) || false;
        case 'workExperience':
          return data.work_experiences?.some(work => (work.designation || work.company_name) && work.visible) || false;
        case 'internships':
          return data.internships?.some(internship => (internship.designation || internship.company_name) && internship.visible) || false;
        case 'projects':
          return data.work_experiences?.some(work => 
            work.projects?.some(project => (project.project_name) && project.visible)
          ) || false;
        case 'academicProjects':
          return data.academic_projects?.some(project => (project.project_name) && project.visible) || false;
        case 'pors':
          return data.positions_of_responsibility?.some(por => por.role && por.visible) || false;
        case 'achievements':
          return data.achievements?.some(achievement => achievement.title && achievement.visible) || false;
        case 'extraCurriculars':
          return data.extra_curriculars?.some(activity => activity.activity && activity.visible) || false;
        case 'certifications':
          return data.certifications?.some(cert => cert.certification && cert.visible) || false;
        case 'skills':
          return data.skills?.skills?.length > 0 || data.skills?.languages?.length > 0;
        case 'externalLinks':
          return data.external_links?.length > 0;
        default:
          return false;
      }
    };

    const formatYearRange = (startYear: number | null, endYear: number | null) => {
      if (!startYear && !endYear) return '';
      if (startYear && !endYear) return `${startYear} - Present`;
      if (!startYear && endYear) return `${endYear}`;
      if (startYear === endYear) return `${startYear}`;
      return `${startYear} - ${endYear}`;
    };

    return (
      <div className={`${baseClasses} ${responsiveClasses} relative`} ref={ref} style={getGlobalStyles()}>
        {/* Personal Info Header */}
        <div className="text-center border-b border-gray-200 pb-3 mb-3">
          <RenderEditableText
            content={data.personalInfo?.name || "YOUR NAME"}
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
            {data.personalInfo?.phone_number && <span>{data.personalInfo.phone_number}</span>}
            {data.personalInfo?.phone_number && data.personalInfo?.email && <span className="hidden sm:inline">| </span>}
            {data.personalInfo?.email && <span className="break-all">{data.personalInfo.email}</span>}
          </div>
        </div>

        {/* Summary */}
        {visibility.summary && hasContent('summary') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('summary')}
            >
              Summary
            </h2>
            <RenderEditableText
              content={data.personalInfo?.summary || ''}
              className={`text-gray-700 leading-relaxed ${isMobileView ? fonts.mobile.content : fonts.content} cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors`}
              onClick={() => onSectionClick && onSectionClick('summary')}
              editMode={editMode}
              onTextChange={onTextChange}
              section="personalInfo"
              field="summary"
            />
          </div>
        )}

        {/* Education */}
        {visibility.education && hasContent('education') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('education')}
            >
              Education
            </h2>
            <div className={isMobileView ? "space-y-1" : "space-y-2 sm:space-y-3"}>
              {(data.education_entries || [])
                .filter(edu => (edu.college || edu.degree) && edu.visible)
                .map((education, index) => (
                  <div
                    key={education.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('education', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-0' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'}`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={education.college || "Institution"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="education"
                          field="college"
                          index={index}
                        />
                        <RenderEditableText
                          content={education.degree || "Degree"}
                          className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="education"
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
                          {formatYearRange(education.start_year, education.end_year)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {visibility.workExperience && hasContent('workExperience') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('workExperience')}
            >
              Work Experience
            </h2>
            <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
              {(data.work_experiences || [])
                .filter(work => (work.designation || work.company_name) && work.visible)
                .map((experience, index) => (
                  <div
                    key={experience.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('workExperience', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'} mb-1`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={experience.designation || "Position"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="workExperience"
                          field="designation"
                          index={index}
                        />
                        <RenderEditableText
                          content={experience.company_name || "Company"}
                          className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="workExperience"
                          field="company_name"
                          index={index}
                        />
                        {experience.location && (
                          <p className={`text-gray-500 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            {experience.location}
                          </p>
                        )}
                      </div>
                      {experience.duration && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobileView ? 'block' : 'sm:ml-4'}`}>
                          {experience.duration}
                        </span>
                      )}
                    </div>
                    {experience.designation_description && (
                      <p className={`text-gray-700 mt-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                        {experience.designation_description}
                      </p>
                    )}
                    {/* Projects within Work Experience */}
                    {experience.projects?.filter(project => project.visible).map((project) => (
                      <div key={project.id} className="ml-4 mt-2">
                        <h4 className="text-gray-800 font-medium">{project.project_name}</h4>
                        <p className="text-gray-600 text-sm">{project.project_description}</p>
                        {project.description_bullets?.filter(bullet => bullet.trim()).length > 0 && (
                          <ul className="list-disc list-inside mt-1 text-gray-700 text-sm space-y-1">
                            {project.description_bullets.filter(bullet => bullet.trim()).map((bullet, bulletIndex) => (
                              <li key={bulletIndex}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Internships */}
        {visibility.internships && hasContent('internships') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('internships')}
            >
              Internships
            </h2>
            <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
              {(data.internships || [])
                .filter(internship => (internship.designation || internship.company_name) && internship.visible)
                .map((internship, index) => (
                  <div
                    key={internship.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('internships', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'} mb-1`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={internship.designation || "Position"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="internships"
                          field="designation"
                          index={index}
                        />
                        <RenderEditableText
                          content={internship.company_name || "Company"}
                          className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="internships"
                          field="company_name"
                          index={index}
                        />
                        {internship.location && (
                          <p className={`text-gray-500 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            {internship.location}
                          </p>
                        )}
                      </div>
                      {internship.duration && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobileView ? 'block' : 'sm:ml-4'}`}>
                          {internship.duration}
                        </span>
                      )}
                    </div>
                    {internship.designation_description && (
                      <p className={`text-gray-700 mt-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                        {internship.designation_description}
                      </p>
                    )}
                    {internship.internship_work_description_bullets?.filter(bullet => bullet.trim()).length > 0 && (
                      <ul className={`list-disc list-inside text-gray-700 ${isMobileView ? 'ml-0 text-xs' : 'ml-0 sm:ml-4 text-xs sm:text-sm'} space-y-1 mt-1`}>
                        {internship.internship_work_description_bullets.filter(bullet => bullet.trim()).map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="break-words">{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Academic Projects */}
        {visibility.academicProjects && hasContent('academicProjects') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('academicProjects')}
            >
              Academic Projects
            </h2>
            <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
              {(data.academic_projects || [])
                .filter(project => project.project_name && project.visible)
                .map((project, index) => (
                  <div
                    key={project.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('academicProjects', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'} mb-1`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={project.project_name || "Project Title"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="academicProjects"
                          field="project_name"
                          index={index}
                        />
                        {project.project_description && (
                          <p className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            {project.project_description}
                          </p>
                        )}
                      </div>
                      {project.duration && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobileView ? 'block' : 'sm:ml-4'}`}>
                          {project.duration}
                        </span>
                      )}
                    </div>
                    {project.description_bullets?.filter(bullet => bullet.trim()).length > 0 && (
                      <ul className={`list-disc list-inside text-gray-700 ${isMobileView ? 'ml-0 text-xs' : 'ml-0 sm:ml-4 text-xs sm:text-sm'} space-y-1`}>
                        {project.description_bullets.filter(bullet => bullet.trim()).map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="break-words">{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Positions of Responsibility */}
        {visibility.pors && hasContent('pors') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('pors')}
            >
              Positions of Responsibility
            </h2>
            <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
              {(data.positions_of_responsibility || [])
                .filter(por => por.role && por.visible)
                .map((por, index) => (
                  <div
                    key={por.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('pors', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'} mb-1`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={por.role || "Role"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="pors"
                          field="role"
                          index={index}
                        />
                        {por.organization && (
                          <p className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            {por.organization}
                          </p>
                        )}
                        {por.location && (
                          <p className={`text-gray-500 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            {por.location}
                          </p>
                        )}
                      </div>
                      {por.duration && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobileView ? 'block' : 'sm:ml-4'}`}>
                          {por.duration}
                        </span>
                      )}
                    </div>
                    {por.role_description && (
                      <p className={`text-gray-700 mt-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                        {por.role_description}
                      </p>
                    )}
                    {por.responsibilities?.filter(resp => resp.trim()).length > 0 && (
                      <ul className={`list-disc list-inside text-gray-700 ${isMobileView ? 'ml-0 text-xs' : 'ml-0 sm:ml-4 text-xs sm:text-sm'} space-y-1 mt-1`}>
                        {por.responsibilities.filter(resp => resp.trim()).map((responsibility, respIndex) => (
                          <li key={respIndex} className="break-words">{responsibility}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {visibility.achievements && hasContent('achievements') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('achievements')}
            >
              Achievements
            </h2>
            <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
              {(data.achievements || [])
                .filter(achievement => achievement.title && achievement.visible)
                .map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('achievements', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'} mb-1`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={achievement.title || "Achievement"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="achievements"
                          field="title"
                          index={index}
                        />
                        {achievement.awarding_body && (
                          <p className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            {achievement.awarding_body}
                          </p>
                        )}
                        {achievement.description && (
                          <p className={`text-gray-700 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} mt-1`}>
                            {achievement.description}
                          </p>
                        )}
                      </div>
                      {achievement.year && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobileView ? 'block' : 'sm:ml-4'}`}>
                          {achievement.year}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Extra Curriculars */}
        {visibility.extraCurriculars && hasContent('extraCurriculars') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('extraCurriculars')}
            >
              Extra-Curricular Activities
            </h2>
            <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
              {(data.extra_curriculars || [])
                .filter(activity => activity.activity && activity.visible)
                .map((activity, index) => (
                  <div
                    key={activity.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('extraCurriculars', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'} mb-1`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={activity.activity || "Activity"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="extraCurriculars"
                          field="activity"
                          index={index}
                        />
                        {activity.position && (
                          <p className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            {activity.position}
                          </p>
                        )}
                        {activity.description && (
                          <p className={`text-gray-700 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} mt-1`}>
                            {activity.description}
                          </p>
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

        {/* Certifications */}
        {visibility.certifications && hasContent('certifications') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('certifications')}
            >
              Certifications
            </h2>
            <div className={isMobileView ? "space-y-1" : "space-y-2 sm:space-y-3"}>
              {(data.certifications || [])
                .filter(cert => cert.certification && cert.visible)
                .map((certification, index) => (
                  <div
                    key={certification.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('certifications', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-0' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'}`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={certification.certification || "Certification"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="certifications"
                          field="certification"
                          index={index}
                        />
                        {certification.issuing_organization && (
                          <p className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            {certification.issuing_organization}
                          </p>
                        )}
                        {certification.description && (
                          <p className={`text-gray-700 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} mt-1`}>
                            {certification.description}
                          </p>
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

        {/* Skills */}
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
              {data.skills?.skills?.length > 0 && (
                <div>
                  <p className={`font-medium text-gray-900 mb-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>Technical Skills:</p>
                  <p className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    {data.skills.skills.join(', ')}
                  </p>
                </div>
              )}
              {data.skills?.languages?.length > 0 && (
                <div>
                  <p className={`font-medium text-gray-900 mb-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>Languages:</p>
                  <p className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    {data.skills.languages.join(', ')}
                  </p>
                </div>
              )}
              {data.skills?.interests?.length > 0 && (
                <div>
                  <p className={`font-medium text-gray-900 mb-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>Interests:</p>
                  <p className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    {data.skills.interests.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* External Links */}
        {visibility.externalLinks && hasContent('externalLinks') && (
          <div>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('externalLinks')}
            >
              Links
            </h2>
            <div
              className={`${isMobileView ? "space-y-1" : "space-y-2"} cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors`}
              onClick={() => onSectionClick && onSectionClick('externalLinks')}
            >
              {data.external_links?.map((link, index) => (
                <div key={index}>
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-blue-600 hover:text-blue-800 underline break-all ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                  >
                    {link}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
