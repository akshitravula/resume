
import React, { useState, useRef, useCallback } from 'react';
import ResumeForm from './resume-form';
import ResumePreview from './resume-preview';

interface SectionVisibility {
  [key: string]: boolean;
}

interface ResumeBuilderProps {
  // Add necessary props
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = (props) => {
  const [resumeData, setResumeData] = useState(/* initial resume data */);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    summary: true,
    education: true,
    workExperience: true,
    projects: true,
    skills: true,
    // Add other sections as needed
  });

  const formRef = useRef<HTMLDivElement>(null);

  const handleDataChange = useCallback((newData: any) => {
    setResumeData(newData);
  }, []);

  const handleSectionVisibilityChange = useCallback((section: string, isVisible: boolean) => {
    setSectionVisibility(prev => ({ ...prev, [section]: isVisible }));
  }, []);

  const handlePreviewFieldClick = useCallback((section: string, field: string, index?: number) => {
    if (formRef.current) {
      const inputId = `${section}-${field}${index !== undefined ? `-${index}` : ''}`;
      const inputElement = formRef.current.querySelector(`#${inputId}`) as HTMLInputElement;
      
      if (inputElement) {
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputElement.focus();
        inputElement.classList.add('highlight');
        setTimeout(() => inputElement.classList.remove('highlight'), 2000);
      }
    }
  }, []);

  const handleSectionClick = (section: string, index?: number) => {
    if (formRef.current) {
      const sectionElement = formRef.current.querySelector(`[data-section="${section}"]`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/2">
        <ResumeForm
          ref={formRef}
          data={resumeData}
          onDataChange={handleDataChange}
          sectionVisibility={sectionVisibility}
          onSectionVisibilityChange={handleSectionVisibilityChange}
          {...props}
        />
      </div>
      <div className="w-full lg:w-1/2">
        <ResumePreview
          data={resumeData}
          sectionVisibility={sectionVisibility}
          onFieldClick={handlePreviewFieldClick}
          onSectionClick={handleSectionClick}
          {...props}
        />
      </div>
    </div>
  );
};

export default ResumeBuilder;