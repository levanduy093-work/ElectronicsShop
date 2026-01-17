import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';
import { changePassword, sendChangePasswordOtp } from '../services/api';

interface ChangePasswordProps {
  onBack: () => void;
  onSuccess?: () => void;
  theme?: Theme;
  email?: string;
  accessToken?: string;
}

export function ChangePassword({ onBack, onSuccess, theme, email, accessToken }: ChangePasswordProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const { t: translate } = useTranslation();
  const { showToast } = useToast();
  const t = theme || ctxTheme || lightTheme;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secure, setSecure] = useState({ old: true, next: true, confirm: true });
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ old?: string; next?: string; confirm?: string; otp?: string }>({});

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!oldPassword) {
      nextErrors.old = translate('enterCurrentPassword');
    } else if (oldPassword.length < 8) {
      nextErrors.old = translate('currentPasswordMinLength');
    }
    if (!newPassword) {
      nextErrors.next = translate('enterNewPassword');
    } else if (newPassword.length < 8) {
      nextErrors.next = translate('newPasswordMinLength');
    }
    if (confirmPassword !== newPassword) {
      nextErrors.confirm = translate('confirmPasswordMismatch');
    }
    if (!otp || otp.length !== 6) {
      nextErrors.otp = translate('enterFullOTP');
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!accessToken) {
      showToast(translate('loginRequiredChangePassword'), 'error');
      return;
    }
    setSaving(true);
    try {
      await changePassword(oldPassword, newPassword, otp, accessToken);
      showToast(translate('passwordUpdated'), 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      onSuccess?.();
    } catch (error: any) {
      showToast(error?.message || translate('changePasswordFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const maskEmail = (text?: string) => {
    if (!text) return translate('yourEmail');
    const [name, domain] = text.split('@');
    if (!domain) return text;
    const maskedName = name.length <= 2 ? `${name[0] || ''}*` : `${name[0]}***${name[name.length - 1]}`;
    return `${maskedName}@${domain}`;
  };

  const handleSendOtp = async () => {
    if (!accessToken) {
      showToast(translate('loginRequiredSendOTP'), 'error');
      return;
    }
    if (!oldPassword) {
      setErrors(prev => ({ ...prev, old: translate('enterCurrentPassword') }));
      return;
    }
    if (oldPassword.length < 8) {
      setErrors(prev => ({ ...prev, old: translate('currentPasswordMinLength') }));
      return;
    }
    setSendingOtp(true);
    try {
      await sendChangePasswordOtp(oldPassword, accessToken);
      setOtp('');
      showToast(translate('otp_sent_to') + ' ' + maskEmail(email), 'success');
    } catch (error: any) {
      showToast(error?.message || translate('otp_resend_error'), 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const renderInput = (label: string, value: string, onChange: (text: string) => void, secureKey: keyof typeof secure, error?: string) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: t.text }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: t.surface, borderColor: error ? '#EF4444' : t.border }]}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="••••••••"
          placeholderTextColor={t.muted}
          secureTextEntry={secure[secureKey]}
          style={[styles.input, { color: t.text }]}
        />
        <TouchableOpacity onPress={() => setSecure(prev => ({ ...prev, [secureKey]: !prev[secureKey] }))} activeOpacity={0.7}>
          <AppIcon name={secure[secureKey] ? 'eye-off' : 'eye'} size={18} color={t.muted} />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  const renderOtpInput = () => (
    <View style={styles.inputGroup}>
      <View style={styles.otpHeader}>
        <Text style={[styles.label, { color: t.text }]}>{translate('verify_otp')}</Text>
        <TouchableOpacity
          onPress={handleSendOtp}
          style={[styles.otpButton, { borderColor: t.primary, backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.otpButtonText, { color: t.primary }]}>{sendingOtp ? translate('sending') : translate('send_code')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.helper, { color: t.muted, marginTop: -4, marginBottom: 6 }]}>
        {translate('otp_will_sent_to', { email: maskEmail(email) })}
      </Text>
      <View style={[styles.inputWrapper, { backgroundColor: t.surface, borderColor: errors.otp ? '#EF4444' : t.border }]}>
        <TextInput
          value={otp}
          onChangeText={setOtp}
          placeholder={translate('enter_otp_code')}
          placeholderTextColor={t.muted}
          keyboardType="number-pad"
          style={[styles.input, { color: t.text }]}
          maxLength={6}
        />
      </View>
      {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: t.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar 
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'} 
        backgroundColor={t.surface}
        translucent={true}
      />
      <View style={[
        styles.header,
        { paddingTop: Math.max(insets.top, 0), backgroundColor: t.surface, borderBottomColor: t.border }
      ]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: t.text }]}>{translate('change_password_title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: t.background }]}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.helper, { color: t.muted }]}>
          {translate('change_password_helper')}
        </Text>

        <View style={[styles.formCard, { backgroundColor: t.card, borderColor: t.border }]}>
          {renderInput(translate('currentPassword'), oldPassword, setOldPassword, 'old', errors.old)}
          {renderInput(translate('newPassword'), newPassword, setNewPassword, 'next', errors.next)}
          {renderInput(translate('confirmNewPassword'), confirmPassword, setConfirmPassword, 'confirm', errors.confirm)}
          {renderOtpInput()}

          <TouchableOpacity
          onPress={handleSubmit}
          style={[
            styles.saveButton,
            { backgroundColor: t.primary, shadowColor: t.primary },
            saving && { opacity: 0.9 },
          ]}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? translate('updating') : translate('update')}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  helper: {
    fontSize: 13,
    color: '#6B7280',
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  otpButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
