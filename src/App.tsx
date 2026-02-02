import { useState, useEffect } from 'react';
import { useSupabaseData } from './hooks/useSupabaseData';
import type { TabId, WeightUnit } from './types';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import NutritionEngine from './components/NutritionEngine';
import VaccineManager from './components/VaccineManager';
import GrowthTracker from './components/GrowthTracker';
import ResourceHub from './components/ResourceHub';
import EmergencyGuide from './components/EmergencyGuide';
import ProfileModal from './components/ProfileModal';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('oz');

  // Dark mode state with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('puppilot-dark-mode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('puppilot-dark-mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev: boolean) => !prev);

  const {
    loading,
    error,
    profile,
    foodBrands,
    healthSchedule,
    weightLog,
    vitalsLog,
    currentWeight,
    ageInWeeks,
    upcomingAlerts,
    updateProfile,
    addFoodBrand,
    updateFoodBrand,
    deleteFoodBrand,
    setDefaultFoodBrand,
    generateSchedule,
    updateHealthEntry,
    addWeightEntry,
    deleteWeightEntry,
    addVitalsEntry,
    todayFeedings,
    addFeedingEntry,
    deleteFeedingEntry,
    exportVetReport,
  } = useSupabaseData();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your puppy data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-800 font-medium mb-2">Error loading data</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            profile={profile}
            currentWeight={currentWeight}
            ageInWeeks={ageInWeeks}
            upcomingAlerts={upcomingAlerts}
            weightUnit={weightUnit}
            onExport={exportVetReport}
            onSetupProfile={() => setShowProfileModal(true)}
            onUnitChange={setWeightUnit}
          />
        );

      case 'nutrition':
        return (
          <NutritionEngine
            currentWeight={currentWeight}
            ageInWeeks={ageInWeeks}
            foodBrands={foodBrands}
            weightUnit={weightUnit}
            todayFeedings={todayFeedings}
            onAddFood={addFoodBrand}
            onUpdateFood={updateFoodBrand}
            onDeleteFood={deleteFoodBrand}
            onSetDefaultFood={setDefaultFoodBrand}
            onLogFeeding={addFeedingEntry}
            onDeleteFeeding={deleteFeedingEntry}
            onUnitChange={setWeightUnit}
          />
        );

      case 'health':
        return (
          <VaccineManager
            birthDate={profile?.birthDate || null}
            breed={profile?.breed || 'Mixed'}
            healthSchedule={healthSchedule}
            onGenerateSchedule={generateSchedule}
            onUpdateEntry={updateHealthEntry}
          />
        );

      case 'growth':
        return (
          <GrowthTracker
            birthDate={profile?.birthDate || null}
            breed={profile?.breed || 'Chihuahua'}
            weightLog={weightLog}
            vitalsLog={vitalsLog}
            weightUnit={weightUnit}
            onAddWeight={addWeightEntry}
            onDeleteWeight={deleteWeightEntry}
            onAddVitals={addVitalsEntry}
            onUnitChange={setWeightUnit}
          />
        );

      case 'resources':
        return <ResourceHub />;

      case 'emergency':
        return <EmergencyGuide />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <Header puppyName={profile?.name} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onSave={updateProfile}
        onGenerateSchedule={generateSchedule}
      />
    </div>
  );
}

export default App;
