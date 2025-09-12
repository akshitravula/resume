import React from 'react';
import { Bold, Italic, Underline, ChevronDown } from 'lucide-react';

interface FloatingFormatToolbarProps {
  position: { x: number; y: number } | null;
  onFormat: (styleProperty: string, value: string) => void;
  fontSizes: { value: string; label: string; }[];
  fontFamilies: { value: string; label: string; css: string }[];
}

const DropdownMenu = ({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute top-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-xl z-[10000] min-w-[120px] py-1 animate-in fade-in-0 zoom-in-95">
          {React.Children.map(children, (child, index) => (
            <div key={index} onClick={() => setIsOpen(false)}>
              {child}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) => (
  <div
    className="px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer transition-colors duration-150"
    onClick={onSelect}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`h-9 px-3 rounded-md flex items-center justify-center gap-1 transition-colors duration-150 hover:bg-gray-700 text-white ${className}`}
  >
    {children}
  </button>
);

const Separator = () => (
  <div className="w-px h-6 bg-gray-600" />
);

export default function FloatingFormatToolbar({ position, onFormat, fontSizes, fontFamilies }: FloatingFormatToolbarProps) {
  if (!position) return null;

  const formatButtons = [
    { icon: <Bold size={18} />, property: 'fontWeight', value: 'bold' },
    { icon: <Italic size={18} />, property: 'fontStyle', value: 'italic' },
    { icon: <Underline size={18} />, property: 'textDecoration', value: 'underline' }
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(5px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        @keyframes animate-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-in {
          animation: animate-in 0.15s ease-out;
        }
        
        .fade-in-0 {
          animation-fill-mode: forwards;
        }
        
        .zoom-in-95 {
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
      
      <div
        className="fixed z-[9999] bg-gray-800 text-white shadow-2xl rounded-lg p-2 flex items-center gap-2 border border-gray-600"
        style={{
          top: `${Math.max(position.y - 60, 10)}px`,
          left: `${position.x}px`,
          transform: 'translateX(-50%)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Format Buttons */}
        <div className="flex items-center gap-1">
          {formatButtons.map((button) => (
            <Button
              key={button.property}
              onClick={() => onFormat(button.property, button.value)}
              className="w-9 p-0"
            >
              {button.icon}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Font Size */}
        <DropdownMenu
          trigger={
            <Button>
              Size <ChevronDown size={16} />
            </Button>
          }
        >
          {fontSizes.map((size) => (
            <DropdownItem
              key={size.value}
              onSelect={() => onFormat('fontSize', size.label)}
            >
              {size.label}
            </DropdownItem>
          ))}
        </DropdownMenu>

        <Separator />

        {/* Paragraph Spacing */}
        <DropdownMenu
          trigger={
            <Button>
              Spacing <ChevronDown size={16} />
            </Button>
          }
        >
          <DropdownItem onSelect={() => onFormat('marginBottom', '0')}>
            None
          </DropdownItem>
          <DropdownItem onSelect={() => onFormat('marginBottom', '8px')}>
            Small (8px)
          </DropdownItem>
          <DropdownItem onSelect={() => onFormat('marginBottom', '16px')}>
            Medium (16px)
          </DropdownItem>
          <DropdownItem onSelect={() => onFormat('marginBottom', '24px')}>
            Large (24px)
          </DropdownItem>
        </DropdownMenu>

        <Separator />

        {/* Line Height */}
        <DropdownMenu
          trigger={
            <Button>
              Line Height <ChevronDown size={16} />
            </Button>
          }
        >
          <DropdownItem onSelect={() => onFormat('lineHeight', '1')}>
            Single
          </DropdownItem>
          <DropdownItem onSelect={() => onFormat('lineHeight', '1.15')}>
            Tight
          </DropdownItem>
          <DropdownItem onSelect={() => onFormat('lineHeight', '1.5')}>
            1.5x
          </DropdownItem>
          <DropdownItem onSelect={() => onFormat('lineHeight', '2')}>
            Double
          </DropdownItem>
        </DropdownMenu>

        <Separator />

        {/* Font Family */}
        <DropdownMenu
          trigger={
            <Button>
              Font <ChevronDown size={16} />
            </Button>
          }
        >
          {fontFamilies.map((family) => (
            <DropdownItem
              key={family.value}
              onSelect={() => onFormat('fontFamily', family.css)}
            >
              <span style={{ fontFamily: family.css }}>
                {family.label}
              </span>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </div>
    </>
  );
}