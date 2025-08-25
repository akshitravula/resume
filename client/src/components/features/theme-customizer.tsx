import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Check, RotateCcw } from "lucide-react";

interface ThemeCustomizerProps {
  onThemeChange: (theme: ResumeTheme) => void;
  currentTheme?: ResumeTheme;
}

interface ResumeTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    section: string;
    element: string;
  };
}

const predefinedThemes: ResumeTheme[] = [
  {
    id: "professional-blue",
    name: "Professional Blue",
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#0ea5e9",
      text: "#1e293b",
      background: "#ffffff",
      border: "#e2e8f0"
    },
    fonts: {
      heading: "Inter",
      body: "Inter"
    },
    spacing: {
      section: "1.5rem",
      element: "0.75rem"
    }
  },
  {
    id: "creative-purple",
    name: "Creative Purple",
    colors: {
      primary: "#7c3aed",
      secondary: "#a855f7",
      accent: "#c084fc",
      text: "#374151",
      background: "#fefefe",
      border: "#e5e7eb"
    },
    fonts: {
      heading: "Poppins",
      body: "Inter"
    },
    spacing: {
      section: "1.75rem",
      element: "0.875rem"
    }
  },
  {
    id: "modern-green",
    name: "Modern Green",
    colors: {
      primary: "#059669",
      secondary: "#047857",
      accent: "#10b981",
      text: "#111827",
      background: "#ffffff",
      border: "#d1d5db"
    },
    fonts: {
      heading: "Roboto",
      body: "Roboto"
    },
    spacing: {
      section: "1.25rem",
      element: "0.625rem"
    }
  },
  {
    id: "elegant-gray",
    name: "Elegant Gray",
    colors: {
      primary: "#374151",
      secondary: "#6b7280",
      accent: "#9ca3af",
      text: "#1f2937",
      background: "#ffffff",
      border: "#e5e7eb"
    },
    fonts: {
      heading: "Playfair Display",
      body: "Source Sans Pro"
    },
    spacing: {
      section: "2rem",
      element: "1rem"
    }
  },
  {
    id: "tech-orange",
    name: "Tech Orange",
    colors: {
      primary: "#ea580c",
      secondary: "#dc2626",
      accent: "#f97316",
      text: "#292524",
      background: "#ffffff",
      border: "#e7e5e4"
    },
    fonts: {
      heading: "JetBrains Mono",
      body: "Inter"
    },
    spacing: {
      section: "1.5rem",
      element: "0.75rem"
    }
  },
  {
    id: "minimalist-black",
    name: "Minimalist Black",
    colors: {
      primary: "#000000",
      secondary: "#404040",
      accent: "#666666",
      text: "#1a1a1a",
      background: "#ffffff",
      border: "#e0e0e0"
    },
    fonts: {
      heading: "Helvetica",
      body: "Helvetica"
    },
    spacing: {
      section: "1rem",
      element: "0.5rem"
    }
  },
  {
    id: "warm-red",
    name: "Warm Red",
    colors: {
      primary: "#dc2626",
      secondary: "#b91c1c",
      accent: "#ef4444",
      text: "#1f2937",
      background: "#ffffff",
      border: "#f3f4f6"
    },
    fonts: {
      heading: "Merriweather",
      body: "Open Sans"
    },
    spacing: {
      section: "1.75rem",
      element: "0.875rem"
    }
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    colors: {
      primary: "#0d9488",
      secondary: "#14b8a6",
      accent: "#2dd4bf",
      text: "#064e3b",
      background: "#ffffff",
      border: "#ccfbf1"
    },
    fonts: {
      heading: "Nunito",
      body: "Nunito Sans"
    },
    spacing: {
      section: "1.5rem",
      element: "0.75rem"
    }
  }
];

const colorPresets = [
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Green", value: "#059669" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Teal", value: "#0d9488" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Gray", value: "#374151" },
  { name: "Black", value: "#000000" }
];

const fontOptions = [
  "Inter",
  "Roboto", 
  "Open Sans",
  "Lato",
  "Poppins",
  "Nunito",
  "Source Sans Pro",
  "Playfair Display",
  "Merriweather",
  "JetBrains Mono",
  "Helvetica",
  "Arial"
];

