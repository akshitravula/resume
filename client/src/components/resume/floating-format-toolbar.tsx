import React, { useEffect } from 'react';
import { Bold, Italic, Underline, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface FloatingFormatToolbarProps {
  position: { x: number; y: number } | null;
  onFormat: (styleProperty: string, value: string) => void;
  onClose?: () => void;
  fontSizes: { value: string; label: string; }[];
  fontFamilies: { value: string; label: string; css: string }[];
}

export default function FloatingFormatToolbar({ position, onFormat, onClose, fontSizes, fontFamilies }: FloatingFormatToolbarProps) {
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === '') {
        // Nothing is selected, close the toolbar
        if (onClose) {
          onClose();
        }
      }
    };

    // Listen for selection changes
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // Also listen for clicks outside to close
    const handleClickOutside = (event: MouseEvent) => {
      const toolbar = document.querySelector('[data-floating-toolbar]');
      if (toolbar && !toolbar.contains(event.target as Node)) {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim() === '') {
          if (onClose) {
            onClose();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!position) return null;

  const formatButtons = [
    { icon: <Bold size={18} />, property: 'fontWeight', value: 'bold' },
    { icon: <Italic size={18} />, property: 'fontStyle', value: 'italic' },
    { icon: <Underline size={18} />, property: 'textDecoration', value: 'underline' }
  ];

  const handleClose = () => {
    console.log('Close button clicked'); // Debug log
    onClose?.();
  };

  return (
    <div
      data-floating-toolbar
      className="fixed z-[9999] bg-gray-800 text-white shadow-xl rounded-lg p-2 flex items-center gap-2 transition-all duration-150 ease-in-out"
      style={{
        top: `${Math.max(position.y - 50, 10)}px`,
        left: `${position.x}px`,
        transform: 'translateX(-50%)',
        animation: 'fadeIn 0.1s ease-in-out',
      }}
    >
      <div className="flex items-center gap-1">
        {formatButtons.map((button) => (
          <Button
            key={button.property}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-gray-700 text-white"
            onClick={() => onFormat(button.property, button.value)}
          >
            {button.icon}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 bg-gray-600" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-gray-700 text-white flex items-center gap-1">
            Font Size <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
            {fontSizes.map((size) => (
              <DropdownMenuItem key={size.value} onClick={() => onFormat('fontSize', size.label)} className="hover:bg-gray-700">
                {size.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 bg-gray-600" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-gray-700 text-white flex items-center gap-1">
            Paragraph <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
            <DropdownMenuItem onClick={() => onFormat('marginBottom', '0')} className="hover:bg-gray-700">None</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFormat('marginBottom', '8px')} className="hover:bg-gray-700">Small</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFormat('marginBottom', '16px')} className="hover:bg-gray-700">Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFormat('marginBottom', '24px')} className="hover:bg-gray-700">Large</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 bg-gray-600" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-gray-700 text-white flex items-center gap-1">
            Line Spacing <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
            <DropdownMenuItem onClick={() => onFormat('lineHeight', '1')} className="hover:bg-gray-700">Single</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFormat('lineHeight', '1.5')} className="hover:bg-gray-700">1.5</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFormat('lineHeight', '2')} className="hover:bg-gray-700">Double</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 bg-gray-600" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-gray-700 text-white flex items-center gap-1">
            Font Family <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
            {fontFamilies.map((family) => (
              <DropdownMenuItem key={family.value} onClick={() => onFormat('fontFamily', family.css)} className="hover:bg-gray-700">
                {family.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 bg-gray-600" />

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-red-600 hover:text-white text-white transition-colors"
        onClick={handleClose}
        onMouseDown={(e) => {
          console.log('Close button mouse down');
          e.preventDefault();
          e.stopPropagation();
        }}
        title="Close toolbar"
      >
        <X size={16} />
      </Button>
    </div>
  );
}