import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        <View
            className="flex-row items-center gap-4 mb-8 p-4 rounded-3xl border shadow-sm elevation-2"
            style={{
                borderColor: t.border,
                backgroundColor: t.card,
                shadowOpacity: t === lightTheme ? 0.05 : 0,
                elevation: t === lightTheme ? 2 : 0,
            }}
        >
            <View className="relative">
                <TouchableOpacity
                    onPress={() => userProfile.avatar && onViewAvatar(userProfile.avatar)}
                    className="w-16 h-16 rounded-full border-2 p-0.5"
                    style={{ borderColor: t.primary }}
                    activeOpacity={userProfile.avatar ? 0.8 : 1}
                    disabled={!userProfile.avatar}
                >
                    {userProfile.avatar ? (
                        <ImageWithFallback
                            source={{ uri: userProfile.avatar }}
                            className="w-full h-full rounded-full"
                        />
                    ) : (
                        <View
                            className="w-full h-full rounded-full justify-center items-center"
                            style={{ backgroundColor: t.surface }}
                        >
                            <AppIcon name="user" size={32} color={t.muted} />
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onEditProfile}
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full justify-center items-center border-2 border-white"
                    style={{ backgroundColor: t.primary }}
                    activeOpacity={0.8}
                >
                    <AppIcon name="camera" size={12} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-xl font-bold flex-1" style={{ color: t.text }}>{userProfile.name}</Text>
                    <TouchableOpacity
                        onPress={onEditProfile}
                        className="p-1"
                        activeOpacity={0.7}
                    >
                        <AppIcon name="pencil" size={16} color={t.primary} />
                    </TouchableOpacity>
                </View>
                <Text className="text-sm" style={{ color: t.muted }}>{userProfile.email}</Text>
            </View>
        </View>
    );
};
