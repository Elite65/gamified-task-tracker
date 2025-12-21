import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'maskable-icon.png'],
      manifest: {
        name: 'Elite65 Task Tracker',
        short_name: 'Elite65',
        description: 'Gamified Task & Habit Tracker with Tactical Alerts',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['productivity', 'utilities', 'lifestyle'],
        iarc_rating_id: 'e84b072d-71b3-4d3e-86ae-31a8ce4e53b7', // Generic IARC for Utility
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/dashboard-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Dashboard Command Center'
          },
          {
            src: 'screenshots/analytics-mobile.png',
            sizes: '450x800',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Advanced Analytics (Mobile)'
          },
          {
            src: 'screenshots/habits-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Habit Protocols'
          },
          {
            src: 'screenshots/tasks-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Mission Control'
          }
        ]
      }
    })
  ],
})
