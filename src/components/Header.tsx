import { Moon, Sun, Sparkles, Users } from 'lucide-react';

interface HeaderProps {
    puppyName?: string;
    isDarkMode?: boolean;
    onToggleDarkMode?: () => void;
    isAdmin?: boolean;
    onManageFamily?: () => void;
}

export function Header({
    puppyName,
    isDarkMode,
    onToggleDarkMode,
    isAdmin,
    onManageFamily
}: HeaderProps) {
    return (
        <header className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white p-4 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1 rounded-xl backdrop-blur-sm overflow-hidden">
                        <img
                            src="/dr-pup-logo.jpg"
                            alt="PupPilot Logo"
                            className="w-10 h-10 rounded-lg object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            PupPilot
                            <Sparkles className="w-4 h-4 text-amber-300" />
                        </h1>
                        <p className="text-xs text-white/80">
                            Navigate Your Puppy's Growth with Ease
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {puppyName && (
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-white/80">Caring for</p>
                            <p className="font-semibold">{puppyName}</p>
                        </div>
                    )}

                    {/* Family Management - Admin Only */}
                    {isAdmin && onManageFamily && (
                        <button
                            onClick={onManageFamily}
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200"
                            aria-label="Manage Family Members"
                            title="Manage Family Members"
                        >
                            <Users className="w-5 h-5" />
                        </button>
                    )}

                    {onToggleDarkMode && (
                        <button
                            onClick={onToggleDarkMode}
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200"
                            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-amber-200" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;

