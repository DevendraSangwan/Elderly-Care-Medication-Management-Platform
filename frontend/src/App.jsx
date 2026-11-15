import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ElderlyDashboard } from './pages/ElderlyDashboard';
import { FamilyDashboard } from './pages/FamilyDashboard';
import { CaregiverDashboard } from './pages/CaregiverDashboard';
import { MedicationsPage } from './pages/MedicationsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { AdherencePage } from './pages/AdherencePage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';

// Modals
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { EmailInboxModal } from './components/EmailInboxModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MedicationModal } from './components/MedicationModal';
import { AppointmentModal } from './components/AppointmentModal';
import { VitalsModal } from './components/VitalsModal';
import { CareCircleModal } from './components/CareCircleModal';

import { api } from './services/api';

export function App() {
  const { user, isAuthenticated, loading } = useAuth();

  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal States
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isCareCircleOpen, setIsCareCircleOpen] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Poll notifications count periodically
  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications(true)
        .then((res) => {
          if (res.success) setUnreadNotifications(res.unreadCount || 0);
        })
        .catch(console.error);

      const interval = setInterval(() => {
        api.getNotifications(true)
          .then((res) => {
            if (res.success) setUnreadNotifications(res.unreadCount || 0);
          })
          .catch(() => {});
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Unauthenticated view
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  // Dashboard role selector
  const renderDashboard = () => {
    switch (user?.role) {
      case 'elderly':
        return (
          <ElderlyDashboard
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenAI={() => setIsAIOpen(true)}
          />
        );
      case 'family':
        return (
          <FamilyDashboard
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenCareCircle={() => setIsCareCircleOpen(true)}
          />
        );
      case 'caregiver':
        return (
          <CaregiverDashboard
            onOpenMedicationModal={(med) => {
              setSelectedMedication(med || null);
              setIsMedicationModalOpen(true);
            }}
            onOpenAppointmentModal={(appt) => {
              setSelectedAppointment(appt || null);
              setIsAppointmentModalOpen(true);
            }}
            onOpenVitalsModal={() => setIsVitalsModalOpen(true)}
            onOpenCareCircle={() => setIsCareCircleOpen(true)}
          />
        );
      default:
        return (
          <ElderlyDashboard
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenAI={() => setIsAIOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenEmailInbox={() => setIsEmailInboxOpen(true)}
        unreadCount={unreadNotifications}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && renderDashboard()}

        {activeTab === 'medications' && (
          <MedicationsPage
            onOpenMedicationModal={() => {
              setSelectedMedication(null);
              setIsMedicationModalOpen(true);
            }}
            onEditMedication={(med) => {
              setSelectedMedication(med);
              setIsMedicationModalOpen(true);
            }}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsPage
            onOpenAppointmentModal={() => {
              setSelectedAppointment(null);
              setIsAppointmentModalOpen(true);
            }}
            onEditAppointment={(appt) => {
              setSelectedAppointment(appt);
              setIsAppointmentModalOpen(true);
            }}
          />
        )}

        {activeTab === 'adherence' && <AdherencePage />}

        {activeTab === 'profile' && (
          <ProfilePage onOpenCareCircle={() => setIsCareCircleOpen(true)} />
        )}

        {activeTab === 'notifications' && (
          <NotificationsPage onOpenEmailInbox={() => setIsEmailInboxOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 CareBridge Healthcare Platform &bull; Empowering Elderly Independence</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>HIPAA Compliant Standard</span>
            <span>Role-Based Access Control</span>
            <span>Emergency Telehealth Protocol</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EmergencySOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />

      <EmailInboxModal isOpen={isEmailInboxOpen} onClose={() => setIsEmailInboxOpen(false)} />

      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onRefreshSchedule={() => {}}
      />

      <AIAssistantModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <MedicationModal
        isOpen={isMedicationModalOpen}
        onClose={() => setIsMedicationModalOpen(false)}
        medication={selectedMedication}
        onSuccess={() => {}}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        appointment={selectedAppointment}
        onSuccess={() => {}}
      />

      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        onSuccess={() => {}}
      />

      <CareCircleModal
        isOpen={isCareCircleOpen}
        onClose={() => setIsCareCircleOpen(false)}
        onLinkedSuccess={() => {}}
      />
    </div>
  );
}
