import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, XCircle, TrendingUp, FileText, Target } from "lucide-react";
import type { ResumeData } from "@shared/schema";

interface ATSScorerProps {
  resumeData: ResumeData;
  jobDescription?: string;
}

interface ScoreMetric {
  name: string;
  score: number;
  maxScore: number;
  status: "good" | "warning" | "poor";
  suggestions: string[];
}

interface ATSAnalysis {
  overallScore: number;
  metrics: ScoreMetric[];
  keywords: {
    found: string[];
    missing: string[];
    suggestions: string[];
  };
}

export function ATSScorer({ resumeData, jobDescription }: ATSScorerProps) {
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeResume = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const analysis = performATSAnalysis(resumeData, jobDescription);
      setAnalysis(analysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  useEffect(() => {
    if (resumeData) {
      analyzeResume();
    }
  }, [resumeData, jobDescription]);

  const performATSAnalysis = (data: ResumeData, jobDesc?: string): ATSAnalysis => {
    const metrics: ScoreMetric[] = [];

    // Contact Information Score
    const contactScore = calculateContactScore(data.personalInfo);
    metrics.push(contactScore);

    // Work Experience Score
    const experienceScore = calculateExperienceScore(data.workExperience);
    metrics.push(experienceScore);

    // Skills Score
    const skillsScore = calculateSkillsScore(data.technicalSkills, data.softSkills);
    metrics.push(skillsScore);

    // Education Score
    const educationScore = calculateEducationScore(data.education);
    metrics.push(educationScore);

    // Format Score
    const formatScore = calculateFormatScore(data);
    metrics.push(formatScore);

    // Keyword Analysis
    const keywords = analyzeKeywords(data, jobDesc);

    // Calculate overall score
    const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
    const maxTotalScore = metrics.reduce((sum, metric) => sum + metric.maxScore, 0);
    const overallScore = Math.round((totalScore / maxTotalScore) * 100);

    return {
      overallScore,
      metrics,
      keywords
    };
  };

  const calculateContactScore = (personalInfo: any): ScoreMetric => {
    let score = 0;
    const maxScore = 20;
    const suggestions: string[] = [];

    if (personalInfo.fullName && personalInfo.fullName.trim() !== "") score += 5;
    else suggestions.push("Add your full name");

    if (personalInfo.email && personalInfo.email.includes("@")) score += 5;
    else suggestions.push("Add a professional email address");

    if (personalInfo.phone && personalInfo.phone.trim() !== "") score += 5;
    else suggestions.push("Add your phone number");

    if (personalInfo.summary && personalInfo.summary.length > 50) score += 5;
    else suggestions.push("Add a professional summary (50+ characters)");

    return {
      name: "Contact Information",
      score,
      maxScore,
      status: score >= 15 ? "good" : score >= 10 ? "warning" : "poor",
      suggestions
    };
  };

  const calculateExperienceScore = (workExperience: any[]): ScoreMetric => {
    let score = 0;
    const maxScore = 25;
    const suggestions: string[] = [];

    if (workExperience.length === 0) {
      suggestions.push("Add at least one work experience entry");
      return { name: "Work Experience", score: 0, maxScore, status: "poor", suggestions };
    }

    // Score based on number of experiences
    if (workExperience.length >= 1) score += 5;
    if (workExperience.length >= 2) score += 5;
    if (workExperience.length >= 3) score += 5;

    // Score based on content quality
    workExperience.forEach(exp => {
      if (exp.company && exp.company.trim() !== "") score += 2;
      if (exp.position && exp.position.trim() !== "") score += 2;
      if (exp.description && exp.description.length > 100) score += 3;
      else suggestions.push("Add detailed job descriptions (100+ characters)");
    });

    if (score < 15) suggestions.push("Add more detailed work experience entries");
    if (workExperience.some(exp => !exp.description?.includes("•"))) {
      suggestions.push("Use bullet points in job descriptions");
    }

    return {
      name: "Work Experience",
      score: Math.min(score, maxScore),
      maxScore,
      status: score >= 20 ? "good" : score >= 12 ? "warning" : "poor",
      suggestions
    };
  };

  const calculateSkillsScore = (technicalSkills: string[], softSkills: string[]): ScoreMetric => {
    let score = 0;
    const maxScore = 20;
    const suggestions: string[] = [];

    const totalSkills = technicalSkills.length + softSkills.length;

    if (totalSkills >= 3) score += 5;
    if (totalSkills >= 6) score += 5;
    if (totalSkills >= 10) score += 5;
    if (technicalSkills.length >= 3) score += 3;
    if (softSkills.length >= 3) score += 2;

    if (totalSkills < 6) suggestions.push("Add more relevant skills (aim for 6+)");
    if (technicalSkills.length < 3) suggestions.push("Add more technical skills");
    if (softSkills.length < 3) suggestions.push("Add more soft skills");

    return {
      name: "Skills",
      score,
      maxScore,
      status: score >= 15 ? "good" : score >= 10 ? "warning" : "poor",
      suggestions
    };
  };

  const calculateEducationScore = (education: any[]): ScoreMetric => {
    let score = 0;
    const maxScore = 15;
    const suggestions: string[] = [];

    if (education.length === 0) {
      suggestions.push("Add your education background");
      return { name: "Education", score: 0, maxScore, status: "poor", suggestions };
    }

    education.forEach(edu => {
      if (edu.institution && edu.institution.trim() !== "") score += 3;
      if (edu.degree && edu.degree.trim() !== "") score += 3;
      if (edu.field && edu.field.trim() !== "") score += 3;
      if (edu.graduationYear) score += 2;
    });

    if (score < 10) suggestions.push("Complete education details (institution, degree, field)");

    return {
      name: "Education",
      score: Math.min(score, maxScore),
      maxScore,
      status: score >= 12 ? "good" : score >= 8 ? "warning" : "poor",
      suggestions
    };
  };

  const calculateFormatScore = (data: ResumeData): ScoreMetric => {
    let score = 0;
    const maxScore = 20;
    const suggestions: string[] = [];

    // Check for consistent formatting
    if (data.personalInfo.fullName) score += 5;
    if (data.workExperience.length > 0) score += 5;
    if (data.education.length > 0) score += 5;
    if (data.technicalSkills.length > 0 || data.softSkills.length > 0) score += 5;

    // Format suggestions
    if (data.workExperience.some(exp => !exp.startDate || !exp.endDate)) {
      suggestions.push("Include start and end dates for all positions");
    }

    if (data.work_experiences.some(exp => exp.projects.some(p => p.description_bullets.some(b => !b.startsWith("•"))))) {
      suggestions.push("Use bullet points for job descriptions");
    }

    return {
      name: "Format & Structure",
      score,
      maxScore,
      status: score >= 15 ? "good" : score >= 10 ? "warning" : "poor",
      suggestions
    };
  };

  const analyzeKeywords = (data: ResumeData, jobDesc?: string) => {
    // Common industry keywords
    const commonKeywords = [
      "leadership", "management", "communication", "teamwork", "problem-solving",
      "project management", "analytical", "creative", "strategic", "innovative",
      "results-driven", "detail-oriented", "customer service", "collaboration"
    ];

    // Extract keywords from job description if provided
    const jobKeywords = jobDesc ? 
      jobDesc.toLowerCase().split(/\W+/).filter(word => word.length > 3) : [];

    // Find keywords in resume
    const resumeText = JSON.stringify(data).toLowerCase();
    const foundKeywords = commonKeywords.filter(keyword => 
      resumeText.includes(keyword.toLowerCase())
    );

    const missingKeywords = commonKeywords.filter(keyword => 
      !resumeText.includes(keyword.toLowerCase())
    ).slice(0, 5);

    return {
      found: foundKeywords,
      missing: missingKeywords,
      suggestions: [
        "Include more action verbs in your descriptions",
        "Add industry-specific keywords",
        "Use quantifiable achievements where possible"
      ]
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "poor": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            ATS Score Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your resume for ATS compatibility...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            ATS Score Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Button onClick={analyzeResume}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Analyze Resume
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              ATS Compatibility Score
            </span>
            <Button variant="outline" size="sm" onClick={analyzeResume}>
              Re-analyze
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}%
            </div>
            <Progress value={analysis.overallScore} className="mb-4" />
            <p className="text-gray-600">
              {analysis.overallScore >= 80 ? "Excellent! Your resume is highly ATS-friendly." :
               analysis.overallScore >= 60 ? "Good! Some improvements recommended." :
               "Needs improvement to pass ATS screening."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.metrics.map((metric, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(metric.status)}
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {metric.score}/{metric.maxScore}
                  </span>
                </div>
                <Progress value={(metric.score / metric.maxScore) * 100} className="mb-2" />
                {metric.suggestions.length > 0 && (
                  <div className="space-y-1">
                    {metric.suggestions.map((suggestion, idx) => (
                      <p key={idx} className="text-sm text-gray-600">• {suggestion}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keywords Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-green-600 mb-2">Found Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.found.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-red-600 mb-2">Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.missing.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="border-red-200 text-red-600">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <div className="space-y-1">
                {analysis.keywords.suggestions.map((suggestion, index) => (
                  <p key={index} className="text-sm text-gray-600">• {suggestion}</p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}