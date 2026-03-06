import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppIcon } from '../../components/common/Icon';
import { SvgXml } from 'react-native-svg';
import { Theme } from '../../theme';
import { TEXT_INPUT_BASE_STYLE, TYPO_CLASS } from '../../theme/typography';

const googleLogoSvg = `<svg width="800" height="800" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M23.75,16A7.7446,7.7446,0,0,1,8.7177,18.6259L4.2849,22.1721A13.244,13.244,0,0,0,29.25,16" fill="#00ac47"/><path d="M23.75,16a7.7387,7.7387,0,0,1-3.2516,6.2987l4.3824,3.5059A13.2042,13.2042,0,0,0,29.25,16" fill="#4285f4"/><path d="M8.25,16a7.698,7.698,0,0,1,.4677-2.6259L4.2849,9.8279a13.177,13.177,0,0,0,0,12.3442l4.4328-3.5462A7.698,7.698,0,0,1,8.25,16Z" fill="#ffba00"/><path d="M16,8.25a7.699,7.699,0,0,1,4.558,1.4958l4.06-3.7893A13.2152,13.2152,0,0,0,4.2849,9.8279l4.4328,3.5462A7.756,7.756,0,0,1,16,8.25Z" fill="#ea4435"/><path d="M29.25,15v1L27,19.5H16.5V14H28.25A1,1,0,0,1,29.25,15Z" fill="#4285f4"/></svg>`;

type AuthFormValues = {
    name: string;
    email: string;
    password: string;
};

interface AuthFormProps {
    isRegister: boolean;
    onSubmit: (values: AuthFormValues) => void;
    onForgotPassword: () => void;
    onToggleMode: () => void;
    onSocialLogin?: (provider: 'google' | 'apple') => void;
    isSubmitting: boolean;
    socialLoadingProvider?: 'google' | 'apple' | null;
    theme: Theme;
}

