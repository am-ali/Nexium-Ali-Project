'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DocumentArrowDownIcon,
    ClipboardDocumentIcon,
    EyeIcon,
    PrinterIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface PreviewProps {
    tailoredResume: string;
    matchScore?: number;
    suggestedChanges?: Array<{
        type: 'addition' | 'removal' | 'modification';
        section: string;
        description: string;
    }>;
    originalResume?: string;
    jobTitle?: string;
}

const Preview: React.FC<PreviewProps> = ({ 
    tailoredResume, 
    matchScore, 
    suggestedChanges = [],
    originalResume,
    jobTitle 
}) => {
    const [showComparison, setShowComparison] = useState(false);

    const formatResumeForDisplay = (content: string): string => {
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n\n');
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([tailoredResume], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `tailored-resume-${jobTitle?.replace(/\s+/g, '-').toLowerCase() || 'job'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(tailoredResume);
            toast.success('Resume copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy resume');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Tailored Resume</title>
                        <style>
                            body { 
                                font-family: 'Times New Roman', serif; 
                                line-height: 1.6; 
                                max-width: 8.5in; 
                                margin: 0 auto; 
                                padding: 1in;
                                color: #000;
                            }
                            h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
                            .section-header { 
                                font-weight: bold; 
                                font-size: 14px; 
                                text-transform: uppercase;
                                border-bottom: 1px solid #ccc;
                                padding-bottom: 2px;
                                margin-bottom: 8px;
                            }
                            p { margin-bottom: 0.5em; }
                            ul { margin-left: 20px; }
                            li { margin-bottom: 3px; }
                        </style>
                    </head>
                    <body>
                        <pre style="white-space: pre-wrap; font-family: inherit;">${tailoredResume}</pre>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const getChangeTypeColor = (type: string) => {
        switch (type) {
            case 'addition': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'modification': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'removal': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getChangeTypeIcon = (type: string) => {
        switch (type) {
            case 'addition': return '+ ';
            case 'modification': return '~ ';
            case 'removal': return '- ';
            default: return '• ';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tailored Resume Preview</h2>
                    {jobTitle && (
                        <p className="text-slate-400">Optimized for: <span className="text-purple-400 font-medium">{jobTitle}</span></p>
                    )}
                </div>
                
                {matchScore !== undefined && (
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <div className={`text-3xl font-bold ${
                                matchScore >= 80 ? 'text-green-400' : 
                                matchScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                                {matchScore}%
                            </div>
                            <p className="text-sm text-slate-400">Match Score</p>
                        </div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            matchScore >= 80 ? 'bg-green-500/20 border-2 border-green-500/50' : 
                            matchScore >= 60 ? 'bg-yellow-500/20 border-2 border-yellow-500/50' : 
                            'bg-red-500/20 border-2 border-red-500/50'
                        }`}>
                            <span className="text-2xl">
                                {matchScore >= 80 ? '🎯' : matchScore >= 60 ? '👍' : '⚠️'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <Button onClick={handleDownload} className="bg-gradient-to-r from-purple-500 to-purple-600">
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download
                </Button>
                <Button onClick={handleCopy} variant="outline">
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    Copy
                </Button>
                <Button onClick={handlePrint} variant="outline">
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Print
                </Button>
                {originalResume && (
                    <Button 
                        onClick={() => setShowComparison(!showComparison)} 
                        variant="outline"
                    >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        {showComparison ? 'Hide' : 'Show'} Comparison
                    </Button>
                )}
            </div>

            {/* Suggested Changes */}
            {suggestedChanges.length > 0 && (
                <Card className="p-6 bg-slate-800/50 border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">AI Improvements Made</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {suggestedChanges.map((change, index) => (
                            <div 
                                key={index} 
                                className={`p-3 rounded-lg border ${getChangeTypeColor(change.type)}`}
                            >
                                <div className="flex items-start space-x-2">
                                    <span className="font-mono text-sm font-bold">
                                        {getChangeTypeIcon(change.type)}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{change.section}</p>
                                        <p className="text-xs opacity-80 mt-1">{change.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Resume Content */}
            <div className={`grid ${showComparison && originalResume ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
                {/* Original Resume (if showing comparison) */}
                {showComparison && originalResume && (
                    <Card className="p-6 bg-slate-800/30 border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4">Original Resume</h3>
                        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50 max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">
                                {formatResumeForDisplay(originalResume)}
                            </pre>
                        </div>
                    </Card>
                )}

                {/* Tailored Resume */}
                <Card className="p-6 bg-slate-800/50 border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {showComparison ? 'Tailored Resume' : 'Resume Content'}
                    </h3>
                    <div className="bg-white p-8 rounded-lg shadow-inner max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-serif text-sm text-gray-900 leading-relaxed">
                                {formatResumeForDisplay(tailoredResume)}
                            </pre>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tips */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">💡 Next Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                    <div>
                        <h4 className="font-medium text-blue-400 mb-2">Before Applying:</h4>
                        <ul className="space-y-1 text-slate-400">
                            <li>• Review the tailored content for accuracy</li>
                            <li>• Customize the format for the specific company</li>
                            <li>• Add any recent achievements or projects</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-purple-400 mb-2">File Formats:</h4>
                        <ul className="space-y-1 text-slate-400">
                            <li>• Save as PDF for most applications</li>
                            <li>• Use .docx for ATS systems when required</li>
                            <li>• Keep a plain text version as backup</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Preview;