import React from 'react';
import { ArrowLeft, Moon, Globe, Bell, Lock, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SettingsProps {
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Settings({ onBack, isDarkMode, onToggleDarkMode }: SettingsProps) {
  return (
    <div className="bg-[#F5F7FA] dark:bg-gray-950 min-h-screen animate-fade-in flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 px-4 h-14 flex items-center shadow-sm">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-lg font-bold ml-2 text-gray-900 dark:text-white">Cài đặt</h1>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        
        {/* Section: CHUNG */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Chung</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <Moon size={18} />
                </div>
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Chế độ tối</span>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={onToggleDarkMode} />
            </div>

            {/* Language */}
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <Globe size={18} />
                </div>
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Ngôn ngữ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Tiếng Việt</span>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Section: THÔNG BÁO */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Thông báo</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <Bell size={18} />
                </div>
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Nhận thông báo đầy</span>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>
          </div>
        </div>

        {/* Section: TÀI KHOẢN */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Tài khoản</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
            {/* Change Password */}
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <Lock size={18} />
                </div>
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Đổi mật khẩu</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

      </div>
      
      {/* Bottom handle indicator (mocking the image) */}
      <div className="pb-2 flex justify-center">
         <div className="w-32 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}

function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: () => void }) {
  return (
    <button
      onClick={onCheckedChange}
      className={cn(
        "w-12 h-7 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
      )}
    >
      <span
        className={cn(
          "absolute top-1 left-1 bg-white rounded-full w-5 h-5 shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}