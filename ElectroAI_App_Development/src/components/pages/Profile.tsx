import React, { useState, useRef } from 'react';
import { User, MapPin, CreditCard, Settings, HelpCircle, LogOut, ChevronRight, Package, Heart, Edit2, Camera, X, TicketPercent } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { AVAILABLE_VOUCHERS } from '../../lib/data';
import { toast } from 'sonner@2.0.3';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

interface ProfileProps {
  onNavigateToOrders?: () => void;
  onNavigateToAddress?: () => void;
  onNavigateToPayment?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToWishlist?: () => void;
  onLogout?: () => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (data: Partial<UserProfile>) => void;
}

export function Profile({ 
  onNavigateToOrders, 
  onNavigateToAddress,
  onNavigateToPayment,
  onNavigateToSettings,
  onNavigateToSupport,
  onNavigateToWishlist,
  onLogout,
  userProfile = { name: "Nguyễn Văn A", email: "nguyenva@example.com", avatar: "" },
  onUpdateProfile
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showVouchers, setShowVouchers] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [previewAvatar, setPreviewAvatar] = useState(userProfile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyVoucher = (code: string) => {
      navigator.clipboard.writeText(code);
      toast.success(`Đã sao chép mã ${code}`);
      setShowVouchers(false);
  };

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile({ name: editName, avatar: previewAvatar });
    }
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-24 pt-16 px-4 bg-[#F5F7FA] dark:bg-gray-950 min-h-screen animate-fade-in relative">
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setIsEditing(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X size={20} />
                </button>
                <h2 className="text-lg font-bold mb-6 text-center dark:text-white">Chỉnh sửa hồ sơ</h2>
                
                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-24 h-24 mb-4">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-800">
                            {previewAvatar ? (
                                <ImageWithFallback src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <User size={40} className="text-gray-400" />
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Camera size={16} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
                        <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            value={userProfile.email}
                            disabled
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <button 
                        onClick={handleSave}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Vouchers Modal */}
      {showVouchers && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowVouchers(false)} />
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative z-10 animate-in slide-in-from-bottom-1/2 duration-300 max-h-[80vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold dark:text-white">Kho Voucher của tôi</h3>
                    <button onClick={() => setShowVouchers(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 space-y-3 -mx-2 px-2 pb-4 scrollbar-hide">
                    {AVAILABLE_VOUCHERS.map((voucher) => (
                        <div 
                            key={voucher.code}
                            className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex gap-4"
                        >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TicketPercent size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{voucher.code}</h4>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{voucher.description}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">HSD: 31/12/2026</p>
                            </div>
                            <div className="flex items-center">
                                <button 
                                    onClick={() => handleCopyVoucher(voucher.code)}
                                    className="text-sm font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 transition-colors"
                                >
                                    Sao chép
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Header Profile */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px] flex-shrink-0">
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden flex items-center justify-center">
             {userProfile.avatar ? (
                <ImageWithFallback src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
             ) : (
                <User size={32} className="text-gray-400" />
             )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold dark:text-gray-100 truncate">{userProfile.name}</h1>
            <button 
                onClick={() => {
                    setEditName(userProfile.name);
                    setPreviewAvatar(userProfile.avatar);
                    setIsEditing(true);
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-blue-600 transition-colors flex-shrink-0"
            >
                <Edit2 size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500 truncate">{userProfile.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div 
            onClick={onNavigateToOrders}
            className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.98] transition-all hover:border-blue-200 dark:hover:border-blue-800"
        >
          <span className="text-2xl font-bold block mb-1 dark:text-gray-100">12</span>
          <span className="text-xs text-gray-500">Đơn hàng</span>
        </div>
        <div 
            onClick={() => setShowVouchers(true)}
            className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.98] transition-all hover:border-blue-200 dark:hover:border-blue-800"
        >
          <span className="text-2xl font-bold block mb-1 dark:text-gray-100">{AVAILABLE_VOUCHERS.length}</span>
          <span className="text-xs text-gray-500">Voucher</span>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="space-y-6">
        {/* Group 1 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          <MenuItem icon={Package} label="Đơn hàng của tôi" onClick={onNavigateToOrders} />
          <div className="h-[1px] bg-gray-50 dark:bg-gray-800 mx-4" />
          <MenuItem icon={Heart} label="Sản phẩm yêu thích" onClick={onNavigateToWishlist} />
          <div className="h-[1px] bg-gray-50 dark:bg-gray-800 mx-4" />
          <MenuItem icon={MapPin} label="Sổ địa chỉ" onClick={onNavigateToAddress} />
          <div className="h-[1px] bg-gray-50 dark:bg-gray-800 mx-4" />
          <MenuItem icon={CreditCard} label="Phương thức thanh toán" onClick={onNavigateToPayment} />
        </div>

        {/* Group 2 */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          <MenuItem icon={Settings} label="Cài đặt" onClick={onNavigateToSettings} />
          <div className="h-[1px] bg-gray-50 dark:bg-gray-800 mx-4" />
          <MenuItem icon={HelpCircle} label="Trung tâm hỗ trợ" onClick={onNavigateToSupport} />
        </div>

        {/* Logout */}
        <button 
          onClick={onLogout}
          className="w-full bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8 mb-4">Version 1.0.0 (Build 2024)</p>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <span className="font-medium text-sm dark:text-gray-200">{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  )
}