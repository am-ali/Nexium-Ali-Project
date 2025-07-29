export default function VerifyPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Check Your Email</h1>
                <p className="text-gray-600 text-center">
                    We&apos;ve sent you a magic link to sign in. 
                    Click the link in your email to continue.
                </p>
                <div className="mt-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        </div>
    );
}