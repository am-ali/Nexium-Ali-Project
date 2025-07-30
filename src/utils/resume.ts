import { Resume, JobDescription } from '../types';

export const formatResume = (resume: Resume): string => {
    // Format the resume into a string or desired format
    return `
        Title: ${resume.title || 'Untitled Resume'}
        Content: ${resume.content || resume.originalContent || 'No content available'}
        Skills: ${resume.skills ? resume.skills.join(', ') : 'No skills listed'}
        Experience: ${resume.experience || 'No experience listed'}
        Education: ${resume.education || 'No education listed'}
        File Name: ${resume.fileName || 'Text input'}
        Upload Date: ${resume.uploadDate ? new Date(resume.uploadDate).toLocaleDateString() : 'N/A'}
        Status: ${resume.status || 'Unknown'}
    `.trim();
};

export const tailorResume = (resume: Resume, jobDescription: JobDescription): Resume => {
    // Create a tailored version of the resume based on the job description
    const tailoredResume: Resume = { 
        ...resume,
        title: `${resume.title} - Tailored for ${jobDescription.title}`,
        updatedAt: new Date()
    };

    // If we have structured skills and the job has requirements, filter relevant skills
    if (resume.skills && Array.isArray(resume.skills) && jobDescription.requirements) {
        const jobKeywords = jobDescription.requirements
            .join(' ')
            .toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 2);

        // Keep skills that match job requirements
        tailoredResume.skills = resume.skills.filter(skill => 
            jobKeywords.some(keyword => 
                skill.toLowerCase().includes(keyword) || 
                keyword.includes(skill.toLowerCase())
            )
        );
    }

    return tailoredResume;
};

export const extractKeywords = (text: string): string[] => {
    // Extract important keywords from text
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
    
    // Remove common words
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'will', 'would', 'could', 'should', 'must', 'have', 'has', 'had', 'are', 'is', 'was', 'were', 'been', 'being'];
    
    return Array.from(new Set(words.filter(word => !commonWords.includes(word))));
};

export const calculateMatchScore = (resume: Resume, jobDescription: JobDescription): number => {
    const resumeText = (resume.content || resume.originalContent || '').toLowerCase();
    const jobText = (jobDescription.description + ' ' + (jobDescription.requirements?.join(' ') || '')).toLowerCase();
    
    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywords = extractKeywords(jobText);
    
    if (jobKeywords.length === 0) return 0;
    
    const matches = resumeKeywords.filter(keyword => 
        jobKeywords.some(jobKeyword => 
            keyword.includes(jobKeyword) || jobKeyword.includes(keyword)
        )
    );
    
    return Math.round((matches.length / jobKeywords.length) * 100);
};

export const generateSuggestedChanges = (resume: Resume, jobDescription: JobDescription): Array<{
    type: 'addition' | 'removal' | 'modification';
    section: string;
    description: string;
}> => {
    const suggestions: Array<{
        type: 'addition' | 'removal' | 'modification';
        section: string;
        description: string;
    }> = [];

    const resumeText = (resume.content || resume.originalContent || '').toLowerCase();
    const jobRequirements = jobDescription.requirements || [];
    
    // Check for missing requirements
    jobRequirements.forEach(requirement => {
        if (!resumeText.includes(requirement.toLowerCase())) {
            suggestions.push({
                type: 'addition',
                section: 'Skills/Experience',
                description: `Consider adding experience or skills related to: ${requirement}`
            });
        }
    });

    // Suggest highlighting relevant experience
    if (jobDescription.title) {
        suggestions.push({
            type: 'modification',
            section: 'Summary/Objective',
            description: `Customize your summary to highlight experience relevant to ${jobDescription.title} role`
        });
    }

    // Suggest company-specific customization
    if (jobDescription.company) {
        suggestions.push({
            type: 'modification',
            section: 'Cover Letter',
            description: `Mention ${jobDescription.company} specifically and why you want to work there`
        });
    }

    return suggestions;
};