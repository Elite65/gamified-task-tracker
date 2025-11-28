import { Client, Account, Databases } from 'appwrite';

export const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

console.log('Appwrite Config:', {
    endpoint: endpoint || 'MISSING',
    projectId: projectId || 'MISSING'
});

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

// Database Constants (User will need to create these in Appwrite Console)
export const DATABASE_ID = 'gamified-task-tracker';
export const COLLECTIONS = {
    TASKS: 'tasks',
    TRACKERS: 'trackers',
    USER_STATS: 'user_stats'
};
