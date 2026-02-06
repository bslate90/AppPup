import './WalkingDog.css';

interface WalkingDogLoaderProps {
    message?: string;
}

/**
 * Animated walking dog loader
 * A cute dog animation that walks in place while loading
 */
export function WalkingDogLoader({ message = 'Loading...' }: WalkingDogLoaderProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="text-center">
                {/* Walking Dog Animation */}
                <div className="walking-dog-container mb-6">
                    <div className="walking-dog">
                        {/* Dog Body */}
                        <div className="dog-body">
                            {/* Head */}
                            <div className="dog-head">
                                <div className="dog-ear dog-ear-left"></div>
                                <div className="dog-ear dog-ear-right"></div>
                                <div className="dog-face">
                                    <div className="dog-eye dog-eye-left"></div>
                                    <div className="dog-eye dog-eye-right"></div>
                                    <div className="dog-nose"></div>
                                    <div className="dog-tongue"></div>
                                </div>
                            </div>

                            {/* Torso */}
                            <div className="dog-torso">
                                <div className="dog-spot dog-spot-1"></div>
                                <div className="dog-spot dog-spot-2"></div>
                            </div>

                            {/* Tail */}
                            <div className="dog-tail"></div>

                            {/* Legs */}
                            <div className="dog-leg dog-leg-front-left"></div>
                            <div className="dog-leg dog-leg-front-right"></div>
                            <div className="dog-leg dog-leg-back-left"></div>
                            <div className="dog-leg dog-leg-back-right"></div>
                        </div>
                    </div>

                    {/* Ground/Shadow */}
                    <div className="dog-shadow"></div>
                </div>

                {/* Loading Text */}
                <div className="flex items-center justify-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300 font-medium text-lg">{message}</span>
                    <div className="loading-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>

                {/* Paw prints trail */}
                <div className="paw-prints mt-8">
                    {[...Array(5)].map((_, i) => (
                        <span
                            key={i}
                            className="paw-print"
                            style={{
                                animationDelay: `${i * 0.2}s`,
                                left: `${20 + i * 15}%`
                            }}
                        >
                            🐾
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WalkingDogLoader;
