import React from 'react';

interface PreviewProps {
    tailoredResume: string;
}

const Preview: React.FC<PreviewProps> = ({ tailoredResume }) => {
    return (
        <div className="preview-container">
            <h2 className="preview-title">Tailored Resume Preview</h2>
            <div className="preview-content">
                <pre>{tailoredResume}</pre>
            </div>
            <style jsx>{`
                .preview-container {
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .preview-title {
                    font-size: 24px;
                    margin-bottom: 16px;
                    color: #333;
                }
                .preview-content {
                    white-space: pre-wrap;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 16px;
                    color: #555;
                }
            `}</style>
        </div>
    );
};

export default Preview;