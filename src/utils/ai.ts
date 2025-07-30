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
    private readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent';

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
                }]
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
            
            // Parse the response to extract tailored content and metadata
            const parsedResult = this.parseGeminiResponse(tailoredContent, resume, jobDescription);
            
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
        
        return `You are an expert resume writer and career coach. Please tailor the following resume to match the job description provided.

RESUME TO TAILOR:
${originalContent}

JOB DESCRIPTION:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Location: ${jobDescription.location}
Description: ${jobDescription.description}
Requirements: ${jobDescription.requirements.join(', ')}
Preferences: ${jobDescription.preferences.join(', ')}

INSTRUCTIONS:
1. Analyze the resume and job requirements
2. Create a tailored version that highlights relevant skills and experience
3. Optimize keywords and phrases to match the job description
4. Maintain professional formatting and structure
5. Add or modify sections as needed to better align with the position

Please respond with ONLY the tailored resume content, formatted professionally. Do not include any explanations or metadata in the response - just the resume text.

The tailored resume should be ready to use and should clearly demonstrate how the candidate's background aligns with the specific job requirements.`;
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
        const titleWords = jobTitle.split(' ');
        titleWords.forEach(word => {
            if (contentLower.includes(word.toLowerCase())) {
                matchScore += 5;
            }
        });
        
        // Check for requirement matches
        jobRequirements.forEach(req => {
            const reqWords = req.toLowerCase().split(' ');
            reqWords.forEach(word => {
                if (contentLower.includes(word) && word.length > 2) {
                    matchScore += 2;
                }
            });
        });
        
        // Cap the score
        matchScore = Math.min(matchScore, 95);
        
        // Generate suggested changes based on content analysis
        const suggestedChanges: Array<{
            type: 'addition' | 'removal' | 'modification';
            section: string;
            description: string;
        }> = [];
        
        // Check if objective/summary was added or modified
        if (response.toLowerCase().includes('objective') || response.toLowerCase().includes('summary')) {
            if (!originalContent.toLowerCase().includes('objective') && !originalContent.toLowerCase().includes('summary')) {
                suggestedChanges.push({
                    type: 'addition' as const,
                    section: 'objective',
                    description: 'Added tailored objective statement'
                });
            } else {
                suggestedChanges.push({
                    type: 'modification' as const,
                    section: 'objective',
                    description: 'Updated objective to align with job requirements'
                });
            }
        }
        
        // Check if skills section was enhanced
        if (response.toLowerCase().includes('skills') && jobRequirements.length > 0) {
            suggestedChanges.push({
                type: 'modification' as const,
                section: 'skills',
                description: 'Enhanced skills section to match job requirements'
            });
        }
        
        return {
            content: response,
            matchScore,
            suggestedChanges
        };
    }
}