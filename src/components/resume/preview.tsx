'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DocumentArrowDownIcon,
    ClipboardDocumentIcon,
    EyeIcon,
    PrinterIcon,
    ShareIcon,
    TrophyIcon,
    SparklesIcon,
    DocumentTextIcon
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
        toast.success('Resume downloaded successfully!');
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
                                background: white;
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
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
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

    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getMatchScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-500/20 border-green-500/30';
        if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                        <DocumentTextIcon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Tailored Resume Preview</h2>
                        {jobTitle && (
                            <p className="text-slate-400">
                                Optimized for: <span className="text-purple-400 font-medium">{jobTitle}</span>
                            </p>
                        )}
                    </div>
                </div>
                
                {matchScore !== undefined && (
                    <Card className={`p-4 border-2 ${getMatchScoreBg(matchScore)}`}>
                        <div className="flex items-center space-x-4">
                            <div className="text-center">
                                <div className={`text-3xl font-bold ${getMatchScoreColor(matchScore)}`}>
                                    {matchScore}%
                                </div>
                                <p className="text-sm text-slate-400">Match Score</p>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getMatchScoreBg(matchScore)}`}>
                                <TrophyIcon className={`h-6 w-6 ${getMatchScoreColor(matchScore)}`} />
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <Button 
                    onClick={handleDownload} 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download Resume
                </Button>
                <Button 
                    onClick={handleCopy} 
                    variant="outline"
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    Copy Text
                </Button>
                <Button 
                    onClick={handlePrint} 
                    variant="outline"
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Print
                </Button>
                {originalResume && (
                    <Button 
                        onClick={() => setShowComparison(!showComparison)} 
                        variant="outline"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        {showComparison ? 'Hide' : 'Show'} Comparison
                    </Button>
                )}
            </div>

            {/* Suggested Changes */}
            {suggestedChanges.length > 0 && (
                <Card className="p-6 bg-slate-800/50 border-slate-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                        <SparklesIcon className="h-5 w-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">AI Improvements Made</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {suggestedChanges.map((change, index) => (
                            <div 
                                key={index} 
                                className={`p-3 rounded-lg border ${getChangeTypeColor(change.type)}`}
                            >
                                <div className="flex items-start space-x-2">
                                    <span className="font-mono text-sm font-bold mt-0.5">
                                        {getChangeTypeIcon(change.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
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
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-slate-400" />
                            Original Resume
                        </h3>
                        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">
                                {formatResumeForDisplay(originalResume)}
                            </pre>
                        </div>
                    </Card>
                )}

                {/* Tailored Resume */}
                <Card className="p-6 bg-slate-800/50 border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-2 text-purple-400" />
                        {showComparison ? 'Tailored Resume' : 'Resume Content'}
                    </h3>
                    
                    {/* Print Preview Style Container */}
                    <div className="bg-slate-900/30 p-8 rounded-lg border border-slate-700/50 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                        <div className="bg-white p-8 rounded-lg shadow-lg min-h-[11in] max-w-[8.5in] mx-auto">
                            <pre className="whitespace-pre-wrap font-serif text-sm text-gray-900 leading-relaxed">
                                {formatResumeForDisplay(tailoredResume)}
                            </pre>
                        </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                        <p className="text-xs text-slate-400 flex items-center">
                            <EyeIcon className="h-3 w-3 mr-1" />
                            This preview shows how your resume will appear when printed or saved as PDF
                        </p>
                    </div>
                </Card>
            </div>

            {/* Tips */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">💡 Next Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h4 className="font-medium text-blue-400 mb-3 flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-2" />
                            Before Applying:
                        </h4>
                        <ul className="space-y-2 text-slate-300">
                            <li className="flex items-start space-x-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>Review the tailored content for accuracy</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>Customize the format for the specific company</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>Add any recent achievements or projects</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-purple-400 mb-3 flex items-center">
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            File Formats:
                        </h4>
                        <ul className="space-y-2 text-slate-300">
                            <li className="flex items-start space-x-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>Save as PDF for most applications(use print button to save as pdf)</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>Use .docx for ATS systems when required</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>Keep a plain text version as backup</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-300">
                        <strong className="text-white">Pro Tip:</strong> The white preview above shows exactly how your resume will look when printed or converted to PDF. The dark background is just for better viewing on screen.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Preview;