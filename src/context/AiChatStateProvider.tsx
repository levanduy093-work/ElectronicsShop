import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

import type { ChatMessage, AiChatArchive } from '../types';
import { getAiChatHistory, saveAiChatHistory, getAiChatArchives, saveAiChatArchives } from '../services/api';
import { AiChatProvider, type AiChatContextValue } from './AiChatContext';
import { useAppOptional } from './AppContext';

const AI_CHAT_STORAGE_KEY_PREFIX = 'electronicsshop/ai-chat/messages';
const AI_CHAT_STORAGE_KEY_LEGACY = 'electronicsshop/ai-chat/messages';
const AI_CHAT_ARCHIVE_STORAGE_KEY_PREFIX = 'electronicsshop/ai-chat/archives';

function getAiChatStorageKey(userId?: string | null) {
    return userId
        ? `${AI_CHAT_STORAGE_KEY_PREFIX}/user/${userId}`
        : `${AI_CHAT_STORAGE_KEY_PREFIX}/guest`;
}

function getAiChatArchiveStorageKey(userId?: string | null) {
    return userId
        ? `${AI_CHAT_ARCHIVE_STORAGE_KEY_PREFIX}/user/${userId}`
        : `${AI_CHAT_ARCHIVE_STORAGE_KEY_PREFIX}/guest`;
}

async function loadPersistedAiMessages(userId?: string | null): Promise<ChatMessage[]> {
    try {
        const key = getAiChatStorageKey(userId);
        let stored = await AsyncStorage.getItem(key);

        // One-time migration from legacy single-key storage.
        if (!stored) {
            const legacy = await AsyncStorage.getItem(AI_CHAT_STORAGE_KEY_LEGACY);
            if (legacy) {
                stored = legacy;
                await AsyncStorage.setItem(key, legacy);
                await AsyncStorage.removeItem(AI_CHAT_STORAGE_KEY_LEGACY);
            }
        }

        if (!stored) return [];
        const raw = JSON.parse(stored) as any[];
        return (raw || []).map(item => ({
            ...item,
            timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        }));
    } catch (error) {
        console.warn('AiChatStateProvider - Failed to load AI chat messages', error);
        return [];
    }
}

async function persistAiMessages(messages: ChatMessage[], userId?: string | null) {
    try {
        const payload = messages.map(m => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
        }));
        await AsyncStorage.setItem(getAiChatStorageKey(userId), JSON.stringify(payload));
    } catch (error) {
        console.warn('AiChatStateProvider - Failed to persist AI chat messages', error);
    }
}

async function loadPersistedAiArchives(userId?: string | null): Promise<AiChatArchive[]> {
    try {
        const stored = await AsyncStorage.getItem(getAiChatArchiveStorageKey(userId));
        if (!stored) return [];
        const raw = JSON.parse(stored) as AiChatArchive[];
        return (raw || []).map((archive) => ({
            ...archive,
            messages: (archive.messages || []).map((item: any) => ({
                ...item,
                timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
            })),
        }));
    } catch (error) {
        console.warn('AiChatStateProvider - Failed to load AI chat archives', error);
        return [];
    }
}

async function persistAiArchives(archives: AiChatArchive[], userId?: string | null) {
    try {
        const payload = archives.map((archive) => ({
            ...archive,
            messages: (archive.messages || []).map((m) => ({
                ...m,
                timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
            })),
        }));
        await AsyncStorage.setItem(
            getAiChatArchiveStorageKey(userId),
            JSON.stringify(payload),
        );
    } catch (error) {
        console.warn('AiChatStateProvider - Failed to persist AI chat archives', error);
    }
}

interface AiChatStateProviderProps {
    children: React.ReactNode;
}

