import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';
import { TYPO_CLASS } from '../../theme/typography';
import { useToast } from '../../components/common/ToastProvider';
import { sendRegisterOtp, verifyRegisterOtp, AuthResponse } from '../../services/api';

interface VerifyEmailViewProps {
    email: string;
    name: string;
    password?: string;
    onBack: () => void;
    onSuccess: (data: AuthResponse) => void;
    theme: Theme;
}

export const VerifyEmailView: React.FC<VerifyEmailViewProps> = ({
    email,
    name,
    password,
    onBack,
    onSuccess,
    theme: t,
}) => {
    const { t: translate } = useTranslation();
    const { showToast } = useToast();
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const codeInputRefs = useRef<(TextInput | null)[]>([]);
    const bottomNavHeight = 80;

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

    const handleVerifyCode = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            showToast(translate('enter_full_otp'), 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await verifyRegisterOtp(email, code);
            showToast(translate('register_success'), 'success');
            onSuccess(result);
        } catch (error: any) {
            showToast(error?.message || translate('otp_invalid'), 'error');
            setVerificationCode(['', '', '', '', '', '']);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        setIsSubmitting(true);
        try {
            await sendRegisterOtp(name, email, password || '');
            showToast(translate('otp_resent'), 'success');
        } catch (error: any) {
            showToast(error?.message || translate('otp_resend_error'), 'error');
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
                    <Text className="text-3xl font-bold mb-2" style={{ color: t.text }}>{translate('verify_email')}</Text>
                    <Text className="text-base" style={{ color: t.muted }}>
                        {translate('otp_sent_to')}{'\n'}
                        <Text className="font-semibold" style={{ color: t.primary }}>{email}</Text>
                    </Text>
                </View>

                <View className="gap-6 mt-4">
                    <Text className={`${TYPO_CLASS.fieldLabel} text-center`} style={{ color: t.text }}>{translate('enter_otp')}</Text>
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
                        onPress={handleResendCode}
                        className="self-center p-2"
                        style={isSubmitting ? { opacity: 0.6 } : undefined}
                        activeOpacity={0.7}
                        disabled={isSubmitting}
                    >
                        <Text className={TYPO_CLASS.fieldLabel} style={{ color: t.primary }}>{translate('resend_code')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleVerifyCode}
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
                        <Text className="text-white text-base font-bold">{isSubmitting ? translate('processing') : translate('confirm')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
