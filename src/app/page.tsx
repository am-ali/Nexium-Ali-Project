import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Welcome to Resume AI</h1>
            <p className="text-lg mb-8">Tailor your resume effortlessly for your dream job!</p>
            <div className="w-full max-w-md">
                <Input 
                    placeholder="Enter your email to get started" 
                    type="email"
                />
                <Button className="w-full mt-4">Get Started</Button>
            </div>
        </div>
    );
}