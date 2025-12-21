import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'maskable-icon-512.png', 'vite.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png'],
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
        id: 'elite65-task-tracker',
        categories: ['productivity', 'utilities', 'lifestyle'],
        iarc_rating_id: 'e84b072d-71b3-4d3e-86ae-31a8ce4e53b7', // Generic IARC for Utility
        prefer_related_applications: false,
        shortcuts: [
          {
            name: 'My Tasks',
            short_name: 'Tasks',
            description: 'View your pending missions',
            url: '/tasks',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Habit Protocols',
            short_name: 'Habits',
            description: 'Track your daily protocols',
            url: '/habits',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Stats & Rank',
            short_name: 'Stats',
            description: 'Check your progress and rank',
            url: '/stats',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          }
        ],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/dashboard-wide.png',
            sizes: '1024x460',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Dashboard Command Center'
          },
          {
            src: 'screenshots/analytics-mobile.png',
            sizes: '613x1024',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Advanced Analytics (Mobile)'
          },
          {
            src: 'screenshots/habits-wide.png',
            sizes: '1024x417',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Habit Protocols'
          },
          {
            src: 'screenshots/tasks-wide.png',
            sizes: '1024x301',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Mission Control'
          }
        ]
      }
    })
  ],
})
