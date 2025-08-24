import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Star, Briefcase, Code, Palette, Heart, Globe, Calculator, Camera, Wrench, Gavel, GraduationCap, Users, TrendingUp, BookOpen, X, Download, FileText } from "lucide-react";
import { TailoringDialog } from "@/components/dialogs/TailoringDialog";

interface Template {
  id: string;
  name: string;
  category: string;
  industry: string[];
  level: "entry" | "mid" | "senior" | "executive";
  rating: number;
  downloads: number;
  preview: string;
  color: string;
  icon: any;
  description: string;
  data: any;
}

const templates: Template[] = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    category: "Professional",
    industry: ["Technology", "Finance", "Consulting"],
    level: "mid",
    rating: 4.9,
    downloads: 12453,
    preview: "",
    color: "from-blue-500 to-blue-600",
    icon: Briefcase,
    description: "Clean, professional design perfect for corporate roles",
    data: {
      personalInfo: {
        fullName: "Your Name",
        jobTitle: "Professional Title",
        email: "email@example.com",
        phone: "(555) 123-4567",
        summary: "Results-driven professional with proven track record in delivering exceptional outcomes."
      },
      workExperience: [
        {
          company: "Company Name",
          position: "Job Title",
          startDate: "2020",
          endDate: "Present",
          description: "• Achieved significant results through strategic initiatives\n• Led cross-functional teams to deliver projects on time\n• Improved processes resulting in increased efficiency"
        }
      ],
      education: [
        {
          institution: "University Name",
          degree: "Bachelor's Degree",
          field: "Field of Study",
          graduationYear: "2020"
        }
      ],
      technicalSkills: ["Leadership", "Project Management", "Strategic Planning"],
      softSkills: ["Communication", "Problem Solving", "Team Collaboration"]
    }
  },
  {
    id: "creative-designer",
    name: "Creative Designer",
    category: "Creative",
    industry: ["Design", "Marketing", "Media"],
    level: "mid",
    rating: 4.8,
    downloads: 8921,
    preview: "",
    color: "from-purple-500 to-pink-500",
    icon: Palette,
    description: "Bold, visually striking design for creative professionals",
    data: {
      personalInfo: {
        fullName: "Creative Professional",
        jobTitle: "Senior Designer",
        email: "designer@email.com",
        phone: "(555) 987-6543",
        summary: "Innovative designer with passion for creating compelling visual experiences that drive engagement."
      },
      workExperience: [
        {
          company: "Design Studio",
          position: "Senior Designer",
          startDate: "2019",
          endDate: "Present",
          description: "• Created award-winning designs for major brands\n• Managed creative projects from concept to completion\n• Collaborated with clients to bring visions to life"
        }
      ],
      education: [
        {
          institution: "Art Institute",
          degree: "Bachelor of Fine Arts",
          field: "Graphic Design",
          graduationYear: "2019"
        }
      ],
      technicalSkills: ["Adobe Creative Suite", "Sketch", "Figma", "UI/UX Design"],
      softSkills: ["Creativity", "Visual Communication", "Client Relations"]
    }
  },
  {
    id: "tech-developer",
    name: "Tech Developer",
    category: "Technology",
    industry: ["Technology", "Software", "Startups"],
    level: "senior",
    rating: 4.9,
    downloads: 15234,
    preview: "",
    color: "from-green-500 to-teal-500",
    icon: Code,
    description: "Modern tech-focused template highlighting technical expertise",
    data: {
      personalInfo: {
        fullName: "Software Engineer",
        jobTitle: "Senior Full Stack Developer",
        email: "dev@techcompany.com",
        phone: "(555) 456-7890",
        summary: "Experienced software engineer specializing in scalable web applications and modern development practices."
      },
      workExperience: [
        {
          company: "Tech Company",
          position: "Senior Full Stack Developer",
          startDate: "2018",
          endDate: "Present",
          description: "• Built and maintained high-traffic web applications\n• Led technical architecture decisions for new projects\n• Mentored junior developers and conducted code reviews"
        }
      ],
      education: [
        {
          institution: "Tech University",
          degree: "Bachelor of Science",
          field: "Computer Science",
          graduationYear: "2018"
        }
      ],
      technicalSkills: ["React", "Node.js", "Python", "AWS", "Docker", "PostgreSQL"],
      softSkills: ["Problem Solving", "Team Leadership", "Agile Development"]
    }
  },
  {
    id: "healthcare-professional",
    name: "Healthcare Professional",
    category: "Healthcare",
    industry: ["Healthcare", "Medical", "Nursing"],
    level: "mid",
    rating: 4.7,
    downloads: 6789,
    preview: "",
    color: "from-red-500 to-red-600",
    icon: Heart,
    description: "Professional template designed for healthcare workers",
    data: {
      personalInfo: {
        fullName: "Healthcare Professional",
        jobTitle: "Registered Nurse",
        email: "nurse@hospital.com",
        phone: "(555) 234-5678",
        summary: "Compassionate healthcare professional dedicated to providing exceptional patient care and improving health outcomes."
      },
      workExperience: [
        {
          company: "City Hospital",
          position: "Registered Nurse",
          startDate: "2020",
          endDate: "Present",
          description: "• Provided direct patient care in fast-paced environment\n• Collaborated with medical teams to develop care plans\n• Educated patients and families on health management"
        }
      ],
      education: [
        {
          institution: "Nursing School",
          degree: "Bachelor of Science in Nursing",
          field: "Nursing",
          graduationYear: "2020"
        }
      ],
      technicalSkills: ["Patient Care", "Medical Procedures", "Electronic Health Records"],
      softSkills: ["Compassion", "Communication", "Critical Thinking"]
    }
  },
  {
    id: "marketing-specialist",
    name: "Marketing Specialist",
    category: "Marketing",
    industry: ["Marketing", "Digital", "E-commerce"],
    level: "mid",
    rating: 4.6,
    downloads: 9876,
    preview: "",
    color: "from-orange-500 to-yellow-500",
    icon: TrendingUp,
    description: "Dynamic template perfect for marketing and digital professionals",
    data: {
      personalInfo: {
        fullName: "Marketing Expert",
        jobTitle: "Digital Marketing Manager",
        email: "marketing@company.com",
        phone: "(555) 345-6789",
        summary: "Results-driven marketing professional with expertise in digital campaigns and brand development."
      },
      workExperience: [
        {
          company: "Marketing Agency",
          position: "Digital Marketing Manager",
          startDate: "2019",
          endDate: "Present",
          description: "• Developed and executed successful digital marketing campaigns\n• Increased brand awareness by 150% through strategic initiatives\n• Managed social media presence across multiple platforms"
        }
      ],
      education: [
        {
          institution: "Business School",
          degree: "Bachelor of Business Administration",
          field: "Marketing",
          graduationYear: "2019"
        }
      ],
      technicalSkills: ["Google Analytics", "Social Media Marketing", "SEO/SEM", "Content Strategy"],
      softSkills: ["Creativity", "Data Analysis", "Strategic Thinking"]
    }
  },
  {
    id: "education-teacher",
    name: "Education Professional",
    category: "Education",
    industry: ["Education", "Teaching", "Academia"],
    level: "mid",
    rating: 4.8,
    downloads: 5432,
    preview: "",
    color: "from-indigo-500 to-purple-500",
    icon: GraduationCap,
    description: "Academic-focused template for educators and administrators",
    data: {
      personalInfo: {
        fullName: "Educator",
        jobTitle: "High School Teacher",
        email: "teacher@school.edu",
        phone: "(555) 456-7890",
        summary: "Passionate educator committed to fostering student growth and creating engaging learning environments."
      },
      workExperience: [
        {
          company: "Local High School",
          position: "Mathematics Teacher",
          startDate: "2018",
          endDate: "Present",
          description: "• Taught advanced mathematics to high school students\n• Developed innovative curriculum and teaching methods\n• Mentored students and supported their academic growth"
        }
      ],
      education: [
        {
          institution: "Education University",
          degree: "Master of Education",
          field: "Mathematics Education",
          graduationYear: "2018"
        }
      ],
      technicalSkills: ["Curriculum Development", "Educational Technology", "Assessment Design"],
      softSkills: ["Patience", "Communication", "Adaptability"]
    }
  },
  {
    id: "finance-analyst",
    name: "Finance Analyst",
    category: "Finance",
    industry: ["Finance", "Banking", "Investment"],
    level: "senior",
    rating: 4.7,
    downloads: 7654,
    preview: "",
    color: "from-blue-600 to-indigo-600",
    icon: Calculator,
    description: "Professional template tailored for finance professionals",
    data: {
      personalInfo: {
        fullName: "Finance Professional",
        jobTitle: "Senior Financial Analyst",
        email: "analyst@finance.com",
        phone: "(555) 567-8901",
        summary: "Detail-oriented financial analyst with expertise in investment analysis and risk management."
      },
      workExperience: [
        {
          company: "Investment Firm",
          position: "Senior Financial Analyst",
          startDate: "2017",
          endDate: "Present",
          description: "• Conducted comprehensive financial analysis and valuation models\n• Prepared investment recommendations for portfolio managers\n• Monitored market trends and performed risk assessments"
        }
      ],
      education: [
        {
          institution: "Business University",
          degree: "Master of Business Administration",
          field: "Finance",
          graduationYear: "2017"
        }
      ],
      technicalSkills: ["Financial Modeling", "Excel", "Bloomberg Terminal", "Risk Analysis"],
      softSkills: ["Analytical Thinking", "Attention to Detail", "Communication"]
    }
  },
  {
    id: "sales-executive",
    name: "Sales Executive",
    category: "Sales",
    industry: ["Sales", "Business Development", "Retail"],
    level: "senior",
    rating: 4.5,
    downloads: 8765,
    preview: "",
    color: "from-emerald-500 to-green-600",
    icon: Users,
    description: "Results-focused template for sales and business development",
    data: {
      personalInfo: {
        fullName: "Sales Professional",
        jobTitle: "Senior Sales Executive",
        email: "sales@company.com",
        phone: "(555) 678-9012",
        summary: "High-performing sales executive with proven track record of exceeding targets and building client relationships."
      },
      workExperience: [
        {
          company: "Sales Corporation",
          position: "Senior Sales Executive",
          startDate: "2019",
          endDate: "Present",
          description: "• Exceeded annual sales targets by 125% for three consecutive years\n• Built and maintained relationships with key enterprise clients\n• Developed new business opportunities and expanded market reach"
        }
      ],
      education: [
        {
          institution: "Business College",
          degree: "Bachelor of Business",
          field: "Sales and Marketing",
          graduationYear: "2019"
        }
      ],
      technicalSkills: ["CRM Software", "Sales Analytics", "Negotiation", "Lead Generation"],
      softSkills: ["Persuasion", "Relationship Building", "Resilience"]
    }
  },
  {
    id: "entry-level-graduate",
    name: "Entry Level Graduate",
    category: "Entry Level",
    industry: ["General", "Various"],
    level: "entry",
    rating: 4.4,
    downloads: 12098,
    preview: "",
    color: "from-gray-500 to-gray-600",
    icon: BookOpen,
    description: "Perfect template for recent graduates and entry-level positions",
    data: {
      personalInfo: {
        fullName: "Recent Graduate",
        jobTitle: "Entry Level Professional",
        email: "graduate@email.com",
        phone: "(555) 789-0123",
        summary: "Recent graduate with strong academic background and passion for starting a successful career."
      },
      workExperience: [
        {
          company: "Internship Company",
          position: "Marketing Intern",
          startDate: "2023",
          endDate: "2023",
          description: "• Assisted with social media campaigns and content creation\n• Conducted market research and competitive analysis\n• Supported team with administrative tasks and project coordination"
        }
      ],
      education: [
        {
          institution: "University",
          degree: "Bachelor of Arts",
          field: "Business Administration",
          graduationYear: "2024"
        }
      ],
      technicalSkills: ["Microsoft Office", "Social Media", "Research", "Data Entry"],
      softSkills: ["Eager to Learn", "Team Player", "Strong Work Ethic"]
    }
  },
  {
    id: "executive-ceo",
    name: "Executive Leadership",
    category: "Executive",
    industry: ["Executive", "Management", "Leadership"],
    level: "executive",
    rating: 4.9,
    downloads: 3456,
    preview: "",
    color: "from-slate-700 to-slate-800",
    icon: Briefcase,
    description: "Premium template for C-level executives and senior leadership",
    data: {
      personalInfo: {
        fullName: "Executive Leader",
        jobTitle: "Chief Executive Officer",
        email: "ceo@company.com",
        phone: "(555) 890-1234",
        summary: "Visionary executive leader with 15+ years of experience driving organizational growth and transformation."
      },
      workExperience: [
        {
          company: "Fortune 500 Company",
          position: "Chief Executive Officer",
          startDate: "2020",
          endDate: "Present",
          description: "• Led company through successful digital transformation initiative\n• Increased revenue by 200% over four-year period\n• Built high-performing leadership team and organizational culture"
        }
      ],
      education: [
        {
          institution: "Harvard Business School",
          degree: "Master of Business Administration",
          field: "Executive Leadership",
          graduationYear: "2008"
        }
      ],
      technicalSkills: ["Strategic Planning", "P&L Management", "Board Relations", "M&A"],
      softSkills: ["Visionary Leadership", "Executive Presence", "Decision Making"]
    }
  },
  {
    id: "international-global",
    name: "Global Professional",
    category: "International",
    industry: ["International", "Consulting", "NGO"],
    level: "senior",
    rating: 4.6,
    downloads: 4567,
    preview: "",
    color: "from-teal-500 to-cyan-500",
    icon: Globe,
    description: "Sophisticated template for international and multicultural professionals",
    data: {
      personalInfo: {
        fullName: "Global Professional",
        jobTitle: "International Relations Manager",
        email: "global@international.org",
        phone: "(555) 901-2345",
        summary: "Internationally experienced professional with expertise in cross-cultural communication and global operations."
      },
      workExperience: [
        {
          company: "International Organization",
          position: "International Relations Manager",
          startDate: "2018",
          endDate: "Present",
          description: "• Managed partnerships across 15+ countries and cultures\n• Coordinated international projects and initiatives\n• Facilitated cross-border collaborations and communications"
        }
      ],
      education: [
        {
          institution: "International University",
          degree: "Master of International Relations",
          field: "Global Studies",
          graduationYear: "2018"
        }
      ],
      technicalSkills: ["Cross-Cultural Communication", "Project Management", "Languages", "International Law"],
      softSkills: ["Cultural Sensitivity", "Diplomatic Relations", "Global Perspective"]
    }
  },
  {
    id: "engineering-technical",
    name: "Engineering Professional",
    category: "Engineering",
    industry: ["Engineering", "Manufacturing", "Construction"],
    level: "senior",
    rating: 4.8,
    downloads: 6789,
    preview: "",
    color: "from-amber-500 to-orange-500",
    icon: Wrench,
    description: "Technical template designed for engineers and technical professionals",
    data: {
      personalInfo: {
        fullName: "Engineering Professional",
        jobTitle: "Senior Mechanical Engineer",
        email: "engineer@company.com",
        phone: "(555) 012-3456",
        summary: "Experienced mechanical engineer with expertise in product design and manufacturing optimization."
      },
      workExperience: [
        {
          company: "Engineering Firm",
          position: "Senior Mechanical Engineer",
          startDate: "2017",
          endDate: "Present",
          description: "• Designed and developed innovative mechanical systems\n• Led product development from concept through manufacturing\n• Improved efficiency and reduced costs through design optimization"
        }
      ],
      education: [
        {
          institution: "Engineering University",
          degree: "Bachelor of Science",
          field: "Mechanical Engineering",
          graduationYear: "2017"
        }
      ],
      technicalSkills: ["CAD Software", "Product Design", "Manufacturing", "Quality Control"],
      softSkills: ["Problem Solving", "Technical Communication", "Project Management"]
    }
  },
  {
    id: "legal-attorney",
    name: "Legal Professional",
    category: "Legal",
    industry: ["Legal", "Law", "Compliance"],
    level: "senior",
    rating: 4.7,
    downloads: 3890,
    preview: "",
    color: "from-red-600 to-rose-600",
    icon: Gavel,
    description: "Professional template for lawyers and legal professionals",
    data: {
      personalInfo: {
        fullName: "Legal Professional",
        jobTitle: "Senior Associate Attorney",
        email: "attorney@lawfirm.com",
        phone: "(555) 123-4567",
        summary: "Experienced attorney specializing in corporate law with a track record of successful case outcomes."
      },
      workExperience: [
        {
          company: "Law Firm",
          position: "Senior Associate Attorney",
          startDate: "2018",
          endDate: "Present",
          description: "• Represented corporate clients in complex litigation matters\n• Drafted and negotiated commercial contracts and agreements\n• Provided legal counsel on regulatory compliance issues"
        }
      ],
      education: [
        {
          institution: "Law School",
          degree: "Juris Doctor",
          field: "Corporate Law",
          graduationYear: "2018"
        }
      ],
      technicalSkills: ["Legal Research", "Contract Negotiation", "Litigation", "Compliance"],
      softSkills: ["Analytical Thinking", "Persuasive Communication", "Client Relations"]
    }
  },
  {
    id: "media-journalist",
    name: "Media Professional",
    category: "Media",
    industry: ["Media", "Journalism", "Communications"],
    level: "mid",
    rating: 4.5,
    downloads: 5432,
    preview: "",
    color: "from-violet-500 to-purple-600",
    icon: Camera,
    description: "Creative template for media professionals and journalists",
    data: {
      personalInfo: {
        fullName: "Media Professional",
        jobTitle: "Senior Journalist",
        email: "journalist@news.com",
        phone: "(555) 234-5678",
        summary: "Award-winning journalist with expertise in investigative reporting and multimedia storytelling."
      },
      workExperience: [
        {
          company: "News Organization",
          position: "Senior Journalist",
          startDate: "2019",
          endDate: "Present",
          description: "• Investigated and reported on major news stories\n• Produced multimedia content across digital platforms\n• Conducted interviews with high-profile subjects"
        }
      ],
      education: [
        {
          institution: "Journalism School",
          degree: "Bachelor of Arts",
          field: "Journalism",
          graduationYear: "2019"
        }
      ],
      technicalSkills: ["Investigative Reporting", "Digital Media", "Video Production", "Social Media"],
      softSkills: ["Storytelling", "Research Skills", "Communication"]
    }
  },
  {
    id: "startup-entrepreneur",
    name: "Startup Founder",
    category: "Entrepreneurship",
    industry: ["Startup", "Technology", "Innovation"],
    level: "executive",
    rating: 4.8,
    downloads: 7890,
    preview: "",
    color: "from-pink-500 to-rose-500",
    icon: TrendingUp,
    description: "Bold template for entrepreneurs and startup founders",
    data: {
      personalInfo: {
        fullName: "Startup Founder",
        jobTitle: "CEO & Founder",
        email: "founder@startup.com",
        phone: "(555) 345-6789",
        summary: "Serial entrepreneur with track record of building successful startups from concept to exit."
      },
      workExperience: [
        {
          company: "Tech Startup",
          position: "CEO & Founder",
          startDate: "2020",
          endDate: "Present",
          description: "• Founded and scaled tech startup to $10M+ revenue\n• Raised $5M in Series A funding from top-tier VCs\n• Built high-performing team of 50+ employees"
        }
      ],
      education: [
        {
          institution: "Entrepreneurship Program",
          degree: "Master of Business Administration",
          field: "Entrepreneurship",
          graduationYear: "2020"
        }
      ],
      technicalSkills: ["Business Development", "Fundraising", "Product Strategy", "Team Building"],
      softSkills: ["Vision", "Leadership", "Risk Taking", "Innovation"]
    }
  }
];

