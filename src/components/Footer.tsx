import { Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="text-center py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
            <p className="flex items-center justify-center gap-1 flex-wrap">
                <span>Created by Brett with</span>
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                <span>| © 2026 Slater Innovations</span>
            </p>
        </footer>
    );
}

export default Footer;
