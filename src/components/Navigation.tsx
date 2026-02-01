import {
    HomeIcon,
    FoodBowlIcon,
    VaccineIcon,
    GrowthIcon,
    LearnIcon,
    EmergencyIcon
} from './icons/NavIcons';
import type { TabId } from '../types';

interface NavigationProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <HomeIcon /> },
    { id: 'nutrition', label: 'Food', icon: <FoodBowlIcon /> },
    { id: 'health', label: 'Shots', icon: <VaccineIcon /> },
    { id: 'growth', label: 'Growth', icon: <GrowthIcon /> },
    { id: 'resources', label: 'Learn', icon: <LearnIcon /> },
    { id: 'emergency', label: 'SOS', icon: <EmergencyIcon /> },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
    return (
        <nav className="fixed bottom-2.5 left-4 right-4 z-40 safe-area-pb">
            <div className="max-w-md mx-auto">
                <div className="glassmorphic-nav">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