// Full Resume Preview Modal Component
const FullResumePreview = ({ template, onClose, onSelectTemplate }: { template: Template; onClose: () => void; onSelectTemplate: (data: any) => void; }) => {
  const getFullPreviewLayout = () => {
    switch (template.category) {
      case "Creative":
        return (
          <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 p-8 min-h-screen">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">SW</span>
              </div>
              <h1 className="text-4xl font-bold text-purple-800 mb-2">{template.data.personalInfo.fullName}</h1>
              <h2 className="text-2xl text-purple-600 mb-4">{template.data.personalInfo.jobTitle}</h2>
              <div className="flex justify-center space-x-6 text-purple-700">
                <span>{template.data.personalInfo.email}</span>
                <span>{template.data.personalInfo.phone}</span>
              </div>
            </div>
            
            <div className="flex space-x-8">
              {/* Left Column */}
              <div className="w-1/3 space-y-6">
                {/* Contact */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-purple-700 mb-3 border-b border-purple-200 pb-2">CONTACT</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>📧 {template.data.personalInfo.email}</div>
                    <div>📱 {template.data.personalInfo.phone}</div>
                    <div>📍 City, State</div>
                    <div>🌐 portfolio.com</div>
                  </div>
                </div>
                
                {/* Skills */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-pink-700 mb-3 border-b border-pink-200 pb-2">SKILLS</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-purple-600 text-sm mb-2">Technical</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.data.technicalSkills.map((skill: string, index: number) => (
                          <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-pink-600 text-sm mb-2">Soft Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.data.softSkills.map((skill: string, index: number) => (
                          <span key={index} className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="w-2/3 space-y-6">
                {/* Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-purple-800 mb-4">PROFESSIONAL SUMMARY</h3>
                  <p className="text-gray-700 leading-relaxed">{template.data.personalInfo.summary}</p>
                </div>
                
                {/* Experience */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-purple-800 mb-4">EXPERIENCE</h3>
                  {template.data.workExperience.map((exp: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <h4 className="text-lg font-semibold text-purple-700">{exp.position}</h4>
                      <h5 className="text-md font-medium text-pink-600 mb-1">{exp.company}</h5>
                      <p className="text-sm text-gray-600 mb-2">{exp.startDate} - {exp.endDate}</p>
                      <div className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</div>
                    </div>
                  ))}
                </div>
                
                {/* Education */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-purple-800 mb-4">EDUCATION</h3>
                  {template.data.education.map((edu: any, index: number) => (
                    <div key={index}>
                      <h4 className="text-lg font-semibold text-purple-700">{edu.degree}</h4>
                      <h5 className="text-md text-pink-600">{edu.institution}</h5>
                      <p className="text-sm text-gray-600">{edu.field} • {edu.graduationYear}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case "Technology":
        return (
          <div className="w-full max-w-4xl mx-auto bg-gray-900 text-white p-8 min-h-screen">
            {/* Header */}
            <div className="mb-8 border-b border-gray-700 pb-6">
              <h1 className="text-4xl font-bold text-green-400 mb-2">{template.data.personalInfo.fullName}</h1>
              <h2 className="text-2xl text-gray-300 mb-4">{template.data.personalInfo.jobTitle}</h2>
              <div className="flex space-x-6 text-gray-400">
                <span>✉ {template.data.personalInfo.email}</span>
                <span>📱 {template.data.personalInfo.phone}</span>
                <span>🔗 github.com/username</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="col-span-2 space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-xl font-bold text-teal-400 mb-4 border-l-4 border-green-400 pl-4">SUMMARY</h3>
                  <p className="text-gray-300 leading-relaxed">{template.data.personalInfo.summary}</p>
                </div>
                
                {/* Experience */}
                <div>
                  <h3 className="text-xl font-bold text-teal-400 mb-4 border-l-4 border-green-400 pl-4">EXPERIENCE</h3>
                  {template.data.workExperience.map((exp: any, index: number) => (
                    <div key={index} className="mb-6 last:mb-0 bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-green-300">{exp.position}</h4>
                      <h5 className="text-md text-teal-300 mb-1">{exp.company}</h5>
                      <p className="text-sm text-gray-400 mb-3">{exp.startDate} - {exp.endDate}</p>
                      <div className="text-sm text-gray-300 whitespace-pre-line">{exp.description}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Skills */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-green-400 mb-4">TECHNICAL SKILLS</h3>
                  <div className="space-y-2">
                    {template.data.technicalSkills.map((skill: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                        <span className="text-gray-300 text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Education */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-green-400 mb-4">EDUCATION</h3>
                  {template.data.education.map((edu: any, index: number) => (
                    <div key={index}>
                      <h4 className="text-md font-semibold text-green-300">{edu.degree}</h4>
                      <h5 className="text-sm text-teal-300">{edu.institution}</h5>
                      <p className="text-xs text-gray-400">{edu.field} • {edu.graduationYear}</p>
                    </div>
                  ))}
                </div>
                
                {/* Soft Skills */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-green-400 mb-4">SOFT SKILLS</h3>
                  <div className="space-y-1">
                    {template.data.softSkills.map((skill: string, index: number) => (
                      <span key={index} className="block text-gray-300 text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-full max-w-4xl mx-auto bg-white p-8 min-h-screen border border-gray-200">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
              <h1 className="text-4xl font-bold text-blue-900 mb-2">{template.data.personalInfo.fullName}</h1>
              <h2 className="text-2xl text-blue-700 mb-4">{template.data.personalInfo.jobTitle}</h2>
              <div className="flex justify-center space-x-6 text-blue-600">
                <span>{template.data.personalInfo.email}</span>
                <span>{template.data.personalInfo.phone}</span>
                <span>LinkedIn.com/in/profile</span>
              </div>
            </div>
            
            {/* Summary */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">PROFESSIONAL SUMMARY</h3>
              <p className="text-gray-700 leading-relaxed">{template.data.personalInfo.summary}</p>
            </div>
            
            {/* Experience */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">PROFESSIONAL EXPERIENCE</h3>
              {template.data.workExperience.map((exp: any, index: number) => (
                <div key={index} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-blue-800">{exp.position}</h4>
                      <h5 className="text-md font-medium text-blue-600">{exp.company}</h5>
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-line ml-4">{exp.description}</div>
                </div>
              ))}
            </div>
            
            {/* Education & Skills */}
            <div className="grid grid-cols-2 gap-8">
              {/* Education */}
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">EDUCATION</h3>
                {template.data.education.map((edu: any, index: number) => (
                  <div key={index} className="mb-4">
                    <h4 className="text-lg font-semibold text-blue-800">{edu.degree}</h4>
                    <h5 className="text-md text-blue-600">{edu.institution}</h5>
                    <p className="text-sm text-gray-600">{edu.field} • Class of {edu.graduationYear}</p>
                  </div>
                ))}
              </div>
              
              {/* Skills */}
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">CORE COMPETENCIES</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.data.technicalSkills.map((skill: string, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.data.softSkills.map((skill: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center`}>
              <template.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{template.name} Preview</h2>
              <p className="text-sm text-gray-600">{template.category} • {template.level}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => onSelectTemplate(template.data)}>
              <FileText className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          {getFullPreviewLayout()}
        </div>
      </div>
    </div>
  );
};

const ResumePreview = ({ template }: { template: Template }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    // Fallback to icon-based preview if image fails to load
    return (
      <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center p-4">
          <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center mx-auto mb-3`}>
            <template.icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{template.name}</h3>
          <p className="text-sm text-gray-600">{template.category}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white border rounded-lg shadow-sm overflow-hidden">
      <img 
        src={template.preview} 
        alt={`${template.name} resume template preview`}
        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={handleImageError}
      />
    </div>
  );
};

interface EnhancedTemplatesProps {
  onSelectTemplate: (data: any) => void;
}

export const EnhancedTemplates = ({ onSelectTemplate }: EnhancedTemplatesProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isTailoringDialogOpen, setIsTailoringDialogOpen] = useState(false);
  const [selectedTemplateData, setSelectedTemplateData] = useState<any>(null);

  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))];
  const levels = [
    { value: "all", label: "All Levels" },
    { value: "entry", label: "Entry (<2 years)" },
    { value: "mid", label: "Mid (2-5 years)" },
    { value: "senior", label: "Senior (5-10 years)" },
    { value: "executive", label: "Executive (>10 years)" },
  ];
  const industries = ["all", ...Array.from(new Set(templates.flatMap(t => t.industry)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || template.level === selectedLevel;
    const matchesIndustry = selectedIndustry === "all" || template.industry.includes(selectedIndustry);

    return matchesSearch && matchesCategory && matchesLevel && matchesIndustry;
  });

  const handleUseTemplateClick = (data: any) => {
    setSelectedTemplateData(data);
    setIsTailoringDialogOpen(true);
  };

  const handleTailoringConfirm = (file: File, industry: string) => {
    console.log("Tailoring confirmed:", { file, industry, selectedTemplateData });
    // Here you would typically handle the file upload and then create the resume
    // For now, we'll just pass the template data to the parent component
    onSelectTemplate(selectedTemplateData);
    setIsTailoringDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Resume Templates</h1>
        <p className="text-gray-600">Choose from our collection of ATS-friendly, industry-specific templates</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:col-span-2"
          />
          
          

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger>
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry === "all" ? "All Industries" : industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            {/* Resume Preview */}
            <div className="p-4 pb-0">
              <ResumePreview template={template} />
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center`}>
                    <template.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.level}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{template.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.rating}</span>
                </div>
                <span>{template.downloads.toLocaleString()} downloads</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {template.industry.slice(0, 2).map(industry => (
                  <Badge key={industry} variant="outline" className="text-xs">
                    {industry}
                  </Badge>
                ))}
                {template.industry.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.industry.length - 2}
                  </Badge>
                )}
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUseTemplateClick(template.data)}
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewTemplate && (
        <FullResumePreview 
          template={previewTemplate} 
          onClose={() => setPreviewTemplate(null)} 
          onSelectTemplate={onSelectTemplate}
        />
      )}

      <TailoringDialog
        isOpen={isTailoringDialogOpen}
        onClose={() => setIsTailoringDialogOpen(false)}
        onConfirm={handleTailoringConfirm}
      />
    </div>
  );
};

export default EnhancedTemplates;