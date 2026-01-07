import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../lib/theme';
import { useToast } from '../components/common/ToastProvider';
import { AuthResponse, login, resetPassword, sendRegisterOtp, sendResetOtp, verifyRegisterOtp, verifyResetOtp } from '../lib/api';

interface AuthProps {
  onBack: () => void;
  onLoginSuccess: (data: AuthResponse) => void;
  theme?: Theme;
}

// Google Icon component from google-icon-logo.svg
const GoogleIcon = ({ size = 24 }: { size?: number }) => {
  // SVG viewBox is 256x262, maintain aspect ratio (approximately square)
  const aspectRatio = 256 / 262;
  const width = size * aspectRatio;
  const height = size;
  
  return (
    <Svg width={width} height={height} viewBox="0 0 256 262" preserveAspectRatio="xMidYMid">
      <Path
        d="M255.878,133.451 C255.878,122.717 255.007,114.884 253.122,106.761 L130.55,106.761 L130.55,155.209 L202.497,155.209 C201.047,167.249 193.214,185.381 175.807,197.565 L175.563,199.187 L214.318,229.21 L217.003,229.478 C241.662,206.704 255.878,173.196 255.878,133.451"
        fill="#4285F4"
      />
      <Path
        d="M130.55,261.1 C165.798,261.1 195.389,249.495 217.003,229.478 L175.807,197.565 C164.783,205.253 149.987,210.62 130.55,210.62 C96.027,210.62 66.726,187.847 56.281,156.37 L54.75,156.5 L14.452,187.687 L13.925,189.152 C35.393,231.798 79.49,261.1 130.55,261.1"
        fill="#34A853"
      />
      <Path
        d="M56.281,156.37 C53.525,148.247 51.93,139.543 51.93,130.55 C51.93,121.556 53.525,112.853 56.136,104.73 L56.063,103 L15.26,71.312 L13.925,71.947 C5.077,89.644 0,109.517 0,130.55 C0,151.583 5.077,171.455 13.925,189.152 L56.281,156.37"
        fill="#FBBC05"
      />
      <Path
        d="M130.55,50.479 C155.064,50.479 171.6,61.068 181.029,69.917 L217.873,33.943 C195.245,12.91 165.798,0 130.55,0 C79.49,0 35.393,29.301 13.925,71.947 L56.136,104.73 C66.726,73.253 96.027,50.479 130.55,50.479"
        fill="#EB4335"
      />
    </Svg>
  );
};

