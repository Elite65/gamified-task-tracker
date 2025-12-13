import { Client, Account, Databases, Avatars, Storage } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);
export const storage = new Storage(client);

// Database Constants (User will need to create these in Appwrite Console)
export const DATABASE_ID = 'gamified-task-tracker';
export const COLLECTIONS = {
    TASKS: 'tasks',
    TRACKERS: 'trackers',
    USER_STATS: 'user_stats'
};

export const BUCKET_ID = 'user-avatars';
