import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';
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
    const bottomNavHeight = 80; // Approximate

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
            style={[styles.container, { backgroundColor: t.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomNavHeight + 24 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <AppIcon name="arrow-left" size={24} color={t.muted} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={[styles.title, { color: t.text }]}>{translate('verify_email')}</Text>
                    <Text style={[styles.subtitle, { color: t.muted }]}>
                        {translate('otp_sent_to')}{'\n'}
                        <Text style={[styles.emailHighlight, { color: t.primary }]}>{email}</Text>
                    </Text>
                </View>

                <View style={styles.verificationContainer}>
                    <Text style={[styles.verificationLabel, { color: t.text }]}>{translate('enter_otp')}</Text>
                    <View style={styles.codeInputContainer}>
                        {verificationCode.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    codeInputRefs.current[index] = ref;
                                }}
                                style={[
                                    styles.codeInput,
                                    {
                                        backgroundColor: t.surface,
                                        borderColor: t.border,
                                        color: t.text,
                                    },
                                ]}
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
                        style={[styles.resendButton, isSubmitting && { opacity: 0.6 }]}
                        activeOpacity={0.7}
                        disabled={isSubmitting}
                    >
                        <Text style={[styles.resendText, { color: t.primary }]}>{translate('resend_code')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleVerifyCode}
                        style={[
                            styles.primaryButton,
                            { backgroundColor: t.primary, shadowColor: t.primary },
                            isSubmitting && { opacity: 0.9 },
                        ]}
                        activeOpacity={0.8}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.primaryButtonText}>{isSubmitting ? translate('processing') : translate('confirm')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
        paddingTop: 64,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 8,
        marginBottom: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    emailHighlight: {
        fontWeight: '600',
    },
    verificationContainer: {
        gap: 24,
        marginTop: 16,
    },
    verificationLabel: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    codeInput: {
        width: 44,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 24,
        fontWeight: 'bold',
    },
    resendButton: {
        alignSelf: 'center',
        padding: 8,
    },
    resendText: {
        fontSize: 14,
        fontWeight: '500',
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
});
