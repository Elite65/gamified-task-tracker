import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log("Main.tsx executing...");

// Simple Error Boundary to catch render errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: '#ff4444', padding: 40, background: '#1a1a1a', height: '100vh' }}>
                    <h1>Application Crashed 💥</h1>
                    <pre style={{ background: '#000', padding: 20, overflow: 'auto' }}>
                        {this.state.error?.message}
                        {'\n' + this.state.error?.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

try {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>,
    )
} catch (e: any) {
    // This catches errors outside React tree
    console.error("Critical Startup Error:", e);
}