export function Auth({ onBack, onLoginSuccess, theme }: AuthProps) {
  const { theme: ctxTheme } = useTheme();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const t = theme || ctxTheme || lightTheme;
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password'>('email');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRegister, setPendingRegister] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);
  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  
  // BottomNav height: 80px + safe area bottom
  const bottomNavHeight = 80 + Math.max(insets.bottom, 16);

  const handleSubmit = async () => {
    if (!email || !password) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Mật khẩu phải có ít nhất 8 ký tự', 'error');
      return;
    }
    if (isRegister) {
      if (!name) {
        showToast('Vui lòng nhập họ và tên', 'error');
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
        setVerificationCode(['', '', '', '', '', '']);
        setIsVerifyingEmail(true);
        showToast('Đã gửi mã xác nhận đến email của bạn', 'success');
      } catch (error: any) {
        showToast(error?.message || 'Không thể gửi mã xác nhận', 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const result = await login(email.trim().toLowerCase(), password);
        showToast('Đăng nhập thành công', 'success');
        onLoginSuccess(result);
      } catch (error: any) {
        showToast(error?.message || 'Đăng nhập thất bại', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    // Xử lý paste nhiều ký tự
    if (value.length > 1) {
      const digits = value.replace(/[^0-9]/g, '').slice(0, 6);
      const newCode = ['', '', '', '', '', ''];
      digits.split('').forEach((digit, i) => {
        if (i < 6) newCode[i] = digit;
      });
      setVerificationCode(newCode);
      
      // Focus vào ô cuối cùng đã nhập
      const lastIndex = Math.min(digits.length - 1, 5);
      if (codeInputRefs.current[lastIndex]) {
        codeInputRefs.current[lastIndex]?.focus();
      }
      return;
    }
    
    const newCode = [...verificationCode];
    newCode[index] = value.replace(/[^0-9]/g, ''); // Chỉ cho phép số
    
    setVerificationCode(newCode);
    
    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5 && codeInputRefs.current[index + 1]) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      showToast('Vui lòng nhập đầy đủ 6 số', 'error');
      return;
    }

    if (!pendingRegister) {
      showToast('Vui lòng nhập lại thông tin đăng ký', 'error');
      setIsVerifyingEmail(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyRegisterOtp(
        pendingRegister.email,
        code,
      );
      showToast('Đăng ký thành công', 'success');
      setIsVerifyingEmail(false);
      setIsRegister(false);
      setPendingRegister(null);
      setVerificationCode(['', '', '', '', '', '']);
      onLoginSuccess(result);
    } catch (error: any) {
      showToast(error?.message || 'Mã xác nhận không đúng. Vui lòng thử lại.', 'error');
      setVerificationCode(['', '', '', '', '', '']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingRegister) {
      showToast('Vui lòng nhập lại thông tin đăng ký', 'error');
      setIsVerifyingEmail(false);
      return;
    }
    setIsSubmitting(true);
    try {
      await sendRegisterOtp(
        pendingRegister.name,
        pendingRegister.email,
        pendingRegister.password,
      );
      showToast('Đã gửi lại mã xác nhận đến email của bạn', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Không thể gửi lại mã xác nhận', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      showToast('Vui lòng nhập email', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendResetOtp(email.trim().toLowerCase());
      setResetEmailSent(true);
      setResetStep('otp');
      showToast('Đã gửi mã xác nhận', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Không thể gửi mã xác nhận', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      showToast('Vui lòng nhập đầy đủ 6 số', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await verifyResetOtp(email.trim().toLowerCase(), code);
      setResetToken(result.resetToken);
      setResetStep('password');
      setVerificationCode(['', '', '', '', '', '']);
      showToast('Mã xác nhận hợp lệ', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Mã xác nhận không đúng', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNewPassword = async () => {
    if (newPassword.length < 8) {
      showToast('Mật khẩu phải có ít nhất 8 ký tự', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    if (!resetToken) {
      showToast('Vui lòng xác thực mã OTP trước', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email.trim().toLowerCase(), resetToken, newPassword);
      showToast('Đổi mật khẩu thành công. Vui lòng đăng nhập.', 'success');
      setIsForgotPassword(false);
      setResetStep('email');
      setResetEmailSent(false);
      setVerificationCode(['', '', '', '', '', '']);
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setPassword('');
    } catch (error: any) {
      showToast(error?.message || 'Không thể đổi mật khẩu', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifyingEmail) {
    return (
      <ScrollView 
        style={[styles.container, { backgroundColor: t.background }]} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomNavHeight + 24 }]}
      >
        <TouchableOpacity
          onPress={() => {
            setIsVerifyingEmail(false);
            setVerificationCode(['', '', '', '', '', '']);
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>Xác nhận email</Text>
          <Text style={[styles.subtitle, { color: t.muted }]}>
            Chúng tôi đã gửi mã xác nhận đến địa chỉ email{'\n'}
            <Text style={[styles.emailHighlight, { color: t.primary }]}>{pendingRegister?.email || email}</Text>
          </Text>
        </View>

        <View style={styles.verificationContainer}>
          <Text style={[styles.verificationLabel, { color: t.text }]}>Nhập mã xác nhận</Text>
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
            <Text style={[styles.resendText, { color: t.primary }]}>Gửi lại mã</Text>
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
            <Text style={styles.primaryButtonText}>{isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (isForgotPassword) {
    return (
      <ScrollView 
        style={[styles.container, { backgroundColor: t.background }]} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomNavHeight + 24 }]}
      >
        <TouchableOpacity
          onPress={() => {
            setIsForgotPassword(false);
            setResetEmailSent(false);
            setResetStep('email');
            setVerificationCode(['', '', '', '', '', '']);
            setResetToken('');
            setNewPassword('');
            setConfirmPassword('');
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>Quên mật khẩu?</Text>
          <Text style={[styles.subtitle, { color: t.muted }]}>
            {resetStep === 'email' && "Đừng lo, chúng tôi sẽ giúp bạn lấy lại mật khẩu."}
            {resetStep === 'otp' && "Nhập mã xác nhận đã được gửi đến email của bạn."}
            {resetStep === 'password' && "Nhập mật khẩu mới cho tài khoản của bạn."}
          </Text>
        </View>

        {resetStep === 'email' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.text }]}>Email</Text>
              <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
                <AppIcon name="mail" size={20} color={t.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="example@email.com"
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.input, { color: t.text }]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={t.muted}
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
              <Text style={styles.primaryButtonText}>{isSubmitting ? 'Đang gửi...' : 'Gửi mã xác nhận'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {resetStep === 'otp' && (
          <View style={styles.verificationContainer}>
            <Text style={[styles.verificationLabel, { color: t.text }]}>Nhập mã xác nhận</Text>
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
              <Text style={styles.primaryButtonText}>{isSubmitting ? 'Đang kiểm tra...' : 'Xác nhận mã'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {resetStep === 'password' && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.text }]}>Mật khẩu mới</Text>
              <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
                <AppIcon name="lock" size={20} color={t.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={[styles.input, { color: t.text }]}
                  secureTextEntry
                  placeholderTextColor={t.muted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: t.text }]}>Xác nhận mật khẩu</Text>
              <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
                <AppIcon name="lock" size={20} color={t.muted} style={styles.inputIcon} />
                <TextInput
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[styles.input, { color: t.text }]}
                  secureTextEntry
                  placeholderTextColor={t.muted}
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
              <Text style={styles.primaryButtonText}>{isSubmitting ? 'Đang đổi...' : 'Đổi mật khẩu'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: t.background }]} 
      contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomNavHeight + 24 }]}
    >
      <View style={styles.header}>
        <Text style={[styles.brandTitle, { color: t.primary }]}>ElectroAI</Text>
        <Text style={[styles.subtitle, { color: t.muted }]}>
          {isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại!"}
        </Text>
      </View>

      <View style={styles.form}>
        {isRegister && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>Họ và tên</Text>
            <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
              <AppIcon name="user" size={20} color={t.muted} style={styles.inputIcon} />
              <TextInput
                placeholder="Nhập họ tên"
                value={name}
                onChangeText={setName}
                style={[styles.input, { color: t.text }]}
                placeholderTextColor={t.muted}
              />
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: t.text }]}>Email</Text>
          <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
            <AppIcon name="mail" size={20} color={t.muted} style={styles.inputIcon} />
            <TextInput
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { color: t.text }]}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={t.muted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: t.text }]}>Mật khẩu</Text>
            {!isRegister && (
              <TouchableOpacity
                onPress={() => setIsForgotPassword(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.forgotPassword, { color: t.primary }]}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.inputContainer, { backgroundColor: t.surface, borderColor: t.border }]}>
            <AppIcon name="lock" size={20} color={t.muted} style={styles.inputIcon} />
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { color: t.text }]}
              secureTextEntry={!showPassword}
              placeholderTextColor={t.muted}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <AppIcon 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color={t.muted} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[
            styles.primaryButton,
            { backgroundColor: t.primary },
            isSubmitting && { opacity: 0.9 },
          ]}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
          </Text>
        </TouchableOpacity>

        <View style={[styles.divider, { borderBottomColor: t.border }]}>
          <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
          <Text style={[styles.dividerText, { color: t.muted, backgroundColor: t.background }]}>Hoặc tiếp tục với</Text>
          <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
        </View>

        <TouchableOpacity style={[styles.socialButton, { backgroundColor: t.surface, borderColor: t.border }]} activeOpacity={0.7}>
          <GoogleIcon size={20} />
          <Text style={[styles.socialButtonText, { color: t.text }]}>Đăng nhập với Google</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: t.muted }]}>
          {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setIsRegister(!isRegister);
            setIsForgotPassword(false);
            setIsVerifyingEmail(false);
            setPendingRegister(null);
            setVerificationCode(['', '', '', '', '', '']);
            setResetStep('email');
            setResetEmailSent(false);
            setResetToken('');
            setNewPassword('');
            setConfirmPassword('');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.footerLink, { color: t.primary }]}>
            {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
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
    color: '#374151',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  eyeButton: {
    padding: 4,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    minWidth: 220,
    alignSelf: 'center',
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#FFFFFF',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  emailHighlight: {
    fontWeight: '600',
    color: '#2563EB',
  },
  verificationContainer: {
    gap: 24,
    marginTop: 16,
  },
  verificationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
});
