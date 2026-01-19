import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';

interface AuthFormProps {
    isRegister: boolean;
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    name: string;
    setName: (val: string) => void;
    onSubmit: () => void;
    onForgotPassword: () => void;
    onToggleMode: () => void;
    isSubmitting: boolean;
    theme: Theme;
}

export const AuthForm: React.FC<AuthFormProps> = ({
    isRegister,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    onSubmit,
    onForgotPassword,
    onToggleMode,
    isSubmitting,
    theme: t,
}) => {
    const { t: translate } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <View style={styles.header}>
                <Text style={[styles.brandTitle, { color: t.primary }]}>{translate('app_name')}</Text>
                <Text style={[styles.subtitle, { color: t.muted }]}>
                    {isRegister ? translate('create_account') : translate('welcome_back')}
                </Text>
            </View>

            <View style={styles.form}>
                {isRegister && (
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: t.text }]}>{translate('full_name')}</Text>
                        <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]} pointerEvents="box-none">
                            <AppIcon name="user" size={20} color={t.muted} style={styles.inputIcon} />
                            <TextInput
                                placeholder={translate('enter_name_placeholder')}
                                value={name}
                                onChangeText={setName}
                                style={[styles.input, { color: t.text }]}
                                placeholderTextColor={t.muted}
                                editable={true}
                            />
                        </View>
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: t.text }]}>{translate('email')}</Text>
                    <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]} pointerEvents="box-none">
                        <AppIcon name="mail" size={20} color={t.muted} style={styles.inputIcon} />
                        <TextInput
                            placeholder="example@email.com"
                            value={email}
                            onChangeText={setEmail}
                            style={[styles.input, { color: t.text }]}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={t.muted}
                            editable={true}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Text style={[styles.label, { color: t.text }]}>{translate('password')}</Text>
                        {!isRegister && (
                            <TouchableOpacity
                                onPress={onForgotPassword}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.forgotPassword, { color: t.primary }]}>{translate('forgot_password_link')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
                        <AppIcon name="lock" size={20} color={t.muted} style={styles.inputIcon} />
                        <TextInput
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            style={[styles.input, { color: t.text }]}
                            secureTextEntry={!showPassword}
                            placeholderTextColor={t.muted}
                            editable={true}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeButton}
                            activeOpacity={0.7}
                        >
                            <AppIcon
                                name={showPassword ? "eye-off" : "eye"}
                                size={20}
                                color={t.muted}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={onSubmit}
                    style={[
                        styles.primaryButton,
                        { backgroundColor: t.primary },
                        isSubmitting && { opacity: 0.9 },
                    ]}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                >
                    <Text style={styles.primaryButtonText}>
                        {isSubmitting ? translate('processing') : isRegister ? translate('register') : translate('login')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: t.muted }]}>
                    {isRegister ? translate('already_have_account') : translate('not_have_account')}
                </Text>
                <TouchableOpacity
                    onPress={onToggleMode}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.footerLink, { color: t.primary }]}>
                        {isRegister ? translate('login') : translate('register_now')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 32,
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forgotPassword: {
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 48,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 14,
    },
    eyeButton: {
        padding: 4,
    },
    primaryButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
