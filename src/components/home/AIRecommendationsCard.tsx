import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

interface AIRecommendationsCardProps {
    onPress: () => void;
}

function AIRecommendationsCardComponent({ onPress }: AIRecommendationsCardProps) {
    const { t } = useTranslation();

    return (
        <TouchableOpacity
            onPress={onPress}
            className="rounded-2xl mb-8 overflow-hidden bg-white"
            style={{
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                    },
                    android: {
                        elevation: 4,
                    },
                }),
            }}
            activeOpacity={0.9}
        >
            <View className="bg-indigo-500 p-5 relative">
                <View className="relative z-10">
                    <View className="mb-2">
                        <View className="bg-white/20 px-2 py-1 rounded self-start">
                            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                                AI Engineer
                            </Text>
                        </View>
                    </View>
                    <Text className="text-xl font-bold text-white mb-2">
                        {t('ai_card_title')}
                    </Text>
                    <Text className="text-sm text-white/90 mb-4 leading-5">
                        {t('ai_card_desc')}
                    </Text>
                    <View className="bg-white px-5 py-2.5 rounded-xl self-start">
                        <Text className="text-indigo-500 text-sm font-bold">
                            {t('chat_with_ai')}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export const AIRecommendationsCard = React.memo(AIRecommendationsCardComponent);