export function AiChatStateProvider({ children }: AiChatStateProviderProps) {
    const app = useAppOptional();
    const { t } = useTranslation();

    const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
    const aiMessagesRef = useRef<ChatMessage[]>([]);
    const [aiChatArchives, setAiChatArchives] = useState<AiChatArchive[]>([]);
    const aiChatArchivesRef = useRef<AiChatArchive[]>([]);
    const activeAiArchiveIdRef = useRef<string | null>(null);
    const aiChatSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const aiArchiveSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [shouldLoadAiChat, setShouldLoadAiChat] = useState(false);
    const accessTokenRef = useRef<string | null>(app?.authTokens?.accessToken || null);

    const isLoggedIn = Boolean(app?.isLoggedIn);
    const userId = app?.userId || null;
    const accessToken = app?.authTokens?.accessToken || null;

    useEffect(() => {
        accessTokenRef.current = accessToken;
    }, [accessToken]);

    const buildAiArchiveTitle = useCallback((messages: ChatMessage[]) => {
        const firstUserMessage = messages.find((m) => m.role === 'user')?.content?.trim();
        if (!firstUserMessage) return t('chat_history');
        return firstUserMessage.length > 48
            ? `${firstUserMessage.slice(0, 48)}...`
            : firstUserMessage;
    }, [t]);

    const normalizeMessagesForCompare = useCallback((messages: ChatMessage[]) => {
        return (messages || []).map((m) => ({
            role: m.role,
            content: m.content || '',
            type: m.type || 'text',
            metadata: m.metadata || null,
            cards: m.cards || [],
            orderCards: m.orderCards || [],
            addressCards: m.addressCards || [],
            actions: m.actions || [],
        }));
    }, []);

    const archiveCurrentAiChat = useCallback((messagesOverride?: ChatMessage[]) => {
        const current = messagesOverride && messagesOverride.length
            ? messagesOverride
            : (aiMessagesRef.current || []);
        if (!current.length) {
            setAiMessages([]);
            activeAiArchiveIdRef.current = null;
            return;
        }

        const now = new Date().toISOString();
        const activeArchiveId = activeAiArchiveIdRef.current;
        if (activeArchiveId) {
            setAiChatArchives((prev) => {
                const existingIndex = prev.findIndex((item) => item.id === activeArchiveId);
                if (existingIndex < 0) {
                    return prev;
                }
                const existing = prev[existingIndex];
                const sameContent =
                    JSON.stringify(normalizeMessagesForCompare(existing.messages || [])) ===
                    JSON.stringify(normalizeMessagesForCompare(current));

                if (sameContent) {
                    return prev;
                }

                const updated: AiChatArchive = {
                    ...existing,
                    title: buildAiArchiveTitle(current),
                    updatedAt: now,
                    messages: current,
                };
                const next = prev.filter((item) => item.id !== activeArchiveId);
                return [updated, ...next];
            });
            setAiMessages([]);
            aiMessagesRef.current = [];
            activeAiArchiveIdRef.current = null;
            return;
        }

        const archive: AiChatArchive = {
            id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: buildAiArchiveTitle(current),
            createdAt: now,
            updatedAt: now,
            messages: current,
        };

        setAiChatArchives((prev) => [archive, ...prev].slice(0, 50));
        setAiMessages([]);
        aiMessagesRef.current = [];
        activeAiArchiveIdRef.current = null;
    }, [buildAiArchiveTitle, normalizeMessagesForCompare]);

    const openAiChatArchive = useCallback((archiveId: string) => {
        const archive = aiChatArchivesRef.current.find((item) => item.id === archiveId);
        if (!archive) return;
        activeAiArchiveIdRef.current = archiveId;
        setAiMessages((archive.messages || []).map((m) => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
        })));
    }, []);

    const deleteAiChatArchive = useCallback((archiveId: string) => {
        if (activeAiArchiveIdRef.current === archiveId) {
            activeAiArchiveIdRef.current = null;
        }
        setAiChatArchives((prev) => prev.filter((item) => item.id !== archiveId));
    }, []);

    const clearAiChatArchives = useCallback(() => {
        activeAiArchiveIdRef.current = null;
        setAiChatArchives([]);
    }, []);

    const ensureAiChatLoaded = useCallback(() => {
        setShouldLoadAiChat(true);
    }, []);

    // Defer AI chat hydration until after initial interactions (or when AI tab opens)
    useEffect(() => {
        if (shouldLoadAiChat) return;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const task = InteractionManager.runAfterInteractions(() => {
            timeoutId = setTimeout(() => {
                setShouldLoadAiChat(true);
            }, 2500);
        });
        return () => {
            task.cancel?.();
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [shouldLoadAiChat]);

    // Load AI chat history by current user (or guest)
    useEffect(() => {
        if (!shouldLoadAiChat) return;
        let cancelled = false;
        const loadAiChatForCurrentUser = async () => {
            if (isLoggedIn && userId && accessToken) {
                const localUserArchives = await loadPersistedAiArchives(userId);
                try {
                    const remote = await getAiChatHistory(accessToken);
                    const remoteArchivesResponse = await getAiChatArchives(accessToken);
                    const remoteMessages = (remote?.messages || []).map((item: any) => ({
                        ...item,
                        timestamp: item?.timestamp ? new Date(item.timestamp) : new Date(),
                    })) as ChatMessage[];
                    const remoteArchives = (remoteArchivesResponse?.archives || []).map((arc: any) => ({
                        ...arc,
                        messages: (arc?.messages || []).map((m: any) => ({
                            ...m,
                            timestamp: m?.timestamp ? new Date(m.timestamp) : new Date(),
                        })),
                    })) as AiChatArchive[];
                    if (!cancelled) {
                        setAiMessages(remoteMessages);
                        aiMessagesRef.current = remoteMessages;
                        setAiChatArchives(remoteArchives);
                        aiChatArchivesRef.current = remoteArchives;
                    }
                    if (!remoteMessages.length) {
                        const localUserMessages = await loadPersistedAiMessages(userId);
                        if (localUserMessages.length) {
                            if (!cancelled) {
                                setAiMessages(localUserMessages);
                                aiMessagesRef.current = localUserMessages;
                            }
                            await saveAiChatHistory(
                                localUserMessages.map((m) => ({
                                    ...m,
                                    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
                                })) as any[],
                                accessToken,
                            );
                        }
                    }
                    if (!remoteArchives.length && localUserArchives.length) {
                        if (!cancelled) {
                            setAiChatArchives(localUserArchives);
                            aiChatArchivesRef.current = localUserArchives;
                        }
                        await saveAiChatArchives(
                            localUserArchives.map((arc) => ({
                                ...arc,
                                messages: (arc.messages || []).map((m) => ({
                                    ...m,
                                    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
                                })),
                            })) as any[],
                            accessToken,
                        );
                    }
                    return;
                } catch (error) {
                    console.warn('AiChatStateProvider - Failed to load AI chat history from API', error);
                }
                const localUserMessages = await loadPersistedAiMessages(userId);
                if (!cancelled) {
                    setAiMessages(localUserMessages);
                    aiMessagesRef.current = localUserMessages;
                    setAiChatArchives(localUserArchives);
                    aiChatArchivesRef.current = localUserArchives;
                }
                return;
            }

            const guestMessages = await loadPersistedAiMessages(null);
            const guestArchives = await loadPersistedAiArchives(null);
            if (!cancelled) {
                setAiMessages(guestMessages);
                aiMessagesRef.current = guestMessages;
                setAiChatArchives(guestArchives);
                aiChatArchivesRef.current = guestArchives;
            }
        };

        void loadAiChatForCurrentUser();
        return () => {
            cancelled = true;
        };
    }, [shouldLoadAiChat, isLoggedIn, userId, accessToken]);

    // Persist AI messages to local storage by user/guest
    useEffect(() => {
        if (!shouldLoadAiChat) return;
        aiMessagesRef.current = aiMessages;
        persistAiMessages(aiMessages, isLoggedIn && userId ? userId : null).catch(() => { });
    }, [aiMessages, isLoggedIn, userId, shouldLoadAiChat]);

    // Persist AI chat archives to local storage by user/guest
    useEffect(() => {
        if (!shouldLoadAiChat) return;
        aiChatArchivesRef.current = aiChatArchives;
        persistAiArchives(aiChatArchives, isLoggedIn && userId ? userId : null).catch(() => { });
    }, [aiChatArchives, isLoggedIn, userId, shouldLoadAiChat]);

    // Sync AI chat archives to backend (debounced)
    useEffect(() => {
        if (!shouldLoadAiChat) return;
        if (!isLoggedIn || !userId || !accessToken) return;
        if (aiArchiveSyncTimeoutRef.current) {
            clearTimeout(aiArchiveSyncTimeoutRef.current);
        }
        aiArchiveSyncTimeoutRef.current = setTimeout(async () => {
            try {
                const token = accessTokenRef.current;
                if (!token) return;
                const payload = aiChatArchivesRef.current.map((arc) => ({
                    ...arc,
                    messages: (arc.messages || []).map((m) => ({
                        ...m,
                        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
                    })),
                }));
                await saveAiChatArchives(payload as any[], token);
            } catch (error) {
                console.warn('AiChatStateProvider - Failed to sync AI chat archives', error);
            }
        }, 800);

        return () => {
            if (aiArchiveSyncTimeoutRef.current) {
                clearTimeout(aiArchiveSyncTimeoutRef.current);
            }
        };
    }, [aiChatArchives, isLoggedIn, userId, accessToken, shouldLoadAiChat]);

    // Sync AI chat history to backend (debounced)
    useEffect(() => {
        if (!shouldLoadAiChat) return;
        if (!isLoggedIn || !userId || !accessToken) return;
        if (aiChatSyncTimeoutRef.current) {
            clearTimeout(aiChatSyncTimeoutRef.current);
        }
        aiChatSyncTimeoutRef.current = setTimeout(async () => {
            try {
                const token = accessTokenRef.current;
                if (!token) return;
                const payload = aiMessagesRef.current.map((m) => ({
                    ...m,
                    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
                }));
                await saveAiChatHistory(payload as any[], token);
            } catch (error) {
                console.warn('AiChatStateProvider - Failed to sync AI chat history', error);
            }
        }, 800);

        return () => {
            if (aiChatSyncTimeoutRef.current) {
                clearTimeout(aiChatSyncTimeoutRef.current);
            }
        };
    }, [aiMessages, isLoggedIn, userId, accessToken, shouldLoadAiChat]);

    const contextValue: AiChatContextValue = useMemo(() => ({
        aiMessages,
        setAiMessages,
        aiChatArchives,
        archiveCurrentAiChat,
        openAiChatArchive,
        deleteAiChatArchive,
        clearAiChatArchives,
        ensureAiChatLoaded,
    }), [
        aiMessages,
        aiChatArchives,
        archiveCurrentAiChat,
        openAiChatArchive,
        deleteAiChatArchive,
        clearAiChatArchives,
        ensureAiChatLoaded,
    ]);

    return (
        <AiChatProvider value={contextValue}>
            {children}
        </AiChatProvider>
    );
}
