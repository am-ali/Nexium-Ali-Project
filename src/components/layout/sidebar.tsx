import React from 'react';

export const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-white shadow-md h-screen">
            <nav className="p-4">
                <ul className="space-y-2">
                    <li><a href="/dashboard" className="block p-2 hover:bg-gray-100 rounded">Dashboard</a></li>
                    <li><a href="/dashboard/upload" className="block p-2 hover:bg-gray-100 rounded">Upload Resume</a></li>
                    <li><a href="/dashboard/preview" className="block p-2 hover:bg-gray-100 rounded">Preview Resume</a></li>
                    <li><a href="/dashboard/history" className="block p-2 hover:bg-gray-100 rounded">History</a></li>
                </ul>
            </nav>
        </aside>
    );
};