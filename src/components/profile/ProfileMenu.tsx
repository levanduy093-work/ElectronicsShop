import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme, lightTheme } from '../../theme';

interface ProfileMenuProps {
    onNavigateToOrders: () => void;
    onNavigateToWishlist: () => void;
    onNavigateToAddress: () => void;
    onNavigateToSettings: () => void;
    onNavigateToSupport: () => void;
    onLogout: () => void;
    onNavigateToAdmin?: () => void;
    isAdmin?: boolean;
    theme: Theme;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
    onNavigateToOrders,
    onNavigateToWishlist,
    onNavigateToAddress,
    onNavigateToSettings,
    onNavigateToSupport,
    onLogout,
    onNavigateToAdmin,
    isAdmin = false,
    theme: t,
}) => {
    const { t: translate } = useTranslation();

    return (
        <View className="gap-6">
            <View
                className="rounded-2xl overflow-hidden shadow-sm elevation-2 border"
                style={{ backgroundColor: t.card, shadowOpacity: t === lightTheme ? 0.05 : 0, borderColor: t.border }}
            >
                <MenuItem
                    icon="package"
                    label={translate('my_orders')}
                    onPress={onNavigateToOrders}
                    theme={t}
                />
                <View className="h-px mx-4" style={{ backgroundColor: t.border }} />
                <MenuItem
                    icon="heart"
                    label={translate('favorite_products')}
                    onPress={onNavigateToWishlist}
                    theme={t}
                />
                <View className="h-px mx-4" style={{ backgroundColor: t.border }} />
                <MenuItem
                    icon="map-pin"
                    label={translate('address_book')}
                    onPress={onNavigateToAddress}
                    theme={t}
                />
            </View>

            <View
                className="rounded-2xl overflow-hidden shadow-sm elevation-2 border"
                style={{ backgroundColor: t.card, shadowOpacity: t === lightTheme ? 0.05 : 0, borderColor: t.border }}
            >
                <MenuItem
                    icon="settings"
                    label={translate('settings')}
                    onPress={onNavigateToSettings}
                    theme={t}
                />
                <View className="h-px mx-4" style={{ backgroundColor: t.border }} />
                <MenuItem
                    icon="headset"
                    label={translate('support_center')}
                    onPress={onNavigateToSupport}
                    theme={t}
                />
                {isAdmin && (
                    <>
                        <View className="h-px mx-4" style={{ backgroundColor: t.border }} />
                        <MenuItem
                            icon="plus-circle"
                            label="Admin: Thêm sản phẩm"
                            onPress={onNavigateToAdmin}
                            theme={t}
                        />
                    </>
                )}
            </View>

            <TouchableOpacity
                onPress={onLogout}
                className="flex-row items-center justify-center gap-2 rounded-2xl p-4 border"
                style={{ backgroundColor: t.card, borderColor: t.border }}
                activeOpacity={0.7}
            >
                <AppIcon name="log-out" size={18} color="#EF4444" />
                <Text className="text-base font-medium" style={{ color: '#EF4444' }}>{translate('logout')}</Text>
            </TouchableOpacity>
        </View>
    );
};

function MenuItem({ icon, label, onPress, theme }: { icon: string; label: string; onPress?: () => void; theme: Theme }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row justify-between items-center p-4"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center gap-3">
                <View
                    className="w-8 h-8 rounded-full justify-center items-center"
                    style={{ backgroundColor: theme.surface }}
                >
                    <AppIcon name={icon} size={16} color={theme.primary} />
                </View>
                <Text className="text-base font-medium" style={{ color: theme.text }}>{label}</Text>
            </View>
            <AppIcon name="chevron-right" size={16} color={theme.muted} />
        </TouchableOpacity>
    );
}
