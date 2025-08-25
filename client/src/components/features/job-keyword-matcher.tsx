import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Search, Target, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import type { ResumeData } from "@shared/schema";

interface JobKeywordMatcherProps {
  resumeData: ResumeData;
  onSuggestion?: (suggestion: string) => void;
}

interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
  matchPercentage: number;
  suggestions: string[];
  industryMatch: string;
}

export function JobKeywordMatcher({ resumeData, onSuggestion }: JobKeywordMatcherProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeKeywords = () => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const result = performKeywordAnalysis(resumeData, jobDescription);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 1500);
  };

  const performKeywordAnalysis = (resume: ResumeData, jobDesc: string): KeywordAnalysis => {
    // Extract keywords from job description
    const jobKeywords = extractKeywords(jobDesc);
    
    // Extract resume content
    const resumeText = getResumeText(resume);
    const resumeKeywords = extractKeywords(resumeText);
    
    // Find matches
    const matchedKeywords = jobKeywords.filter(keyword => 
      resumeKeywords.some(rKeyword => 
        rKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(rKeyword.toLowerCase())
      )
    );
    
    const missingKeywords = jobKeywords.filter(keyword => 
      !matchedKeywords.some(matched => 
        matched.toLowerCase() === keyword.toLowerCase()
      )
    ).slice(0, 10); // Limit to top 10 missing
    
    const matchPercentage = jobKeywords.length > 0 ? 
      Math.round((matchedKeywords.length / jobKeywords.length) * 100) : 0;
    
    // Generate suggestions
    const suggestions = generateSuggestions(missingKeywords, resume);
    
    // Detect industry
    const industryMatch = detectIndustry(jobDesc);
    
    return {
      matchedKeywords,
      missingKeywords,
      matchPercentage,
      suggestions,
      industryMatch
    };
  };

  const extractKeywords = (text: string): string[] => {
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our'
    ]);

    // Extract words and phrases
    const words = text.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter(word => /^[a-zA-Z]/.test(word)); // Start with letter

    // Add common professional phrases
    const phrases = [
      'project management', 'data analysis', 'customer service', 'team leadership',
      'problem solving', 'strategic planning', 'business development', 'software development',
      'machine learning', 'artificial intelligence', 'digital marketing', 'user experience',
      'quality assurance', 'financial analysis', 'risk management', 'process improvement'
    ];

    const foundPhrases = phrases.filter(phrase => 
      text.toLowerCase().includes(phrase)
    );

    // Combine and deduplicate
    return Array.from(new Set([...words, ...foundPhrases]))
      .filter(keyword => keyword.length > 2)
      .slice(0, 50); // Limit to most relevant
  };

  const getResumeText = (resume: ResumeData): string => {
    const parts = [];
    
    if (resume.personalInfo.summary) parts.push(resume.personalInfo.summary);
    if (resume.personalInfo.jobTitle) parts.push(resume.personalInfo.jobTitle);
    
    resume.workExperience.forEach(exp => {
      if (exp.title) parts.push(exp.title);
      if (exp.description) parts.push(exp.description);
    });
    
    resume.education.forEach(edu => {
      if (edu.degree) parts.push(edu.degree);
      if (edu.degree) parts.push(edu.degree);
    });
    
    parts.push(...resume.technicalSkills);
    parts.push(...resume.softSkills);
    
    return parts.join(' ');
  };

  const detectIndustry = (jobDesc: string): string => {
    const industryKeywords = {
      'Technology': ['software', 'programming', 'developer', 'engineer', 'tech', 'coding', 'algorithm'],
      'Healthcare': ['medical', 'healthcare', 'patient', 'clinical', 'nursing', 'hospital'],
      'Finance': ['financial', 'banking', 'investment', 'accounting', 'finance', 'trading'],
      'Marketing': ['marketing', 'advertising', 'campaign', 'brand', 'social media', 'seo'],
      'Sales': ['sales', 'selling', 'revenue', 'client', 'customer', 'business development'],
      'Education': ['education', 'teaching', 'learning', 'curriculum', 'student', 'academic'],
      'Legal': ['legal', 'law', 'attorney', 'compliance', 'regulation', 'contract']
    };

    const text = jobDesc.toLowerCase();
    let bestMatch = 'General';
    let maxScore = 0;

    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = industry;
      }
    });

    return bestMatch;
  };

  const generateSuggestions = (missingKeywords: string[], resume: ResumeData): string[] => {
    const suggestions = [];
    
    if (missingKeywords.length > 0) {
      suggestions.push(`Add these keywords to your summary: ${missingKeywords.slice(0, 3).join(', ')}`);
      
      if (resume.workExperience.length > 0) {
        suggestions.push("Incorporate relevant keywords into your job descriptions");
      }
      
      if (missingKeywords.some(k => k.includes('management') || k.includes('leadership'))) {
        suggestions.push("Highlight leadership and management experience");
      }
      
      if (missingKeywords.some(k => k.includes('technical') || k.includes('software'))) {
        suggestions.push("Add more technical skills to your skills section");
      }
    }
    
    suggestions.push("Use action verbs from the job description in your experience bullets");
    suggestions.push("Match the job title in your summary or objective");
    
    return suggestions.slice(0, 5);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchStatus = (percentage: number) => {
    if (percentage >= 70) return { icon: CheckCircle, text: "Excellent Match", color: "text-green-600" };
    if (percentage >= 50) return { icon: AlertTriangle, text: "Good Match", color: "text-yellow-600" };
    return { icon: AlertTriangle, text: "Needs Improvement", color: "text-red-600" };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Job Keyword Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here to analyze keyword match..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="mt-1"
            />
          </div>
          
          <Button 
            onClick={analyzeKeywords}
            disabled={!jobDescription.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze Keywords
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <>
          {/* Match Score */}
          <Card>
            <CardHeader>
              <CardTitle>Keyword Match Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className={`text-3xl font-bold mb-2 ${getMatchColor(analysis.matchPercentage)}`}>
                  {analysis.matchPercentage}%
                </div>
                <Progress value={analysis.matchPercentage} className="mb-4" />
                <div className="flex items-center justify-center space-x-2">
                  {(() => {
                    const status = getMatchStatus(analysis.matchPercentage);
                    return (
                      <>
                        <status.icon className={`w-5 h-5 ${status.color}`} />
                        <span className={status.color}>{status.text}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">{analysis.matchedKeywords.length}</div>
                  <div className="text-gray-600">Matched Keywords</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{analysis.missingKeywords.length}</div>
                  <div className="text-gray-600">Missing Keywords</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Match */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm">
                  {analysis.industryMatch} Industry
                </Badge>
                <span className="text-gray-600">Detected from job description</span>
              </div>
            </CardContent>
          </Card>

          {/* Keywords Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Matched Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedKeywords.map((keyword, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                {analysis.matchedKeywords.length === 0 && (
                  <p className="text-gray-500 text-sm">No keywords matched. Consider adding relevant skills and experience.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Missing Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-red-200 text-red-600 cursor-pointer hover:bg-red-50"
                      onClick={() => onSuggestion?.(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
                {analysis.missingKeywords.length === 0 && (
                  <p className="text-gray-500 text-sm">Great! You have most of the important keywords.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Optimization Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}