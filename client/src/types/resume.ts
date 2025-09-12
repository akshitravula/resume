export const Role = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface Project {
  project_name: string | null;
  project_description: string | null;
  description_bullets: string[];
}

export interface WorkExperience {
  company_name: string | null;
  company_description: string | null;
  location: string | null;
  duration: string | null;
  designation: string | null;
  designation_description: string | null;
  projects: Project[];
}

export interface Internship {
  company_name: string | null;
  company_description: string | null;
  location: string | null;
  designation: string | null;
  designation_description: string | null;
  duration: string | null;
  internship_work_description_bullets: string[];
}

export interface Education {
  college: string | null;
  degree: string | null;
  start_year: number | null;
  end_year: number | null;
  cgpa: number | null;
}

export interface ScholasticAchievement {
  title: string | null;
  awarding_body: string | null;
  year: number | null;
  description: string | null;
}

export interface PositionOfResponsibility {
  role: string | null;
  role_description: string | null;
  organization: string | null;
  organization_description: string | null;
  location: string | null;
  duration: string | null;
  responsibilities: string[];
}

export interface ExtraCurricular {
  activity: string | null;
  position: string | null;
  description: string | null;
  year: number | null;
}

export interface Certification {
  certification: string | null;
  description: string | null;
  issuing_organization: string | null;
  time_of_certification: number | null;
}

export interface AcademicProject {
  project_name: string | null;
  project_description: string | null;
  description_bullets: string[];
  duration: string | null;
}
    
    

export interface ResumeInput {
  input_text: string | null;
  audio_file: string | null;
  transcribed_text: string | null;
  submitted_at: string | null; // ISO datetime or null
}

export interface Resume {
  id: string ;
  title: string | null;
  summary: string | null;
  name: string | null; // always null in your JSON
  email: string | null;
  phone_number: string | null;
  updatedAt: string; // ISO datetime
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

