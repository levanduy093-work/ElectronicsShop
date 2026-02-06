import React, { useMemo, useState } from 'react';
import { Platform, StatusBar, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

type ChangePasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  otp: string;
};

export function ChangePassword({ onBack, onSuccess, theme, email, accessToken }: ChangePasswordProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const { t: translate } = useTranslation();
  const { showToast } = useToast();
  const t = theme || ctxTheme || lightTheme;

  const [secure, setSecure] = useState({ old: true, next: true, confirm: true });
  const [sendingOtp, setSendingOtp] = useState(false);
  const [saving, setSaving] = useState(false);

  const schema = useMemo(() => {
    return z.object({
      oldPassword: z
        .string()
        .min(1, translate('enter_current_password'))
        .min(8, translate('current_password_min_length')),
      newPassword: z
        .string()
        .min(1, translate('enter_new_password'))
        .min(8, translate('new_password_min_length')),
      confirmPassword: z.string().min(1, translate('enter_confirm_password')),
      otp: z.string().min(6, translate('enter_full_otp')).max(6, translate('enter_full_otp')),
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    setValue,
    trigger,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      otp: '',
    },
    mode: 'onTouched',
  });

  const handleSubmitForm = handleSubmit(async (values) => {
    if (!accessToken) {
      showToast(translate('login_required_change_password'), 'error');
      return;
    }
    setSaving(true);
    try {
      await changePassword(values.oldPassword, values.newPassword, values.otp, accessToken);
      showToast(translate('password_updated'), 'success');
      reset();
      onSuccess?.();
    } catch (error: any) {
      showToast(error?.message || translate('change_password_failed'), 'error');
    } finally {
      setSaving(false);
    }
  });

  const maskEmail = (text?: string) => {
    if (!text) return translate('yourEmail');
    const [name, domain] = text.split('@');
    if (!domain) return text;
    const maskedName = name.length <= 2 ? `${name[0] || ''}*` : `${name[0]}***${name[name.length - 1]}`;
    return `${maskedName}@${domain}`;
  };

  const handleSendOtp = async () => {
    if (!accessToken) {
      showToast(translate('login_required_send_otp'), 'error');
      return;
    }

    const isOldPasswordValid = await trigger('oldPassword');
    if (!isOldPasswordValid) return;

    const oldPassword = getValues('oldPassword');
    setSendingOtp(true);
    try {
      await sendChangePasswordOtp(oldPassword, accessToken);
      setValue('otp', '');
      showToast(translate('otp_sent_to') + ' ' + maskEmail(email), 'success');
    } catch (error: any) {
      showToast(error?.message || translate('otp_resend_error'), 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const renderInput = (
    label: string,
    name: 'oldPassword' | 'newPassword' | 'confirmPassword',
    secureKey: keyof typeof secure,
    error?: string,
  ) => (
    <View className="gap-2">
      <Text className="text-sm font-semibold" style={{ color: t.text }}>{label}</Text>
      <View
        className="flex-row items-center border rounded-xl px-3"
        style={{ backgroundColor: t.surface, borderColor: error ? '#EF4444' : t.border }}
      >
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="••••••••"
              placeholderTextColor={t.muted}
              secureTextEntry={secure[secureKey]}
              className="flex-1 py-3 text-sm"
              style={{ color: t.text }}
              editable={!saving}
            />
          )}
        />
        <TouchableOpacity onPress={() => setSecure(prev => ({ ...prev, [secureKey]: !prev[secureKey] }))} activeOpacity={0.7}>
          <AppIcon name={secure[secureKey] ? 'eye-off' : 'eye'} size={18} color={t.muted} />
        </TouchableOpacity>
      </View>
      {error ? <Text className="text-xs text-red-500">{error}</Text> : null}
    </View>
  );

  const renderOtpInput = () => (
    <View className="gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-semibold" style={{ color: t.text }}>{translate('verify_otp')}</Text>
        <TouchableOpacity
          onPress={handleSendOtp}
          className="py-1.5 px-3 rounded-full border"
          style={{ borderColor: t.primary, backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }}
          activeOpacity={0.8}
        >
          <Text className="text-xs font-bold" style={{ color: t.primary }}>{sendingOtp ? translate('sending') : translate('send_code')}</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-[13px] -mt-1 mb-1.5" style={{ color: t.muted }}>
        {translate('otp_will_sent_to', { email: maskEmail(email) })}
      </Text>
      <View
        className="flex-row items-center border rounded-xl px-3"
        style={{ backgroundColor: t.surface, borderColor: errors.otp ? '#EF4444' : t.border }}
      >
        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 6))}
              onBlur={onBlur}
              placeholder={translate('enter_otp_code')}
              placeholderTextColor={t.muted}
              keyboardType="number-pad"
              className="flex-1 py-3 text-sm"
              style={{ color: t.text }}
              maxLength={6}
              editable={!saving}
            />
          )}
        />
      </View>
      {errors.otp ? <Text className="text-xs text-red-500">{errors.otp.message}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: t.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'}
        backgroundColor={t.surface}
        translucent={true}
      />
      <View
        className="flex-row items-center justify-between px-4 pb-3 border-b shadow-sm"
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.surface,
          borderBottomColor: t.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <TouchableOpacity onPress={onBack} className="p-2" activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 ml-2" style={{ color: t.text }}>{translate('change_password_title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1"
        style={{ backgroundColor: t.background }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[13px] mb-2" style={{ color: t.muted }}>
          {translate('change_password_helper')}
        </Text>

        <View
          className="rounded-2xl border p-4 gap-3"
          style={{ backgroundColor: t.card, borderColor: t.border }}
        >
          {renderInput(translate('current_password'), 'oldPassword', 'old', errors.oldPassword?.message)}
          {renderInput(translate('new_password'), 'newPassword', 'next', errors.newPassword?.message)}
          {renderInput(translate('confirm_new_password'), 'confirmPassword', 'confirm', errors.confirmPassword?.message)}
          {renderOtpInput()}

          <TouchableOpacity
            onPress={handleSubmitForm}
            className="w-full py-3.5 rounded-xl items-center mt-2 shadow-sm"
            style={{
              backgroundColor: t.primary,
              shadowColor: t.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
              opacity: saving ? 0.9 : 1
            }}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Text className="text-base font-bold text-white">{saving ? translate('updating') : translate('update')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
