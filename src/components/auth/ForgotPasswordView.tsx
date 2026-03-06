import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';
import { useToast } from '../../components/common/ToastProvider';
import { sendResetOtp, verifyResetOtp, resetPassword } from '../../services/api';

interface ForgotPasswordViewProps {
    onBack: () => void;
    theme: Theme;
}

type EmailFormValues = {
    email: string;
};

type PasswordFormValues = {
    newPassword: string;
    confirmPassword: string;
};

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBack, theme: t }) => {
    const { t: translate } = useTranslation();
    const { showToast } = useToast();
    const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password'>('email');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [resetToken, setResetToken] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const codeInputRefs = useRef<(TextInput | null)[]>([]);
    const bottomNavHeight = 80;

    const emailSchema = useMemo(() => {
        return z.object({
            email: z
                .string()
                .trim()
                .min(1, translate('enter_email'))
                .email(translate('invalid_email')),
        });
    }, [translate]);

    const passwordSchema = useMemo(() => {
        return z.object({
            newPassword: z.string().min(8, translate('password_min_length')),
            confirmPassword: z.string().min(1, translate('enter_confirm_password')),
        }).superRefine((data, ctx) => {
            if (data.newPassword !== data.confirmPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: translate('password_mismatch'),
                    path: ['confirmPassword'],
                });
            }
        });
    }, [translate]);

    const emailForm = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: '' },
        mode: 'onSubmit',
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
        mode: 'onSubmit',
    });

    const emailValue = emailForm.watch('email');

    const handleResetPassword = async (values: EmailFormValues) => {
        const cleanedEmail = values.email.trim().toLowerCase();
        setIsSubmitting(true);
        try {
            await sendResetOtp(cleanedEmail);
            setResetStep('otp');
            showToast(translate('otp_sent'), 'success');
        } catch (error: any) {
            showToast(error?.message || translate('otp_send_error'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerificationCodeChange = (index: number, value: string) => {
        if (value.length > 1) {
            const digits = value.replace(/[^0-9]/g, '').slice(0, 6);
            const newCode = ['', '', '', '', '', ''];
            digits.split('').forEach((digit, i) => {
                if (i < 6) newCode[i] = digit;
            });
            setVerificationCode(newCode);
            const lastIndex = Math.min(digits.length - 1, 5);
            if (codeInputRefs.current[lastIndex]) {
                codeInputRefs.current[lastIndex]?.focus();
            }
            return;
        }

        const newCode = [...verificationCode];
        newCode[index] = value.replace(/[^0-9]/g, '');
        setVerificationCode(newCode);

        if (value && index < 5 && codeInputRefs.current[index + 1]) {
            codeInputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerifyResetOtp = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            showToast(translate('enter_full_otp'), 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await verifyResetOtp(emailValue.trim().toLowerCase(), code);
            setResetToken(result.resetToken);
            setResetStep('password');
            setVerificationCode(['', '', '', '', '', '']);
            showToast(translate('otp_valid'), 'success');
        } catch (error: any) {
            showToast(error?.message || translate('otp_invalid'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitNewPassword = async (values: PasswordFormValues) => {
        if (!resetToken) {
            showToast(translate('verify_otp_first'), 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await resetPassword(emailValue.trim().toLowerCase(), resetToken, values.newPassword);
            showToast(translate('change_password_success'), 'success');
            passwordForm.reset();
            onBack();
        } catch (error: any) {
            showToast(error?.message || translate('change_password_failed'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            style={{ backgroundColor: t.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: bottomNavHeight + 24 }}
                className="px-6 pt-16"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    onPress={onBack}
                    className="self-start p-2 mb-6"
                    activeOpacity={0.7}
                >
                    <AppIcon name="arrow-left" size={24} color={t.muted} />
                </TouchableOpacity>

                <View className="mb-8">
                    <Text className="text-3xl font-bold mb-2" style={{ color: t.text }}>{translate('forgot_password_title')}</Text>
                    <Text className="text-base" style={{ color: t.muted }}>
                        {resetStep === 'email' && translate('forgot_password_subtitle_email')}
                        {resetStep === 'otp' && translate('forgot_password_subtitle_otp')}
                        {resetStep === 'password' && translate('forgot_password_subtitle_password')}
                    </Text>
                </View>

                {resetStep === 'email' && (
                    <View className="gap-4">
                        <View className="gap-2">
                            <Text className="text-sm font-medium" style={{ color: t.text }}>{translate('email')}</Text>
                            <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }} pointerEvents="box-none">
                                <AppIcon name="mail" size={20} color={t.muted} style={{ marginRight: 12 }} />
                                <Controller
                                    control={emailForm.control}
                                    name="email"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            placeholder="example@email.com"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            className="flex-1 text-sm"
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
                            {emailForm.formState.errors.email ? (
                                <Text className="text-xs text-red-500">{emailForm.formState.errors.email.message}</Text>
                            ) : null}
                        </View>

                        <TouchableOpacity
                            onPress={emailForm.handleSubmit(handleResetPassword)}
                            className="rounded-xl py-3.5 items-center mt-2"
                            style={[
                                { backgroundColor: t.primary, shadowColor: t.primary },
                                isSubmitting ? { opacity: 0.9 } : undefined,
                                {
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 4,
                                },
                            ]}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            <Text className="text-white text-base font-bold">{isSubmitting ? translate('sending') : translate('send_otp')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {resetStep === 'otp' && (
                    <View className="gap-6 mt-4">
                        <Text className="text-sm font-medium text-center" style={{ color: t.text }}>{translate('enter_otp')}</Text>
                        <View className="flex-row justify-center gap-3">
                            {verificationCode.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        codeInputRefs.current[index] = ref;
                                    }}
                                    className="w-11 h-14 rounded-xl border text-2xl font-bold"
                                    style={{
                                        backgroundColor: t.surface,
                                        borderColor: t.border,
                                        color: t.text,
                                    }}
                                    value={digit}
                                    onChangeText={(value) => handleVerificationCodeChange(index, value)}
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                                            codeInputRefs.current[index - 1]?.focus();
                                        }
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                    textAlign="center"
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleVerifyResetOtp}
                            className="rounded-xl py-3.5 items-center mt-2"
                            style={[
                                { backgroundColor: t.primary, shadowColor: t.primary },
                                isSubmitting ? { opacity: 0.9 } : undefined,
                                {
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 4,
                                },
                            ]}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            <Text className="text-white text-base font-bold">{isSubmitting ? translate('checking') : translate('verify_code')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {resetStep === 'password' && (
                    <View className="gap-4">
                        <View className="gap-2">
                            <Text className="text-sm font-medium" style={{ color: t.text }}>{translate('new_password')}</Text>
                            <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }} pointerEvents="box-none">
                                <AppIcon name="lock" size={20} color={t.muted} style={{ marginRight: 12 }} />
                                <Controller
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            placeholder="••••••••"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            className="flex-1 text-sm"
                                            style={{
                                                color: t.text,
                                                textAlignVertical: 'center',
                                                includeFontPadding: false,
                                                paddingVertical: 0,
                                            }}
                                            secureTextEntry
                                            placeholderTextColor={t.muted}
                                            editable={!isSubmitting}
                                        />
                                    )}
                                />
                            </View>
                            {passwordForm.formState.errors.newPassword ? (
                                <Text className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</Text>
                            ) : null}
                        </View>

                        <View className="gap-2">
                            <Text className="text-sm font-medium" style={{ color: t.text }}>{translate('confirm_password')}</Text>
                            <View className="flex-row items-center rounded-xl border px-3 h-12" style={{ backgroundColor: t.surface, borderColor: t.border }} pointerEvents="box-none">
                                <AppIcon name="lock" size={20} color={t.muted} style={{ marginRight: 12 }} />
                                <Controller
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            placeholder="••••••••"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            className="flex-1 text-sm"
                                            style={{
                                                color: t.text,
                                                textAlignVertical: 'center',
                                                includeFontPadding: false,
                                                paddingVertical: 0,
                                            }}
                                            secureTextEntry
                                            placeholderTextColor={t.muted}
                                            editable={!isSubmitting}
                                        />
                                    )}
                                />
                            </View>
                            {passwordForm.formState.errors.confirmPassword ? (
                                <Text className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</Text>
                            ) : null}
                        </View>

                        <TouchableOpacity
                            onPress={passwordForm.handleSubmit(handleSubmitNewPassword)}
                            className="rounded-xl py-3.5 items-center mt-2"
                            style={[
                                { backgroundColor: t.primary, shadowColor: t.primary },
                                isSubmitting ? { opacity: 0.9 } : undefined,
                                {
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 4,
                                },
                            ]}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            <Text className="text-white text-base font-bold">{isSubmitting ? translate('changing') : translate('change_password_btn')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
