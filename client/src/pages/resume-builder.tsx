
import React, { useState } from 'react';
import ResumeForm, { Resume } from '@/components/resume/resume-form';
import { ResumePreviewPanel } from '@/components/resume/resume-preview';

const defaultResumeData: Resume = {
  id: "",
  title: "Untitled Resume",
  summary: "",
  name: "",
  email: "",
  phone_number: "",
  updatedAt: new Date().toISOString(),
  status: "new",
  skills: [],
  interests: [],
  languages: [],
  external_links: [],
  resume_inputs: [],
  education_entries: [],
  work_experiences: [],
  internships: [],
  achievements: [],
  positions_of_responsibility: [],
  extra_curriculars: [],
  certifications: [],
  academic_projects: [],
};

const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<Resume>(defaultResumeData);
  const [sectionVisibility, setSectionVisibility] = useState<any>({
    summary: true,
    education: true,
    workExperience: true,
    projects: true,
    pors: true,
    achievements: true,
    certifications: true,
    skills: true
  });

  const handleDataChange = (newData: Resume) => {
    setResumeData(newData);
  };

  const handleSectionVisibilityChange = (newVisibility: any) => {
    setSectionVisibility(newVisibility);
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <ResumeForm
        initialData={resumeData}
        onChange={handleDataChange}
        sectionVisibility={sectionVisibility}
        onSectionVisibilityChange={handleSectionVisibilityChange}
      />
      <ResumePreviewPanel
        data={resumeData}
        sectionVisibility={sectionVisibility}
        onSectionClick={() => {}}
      />
    </div>
  );
};

export default ResumeBuilder;
