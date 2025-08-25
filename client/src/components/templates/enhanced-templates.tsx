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
      title: "Modern Professional Resume",
      name: "Your Name",
      email: "email@example.com",
      phone_number: "(555) 123-4567",
      summary: "Results-driven professional with proven track record in delivering exceptional outcomes.",
      skills: ["Leadership", "Project Management", "Strategic Planning", "Communication", "Problem Solving"],
      interests: ["Professional Development", "Innovation", "Team Building"],
      languages: ["English (Native)"],
      external_links: ["LinkedIn: linkedin.com/in/yourname"],
      education_entries: [
        {
          college: "University Name",
          degree: "Bachelor's Degree",
          start_year: 2016,
          end_year: 2020,
          cgpa: null
        }
      ],
      work_experiences: [
        {
          company_name: "Company Name",
          company_description: "Leading technology company",
          location: "New York, NY",
          duration: "2020 - Present",
          designation: "Senior Analyst",
          designation_description: "Senior professional role",
          projects: [
            {
              project_name: "Strategic Initiative",
              project_description: "Led cross-functional project",
              description_bullets: [
                "Achieved significant results through strategic initiatives",
                "Led cross-functional teams to deliver projects on time",
                "Improved processes resulting in increased efficiency"
              ]
            }
          ]
        }
      ],
      internships: [],
      achievements: [],
      positions_of_responsibility: [],
      extra_curriculars: [],
      certifications: [],
      academic_projects: []
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
      title: "Creative Designer Resume",
      name: "Creative Professional",
      email: "designer@email.com",
      phone_number: "(555) 987-6543",
      summary: "Innovative designer with passion for creating compelling visual experiences that drive engagement.",
      skills: ["Adobe Creative Suite", "Sketch", "Figma", "UI/UX Design", "Creativity", "Visual Communication"],
      interests: ["Digital Art", "Typography", "Brand Identity"],
      languages: ["English (Native)", "Spanish (Conversational)"],
      external_links: ["Portfolio: portfolio.com", "Dribbble: dribbble.com/designer"],
      education_entries: [
        {
          college: "Art Institute",
          degree: "Bachelor of Fine Arts",
          start_year: 2015,
          end_year: 2019,
          cgpa: null
        }
      ],
      work_experiences: [
        {
          company_name: "Design Studio",
          company_description: "Creative design agency specializing in brand identity",
          location: "Los Angeles, CA",
          duration: "2019 - Present",
          designation: "Senior Designer",
          designation_description: "Lead designer for major client projects",
          projects: [
            {
              project_name: "Brand Redesign Campaign",
              project_description: "Complete brand overhaul for Fortune 500 client",
              description_bullets: [
                "Created award-winning designs for major brands",
                "Managed creative projects from concept to completion",
                "Collaborated with clients to bring visions to life"
              ]
            }
          ]
        }
      ],
      internships: [],
      achievements: [
        {
          title: "Design Excellence Award",
          awarding_body: "Creative Industry Association",
          year: 2021,
          description: "Recognized for outstanding creative work"
        }
      ],
      positions_of_responsibility: [],
      extra_curriculars: [],
      certifications: [],
      academic_projects: []
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
      title: "Senior Full Stack Developer Resume",
      name: "Software Engineer",
      email: "dev@techcompany.com",
      phone_number: "(555) 456-7890",
      summary: "Experienced software engineer specializing in scalable web applications and modern development practices.",
      skills: ["React", "Node.js", "Python", "AWS", "Docker", "PostgreSQL", "Problem Solving", "Team Leadership"],
      interests: ["Open Source", "Machine Learning", "Cloud Architecture"],
      languages: ["English (Native)", "Python (Expert)", "JavaScript (Expert)"],
      external_links: ["GitHub: github.com/developer", "LinkedIn: linkedin.com/in/developer"],
      education_entries: [
        {
          college: "Tech University",
          degree: "Bachelor of Science",
          start_year: 2014,
          end_year: 2018,
          cgpa: 3.8
        }
      ],
      work_experiences: [
        {
          company_name: "Tech Company",
          company_description: "Leading SaaS platform company",
          location: "San Francisco, CA",
          duration: "2018 - Present",
          designation: "Senior Full Stack Developer",
          designation_description: "Lead developer for core platform features",
          projects: [
            {
              project_name: "Microservices Architecture Migration",
              project_description: "Led migration from monolithic to microservices architecture",
              description_bullets: [
                "Built and maintained high-traffic web applications",
                "Led technical architecture decisions for new projects",
                "Mentored junior developers and conducted code reviews"
              ]
            }
          ]
        }
      ],
      internships: [],
      achievements: [
        {
          title: "Technical Excellence Award",
          awarding_body: "Tech Company",
          year: 2020,
          description: "Recognized for outstanding technical contributions"
        }
      ],
      positions_of_responsibility: [],
      extra_curriculars: [],
      certifications: [
        {
          certification: "AWS Solutions Architect",
          description: "Cloud architecture and deployment",
          issuing_organization: "Amazon Web Services",
          time_of_certification: 2019
        }
      ],
      academic_projects: [
        {
          project_name: "Real-time Chat Application",
          project_description: "Full-stack chat application with WebSocket support",
          description_bullets: [
            "Implemented real-time messaging with Socket.io",
            "Built responsive UI with React and Redux",
            "Deployed on AWS with Docker containers"
          ],
          duration: "3 months"
        }
      ]
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
      title: "Healthcare Professional Resume",
      name: "Healthcare Professional",
      email: "nurse@hospital.com",
      phone_number: "(555) 234-5678",
      summary: "Compassionate healthcare professional dedicated to providing exceptional patient care and improving health outcomes.",
      skills: ["Patient Care", "Medical Procedures", "Electronic Health Records", "Compassion", "Communication", "Critical Thinking"],
      interests: ["Patient Advocacy", "Medical Research", "Community Health"],
      languages: ["English (Native)", "Spanish (Conversational)"],
      external_links: ["LinkedIn: linkedin.com/in/nurse"],
      education_entries: [
        {
          college: "Nursing School",
          degree: "Bachelor of Science in Nursing",
          start_year: 2016,
          end_year: 2020,
          cgpa: 3.7
        }
      ],
      work_experiences: [
        {
          company_name: "City Hospital",
          company_description: "Major metropolitan hospital",
          location: "Chicago, IL",
          duration: "2020 - Present",
          designation: "Registered Nurse",
          designation_description: "ICU nursing specialist",
          projects: [
            {
              project_name: "Patient Care Excellence Initiative",
              project_description: "Led quality improvement in patient care",
              description_bullets: [
                "Provided direct patient care in fast-paced environment",
                "Collaborated with medical teams to develop care plans",
                "Educated patients and families on health management"
              ]
            }
          ]
        }
      ],
      internships: [
        {
          company_name: "Regional Medical Center",
          company_description: "Teaching hospital",
          location: "Chicago, IL",
          designation: "Nursing Student",
          designation_description: "Clinical rotation",
          duration: "2019 - 2020",
          internship_work_description_bullets: [
            "Completed clinical rotations in multiple departments",
            "Assisted with patient care under supervision",
            "Gained experience in medical procedures"
          ]
        }
      ],
      achievements: [],
      positions_of_responsibility: [],
      extra_curriculars: [],
      certifications: [
        {
          certification: "RN License",
          description: "Registered Nurse License",
          issuing_organization: "Illinois Board of Nursing",
          time_of_certification: 2020
        }
      ],
      academic_projects: []
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
      title: "Digital Marketing Manager Resume",
      name: "Marketing Expert",
      email: "marketing@company.com",
      phone_number: "(555) 345-6789",
      summary: "Results-driven marketing professional with expertise in digital campaigns and brand development.",
      skills: ["Google Analytics", "Social Media Marketing", "SEO/SEM", "Content Strategy", "Creativity", "Data Analysis"],
      interests: ["Digital Trends", "Content Creation", "Brand Strategy"],
      languages: ["English (Native)"],
      external_links: ["LinkedIn: linkedin.com/in/marketer", "Portfolio: marketing-portfolio.com"],
      education_entries: [
        {
          college: "Business School",
          degree: "Bachelor of Business Administration",
          start_year: 2015,
          end_year: 2019,
          cgpa: null
        }
      ],
      work_experiences: [
        {
          company_name: "Marketing Agency",
          company_description: "Full-service digital marketing agency",
          location: "Austin, TX",
          duration: "2019 - Present",
          designation: "Digital Marketing Manager",
          designation_description: "Lead marketing campaigns for clients",
          projects: [
            {
              project_name: "Brand Awareness Campaign",
              project_description: "Multi-channel marketing campaign",
              description_bullets: [
                "Developed and executed successful digital marketing campaigns",
                "Increased brand awareness by 150% through strategic initiatives",
                "Managed social media presence across multiple platforms"
              ]
            }
          ]
        }
      ],
      internships: [],
      achievements: [],
      positions_of_responsibility: [],
      extra_curriculars: [],
      certifications: [
        {
          certification: "Google Analytics Certified",
          description: "Web analytics certification",
          issuing_organization: "Google",
          time_of_certification: 2020
        }
      ],
      academic_projects: []
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
      title: "Recent Graduate Resume",
      name: "Recent Graduate",
      email: "graduate@email.com",
      phone_number: "(555) 789-0123",
      summary: "Recent graduate with strong academic background and passion for starting a successful career.",
      skills: ["Microsoft Office", "Social Media", "Research", "Data Entry", "Communication", "Team Collaboration"],
      interests: ["Professional Development", "Technology", "Volunteering"],
      languages: ["English (Native)"],
      external_links: ["LinkedIn: linkedin.com/in/graduate"],
      education_entries: [
        {
          college: "University",
          degree: "Bachelor of Arts",
          start_year: 2020,
          end_year: 2024,
          cgpa: 3.5
        }
      ],
      work_experiences: [],
      internships: [
        {
          company_name: "Internship Company",
          company_description: "Marketing agency",
          location: "Boston, MA",
          designation: "Marketing Intern",
          designation_description: "Summer internship program",
          duration: "Summer 2023",
          internship_work_description_bullets: [
            "Assisted with social media campaigns and content creation",
            "Conducted market research and competitive analysis",
            "Supported team with administrative tasks and project coordination"
          ]
        }
      ],
      achievements: [
        {
          title: "Dean's List",
          awarding_body: "University",
          year: 2023,
          description: "Academic excellence recognition"
        }
      ],
      positions_of_responsibility: [
        {
          role: "Student Body Representative",
          role_description: "Elected representative for student affairs",
          organization: "University Student Government",
          organization_description: "Student governing body",
          location: "University Campus",
          duration: "2022 - 2024",
          responsibilities: [
            "Represented student interests in university meetings",
            "Organized student events and activities",
            "Facilitated communication between students and administration"
          ]
        }
      ],
      extra_curriculars: [
        {
          activity: "Debate Club",
          position: "Secretary",
          description: "Organized club meetings and competitions",
          year: 2022
        }
      ],
      certifications: [],
      academic_projects: [
        {
          project_name: "Senior Capstone Project",
          project_description: "Independent research project",
          description_bullets: [
            "Conducted comprehensive research on market trends",
            "Presented findings to faculty committee",
            "Received honors recognition for project"
          ],
          duration: "Fall 2023"
        }
      ]
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
      title: "Senior Financial Analyst Resume",
      name: "Finance Professional",
      email: "analyst@finance.com",
      phone_number: "(555) 567-8901",
      summary: "Detail-oriented financial analyst with expertise in investment analysis and risk management.",
      skills: ["Financial Modeling", "Excel", "Bloomberg Terminal", "Risk Analysis", "Analytical Thinking", "Communication"],
      interests: ["Market Analysis", "Investment Strategy", "Financial Innovation"],
      languages: ["English (Native)"],
      external_links: ["LinkedIn: linkedin.com/in/analyst"],
      education_entries: [
        {
          college: "Business University",
          degree: "Master of Business Administration",
          start_year: 2015,
          end_year: 2017,
          cgpa: null
        }
      ],
      work_experiences: [
        {
          company_name: "Investment Firm",
          company_description: "Leading investment management company",
          location: "New York, NY",
          duration: "2017 - Present",
          designation: "Senior Financial Analyst",
          designation_description: "Investment analysis and portfolio management",
          projects: [
            {
              project_name: "Portfolio Optimization Model",
              project_description: "Developed comprehensive financial models",
              description_bullets: [
                "Conducted comprehensive financial analysis and valuation models",
                "Prepared investment recommendations for portfolio managers",
                "Monitored market trends and performed risk assessments"
              ]
            }
          ]
        }
      ],
      internships: [],
      achievements: [],
      positions_of_responsibility: [],
      extra_curriculars: [],
      certifications: [
        {
          certification: "CFA Charter",
          description: "Chartered Financial Analyst",
          issuing_organization: "CFA Institute",
          time_of_certification: 2018
        }
      ],
      academic_projects: []
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
      title: "Senior Sales Executive Resume",
      name: "Sales Professional",
      email: "sales@company.com",
      phone_number: "(555) 678-9012",
      summary: "High-performing sales executive with proven track record of exceeding targets and building client relationships.",
      skills: ["CRM Software", "Sales Analytics", "Negotiation", "Lead Generation", "Relationship Building", "Communication"],
      interests: ["Business Development", "Client Relations", "Sales Strategy"],
      languages: ["English (Native)"],
      external_links: ["LinkedIn: linkedin.com/in/sales"],
      education_entries: [
        {
          college: "Business College",
          degree: "Bachelor of Business",
          start_year: 2015,
          end_year: 2019,
          cgpa: null
        }
      ],
      work_experiences: [
        {
          company_name: "Sales Corporation",
          company_description: "B2B software sales company",
          location: "Denver, CO",
          duration: "2019 - Present",
          designation: "Senior Sales Executive",
          designation_description: "Enterprise sales and account management",
          projects: [
            {
              project_name: "Enterprise Client Expansion",
              project_description: "Led major client acquisition initiative",
              description_bullets: [
                "Exceeded annual sales targets by 125% for three consecutive years",
                "Built and maintained relationships with key enterprise clients",
                "Developed new business opportunities and expanded market reach"
              ]
            }
          ]
        }
      ],
      internships: [],
      achievements: [
        {
          title: "Top Performer Award",
          awarding_body: "Sales Corporation",
          year: 2021,
          description: "Highest sales performance company-wide"
        }
      ],
      positions_of_responsibility: [],
      extra_curriculars: [],
      certifications: [],
      academic_projects: []
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
      title: "Chief Executive Officer Resume",
      name: "Executive Leader",
      email: "ceo@company.com",
      phone_number: "(555) 890-1234",
      summary: "Visionary executive leader with 15+ years of experience driving organizational growth and transformation.",
      skills: ["Strategic Planning", "P&L Management", "Board Relations", "M&A", "Leadership", "Executive Presence"],
      interests: ["Strategic Innovation", "Organizational Development", "Industry Leadership"],
      languages: ["English (Native)"],
      external_links: ["LinkedIn: linkedin.com/in/ceo", "Company: company.com"],
      education_entries: [
        {
          college: "Harvard Business School",
          degree: "Master of Business Administration",
          start_year: 2006,
          end_year: 2008,
          cgpa: null
        }
      ],
      work_experiences: [
        {
          company_name: "Fortune 500 Company",
          company_description: "Global technology and consulting company",
          location: "New York, NY",
          duration: "2020 - Present",
          designation: "Chief Executive Officer",
          designation_description: "Executive leadership and strategic direction",
          projects: [
            {
              project_name: "Digital Transformation Initiative",
              project_description: "Company-wide digital modernization",
              description_bullets: [
                "Led company through successful digital transformation initiative",
                "Increased revenue by 200% over four-year period",
                "Built high-performing leadership team and organizational culture"
              ]
            }
          ]
        }
      ],
      internships: [],
      achievements: [
        {
          title: "CEO of the Year",
          awarding_body: "Industry Leadership Council",
          year: 2022,
          description: "Recognition for outstanding executive leadership"
        }
      ],
      positions_of_responsibility: [
        {
          role: "Board Member",
          role_description: "Strategic advisor and board member",
          organization: "Tech Innovation Council",
          organization_description: "Industry advisory board",
          location: "Silicon Valley, CA",
          duration: "2018 - Present",
          responsibilities: [
            "Provide strategic guidance on industry trends",
            "Mentor emerging technology companies",
            "Advise on investment and growth strategies"
          ]
        }
      ],
      extra_curriculars: [],
      certifications: [],
      academic_projects: []
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
              <h1 className="text-4xl font-bold text-purple-800 mb-2">{template.data.name}</h1>
              <h2 className="text-2xl text-purple-600 mb-4">{template.data.work_experiences[0]?.designation || "Professional"}</h2>
              <div className="flex justify-center space-x-6 text-purple-700">
                <span>{template.data.email}</span>
                <span>{template.data.phone_number}</span>
              </div>
            </div>
            
            <div className="flex space-x-8">
              {/* Left Column */}
              <div className="w-1/3 space-y-6">
                {/* Contact */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-purple-700 mb-3 border-b border-purple-200 pb-2">CONTACT</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>{template.data.email}</div>
                    <div>{template.data.phone_number}</div>
                    <div>{template.data.work_experiences[0]?.location || "City, State"}</div>
                    {template.data.external_links.map((link: string, index: number) => (
                      <div key={index}>{link}</div>
                    ))}
                  </div>
                </div>
                
                {/* Skills */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-pink-700 mb-3 border-b border-pink-200 pb-2">SKILLS</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-purple-600 text-sm mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.data.skills.map((skill: string, index: number) => (
                          <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-pink-600 text-sm mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.data.languages.map((lang: string, index: number) => (
                          <span key={index} className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">{lang}</span>
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
                  <p className="text-gray-700 leading-relaxed">{template.data.summary}</p>
                </div>
                
                {/* Experience */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-purple-800 mb-4">EXPERIENCE</h3>
                  {template.data.work_experiences.map((exp: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <h4 className="text-lg font-semibold text-purple-700">{exp.designation}</h4>
                      <h5 className="text-md font-medium text-pink-600 mb-1">{exp.company_name}</h5>
                      <p className="text-sm text-gray-600 mb-2">{exp.duration}</p>
                      {exp.projects.map((project: any, projIndex: number) => (
                        <div key={projIndex} className="text-sm text-gray-700">
                          {project.description_bullets.map((bullet: string, bulletIndex: number) => (
                            <div key={bulletIndex}>• {bullet}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Education */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-purple-800 mb-4">EDUCATION</h3>
                  {template.data.education_entries.map((edu: any, index: number) => (
                    <div key={index}>
                      <h4 className="text-lg font-semibold text-purple-700">{edu.degree}</h4>
                      <h5 className="text-md text-pink-600">{edu.college}</h5>
                      <p className="text-sm text-gray-600">{edu.start_year} - {edu.end_year}</p>
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
              <h1 className="text-4xl font-bold text-green-400 mb-2">{template.data.name}</h1>
              <h2 className="text-2xl text-gray-300 mb-4">{template.data.work_experiences[0]?.designation || "Software Engineer"}</h2>
              <div className="flex space-x-6 text-gray-400">
                <span>{template.data.email}</span>
                <span>{template.data.phone_number}</span>
                {template.data.external_links.map((link: string, index: number) => (
                  <span key={index}>{link}</span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="col-span-2 space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-xl font-bold text-teal-400 mb-4 border-l-4 border-green-400 pl-4">SUMMARY</h3>
                  <p className="text-gray-300 leading-relaxed">{template.data.summary}</p>
                </div>
                
                {/* Experience */}
                <div>
                  <h3 className="text-xl font-bold text-teal-400 mb-4 border-l-4 border-green-400 pl-4">EXPERIENCE</h3>
                  {template.data.work_experiences.map((exp: any, index: number) => (
                    <div key={index} className="mb-6 last:mb-0 bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-green-300">{exp.designation}</h4>
                      <h5 className="text-md text-teal-300 mb-1">{exp.company_name}</h5>
                      <p className="text-sm text-gray-400 mb-3">{exp.duration}</p>
                      {exp.projects.map((project: any, projIndex: number) => (
                        <div key={projIndex} className="text-sm text-gray-300">
                          {project.description_bullets.map((bullet: string, bulletIndex: number) => (
                            <div key={bulletIndex}>• {bullet}</div>
                          ))}
                        </div>
                      ))}
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
                    {template.data.skills.map((skill: string, index: number) => (
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
                  {template.data.education_entries.map((edu: any, index: number) => (
                    <div key={index}>
                      <h4 className="text-md font-semibold text-green-300">{edu.degree}</h4>
                      <h5 className="text-sm text-teal-300">{edu.college}</h5>
                      <p className="text-xs text-gray-400">{edu.start_year} - {edu.end_year}</p>
                    </div>
                  ))}
                </div>
                
                {/* Languages */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-green-400 mb-4">LANGUAGES</h3>
                  <div className="space-y-1">
                    {template.data.languages.map((lang: string, index: number) => (
                      <span key={index} className="block text-gray-300 text-sm">{lang}</span>
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
              <h1 className="text-4xl font-bold text-blue-900 mb-2">{template.data.name}</h1>
              <h2 className="text-2xl text-blue-700 mb-4">{template.data.work_experiences[0]?.designation || "Professional"}</h2>
              <div className="flex justify-center space-x-6 text-blue-600">
                <span>{template.data.email}</span>
                <span>{template.data.phone_number}</span>
                {template.data.external_links.slice(0, 1).map((link: string, index: number) => (
                  <span key={index}>{link}</span>
                ))}
              </div>
            </div>
            
            {/* Summary */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">PROFESSIONAL SUMMARY</h3>
              <p className="text-gray-700 leading-relaxed">{template.data.summary}</p>
            </div>
            
            {/* Experience */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">PROFESSIONAL EXPERIENCE</h3>
              {template.data.work_experiences.map((exp: any, index: number) => (
                <div key={index} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-blue-800">{exp.designation}</h4>
                      <h5 className="text-md font-medium text-blue-600">{exp.company_name}</h5>
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">{exp.duration}</span>
                  </div>
                  {exp.projects.map((project: any, projIndex: number) => (
                    <div key={projIndex} className="text-sm text-gray-700 ml-4">
                      {project.description_bullets.map((bullet: string, bulletIndex: number) => (
                        <div key={bulletIndex}>• {bullet}</div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Internships */}
            {template.data.internships && template.data.internships.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">INTERNSHIPS</h3>
                {template.data.internships.map((internship: any, index: number) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-800">{internship.designation}</h4>
                        <h5 className="text-md font-medium text-blue-600">{internship.company_name}</h5>
                      </div>
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">{internship.duration}</span>
                    </div>
                    <div className="text-sm text-gray-700 ml-4">
                      {internship.internship_work_description_bullets.map((bullet: string, bulletIndex: number) => (
                        <div key={bulletIndex}>• {bullet}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Academic Projects */}
            {template.data.academic_projects && template.data.academic_projects.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">ACADEMIC PROJECTS</h3>
                {template.data.academic_projects.map((project: any, index: number) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <h4 className="text-lg font-semibold text-blue-800">{project.project_name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{project.duration}</p>
                    <div className="text-sm text-gray-700 ml-4">
                      {project.description_bullets.map((bullet: string, bulletIndex: number) => (
                        <div key={bulletIndex}>• {bullet}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Education & Skills */}
            <div className="grid grid-cols-2 gap-8">
              {/* Education */}
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">EDUCATION</h3>
                {template.data.education_entries.map((edu: any, index: number) => (
                  <div key={index} className="mb-4">
                    <h4 className="text-lg font-semibold text-blue-800">{edu.degree}</h4>
                    <h5 className="text-md text-blue-600">{edu.college}</h5>
                    <p className="text-sm text-gray-600">Class of {edu.end_year}</p>
                  </div>
                ))}
              </div>
              
              {/* Skills & Certifications */}
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">SKILLS & CERTIFICATIONS</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.data.skills.map((skill: string, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  {template.data.certifications && template.data.certifications.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">Certifications</h4>
                      {template.data.certifications.map((cert: any, index: number) => (
                        <div key={index} className="mb-2">
                          <span className="text-sm font-medium text-gray-800">{cert.certification}</span>
                          <span className="text-xs text-gray-600 ml-2">({cert.time_of_certification})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.data.languages.map((lang: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {template.data.achievements && template.data.achievements.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-blue-900 mb-4 border-b border-blue-300 pb-2">ACHIEVEMENTS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {template.data.achievements.map((achievement: any, index: number) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800">{achievement.title}</h4>
                      <p className="text-sm text-blue-600">{achievement.awarding_body} • {achievement.year}</p>
                      <p className="text-sm text-gray-700 mt-1">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

  const handleUseTemplateClick = (templateData: any) => {
    // Make sure we're passing a clean copy of the template data
    const cleanTemplateData = JSON.parse(JSON.stringify(templateData));
    setSelectedTemplateData(cleanTemplateData);
    setIsTailoringDialogOpen(true);
  };

  const handleTailoringConfirm = (file: File, industry: string) => {
    try {
      // Create a merged data object with the template and tailoring info
      const mergedData = {
        ...selectedTemplateData,
        tailoring: {
          jobDescription: file,
          industry: industry
        }
      };
      
      // Pass the merged data to the parent component
      onSelectTemplate(mergedData);
      setIsTailoringDialogOpen(false);
    } catch (error) {
      console.error("Error creating resume:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleTemplateSelect = (template: Template) => {
    try {
      // Make a clean copy of the template data
      const templateData = JSON.parse(JSON.stringify(template.data));
      onSelectTemplate(templateData);
      setPreviewTemplate(null);
    } catch (error) {
      console.error("Error selecting template:", error);
      // You might want to show an error message to the user here
    }
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
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
        </div>
        
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="md:w-1/4">
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
          onSelectTemplate={handleTemplateSelect}
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