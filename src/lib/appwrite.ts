import { Client, Account, Databases } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69285d7c0000be1bb5a1');

export const account = new Account(client);
export const databases = new Databases(client);

// Database Constants (User will need to create these in Appwrite Console)
export const DATABASE_ID = 'gamified-task-tracker';
export const COLLECTIONS = {
    TASKS: 'tasks',
    TRACKERS: 'trackers',
    USER_STATS: 'user_stats'
};
