import React, { useState, useEffect } from 'react';
import { StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';
import { AuthResponse, login, sendRegisterOtp } from '../services/api';
import { VerifyEmailView } from '../components/auth/VerifyEmailView';
import { ForgotPasswordView } from '../components/auth/ForgotPasswordView';
import { AuthForm } from '../components/auth/AuthForm';

interface AuthProps {

  onLoginSuccess: (data: AuthResponse) => void;
  theme?: Theme;
  initialMode?: 'login' | 'register';
}

export function Auth({ onLoginSuccess, theme, initialMode = 'login' }: AuthProps) {
  const { t: translate } = useTranslation();
  const { theme: ctxTheme } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const t = theme || ctxTheme || lightTheme;

  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRegister, setPendingRegister] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    setIsRegister(initialMode === 'register');
  }, [initialMode]);

  const bottomNavHeight = 80 + Math.max(insets.bottom, 16);

  const handleSubmit = async () => {
    if (!email || !password) {
      showToast(translate('fill_all_info'), 'error');
      return;
    }
    if (password.length < 8) {
      showToast(translate('password_min_length'), 'error');
      return;
    }

    if (isRegister) {
      if (!name) {
        showToast(translate('enter_name'), 'error');
        return;
      }
      setIsSubmitting(true);
      try {
        await sendRegisterOtp(name.trim(), email.trim().toLowerCase(), password);
        setPendingRegister({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
        });
        setIsVerifyingEmail(true);
        showToast(translate('otp_sent'), 'success');
      } catch (error: any) {
        showToast(error?.message || translate('otp_send_error'), 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const result = await login(email.trim().toLowerCase(), password);
        showToast(translate('login_success'), 'success');
        onLoginSuccess(result);
      } catch (error: any) {
        showToast(error?.message || translate('login_failed'), 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRegisterSuccess = (result: AuthResponse) => {
    setIsVerifyingEmail(false);
    setIsRegister(false);
    setPendingRegister(null);
    onLoginSuccess(result);
  };

  if (isVerifyingEmail && pendingRegister) {
    return (
      <VerifyEmailView
        email={pendingRegister.email}
        name={pendingRegister.name}
        password={pendingRegister.password}
        onBack={() => {
          setIsVerifyingEmail(false);
          setPendingRegister(null);
        }}
        onSuccess={handleRegisterSuccess}
        theme={t}
      />
    );
  }

  if (isForgotPassword) {
    return (
      <ForgotPasswordView
        onBack={() => setIsForgotPassword(false)}
        theme={t}
      />
    );
  }

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
        <AuthForm
          isRegister={isRegister}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          name={name}
          setName={setName}
          onSubmit={handleSubmit}
          onForgotPassword={() => setIsForgotPassword(true)}
          onToggleMode={() => {
            setIsRegister(!isRegister);
            setEmail('');
            setPassword('');
            setName('');
          }}
          isSubmitting={isSubmitting}
          theme={t}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 64,
  },
});
