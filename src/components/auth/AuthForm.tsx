import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
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
            <View className="mb-8">
                <Text className="text-4xl font-bold mb-2" style={{ color: t.primary }}>{translate('app_name')}</Text>
                <Text className="text-base" style={{ color: t.muted }}>
                    {isRegister ? translate('create_account') : translate('welcome_back')}
                </Text>
            </View>

            <View className="gap-4">
                {isRegister && (
                    <View className="gap-2">
                        <Text className="text-sm font-medium" style={{ color: t.text }}>{translate('full_name')}</Text>
                        <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                            <AppIcon name="user" size={20} color={t.muted} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-sm h-full"
                                placeholder={translate('enter_name_placeholder')}
                                value={name}
                                onChangeText={setName}
                                style={{ color: t.text }}
                                placeholderTextColor={t.muted}
                                editable={true}
                            />
                        </View>
                    </View>
                )}

                <View className="gap-2">
                    <Text className="text-sm font-medium" style={{ color: t.text }}>{translate('email')}</Text>
                    <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                        <AppIcon name="mail" size={20} color={t.muted} style={{ marginRight: 12 }} />
                        <TextInput
                            className="flex-1 text-sm h-full"
                            placeholder="example@email.com"
                            value={email}
                            onChangeText={setEmail}
                            style={{ color: t.text }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={t.muted}
                            editable={true}
                        />
                    </View>
                </View>

                <View className="gap-2">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-medium" style={{ color: t.text }}>{translate('password')}</Text>
                        {!isRegister && (
                            <TouchableOpacity
                                onPress={onForgotPassword}
                                activeOpacity={0.7}
                            >
                                <Text className="text-sm font-medium" style={{ color: t.primary }}>{translate('forgot_password_link')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                        <AppIcon name="lock" size={20} color={t.muted} style={{ marginRight: 12 }} />
                        <TextInput
                            className="flex-1 text-sm h-full"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            style={{ color: t.text }}
                            secureTextEntry={!showPassword}
                            placeholderTextColor={t.muted}
                            editable={true}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="p-1"
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
                    className="rounded-xl py-3.5 items-center mt-2 shadow-md elevation-4"
                    style={[
                        { backgroundColor: t.primary },
                        isSubmitting && { opacity: 0.9 },
                    ]}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                >
                    <Text className="text-white text-base font-bold">
                        {isSubmitting ? translate('processing') : isRegister ? translate('register') : translate('login')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-6 gap-1">
                <Text className="text-sm" style={{ color: t.muted }}>
                    {isRegister ? translate('already_have_account') : translate('not_have_account')}
                </Text>
                <TouchableOpacity
                    onPress={onToggleMode}
                    activeOpacity={0.7}
                >
                    <Text className="text-sm font-bold" style={{ color: t.primary }}>
                        {isRegister ? translate('login') : translate('register_now')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
};
