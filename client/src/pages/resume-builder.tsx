
import React, { useState } from 'react';
import ResumeForm from '@/components/resume/resume-form';
import ResumePreview from '@/components/resume/resume-preview';

const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(/* initial resume data */);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    summary: true,
    education: true,
    workExperience: true,
    projects: true,
    pors: true,
    achievements: true,
    certifications: true,
    skills: true
  });

  const handleDataChange = (newData: ResumeData) => {
    setResumeData(newData);
  };

  const handleSectionVisibilityChange = (newVisibility: SectionVisibility) => {
    setSectionVisibility(newVisibility);
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <ResumeForm
        initialData={resumeData}
        onDataChange={handleDataChange}
        sectionVisibility={sectionVisibility}
        onSectionVisibilityChange={handleSectionVisibilityChange}
      />
      <ResumePreview
        data={resumeData}
        sectionVisibility={sectionVisibility}
        styleOptions={/* your style options */}
        onSectionClick={/* your section click handler */}
      />
    </div>
  );
};

export default ResumeBuilder;
