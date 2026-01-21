import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';
import { useToast } from '../../components/common/ToastProvider';
import { sendResetOtp, verifyResetOtp, resetPassword } from '../../services/api';

interface ForgotPasswordViewProps {
    onBack: () => void;
    theme: Theme;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBack, theme: t }) => {
    const { t: translate } = useTranslation();
    const { showToast } = useToast();
    const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const codeInputRefs = useRef<(TextInput | null)[]>([]);
    const bottomNavHeight = 80;

    const handleResetPassword = async () => {
        if (!email) {
            showToast(translate('enter_email'), 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await sendResetOtp(email.trim().toLowerCase());
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
            const result = await verifyResetOtp(email.trim().toLowerCase(), code);
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

    const handleSubmitNewPassword = async () => {
        if (newPassword.length < 8) {
            showToast(translate('password_min_length'), 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast(translate('password_mismatch'), 'error');
            return;
        }
        if (!resetToken) {
            showToast(translate('verify_otp_first'), 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await resetPassword(email.trim().toLowerCase(), resetToken, newPassword);
            showToast(translate('change_password_success'), 'success');
            onBack(); // Go back to login
        } catch (error: any) {
            showToast(error?.message || translate('change_password_failed'), 'error');
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
                    <Text style={[styles.title, { color: t.text }]}>{translate('forgot_password_title')}</Text>
                    <Text style={[styles.subtitle, { color: t.muted }]}>
                        {resetStep === 'email' && translate('forgot_password_subtitle_email')}
                        {resetStep === 'otp' && translate('forgot_password_subtitle_otp')}
                        {resetStep === 'password' && translate('forgot_password_subtitle_password')}
                    </Text>
                </View>

                {resetStep === 'email' && (
                    <View style={styles.form}>
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

                        <TouchableOpacity
                            onPress={handleResetPassword}
                            style={[
                                styles.primaryButton,
                                { backgroundColor: t.primary, shadowColor: t.primary },
                                isSubmitting && { opacity: 0.9 },
                            ]}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.primaryButtonText}>{isSubmitting ? translate('sending') : translate('send_otp')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {resetStep === 'otp' && (
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
                            onPress={handleVerifyResetOtp}
                            style={[
                                styles.primaryButton,
                                { backgroundColor: t.primary, shadowColor: t.primary },
                                isSubmitting && { opacity: 0.9 },
                            ]}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.primaryButtonText}>{isSubmitting ? translate('checking') : translate('verify_code')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {resetStep === 'password' && (
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: t.text }]}>{translate('new_password')}</Text>
                            <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]} pointerEvents="box-none">
                                <AppIcon name="lock" size={20} color={t.muted} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    style={[styles.input, { color: t.text }]}
                                    secureTextEntry
                                    placeholderTextColor={t.muted}
                                    editable={true}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: t.text }]}>{translate('confirm_password')}</Text>
                            <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]} pointerEvents="box-none">
                                <AppIcon name="lock" size={20} color={t.muted} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    style={[styles.input, { color: t.text }]}
                                    secureTextEntry
                                    placeholderTextColor={t.muted}
                                    editable={true}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmitNewPassword}
                            style={[
                                styles.primaryButton,
                                { backgroundColor: t.primary, shadowColor: t.primary },
                                isSubmitting && { opacity: 0.9 },
                            ]}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.primaryButtonText}>{isSubmitting ? translate('changing') : translate('change_password_btn')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
