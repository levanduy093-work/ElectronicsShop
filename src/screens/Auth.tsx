import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';
import { AuthResponse, login, sendRegisterOtp, socialLogin } from '../services/api';
import { VerifyEmailView } from '../components/auth/VerifyEmailView';
import { ForgotPasswordView } from '../components/auth/ForgotPasswordView';
import { AuthForm } from '../components/auth/AuthForm';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';

interface AuthProps {
  onBack?: () => void;
  onLoginSuccess: (data: AuthResponse) => void;
  theme?: Theme;
  initialMode?: 'login' | 'register';
}

export function Auth({ onBack, onLoginSuccess, theme, initialMode = 'login' }: AuthProps) {
  const { t: translate } = useTranslation();
  const { theme: ctxTheme } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const t = theme || ctxTheme || lightTheme;

  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [pendingRegister, setPendingRegister] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    setIsRegister(initialMode === 'register');
  }, [initialMode]);

  const bottomNavHeight = 80 + Math.max(insets.bottom, 16);

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    const cleanedEmail = values.email.trim().toLowerCase();
    const cleanedName = values.name.trim();
    const password = values.password;

    if (isRegister) {
      setIsSubmitting(true);
      try {
        await sendRegisterOtp(cleanedName, cleanedEmail, password);
        setPendingRegister({
          email: cleanedEmail,
          password,
          name: cleanedName,
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
        const result = await login(cleanedEmail, password);
        showToast(translate('login_success'), 'success');
        onLoginSuccess(result);
      } catch (error: any) {
        showToast(error?.message || translate('login_failed'), 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setSocialLoadingProvider(provider);
    try {
      let firebaseIdToken: string | undefined;

      if (provider === 'google') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();
        const idToken = response.data?.idToken;
        if (!idToken) {
          throw new Error(translate('social_login_no_id_token'));
        }
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        const userCredential = await auth().signInWithCredential(googleCredential);
        firebaseIdToken = await userCredential.user.getIdToken(true);
      } else if (provider === 'apple') {
        const appleAuthResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
        if (!appleAuthResponse.identityToken) {
          throw new Error(translate('social_login_no_identity_token'));
        }
        const { identityToken, nonce } = appleAuthResponse;
        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
        const userCredential = await auth().signInWithCredential(appleCredential);
        firebaseIdToken = await userCredential.user.getIdToken(true);
      }

      if (!firebaseIdToken) {
        throw new Error(translate('social_login_no_firebase_token'));
      }

      const result = await socialLogin(firebaseIdToken, provider);
      showToast(translate('social_login_success'), 'success');
      onLoginSuccess(result);
    } catch (error: any) {
      const isCancelled =
        error?.code === 'SIGN_IN_CANCELLED' ||
        error?.code === '12501' ||
        error?.code === 'ERR_REQUEST_CANCELED' ||
        error?.message?.includes('Sign in action cancelled');

      if (isCancelled) {
        showToast(translate('social_login_cancelled'), 'info');
      } else {
        // Ẩn thông điệp kỹ thuật (ví dụ: com.apple.AuthenticationServices.AuthorizationError error 1000)
        // và chỉ hiển thị thông báo thân thiện cho người dùng.
        console.warn('Social login error', error);
        showToast(translate('social_login_failed'), 'error');
      }
    } finally {
      setSocialLoadingProvider(null);
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
      className="flex-1"
      style={{ backgroundColor: t.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingTop: 64,
          paddingBottom: bottomNavHeight + 24
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthForm
          isRegister={isRegister}
          onSubmit={handleSubmit}
          onForgotPassword={() => setIsForgotPassword(true)}
          onToggleMode={() => {
            setIsRegister(!isRegister);
          }}
          onSocialLogin={handleSocialLogin}
          isSubmitting={isSubmitting}
          socialLoadingProvider={socialLoadingProvider}
          theme={t}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