export function ThemeCustomizer({ onThemeChange, currentTheme }: ThemeCustomizerProps) {
  const [customTheme, setCustomTheme] = useState<ResumeTheme>(
    currentTheme || predefinedThemes[0]
  );
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");

  const handleThemeSelect = (theme: ResumeTheme) => {
    setCustomTheme(theme);
    onThemeChange(theme);
  };

  const handleColorChange = (colorType: keyof ResumeTheme["colors"], value: string) => {
    const updatedTheme = {
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [colorType]: value
      }
    };
    setCustomTheme(updatedTheme);
    onThemeChange(updatedTheme);
  };

  const handleFontChange = (fontType: keyof ResumeTheme["fonts"], value: string) => {
    const updatedTheme = {
      ...customTheme,
      fonts: {
        ...customTheme.fonts,
        [fontType]: value
      }
    };
    setCustomTheme(updatedTheme);
    onThemeChange(updatedTheme);
  };

  const resetToDefault = () => {
    const defaultTheme = predefinedThemes[0];
    setCustomTheme(defaultTheme);
    onThemeChange(defaultTheme);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Resume Theme Customizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === "presets" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("presets")}
              className="flex-1"
            >
              Theme Presets
            </Button>
            <Button
              variant={activeTab === "custom" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("custom")}
              className="flex-1"
            >
              Custom Theme
            </Button>
          </div>

          {activeTab === "presets" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predefinedThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      customTheme.id === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                    }`}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{theme.name}</h3>
                      {customTheme.id === theme.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mb-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: theme.colors.primary }}
                        title="Primary Color"
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: theme.colors.secondary }}
                        title="Secondary Color"
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent Color"
                      />
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <div>Font: {theme.fonts.heading}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "custom" && (
            <div className="space-y-6">
              {/* Colors Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        id="primary-color"
                        type="color"
                        value={customTheme.colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTheme.colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        className="flex-1 px-3 py-2 border rounded text-sm"
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        id="secondary-color"
                        type="color"
                        value={customTheme.colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTheme.colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        className="flex-1 px-3 py-2 border rounded text-sm"
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        id="accent-color"
                        type="color"
                        value={customTheme.colors.accent}
                        onChange={(e) => handleColorChange("accent", e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTheme.colors.accent}
                        onChange={(e) => handleColorChange("accent", e.target.value)}
                        className="flex-1 px-3 py-2 border rounded text-sm"
                        placeholder="#0ea5e9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        id="text-color"
                        type="color"
                        value={customTheme.colors.text}
                        onChange={(e) => handleColorChange("text", e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customTheme.colors.text}
                        onChange={(e) => handleColorChange("text", e.target.value)}
                        className="flex-1 px-3 py-2 border rounded text-sm"
                        placeholder="#1e293b"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Presets */}
                <div className="mt-4">
                  <Label>Quick Color Presets</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handleColorChange("primary", preset.value)}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: preset.value }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Typography</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heading-font">Heading Font</Label>
                    <select
                      id="heading-font"
                      value={customTheme.fonts.heading}
                      onChange={(e) => handleFontChange("heading", e.target.value)}
                      className="w-full px-3 py-2 border rounded mt-1"
                    >
                      {fontOptions.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="body-font">Body Font</Label>
                    <select
                      id="body-font"
                      value={customTheme.fonts.body}
                      onChange={(e) => handleFontChange("body", e.target.value)}
                      className="w-full px-3 py-2 border rounded mt-1"
                    >
                      {fontOptions.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={resetToDefault}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
                
                <div className="flex space-x-2">
                  <Badge variant="secondary">
                    Current: {customTheme.name}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded-lg p-6 space-y-4"
            style={{ 
              backgroundColor: customTheme.colors.background,
              color: customTheme.colors.text,
              borderColor: customTheme.colors.border
            }}
          >
            <h1 
              className="text-2xl font-bold"
              style={{ 
                color: customTheme.colors.primary,
                fontFamily: customTheme.fonts.heading 
              }}
            >
              Your Name
            </h1>
            <p 
              className="text-lg"
              style={{ 
                color: customTheme.colors.secondary,
                fontFamily: customTheme.fonts.body 
              }}
            >
              Professional Title
            </p>
            <div className="space-y-2">
              <h2 
                className="text-xl font-semibold"
                style={{ 
                  color: customTheme.colors.primary,
                  fontFamily: customTheme.fonts.heading 
                }}
              >
                Experience
              </h2>
              <p 
                style={{ 
                  fontFamily: customTheme.fonts.body,
                  color: customTheme.colors.text 
                }}
              >
                This is how your resume content will look with the selected theme.
              </p>
              <span 
                className="inline-block px-2 py-1 rounded text-sm"
                style={{ 
                  backgroundColor: customTheme.colors.accent,
                  color: customTheme.colors.background 
                }}
              >
                Skill Tag
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}