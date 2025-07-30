'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface UploadFormProps {
    onSubmit: (data: { file?: File; text?: string }) => Promise<void>;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSubmit }) => {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB');
                return;
            }
            if (!['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                .includes(selectedFile.type)) {
                setError('Only DOCX files are allowed (PDF upload is temporarily disabled)');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResumeText(event.target.value);
        setError(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file && !resumeText) {
            setError('Please upload a file or enter resume text');
            return;
        }
        
        setLoading(true);
        try {
            const formData = new FormData();
            if (file) {
                // Create a new Blob with the correct type
                const blob = new Blob([await file.arrayBuffer()], { type: file.type });
                formData.append('file', blob, file.name);
            }
            if (resumeText) {
                formData.append('text', resumeText);
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                throw new Error('Invalid response from server');
            }

            if (!response.ok) {
                throw new Error(result?.error || 'Upload failed');
            }

            toast.success('Resume processed successfully!');
            router.push('/dashboard');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Upload Your Resume">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Input
                            type="file"
                            accept=".docx"
                            onChange={handleFileChange}
                            label="Drop your resume here or click to browse"
                            className="hidden"
                            id="file-upload"
                        />
                        <label 
                            htmlFor="file-upload"
                            className="cursor-pointer text-blue-600 hover:text-blue-700"
                        >
                            {file ? file.name : 'Choose a DOCX file'}
                        </label>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or</span>
                        </div>
                    </div>

                    <textarea
                        value={resumeText}
                        onChange={handleTextChange}
                        placeholder="Paste your resume text here..."
                        rows={8}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading || (!file && !resumeText)}
                    className="w-full"
                >
                    {loading ? 'Uploading...' : 'Upload Resume'}
                </Button>
            </form>
        </Card>
    );
};

export default UploadForm;