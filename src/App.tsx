import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TrackerView } from './pages/TrackerView';
import { Calendar } from './pages/Calendar';
import { TasksPage } from './pages/TasksPage';
import { HabitsPage } from './pages/HabitsPage';
import { CoursesPage } from './pages/CoursesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { StatsPage } from './pages/StatsPage';
import { RemindersPage } from './pages/RemindersPage';

import { ThemePreloader } from './components/ThemePreloader';
import { ChatWidget } from './components/ChatWidget';
import { AlarmOverlay } from './components/AlarmOverlay';

function App() {
    return (
        <ToastProvider>
            <GameProvider>
                <ThemePreloader />
                <AlarmOverlay />
                <BrowserRouter>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/tasks" element={<TasksPage />} />
                            <Route path="/habits" element={<HabitsPage />} />
                            <Route path="/courses" element={<CoursesPage />} />
                            <Route path="/stats" element={<StatsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route path="/tracker/:id" element={<TrackerView />} />
                            <Route path="/reminders" element={<RemindersPage />} />
                        </Routes>
                        <ChatWidget />
                    </Layout>
                </BrowserRouter>
            </GameProvider>
        </ToastProvider>
    );
}

export default App;
