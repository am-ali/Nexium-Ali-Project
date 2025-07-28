import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const ResumeEditor: React.FC = () => {
    const [resumeContent, setResumeContent] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResumeContent(event.target.value);
    };

    return (
        <div className="resume-editor">
            <h2>Edit Your Resume</h2>
            <textarea
                value={resumeContent}
                onChange={handleChange}
                placeholder="Paste or write your resume here..."
                className="resume-textarea"
            />
            <Button onClick={() => console.log('Save Resume')}>Save</Button>
        </div>
    );
};

export default ResumeEditor;