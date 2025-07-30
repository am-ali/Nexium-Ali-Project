export interface User {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    preferences?: UserPreferences;
}

export interface UserPreferences {
    emailNotifications: boolean;
    theme: 'light' | 'dark';
    language: string;
}

export interface Resume {
    id?: string;
    _id?: string;
    userId: string;
    title?: string;
    content?: string;
    originalContent?: string;
    fileName?: string;
    fileUrl?: string;
    fileType?: 'pdf' | 'docx' | 'text';
    skills?: string[];
    experience?: Experience[];
    education?: Education[];
    createdAt?: Date;
    updatedAt?: Date;
    version?: number;
    uploadDate?: Date;
    status?: string;
}

export interface Experience {
    company: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description: string;
    highlights: string[];
    location?: string;
}

export interface Education {
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    gpa?: number;
    achievements: string[];
}

export interface JobDescription {
    id?: string;
    _id?: string;
    title: string;
    company: string;
    description: string;
    requirements: string[];
    preferences: string[];
    location: string;
    salary?: {
        min: number;
        max: number;
        currency: string;
    };
    createdAt: Date;
}

export interface TailoredResume {
    id: string;
    originalResumeId: string;
    jobDescriptionId: string;
    content: string;
    matchScore: number;
    suggestedChanges: {
        type: 'addition' | 'removal' | 'modification';
        section: string;
        description: string;
    }[];
    createdAt: Date;
}