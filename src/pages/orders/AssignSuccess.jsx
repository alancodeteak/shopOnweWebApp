import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AssignSuccess = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 text-center pt-16 pb-24">
            <div className="max-w-screen-md mx-auto px-4">
            <CheckCircle className="text-green-500 w-24 h-24 mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Assigned!</h1>
            <p className="text-gray-600 mb-8">The delivery partner has been notified and is on their way.</p>
            <Link
                to="/dashboard"
                className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
            >
                Back to Dashboard
            </Link>
            </div>
        </div>
    );
};

export default AssignSuccess; 