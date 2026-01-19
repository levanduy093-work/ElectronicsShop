import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface AIRecommendationsCardProps {
    onPress: () => void;
}

export const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({ onPress }) => {
    const { t } = useTranslation();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.aiCard}
            activeOpacity={0.9}
        >
            <View style={styles.aiCardBackground}>
                <View style={styles.aiCardContent}>
                    <View style={styles.aiBadgeContainer}>
                        <View style={styles.aiBadge}>
                            <Text style={styles.aiBadgeText}>AI Engineer</Text>
                        </View>
                    </View>
                    <Text style={styles.aiTitle}>{t('ai_card_title')}</Text>
                    <Text style={styles.aiDescription}>
                        {t('ai_card_desc')}
                    </Text>
                    <View style={styles.aiButton}>
                        <Text style={styles.aiButtonText}>{t('chat_with_ai')}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    aiCard: {
        borderRadius: 16,
        marginBottom: 32,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    aiCardBackground: {
        backgroundColor: '#6366F1',
        padding: 20,
        position: 'relative',
    },
    aiCardContent: {
        position: 'relative',
        zIndex: 10,
    },
    aiBadgeContainer: {
        marginBottom: 8,
    },
    aiBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    aiBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    aiTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    aiDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 16,
        lineHeight: 20,
    },
    aiButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    aiButtonText: {
        color: '#6366F1',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
