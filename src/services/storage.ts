import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '../types';

const CHAT_HISTORY_KEY_PREFIX = '@chat_history';
const CHAT_ARCHIVES_KEY_PREFIX = '@chat_archives';

// Helper to get user-specific key
const getChatHistoryKey = (userId?: string | null) =>
    userId ? `${CHAT_HISTORY_KEY_PREFIX}_${userId}` : CHAT_HISTORY_KEY_PREFIX;

const getChatArchivesKey = (userId?: string | null) =>
    userId ? `${CHAT_ARCHIVES_KEY_PREFIX}_${userId}` : CHAT_ARCHIVES_KEY_PREFIX;

export interface ChatSession {
    id: string;
    timestamp: number;
    snippet: string;
    messages: ChatMessage[];
}


export const saveChatHistory = async (messages: ChatMessage[], userId?: string | null) => {
    try {
        const jsonValue = JSON.stringify(messages);
        await AsyncStorage.setItem(getChatHistoryKey(userId), jsonValue);
    } catch (e) {
        console.warn('Failed to save chat history', e);
    }
};

export const loadChatHistory = async (userId?: string | null): Promise<ChatMessage[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(getChatHistoryKey(userId));
        console.log('[Storage] Loaded chat history:', jsonValue ? 'found data' : 'empty');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.warn('Failed to load chat history', e);
        return [];
    }
};

export const clearChatHistory = async (userId?: string | null) => {
    try {
        await AsyncStorage.removeItem(getChatHistoryKey(userId));
        await AsyncStorage.removeItem(getChatArchivesKey(userId));
        console.log('[Storage] Cleared chat history for user:', userId || 'guest');
    } catch (e) {
        console.warn('Failed to clear chat history', e);
    }
};

export const saveArchivedSession = async (messages: ChatMessage[], userId?: string | null) => {
    if (!messages || messages.length === 0) return;
    try {
        const archives = await loadArchivedSessions(userId);
        const lastMsg = messages[messages.length - 1];
        const snippet = lastMsg.content.substring(0, 50) + (lastMsg.content.length > 50 ? '...' : '');

        const newSession: ChatSession = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            snippet,
            messages
        };

        const newArchives = [newSession, ...archives];
        await AsyncStorage.setItem(getChatArchivesKey(userId), JSON.stringify(newArchives));
        console.log('[Storage] Archived session:', newSession.id);
    } catch (e) {
        console.warn('Failed to archive session', e);
    }
};

export const loadArchivedSessions = async (userId?: string | null): Promise<ChatSession[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(getChatArchivesKey(userId));
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.warn('Failed to load archives', e);
        return [];
    }
};


export const saveAddresses = async (addresses: any[]) => { // Using any[] to avoid circular dependency if types are messy, or better import Address
    try {
        await AsyncStorage.setItem('@addresses', JSON.stringify(addresses));
    } catch (e) {
        console.warn('Failed to save addresses', e);
    }
};

export const loadLocalAddresses = async (): Promise<any[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem('@addresses');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.warn('Failed to load local addresses', e);
        return [];
    }
};
