import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppIcon } from '../components/common/Icon';
import { Theme, lightTheme, useTheme } from '../lib/theme';

interface AuthProps {
  onBack: () => void;
  onLoginSuccess: () => void;
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
  const t = theme || ctxTheme || lightTheme;
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (isRegister) {
      if (!name) {
        Alert.alert('Thông báo', 'Vui lòng nhập họ và tên');
        return;
      }
      // Chuyển sang màn hình xác nhận email
      setIsVerifyingEmail(true);
    } else {
      onLoginSuccess();
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

  const handleVerifyCode = () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ 6 số');
      return;
    }
    
    // Giả lập kiểm tra mã (trong thực tế sẽ gọi API)
    // Mã test: 123456
    if (code === '123456') {
      Alert.alert('Thành công', 'Email đã được xác nhận!', [
        {
          text: 'OK',
          onPress: () => {
            setIsVerifyingEmail(false);
            onLoginSuccess();
          }
        }
      ]);
    } else {
      Alert.alert('Lỗi', 'Mã xác nhận không đúng. Vui lòng thử lại.');
      setVerificationCode(['', '', '', '', '', '']);
    }
  };

  const handleResendCode = () => {
    Alert.alert('Thông báo', 'Đã gửi lại mã xác nhận đến email của bạn');
    // Trong thực tế sẽ gọi API gửi lại mã
  };

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Thông báo', 'Vui lòng nhập email');
      return;
    }
    setResetEmailSent(true);
  };

  if (isVerifyingEmail) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: t.background }]} contentContainerStyle={styles.contentContainer}>
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
            <Text style={[styles.emailHighlight, { color: t.primary }]}>{email}</Text>
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
            style={styles.resendButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.resendText, { color: t.primary }]}>Gửi lại mã</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleVerifyCode}
            style={[styles.primaryButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (isForgotPassword) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: t.background }]} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => {
            setIsForgotPassword(false);
            setResetEmailSent(false);
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <AppIcon name="arrow-left" size={24} color={t.muted} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>Quên mật khẩu?</Text>
          <Text style={[styles.subtitle, { color: t.muted }]}>
            {resetEmailSent
              ? "Vui lòng kiểm tra email của bạn."
              : "Đừng lo, chúng tôi sẽ giúp bạn lấy lại mật khẩu."}
          </Text>
        </View>

        {resetEmailSent ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <AppIcon name="check-circle" size={40} color={t.primary} />
            </View>
            <Text style={[styles.successTitle, { color: t.text }]}>Đã gửi email!</Text>
            <Text style={[styles.successText, { color: t.muted }]}>
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến địa chỉ email bạn cung cấp.
            </Text>
            <TouchableOpacity
              onPress={() => setIsForgotPassword(false)}
              style={[styles.primaryButton, styles.primaryButtonLarge, { backgroundColor: t.primary, shadowColor: t.primary }]}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
              style={[styles.primaryButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Gửi hướng dẫn</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: t.background }]} contentContainerStyle={styles.contentContainer}>
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
          style={[styles.primaryButton, { backgroundColor: t.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {isRegister ? "Đăng ký" : "Đăng nhập"}
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
          onPress={() => setIsRegister(!isRegister)}
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
