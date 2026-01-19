import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { AppIcon } from '../../components/common/Icon';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { Theme, lightTheme } from '../../theme';

interface ProfileHeaderProps {
    userProfile: {
        name: string;
        email: string;
        avatar: string;
    };
    onEditProfile: () => void;
    onViewAvatar: (uri: string) => void;
    theme: Theme;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    userProfile,
    onEditProfile,
    onViewAvatar,
    theme: t,
}) => {
    return (
        <View style={[
            styles.profileHeader,
            {
                borderColor: t.border,
                backgroundColor: t.card,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0,
            }
        ]}>
            <View style={styles.avatarWrapper}>
                <TouchableOpacity
                    onPress={() => userProfile.avatar && onViewAvatar(userProfile.avatar)}
                    style={styles.avatarContainer}
                    activeOpacity={userProfile.avatar ? 0.8 : 1}
                    disabled={!userProfile.avatar}
                >
                    {userProfile.avatar ? (
                        <ImageWithFallback
                            source={{ uri: userProfile.avatar }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: t.surface }]}>
                            <AppIcon name="user" size={32} color={t.muted} />
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onEditProfile}
                    style={[styles.editAvatarBadge, { backgroundColor: t.primary }]}
                    activeOpacity={0.8}
                >
                    <AppIcon name="camera" size={14} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                    <Text style={[styles.profileName, { color: t.text }]}>{userProfile.name}</Text>
                    <TouchableOpacity
                        onPress={onEditProfile}
                        style={styles.editNameButton}
                        activeOpacity={0.7}
                    >
                        <AppIcon name="pencil" size={16} color={t.primary} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.profileEmail, { color: t.muted }]}>{userProfile.email}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 32,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
        borderColor: '#E5E7EB',
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#2563EB',
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
    },
    editNameButton: {
        padding: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#6B7280',
    },
});