export const AuthForm: React.FC<AuthFormProps> = ({
    isRegister,
    onSubmit,
    onForgotPassword,
    onToggleMode,
    onSocialLogin,
    isSubmitting,
    socialLoadingProvider = null,
    theme: t,
}) => {
    const { t: translate } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const schema = useMemo(() => {
        return z.object({
            name: z.string(),
            email: z
                .string()
                .trim()
                .min(1, translate('enter_email'))
                .email(translate('invalid_email')),
            password: z.string().min(8, translate('password_min_length')),
        }).superRefine((data, ctx) => {
            if (isRegister && !data.name.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: translate('enter_name'),
                    path: ['name'],
                });
            }
        });
    }, [isRegister, translate]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<AuthFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
        mode: 'onSubmit',
    });

    useEffect(() => {
        reset({ name: '', email: '', password: '' });
    }, [isRegister, reset]);

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
                        <Text className={TYPO_CLASS.fieldLabel} style={{ color: t.text }}>{translate('full_name')}</Text>
                        <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                            <AppIcon name="user" size={20} color={t.muted} style={{ marginRight: 12 }} />
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className="flex-1 text-base h-full p-0"
                                        placeholder={translate('enter_name_placeholder')}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        style={{
                                            color: t.text,
                                            ...TEXT_INPUT_BASE_STYLE,
                                        }}
                                        placeholderTextColor={t.muted}
                                        editable={!isSubmitting}
                                    />
                                )}
                            />
                        </View>
                        {errors.name ? (
                            <Text className="text-xs text-red-500">{errors.name.message}</Text>
                        ) : null}
                    </View>
                )}

                <View className="gap-2">
                    <Text className={TYPO_CLASS.fieldLabel} style={{ color: t.text }}>{translate('email')}</Text>
                    <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                        <AppIcon name="mail" size={20} color={t.muted} style={{ marginRight: 12 }} />
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="flex-1 text-base h-full p-0"
                                    placeholder="example@email.com"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    style={{
                                        color: t.text,
                                        ...TEXT_INPUT_BASE_STYLE,
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={t.muted}
                                    editable={!isSubmitting}
                                />
                            )}
                        />
                    </View>
                    {errors.email ? (
                        <Text className="text-xs text-red-500">{errors.email.message}</Text>
                    ) : null}
                </View>

                <View className="gap-2">
                    <View className="flex-row justify-between items-center">
                        <Text className={TYPO_CLASS.fieldLabel} style={{ color: t.text }}>{translate('password')}</Text>
                        {!isRegister && (
                            <TouchableOpacity
                                onPress={onForgotPassword}
                                activeOpacity={0.7}
                            >
                                <Text className={TYPO_CLASS.bodyStrong} style={{ color: t.primary }}>{translate('forgot_password_link')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                        <AppIcon name="lock" size={20} color={t.muted} style={{ marginRight: 12 }} />
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="flex-1 text-base h-full p-0"
                                    placeholder="••••••••"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    style={{
                                        color: t.text,
                                        ...TEXT_INPUT_BASE_STYLE,
                                    }}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor={t.muted}
                                    editable={!isSubmitting}
                                />
                            )}
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
                    {errors.password ? (
                        <Text className="text-xs text-red-500">{errors.password.message}</Text>
                    ) : null}
                </View>

                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
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

            {onSocialLogin && (
                <>
                    <View className="flex-row items-center mt-6 mb-4">
                        <View className="flex-1 h-px" style={{ backgroundColor: t.border }} />
                        <Text className="mx-4 text-xs" style={{ color: t.muted }}>
                            {translate('or_continue_with')}
                        </Text>
                        <View className="flex-1 h-px" style={{ backgroundColor: t.border }} />
                    </View>

                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={() => onSocialLogin('google')}
                            className="flex-row items-center justify-center rounded-xl py-3.5 border"
                            style={{ backgroundColor: t.surface, borderColor: t.border }}
                            activeOpacity={0.8}
                            disabled={isSubmitting || !!socialLoadingProvider}
                        >
                            {socialLoadingProvider === 'google' ? (
                                <ActivityIndicator size="small" color={t.primary} style={{ marginRight: 12 }} />
                            ) : (
                                <SvgXml xml={googleLogoSvg} width={20} height={20} style={{ marginRight: 12 }} />
                            )}
                            <Text className={TYPO_CLASS.bodyStrong} style={{ color: t.text }}>
                                {translate('sign_in_with_google')}
                            </Text>
                        </TouchableOpacity>

                        {Platform.OS === 'ios' && (
                            <TouchableOpacity
                                onPress={() => onSocialLogin('apple')}
                                className="flex-row items-center justify-center rounded-xl py-3.5 border"
                                style={{
                                    backgroundColor: t.isDark ? '#FFFFFF' : '#000000',
                                    borderColor: t.isDark ? '#FFFFFF' : '#000000',
                                }}
                                activeOpacity={0.8}
                                disabled={isSubmitting || !!socialLoadingProvider}
                            >
                                {socialLoadingProvider === 'apple' ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={t.isDark ? '#000000' : '#FFFFFF'}
                                        style={{ marginRight: 12 }}
                                    />
                                ) : (
                                    <AppIcon
                                        name="apple"
                                        size={20}
                                        color={t.isDark ? '#000000' : '#FFFFFF'}
                                        style={{ marginRight: 12 }}
                                    />
                                )}
                                <Text
                                    className={TYPO_CLASS.bodyStrong}
                                    style={{ color: t.isDark ? '#000000' : '#FFFFFF' }}
                                >
                                    {translate('sign_in_with_apple')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </>
            )}

            <View className="flex-row justify-center mt-6 gap-1">
                <Text className={TYPO_CLASS.body} style={{ color: t.muted }}>
                    {isRegister ? translate('already_have_account') : translate('not_have_account')}
                </Text>
                <TouchableOpacity
                    onPress={onToggleMode}
                    activeOpacity={0.7}
                >
                    <Text className={TYPO_CLASS.bodyStrong} style={{ color: t.primary }}>
                        {isRegister ? translate('login') : translate('register_now')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
};
