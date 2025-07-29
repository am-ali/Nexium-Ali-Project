import Link from 'next/link';
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Not Found</h2>
      <p className="text-gray-600 mb-4">Could not find the requested resource</p>
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Return Home
      </Link>
    </div>
  );
}