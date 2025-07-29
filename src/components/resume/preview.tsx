'use client';

import React from 'react';

interface PreviewProps {
    tailoredResume: string;
}

const Preview: React.FC<PreviewProps> = ({ tailoredResume }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tailored Resume Preview</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                    {tailoredResume}
                </pre>
            </div>
        </div>
    );
};

export default Preview;