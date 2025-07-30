import { Resume, JobDescription, TailoredResume } from '../types';

interface AiServiceConfig {
    apiKey: string;
}

interface GeminiRequest {
    contents: {
        parts: {
            text: string;
        }[];
    }[];
    generationConfig?: {
        temperature?: number;
        topP?: number;
        topK?: number;
        maxOutputTokens?: number;
    };
}

interface GeminiResponse {
    candidates: {
        content: {
            parts: {
                text: string;
            }[];
        };
    }[];
}

interface TailoredResumeResult extends Resume {
    matchScore: number;
    suggestedChanges: Array<{
        type: 'addition' | 'removal' | 'modification';
        section: string;
        description: string;
    }>;
}

export class AiService {
    private config: AiServiceConfig;
    private readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent';

    constructor(config: AiServiceConfig) {
        this.config = config;
    }

    async tailorResume(resume: Resume, jobDescription: JobDescription): Promise<TailoredResumeResult> {
        try {
            const prompt = this.buildTailoringPrompt(resume, jobDescription);
            
            const requestBody: GeminiRequest = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40,
                    maxOutputTokens: 4096
                }
            };

            const response = await fetch(`${this.GEMINI_API_URL}?key=${this.config.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API Error:', errorText);
                throw new Error(`Gemini API request failed: ${response.status}`);
            }

            const result: GeminiResponse = await response.json();
            
            if (!result.candidates || result.candidates.length === 0) {
                throw new Error('No response from Gemini API');
            }

            const tailoredContent = result.candidates[0].content.parts[0].text;
            
            // Clean and format the response
            const formattedContent = this.formatResumeContent(tailoredContent);
            
            // Parse the response to extract tailored content and metadata
            const parsedResult = this.parseGeminiResponse(formattedContent, resume, jobDescription);
            
            return {
                ...resume,
                content: parsedResult.content,
                matchScore: parsedResult.matchScore,
                suggestedChanges: parsedResult.suggestedChanges
            } as TailoredResumeResult;
        } catch (error) {
            console.error('AI Service Error:', error);
            throw new Error('Failed to tailor resume. Please try again later.');
        }
    }

    private buildTailoringPrompt(resume: Resume, jobDescription: JobDescription): string {
        const originalContent = resume.originalContent || resume.content || '';
        
        return `You are an expert resume writer and career coach. Please tailor the following resume to match the job description provided. Return ONLY the tailored resume content in a clean, professional format.

RESUME TO TAILOR:
${originalContent}

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Location: ${jobDescription.location}
Description: ${jobDescription.description}
Requirements: ${jobDescription.requirements?.join(', ') || 'Not specified'}
Preferences: ${jobDescription.preferences?.join(', ') || 'Not specified'}

INSTRUCTIONS:
1. Analyze the resume and job requirements carefully
2. Create a tailored version that highlights relevant skills and experience
3. Optimize keywords and phrases to match the job description
4. Maintain professional formatting with clear sections
5. Add or modify sections as needed to better align with the position
6. Ensure proper spacing and structure for readability

FORMATTING REQUIREMENTS:
- Use clear section headers (e.g., PROFESSIONAL SUMMARY, EXPERIENCE, SKILLS, etc.)
- Maintain consistent formatting throughout
- Use bullet points for achievements and responsibilities
- Include proper line breaks between sections
- Keep the content professional and ATS-friendly

Please respond with ONLY the tailored resume content. Do not include any explanations, metadata, or additional text - just the formatted resume ready for use.`;
    }

    private formatResumeContent(content: string): string {
        // Remove any markdown formatting
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
            .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
            .replace(/#{1,6}\s/g, '')        // Remove markdown headers
            .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
            .replace(/`([^`]+)`/g, '$1');    // Remove inline code

        // Ensure proper spacing between sections
        formatted = formatted
            .replace(/\n{3,}/g, '\n\n')      // Replace multiple newlines with double newlines
            .replace(/([A-Z\s]{3,})\n(?=[A-Z])/g, '$1\n\n') // Add spacing after section headers
            .trim();

        // Ensure section headers are properly formatted
        const sectionHeaders = [
            'PROFESSIONAL SUMMARY',
            'OBJECTIVE',
            'SUMMARY',
            'EXPERIENCE',
            'WORK EXPERIENCE',
            'PROFESSIONAL EXPERIENCE',
            'EDUCATION',
            'SKILLS',
            'TECHNICAL SKILLS',
            'CERTIFICATIONS',
            'PROJECTS',
            'ACHIEVEMENTS',
            'AWARDS'
        ];

        sectionHeaders.forEach(header => {
            const regex = new RegExp(`^${header}:?\\s*`, 'gmi');
            formatted = formatted.replace(regex, `${header}\n`);
        });

        return formatted;
    }

    private parseGeminiResponse(response: string, originalResume: Resume, jobDescription: JobDescription): {
        content: string;
        matchScore: number;
        suggestedChanges: Array<{
            type: 'addition' | 'removal' | 'modification';
            section: string;
            description: string;
        }>;
    } {
        // Calculate match score based on keyword matching
        const originalContent = originalResume.originalContent || originalResume.content || '';
        const jobRequirements = jobDescription.requirements || [];
        const jobTitle = jobDescription.title.toLowerCase();
        
        let matchScore = 60; // Base score
        const contentLower = response.toLowerCase();
        
        // Check for job title keywords
        const titleWords = jobTitle.split(' ').filter(word => word.length > 2);
        titleWords.forEach(word => {
            if (contentLower.includes(word.toLowerCase())) {
                matchScore += 5;
            }
        });
        
        // Check for requirement matches
        jobRequirements.forEach(req => {
            const reqWords = req.toLowerCase().split(' ').filter(word => word.length > 2);
            reqWords.forEach(word => {
                if (contentLower.includes(word)) {
                    matchScore += 3;
                }
            });
        });
        
        // Check for company/industry-specific terms
        const companyName = jobDescription.company.toLowerCase();
        if (contentLower.includes(companyName)) {
            matchScore += 5;
        }
        
        // Cap the score
        matchScore = Math.min(matchScore, 95);
        
        // Generate suggested changes based on content analysis
        const suggestedChanges: Array<{
            type: 'addition' | 'removal' | 'modification';
            section: string;
            description: string;
        }> = [];
        
        // Analyze content changes
        const originalLower = originalContent.toLowerCase();
        
        // Check if objective/summary was added or modified
        if (contentLower.includes('objective') || contentLower.includes('summary')) {
            if (!originalLower.includes('objective') && !originalLower.includes('summary')) {
                suggestedChanges.push({
                    type: 'addition',
                    section: 'Professional Summary',
                    description: 'Added tailored professional summary to highlight relevant qualifications'
                });
            } else {
                suggestedChanges.push({
                    type: 'modification',
                    section: 'Professional Summary',
                    description: 'Updated summary to align with job requirements and company values'
                });
            }
        }
        
        // Check if skills section was enhanced
        if (contentLower.includes('skills') && jobRequirements.length > 0) {
            suggestedChanges.push({
                type: 'modification',
                section: 'Skills',
                description: 'Enhanced skills section to emphasize job-relevant technologies and competencies'
            });
        }
        
        // Check if experience descriptions were modified
        if (contentLower.includes('experience') || contentLower.includes('work')) {
            suggestedChanges.push({
                type: 'modification',
                section: 'Experience',
                description: 'Optimized job descriptions with relevant keywords and achievements'
            });
        }
        
        // Check if new keywords were added
        const newKeywords = jobRequirements.filter(req => 
            contentLower.includes(req.toLowerCase()) && !originalLower.includes(req.toLowerCase())
        );
        
        if (newKeywords.length > 0) {
            suggestedChanges.push({
                type: 'addition',
                section: 'Keywords',
                description: `Added industry-relevant keywords: ${newKeywords.slice(0, 3).join(', ')}`
            });
        }
        
        return {
            content: response,
            matchScore,
            suggestedChanges
        };
    }
}