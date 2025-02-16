import { FcGoogle } from "react-icons/fc";

export default function SignIn() {
    const handleSignIn = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/login`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Choose your preferred sign in method
                    </p>
                </div>
                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleSignIn}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FcGoogle className="text-xl" />
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
}