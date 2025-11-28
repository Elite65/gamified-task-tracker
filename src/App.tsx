import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TrackerView } from './pages/TrackerView';
import { Calendar } from './pages/Calendar';
import { TasksPage } from './pages/TasksPage';
import { CoursesPage } from './pages/CoursesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

function App() {
    return (
        <ToastProvider>
            <GameProvider>
                <BrowserRouter>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/tasks" element={<TasksPage />} />
                            <Route path="/courses" element={<CoursesPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/tracker/:id" element={<TrackerView />} />
                        </Routes>
                    </Layout>
                </BrowserRouter>
            </GameProvider>
        </ToastProvider>
    );
}

export default App;
