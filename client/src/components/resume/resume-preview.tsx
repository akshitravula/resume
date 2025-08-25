
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

// Types
interface PersonalInfo {
  name: string;
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
  fontSettings?: FontSettings; // ADD: Font settings for global formatting
  fieldFormats?: Record<string, FieldFormat>; // ADD: Field-specific formatting
  getFieldFormatting?: (fieldKey: string) => FieldFormat; // ADD: Function to get field formatting
  onSectionClick: (section: string, index?: number) => void;
  className?: string;
  isMobileView?: boolean;
  editMode?: boolean;
  onTextChange?: (section: string, field: string, value: string, index?: number) => void;
}

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

// Types
// ... existing types

// FloatingFormatToolbar component
// ... existing FloatingFormatToolbar component

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

// ResumePreview component
export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({
    data,
    sectionVisibility,
    styleOptions,
    fontSettings, // ADD: Accept fontSettings prop
    fieldFormats, // ADD: Accept fieldFormats prop
    getFieldFormatting, // ADD: Accept getFieldFormatting prop
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
      projects: true,
      pors: true,
      achievements: true,
      certifications: true,
      skills: true
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

    // ADD: Apply global font settings
    const getGlobalStyles = () => {
      if (!fontSettings) return {};
      
      const styles: React.CSSProperties = {};
      
      if (fontSettings.color) {
        styles.color = fontSettings.color;
      }
      
      return styles;
    };

    // ADD: Get combined font classes
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

    // ADD: Combine base classes with global font settings
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
          return data.education?.some(edu => (edu.institution || edu.degree) && edu.visible) || false;
        case 'workExperience':
          return data.workExperience?.some(work => (work.designation || work.company) && work.visible) || false;
        case 'projects':
          return data.projects?.some(project => (project.title || project.technologies) && project.visible) || false;
        case 'pors':
          return data.pors?.some(por => por.title && por.visible) || false;
        case 'achievements':
          return data.achievements?.some(achievement => achievement.title && achievement.visible) || false;
        case 'certifications':
          return data.certifications?.some(cert => cert.name && cert.visible) || false;
        case 'skills':
          return data.skills?.technical || data.skills?.languages || data.skills?.frameworks || data.skills?.tools;
        default:
          return false;
      }
    };

    // ADD: Enhanced RenderEditableText component that applies field-specific formatting
    const RenderEditableText = ({ content, className, onClick, editMode, onTextChange, section, field, index }: any) => {
      const fieldKey = index !== undefined ? `${section}_${field}_${index}` : `${section}_${field}`;
      const fieldStyles = getFieldFormatting ? getFieldFormatting(fieldKey) : {};
      const globalStyles = getGlobalStyles();
      
      // Combine field-specific styles with global styles
      const combinedStyles = { ...globalStyles, ...fieldStyles };
      
      return (
        <span
          className={className}
          style={combinedStyles}
          onClick={onClick}
        >
          {content}
        </span>
      );
    };

    return (
      <div className={`${baseClasses} ${responsiveClasses} relative`} ref={ref} style={getGlobalStyles()}>
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
            {data.personalInfo?.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo?.phone && data.personalInfo?.email && <span className="hidden sm:inline">| </span>}
            {data.personalInfo?.email && <span className="break-all">{data.personalInfo.email}</span>}
            {(data.personalInfo?.phone || data.personalInfo?.email) && data.personalInfo?.linkedin && <span className="hidden sm:inline">| </span>}
            {data.personalInfo?.linkedin && <span>{data.personalInfo.linkedin}</span>}
          </div>
        </div>

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

        {visibility.education && hasContent('education') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('education')}
            >
              Education
            </h2>
            <div className={isMobileView ? "space-y-1" : "space-y-2 sm:space-y-3"}>
              {(data.education || [])
                .filter(edu => (edu.institution || edu.degree) && edu.visible)
                .map((education, index) => (
                  <div
                    key={education.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('education', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-0' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'}`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={education.institution || "Institution"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="education"
                          field="institution"
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
                        {education.gpa && (
                          <p className={`text-gray-600 mt-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            GPA: {education.gpa}
                          </p>
                        )}
                      </div>
                      {education.year && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs inline ml-2' : 'text-xs sm:text-sm block sm:ml-4'}`}>
                          {education.year}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {visibility.workExperience && hasContent('workExperience') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('workExperience')}
            >
              Work Experience
            </h2>
            <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
              {(data.workExperience || [])
                .filter(work => (work.designation || work.company) && work.visible)
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
                          content={experience.company || "Company"}
                          className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="workExperience"
                          field="company"
                          index={index}
                        />
                      </div>
                      {experience.year && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobileView ? 'block' : 'sm:ml-4'}`}>
                          {experience.year}
                        </span>
                      )}
                    </div>
                    {experience.bullets?.filter(bullet => bullet.trim()).length > 0 && (
                      <ul className={`list-disc list-inside text-gray-700 ${isMobileView ? 'ml-0 text-xs' : 'ml-0 sm:ml-4 text-xs sm:text-sm'} space-y-1`}>
                        {experience.bullets.filter(bullet => bullet.trim()).map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="break-words">
                            <RenderEditableText
                              content={bullet}
                              className="inline"
                              editMode={editMode}
                              onTextChange={onTextChange}
                              section="workExperience"
                              field={`bullet_${bulletIndex}`}
                              index={index}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {visibility.projects && hasContent('projects') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('projects')}
            >
              Projects
            </h2>
            <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
              {(data.projects || [])
                .filter(project => (project.title || project.technologies) && project.visible)
                .map((project, index) => (
                  <div
                    key={project.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('projects', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'} mb-1`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={project.title || "Project Title"}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="projects"
                          field="title"
                          index={index}
                        />
                        {project.technologies && (
                          <p className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            Technologies: {project.technologies}
                          </p>
                        )}
                      </div>
                      {project.year && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobileView ? 'block' : 'sm:ml-4'}`}>
                          {project.year}
                        </span>
                      )}
                    </div>
                    {project.bullets?.filter(bullet => bullet.trim()).length > 0 && (
                      <ul className={`list-disc list-inside text-gray-700 ${isMobileView ? 'ml-0 text-xs' : 'ml-0 sm:ml-4 text-xs sm:text-sm'} space-y-1`}>
                        {project.bullets?.filter(bullet => bullet.trim()).map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="break-words">
                            <RenderEditableText
                              content={bullet}
                              className="inline"
                              editMode={editMode}
                              onTextChange={onTextChange}
                              section="projects"
                              field={`bullet_${bulletIndex}`}
                              index={index}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {visibility.pors && hasContent('pors') && (
          <div className={isMobileView ? "mb-3" : "mb-4 sm:mb-6"}>
            <h2
              className={`font-semibold ${colors.primary} border-b ${colors.border} pb-1 mb-2 ${isMobileView ? fonts.mobile.section : fonts.section} cursor-pointer hover:opacity-75 transition-opacity`}
              onClick={() => onSectionClick && onSectionClick('pors')}
            >
              Positions of Responsibility
            </h2>
            <div className={isMobileView ? "space-y-2" : "space-y-3 sm:space-y-4"}>
              {(data.pors || [])
                .filter(por => por.title && por.visible)
                .map((por, index) => (
                  <div
                    key={por.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('pors', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-1' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'} mb-1`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={por.title}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="pors"
                          field="title"
                          index={index}
                        />
                      </div>
                      {por.year && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} ${isMobileView ? 'block' : 'sm:ml-4'}`}>
                          {por.year}
                        </span>
                      )}
                    </div>
                    {por.bullets?.filter(bullet => bullet.trim()).length > 0 && (
                      <ul className={`list-disc list-inside text-gray-700 ${isMobileView ? 'ml-0 text-xs' : 'ml-0 sm:ml-4 text-xs sm:text-sm'} space-y-1`}>
                        {por.bullets?.filter(bullet => bullet.trim()).map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="break-words">
                            <RenderEditableText
                              content={bullet}
                              className="inline"
                              editMode={editMode}
                              onTextChange={onTextChange}
                              section="pors"
                              field={`bullet_${bulletIndex}`}
                              index={index}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

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
                          content={achievement.title}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="achievements"
                          field="title"
                          index={index}
                        />
                        {achievement.description && (
                          <RenderEditableText
                            content={achievement.description}
                            className={`text-gray-700 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'} mt-1`}
                            editMode={editMode}
                            onTextChange={onTextChange}
                            section="achievements"
                            field="description"
                            index={index}
                          />
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
                .filter(cert => cert.name && cert.visible)
                .map((certification, index) => (
                  <div
                    key={certification.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => onSectionClick && onSectionClick('certifications', index)}
                  >
                    <div className={`${isMobileView ? 'block space-y-0' : 'flex flex-col sm:flex-row sm:justify-between sm:items-start'}`}>
                      <div className="flex-1 min-w-0">
                        <RenderEditableText
                          content={certification.name}
                          className={`font-semibold text-gray-900 ${isMobileView ? fonts.mobile.content : fonts.content}`}
                          editMode={editMode}
                          onTextChange={onTextChange}
                          section="certifications"
                          field="name"
                          index={index}
                        />
                        {certification.issuer && (
                          <RenderEditableText
                            content={certification.issuer}
                            className={`text-gray-600 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                            editMode={editMode}
                            onTextChange={onTextChange}
                            section="certifications"
                            field="issuer"
                            index={index}
                          />
                        )}
                      </div>
                      {certification.year && (
                        <span className={`text-gray-500 flex-shrink-0 ${isMobileView ? 'text-xs inline ml-2' : 'text-xs sm:text-sm block sm:ml-4'}`}>
                          {certification.year}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {visibility.skills && hasContent('skills') && (
          <div>
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
              {data.skills.technical && (
                <div>
                  <p className={`font-medium text-gray-900 mb-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>Technical Skills:</p>
                  <RenderEditableText
                    content={data.skills.technical}
                    className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                    editMode={editMode}
                    onTextChange={onTextChange}
                    section="skills"
                    field="technical"
                  />
                </div>
              )}
              {data.skills.languages && (
                <div>
                  <p className={`font-medium text-gray-900 mb-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>Programming Languages:</p>
                  <RenderEditableText
                    content={data.skills.languages}
                    className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                    editMode={editMode}
                    onTextChange={onTextChange}
                    section="skills"
                    field="languages"
                  />
                </div>
              )}
              {data.skills.frameworks && (
                <div>
                  <p className={`font-medium text-gray-900 mb-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>Frameworks & Libraries:</p>
                  <RenderEditableText
                    content={data.skills.frameworks}
                    className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                    editMode={editMode}
                    onTextChange={onTextChange}
                    section="skills"
                    field="frameworks"
                  />
                </div>
              )}
              {data.skills.tools && (
                <div>
                  <p className={`font-medium text-gray-900 mb-1 ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}>Tools & Technologies:</p>
                  <RenderEditableText
                    content={data.skills.tools}
                    className={`text-gray-700 break-words ${isMobileView ? 'text-xs' : 'text-xs sm:text-sm'}`}
                    editMode={editMode}
                    onTextChange={onTextChange}
                    section="skills"
                    field="tools"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";

// Test data with fixed PORs
const testData: ResumeData = {
  personalInfo: {
    name: "John Doe",
    phone: "+1 (555) 123-4567",
    email: "john.doe@email.com",
    linkedin: "linkedin.com/in/johndoe",
    summary: "Experienced software developer with a passion for creating innovative solutions and leading development teams."
  },
  education: [
    {
      id: "1",
      institution: "University of Technology",
      degree: "Bachelor of Computer Science",
      gpa: "3.8",
      year: "2020-2024",
      visible: true
    }
  ],
  workExperience: [
    {
      id: "1",
      designation: "Senior Software Developer",
      company: "Tech Solutions Inc.",
      year: "2022-Present",
      bullets: [
        "Led development of microservices architecture serving 1M+ users",
        "Reduced system latency by 40% through optimization techniques",
        "Mentored 5 junior developers and conducted code reviews"
      ],
      visible: true
    }
  ],
  projects: [
    {
      id: "1",
      title: "E-commerce Platform",
      technologies: "React, Node.js, MongoDB, AWS",
      year: "2023",
      bullets: [
        "Built scalable e-commerce platform with real-time inventory management",
        "Implemented secure payment processing with Stripe integration"
      ],
      visible: true
    }
  ],
  pors: [
    {
      id: "1",
      title: "Team Lead - University Coding Club",
      year: "2023-2024",
      bullets: [
        "Organized weekly coding workshops for 50+ students",
        "Led team of 8 members in organizing hackathons"
      ],
      visible: true
    }
  ],
  achievements: [
    {
      id: "1",
      title: "Best Innovation Award",
      year: "2023",
      description: "Received recognition for developing an AI-powered code review tool",
      visible: true
    }
  ],
  certifications: [
    {
      id: "1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      year: "2023",
      visible: true
    }
  ],
  skills: {
    technical: "JavaScript, TypeScript, Python, Java, React, Node.js",
    languages: "JavaScript, Python, Java, C++, SQL",
    frameworks: "React, Express.js, Django, Spring Boot, Next.js",
    tools: "Git, Docker, AWS, MongoDB, PostgreSQL, Jenkins"
  }
};

// ResumePreviewPanel component
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
  onTextChange = () => {}
}: {
  data?: ResumeData;
  sectionVisibility?: SectionVisibility;
  styleOptions?: StyleOptions;
  fontSettings?: FontSettings;
  fieldFormats?: Record<string, FieldFormat>;
  getFieldFormatting?: (fieldKey: string) => FieldFormat;
  onSectionClick?: (section: string, index?: number) => void;
  editMode?: boolean;
  onTextChange?: (section: string, field: string, value: string, index?: number) => void;
}) {
  return (
    <div className="w-full bg-gray-100 p-6">
      {editMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Edit Mode Active:</strong> Select any text to format it with bold, italic, underline, font size, alignment, spacing, and more using the floating toolbar.
          </p>
        </div>
      )}
      <div className="w-full max-w-4xl mx-auto">
        <ResumePreview
          data={data}
          sectionVisibility={sectionVisibility}
          styleOptions={styleOptions}
          fontSettings={fontSettings}
          fieldFormats={fieldFormats}
          getFieldFormatting={getFieldFormatting}
          onSectionClick={onSectionClick}
          className="min-h-[600px] rounded-lg shadow-lg"
          isMobileView={false}
          editMode={editMode}
          onTextChange={onTextChange}
        />
      </div>
    </div>
  );
}

export default ResumePreview;
