import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppIcon } from '../components/common/Icon';

interface AuthProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

// Google Icon component from google-brand-color.svg
const GoogleIcon = ({ size = 24 }: { size?: number }) => {
  // SVG viewBox is 77x24, maintain aspect ratio
  const aspectRatio = 77 / 24;
  const width = size * aspectRatio;
  const height = size;
  
  return (
    <Svg width={width} height={height} viewBox="0 0 77 24">
      <Path
        d="M19.947 8.482H11.43v2.536h6.041c-.298 3.557-3.247 5.074-6.03 5.074-3.562 0-6.67-2.812-6.67-6.753 0-3.839 2.963-6.795 6.677-6.795 2.866 0 4.555 1.833 4.555 1.833l1.77-1.84S15.5 0 11.357 0C6.081 0 2 4.468 2 9.294c0 4.729 3.84 9.34 9.491 9.34 4.972 0 8.61-3.417 8.61-8.47 0-1.067-.154-1.683-.154-1.683"
        fill="#4285F4"
      />
      <Path
        d="M26.96 8.997c1.719 0 3.347 1.395 3.347 3.642 0 2.199-1.621 3.633-3.355 3.633-1.905 0-3.408-1.53-3.408-3.65 0-2.075 1.485-3.625 3.416-3.625zm-.035-2.352c-3.495 0-6 2.742-6 5.94 0 3.245 2.43 6.038 6.041 6.038 3.27 0 5.948-2.508 5.948-5.968 0-3.967-3.116-6.01-5.989-6.01z"
        fill="#EB4335"
      />
      <Path
        d="M40.01 8.997c1.718 0 3.347 1.395 3.347 3.642 0 2.199-1.622 3.633-3.356 3.633-1.904 0-3.407-1.53-3.407-3.65 0-2.075 1.484-3.625 3.415-3.625zm-.035-2.352c-3.496 0-6 2.742-6 5.94 0 3.245 2.43 6.038 6.04 6.038 3.27 0 5.949-2.508 5.949-5.968 0-3.967-3.116-6.01-5.99-6.01z"
        fill="#FBBC05"
      />
      <Path
        d="M53.006 9c1.573 0 3.188 1.347 3.188 3.648 0 2.34-1.611 3.629-3.222 3.629-1.71 0-3.302-1.394-3.302-3.607 0-2.299 1.652-3.67 3.336-3.67zm-.232-2.349c-3.208 0-5.73 2.82-5.73 5.984 0 3.605 2.924 5.996 5.675 5.996 1.7 0 2.605-.678 3.273-1.455v1.18c0 2.067-1.25 3.304-3.137 3.304-1.824 0-2.738-1.36-3.056-2.132l-2.293.962c.813 1.726 2.451 3.527 5.368 3.527 3.19 0 5.62-2.016 5.62-6.244V7.012h-2.502v1.014c-.77-.832-1.821-1.375-3.218-1.375z"
        fill="#4285F4"
      />
      <Path
        d="M69.725 8.94c1.09 0 1.875.582 2.209 1.28l-5.345 2.241c-.23-1.735 1.408-3.52 3.136-3.52zm-.104-2.303c-3.026 0-5.567 2.416-5.567 5.981 0 3.772 2.832 6.01 5.858 6.01 2.525 0 4.075-1.387 5-2.629l-2.063-1.377c-.536.833-1.43 1.648-2.925 1.648-1.678 0-2.45-.922-2.927-1.815L75 11.123l-.415-.976c-.774-1.913-2.577-3.51-4.964-3.51z"
        fill="#EB4335"
      />
      <Path
        d="M60.239 18.272h2.628V.62H60.24z"
        fill="#34A853"
      />
    </Svg>
  );
};

export function Auth({ onBack, onLoginSuccess }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    onLoginSuccess();
  };

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Thông báo', 'Vui lòng nhập email');
      return;
    }
    setResetEmailSent(true);
  };

  if (isForgotPassword) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => {
            setIsForgotPassword(false);
            setResetEmailSent(false);
          }}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <AppIcon name="arrow-left" size={24} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.subtitle}>
            {resetEmailSent
              ? "Vui lòng kiểm tra email của bạn."
              : "Đừng lo, chúng tôi sẽ giúp bạn lấy lại mật khẩu."}
          </Text>
        </View>

        {resetEmailSent ? (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <AppIcon name="check-circle" size={40} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Đã gửi email!</Text>
            <Text style={styles.successText}>
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến địa chỉ email bạn cung cấp.
            </Text>
            <TouchableOpacity
              onPress={() => setIsForgotPassword(false)}
              style={[styles.primaryButton, styles.primaryButtonLarge]}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <AppIcon name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  placeholder="example@email.com"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              style={styles.primaryButton}
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>ElectroAI</Text>
        <Text style={styles.subtitle}>
          {isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại!"}
        </Text>
      </View>

      <View style={styles.form}>
        {isRegister && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputContainer}>
              <AppIcon name="user" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                placeholder="Nhập họ tên"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <AppIcon name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Mật khẩu</Text>
            {!isRegister && (
              <TouchableOpacity
                onPress={() => setIsForgotPassword(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.inputContainer}>
            <AppIcon name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <AppIcon 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.primaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {isRegister ? "Đăng ký" : "Đăng nhập"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
          <GoogleIcon size={20} />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
        </Text>
        <TouchableOpacity
          onPress={() => setIsRegister(!isRegister)}
          activeOpacity={0.7}
        >
          <Text style={styles.footerLink}>
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
});
