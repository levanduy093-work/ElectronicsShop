import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';

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
    isSubmitting: boolean;
    theme: Theme;
}

export const AuthForm: React.FC<AuthFormProps> = ({
    isRegister,
    onSubmit,
    onForgotPassword,
    onToggleMode,
    isSubmitting,
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
                        <Text className="text-sm font-medium" style={{ color: t.text }}>{translate('full_name')}</Text>
                        <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                            <AppIcon name="user" size={20} color={t.muted} style={{ marginRight: 12 }} />
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className="flex-1 text-sm h-full p-0"
                                        placeholder={translate('enter_name_placeholder')}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        style={{
                                            color: t.text,
                                            textAlignVertical: 'center',
                                            includeFontPadding: false,
                                            paddingVertical: 0,
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
                    <Text className="text-sm font-medium" style={{ color: t.text }}>{translate('email')}</Text>
                    <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                        <AppIcon name="mail" size={20} color={t.muted} style={{ marginRight: 12 }} />
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="flex-1 text-sm h-full p-0"
                                    placeholder="example@email.com"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    style={{
                                        color: t.text,
                                        textAlignVertical: 'center',
                                        includeFontPadding: false,
                                        paddingVertical: 0,
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
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="flex-1 text-sm h-full p-0"
                                    placeholder="••••••••"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    style={{
                                        color: t.text,
                                        textAlignVertical: 'center',
                                        includeFontPadding: false,
                                        paddingVertical: 0,
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
