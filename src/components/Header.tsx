import { Dog, Sparkles } from 'lucide-react';

interface HeaderProps {
    puppyName?: string;
}

export function Header({ puppyName }: HeaderProps) {
    return (
        <header className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white p-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Dog className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            AppPup
                            <Sparkles className="w-4 h-4 text-amber-300" />
                        </h1>
                        <p className="text-xs text-white/80">
                            Health & Nutrition Command Center
                        </p>
                    </div>
                </div>
                {puppyName && (
                    <div className="text-right">
                        <p className="text-xs text-white/80">Caring for</p>
                        <p className="font-semibold">{puppyName}</p>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
