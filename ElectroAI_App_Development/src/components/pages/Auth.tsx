import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Facebook, CheckCircle } from 'lucide-react';

interface AuthProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export function Auth({ onBack, onLoginSuccess }: AuthProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Forgot Password Screen
  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 p-6 flex flex-col animate-slide-up-fade">
        <button 
          onClick={() => {
            setIsForgotPassword(false);
            setResetEmailSent(false);
          }} 
          className="self-start p-2 -ml-2 text-gray-500 mb-8"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-blue-600">Quên mật khẩu?</h1>
          <p className="text-gray-500 text-lg">
            {resetEmailSent 
              ? "Vui lòng kiểm tra email của bạn." 
              : "Đừng lo, chúng tôi sẽ giúp bạn lấy lại mật khẩu."}
          </p>
        </div>

        {resetEmailSent ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Đã gửi email!</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến địa chỉ email bạn cung cấp.
              </p>
            </div>
            <button 
              onClick={() => setIsForgotPassword(false)}
              className="w-full bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg hover:bg-blue-700 transition-all mt-8"
            >
              Quay lại đăng nhập
            </button>
          </div>
        ) : (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  placeholder="example@email.com" 
                  className="w-full h-12 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={() => setResetEmailSent(true)}
              className="w-full bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg hover:bg-blue-700 transition-all mt-6"
            >
              Gửi hướng dẫn
            </button>
          </div>
        )}
      </div>
    );
  }

  // Login / Register Screen
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-6 flex flex-col animate-slide-up-fade">
      <div className="h-14"></div> {/* Spacer instead of Back button */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">ElectroAI</h1>
        <p className="text-gray-500 text-lg">
          {isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại!"}
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {isRegister && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Nhập họ tên" 
                className="w-full h-12 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="email" 
              placeholder="example@email.com" 
              className="w-full h-12 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full h-12 pl-10 pr-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {!isRegister && (
            <div className="flex justify-end">
              <button 
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={onLoginSuccess}
          className="w-full bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg hover:bg-blue-700 transition-all mt-6"
        >
          {isRegister ? "Đăng ký" : "Đăng nhập"}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-950 text-gray-500">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="h-12 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button className="h-12 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
             <Facebook className="text-blue-600" size={20} />
             Facebook
          </button>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-gray-500">
          {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
          </button>
        </p>
      </div>
    </div>
  );
}