import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '../context/ToastContext';

export const ReloadPrompt = () => {
    const { showToast } = useToast();

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: any) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error);
        },
    });

    React.useEffect(() => {
        if (needRefresh) {
            // Custom toast with action
            // Since our simple toast doesn't support buttons easily, we might just auto-reload or show a persistent message.
            // But let's try to notify user.
            // For now, let's just use the toast text to tell them to refresh. 
            // Ideally we want a button. 

            const userConfirmed = window.confirm("New version available! Reload to update?");
            if (userConfirmed) {
                updateServiceWorker(true);
            }
        }
    }, [needRefresh, updateServiceWorker]);

    return null; // Headless component, logic only for this MVP
};
