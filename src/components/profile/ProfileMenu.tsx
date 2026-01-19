import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    theme: Theme;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
    onNavigateToOrders,
    onNavigateToWishlist,
    onNavigateToAddress,
    onNavigateToSettings,
    onNavigateToSupport,
    onLogout,
    theme: t,
}) => {
    const { t: translate } = useTranslation();

    return (
        <View style={styles.menuContainer}>
            <View style={[styles.menuGroup, { backgroundColor: t.card, shadowOpacity: t === lightTheme ? 0.05 : 0, borderColor: t.border }]}>
                <MenuItem
                    icon="package"
                    label={translate('my_orders')}
                    onPress={onNavigateToOrders}
                    theme={t}
                />
                <View style={[styles.menuDivider, { backgroundColor: t.border }]} />
                <MenuItem
                    icon="heart"
                    label={translate('favorite_products')}
                    onPress={onNavigateToWishlist}
                    theme={t}
                />
                <View style={[styles.menuDivider, { backgroundColor: t.border }]} />
                <MenuItem
                    icon="map-pin"
                    label={translate('address_book')}
                    onPress={onNavigateToAddress}
                    theme={t}
                />
            </View>

            <View style={[styles.menuGroup, { backgroundColor: t.card, shadowOpacity: t === lightTheme ? 0.05 : 0, borderColor: t.border }]}>
                <MenuItem
                    icon="settings"
                    label={translate('settings')}
                    onPress={onNavigateToSettings}
                    theme={t}
                />
                <View style={[styles.menuDivider, { backgroundColor: t.border }]} />
                <MenuItem
                    icon="help-circle"
                    label={translate('support_center')}
                    onPress={onNavigateToSupport}
                    theme={t}
                />
            </View>

            <TouchableOpacity
                onPress={onLogout}
                style={[styles.logoutButton, { backgroundColor: t.card, borderColor: t.border }]}
                activeOpacity={0.7}
            >
                <AppIcon name="log-out" size={18} color="#EF4444" />
                <Text style={[styles.logoutText, { color: '#EF4444' }]}>{translate('logout')}</Text>
            </TouchableOpacity>
        </View>
    );
};

function MenuItem({ icon, label, onPress, theme }: { icon: string; label: string; onPress?: () => void; theme: Theme }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.menuItem}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: theme.surface }]}>
                    <AppIcon name={icon} size={16} color={theme.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
            </View>
            <AppIcon name="chevron-right" size={16} color={theme.muted} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    menuContainer: {
        gap: 24,
    },
    menuGroup: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1, // Added border width to match prop usage
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 16,
        marginRight: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#EF4444',
    },
});
