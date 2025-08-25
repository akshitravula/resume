import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  RotateCcw,
  Space
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TextSelection {
  field: string;
  fieldIndex?: number;
  startIndex: number;
  endIndex: number;
  text: string;
}

interface FloatingFormatToolbarProps {
  onFormatChange: (selection: TextSelection, format: string, value: any) => void;
  currentFormats: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    fontSize: string;
    fontFamily: string;
    alignment: string;
    letterSpacing: string;
    lineHeight: string;
  };
}

const defaultFormats = {
  bold: false,
  italic: false,
  underline: false,
  fontSize: 'base',
  fontFamily: 'sans',
  alignment: 'left',
  letterSpacing: 'normal',
  lineHeight: 'normal'
};

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  onFormatChange,
  currentFormats = defaultFormats
}) => {
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

  const handleFormatChange = (format: string, value: any) => {
    if (!textSelection) return;
    onFormatChange(textSelection, format, value);
  };

  const expandToWords = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    selection.modify('move', 'backward', 'word');
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
    const toolbarWidth = 650;
    const toolbarHeight = 44;
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
      {/* Font Family */}
      <Select
        value={currentFormats?.fontFamily || 'sans'}
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

      {/* Font Size */}
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

      {/* Bold */}
      <Button
        variant={currentFormats.bold ? "default" : "outline"}
        size="sm"
        onClick={() => handleFormatChange('bold', !currentFormats.bold)}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
      >
        <Bold className="w-3 h-3" />
      </Button>

      {/* Italic */}
      <Button
        variant={currentFormats.italic ? "default" : "outline"}
        size="sm"
        onClick={() => handleFormatChange('italic', !currentFormats.italic)}
        onMouseDown={startInteraction}
        className="h-8 w-8 p-0 border-gray-300"
      >
        <Italic className="w-3 h-3" />
      </Button>

      {/* Underline */}
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

      {/* Letter Spacing */}
      <div className="flex items-center gap-1">
        <Space className="w-3 h-3 text-gray-500" />
        <Select
          value={currentFormats.letterSpacing}
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

      {/* Line Height */}
      <div className="flex items-center gap-1">
        <div className="flex flex-col w-3 h-3 justify-between">
          <div className="w-full h-px bg-gray-500"></div>
          <div className="w-full h-px bg-gray-500"></div>
          <div className="w-full h-px bg-gray-500"></div>
        </div>
        <Select
          value={currentFormats.lineHeight}
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

      {/* Alignment */}
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

      {/* Word Select */}
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

      {/* Clear Formatting */}
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

      {/* Selection Preview */}
      <div className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-600 max-w-20 truncate">
        "{textSelection.text.length > 12 ? textSelection.text.substring(0, 12) + '…' : textSelection.text}"
      </div>
    </div>
  );
};