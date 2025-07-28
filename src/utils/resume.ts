import { Resume, JobDescription } from '../types';

export const formatResume = (resume: Resume): string => {
    // Format the resume into a string or desired format
    return `
        Name: ${resume.name}
        Email: ${resume.email}
        Phone: ${resume.phone}
        Summary: ${resume.summary}
        Experience: ${resume.experience.map(exp => `
            Company: ${exp.company}
            Role: ${exp.role}
            Duration: ${exp.duration}
            Description: ${exp.description}
        `).join('\n')}
        Education: ${resume.education.map(edu => `
            Institution: ${edu.institution}
            Degree: ${edu.degree}
            Year: ${edu.year}
        `).join('\n')}
    `;
};

export const tailorResume = (resume: Resume, jobDescription: JobDescription): Resume => {
    // Tailor the resume based on the job description
    const tailoredResume = { ...resume };

    // Example logic to highlight relevant skills
    tailoredResume.skills = resume.skills.filter(skill => 
        jobDescription.requiredSkills.includes(skill)
    );

    return tailoredResume;
};