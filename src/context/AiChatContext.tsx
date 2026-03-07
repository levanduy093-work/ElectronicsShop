import React, { createContext, useContext } from 'react';
import type { ChatMessage, AiChatArchive } from '../types';

export interface AiChatContextValue {
    aiMessages: ChatMessage[];
    setAiMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    aiChatArchives: AiChatArchive[];
    archiveCurrentAiChat: (messagesOverride?: ChatMessage[]) => void;
    openAiChatArchive: (archiveId: string) => void;
    deleteAiChatArchive: (archiveId: string) => void;
    clearAiChatArchives: () => void;
    ensureAiChatLoaded: () => void;
}

const AiChatContext = createContext<AiChatContextValue | null>(null);

export const AiChatProvider = AiChatContext.Provider;

export function useAiChatOptional(): AiChatContextValue | null {
    return useContext(AiChatContext);
}
