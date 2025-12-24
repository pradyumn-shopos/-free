import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sitePassword = import.meta.env.VITE_SITE_PASSWORD;

        // Fallback if env var is not set (optional, or strict)
        // For now, let's assume if env var is missing, any non-empty password works or strict check?
        // User said "put this password in the env file".
        // If not set, maybe default to "admin" for local testing or block?
        // Let's check against the env var.

        if (password === sitePassword) {
            onLogin();
        } else {
            setError(true);
        }
    };

    return (
        <div className="min-h-screen bg-salmon flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white neo-border neo-shadow-lg p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-black transform rotate-45 translate-x-8 -translate-y-8"></div>

                    <div className="flex flex-col items-center mb-8">
                        <h1 className="text-4xl font-display text-black mb-2">
                            ✦ free
                        </h1>
                        <p className="font-mono text-sm text-gray-500 uppercase tracking-widest">Access Required</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(false);
                                }}
                                placeholder="Enter Password"
                                className="w-full h-12 px-4 bg-gray-50 border-2 border-black focus:outline-none focus:bg-white font-mono text-lg placeholder-gray-400 transition-colors"
                                autoFocus
                            />
                            {error && (
                                <p className="mt-2 text-red-600 font-bold text-sm bg-red-50 p-2 border border-red-200">
                                    INCORRECT PASSWORD
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full h-14 bg-black text-white font-display text-xl uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
                        >
                            <span>Enter</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <div className="inline-flex items-center gap-2 text-xs font-mono text-gray-400">
                            <Sparkles className="w-3 h-3" />
                            <span>SECURE ACCESS</span>
                            <Sparkles className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
