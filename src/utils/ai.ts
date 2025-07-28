import { Resume, JobDescription } from '../types';

interface AiServiceConfig {
    n8nWebhookUrl: string;
    apiKey: string;
}

export class AiService {
    private config: AiServiceConfig;

    constructor(config: AiServiceConfig) {
        this.config = config;
    }

    async tailorResume(resume: Resume, jobDescription: JobDescription): Promise<Resume> {
        try {
            const response = await fetch(this.config.n8nWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    resume,
                    jobDescription
                })
            });

            if (!response.ok) {
                throw new Error('Failed to process resume');
            }

            const tailoredResume = await response.json();
            return tailoredResume;
        } catch (error) {
            console.error('AI Service Error:', error);
            throw new Error('Failed to tailor resume. Please try again later.');
        }
    }
}