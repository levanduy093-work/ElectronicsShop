import React from 'react';
import { ArrowLeft, Package, Tag, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NotificationsProps {
  onBack: () => void;
}

export function Notifications({ onBack }: NotificationsProps) {
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Giao hàng thành công',
      message: 'Đơn hàng #ORD-2024-001 đã được giao thành công. Vui lòng đánh giá sản phẩm nhé!',
      time: '2 giờ trước',
      read: false,
    },
    {
      id: 2,
      type: 'promo',
      title: 'Giảm 20% linh kiện Arduino',
      message: 'Duy nhất hôm nay! Nhập mã ARDUINO20 khi thanh toán.',
      time: '5 giờ trước',
      read: false,
    },
    {
      id: 3,
      type: 'system',
      title: 'Chào mừng đến với ElectroAI',
      message: 'Cảm ơn bạn đã tạo tài khoản. Khám phá ngay các tính năng AI độc đáo của chúng tôi.',
      time: '1 ngày trước',
      read: true,
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package size={20} className="text-blue-600" />;
      case 'promo': return <Tag size={20} className="text-orange-500" />;
      case 'system': return <Info size={20} className="text-purple-600" />;
      default: return <Info size={20} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'order': return "bg-blue-50 dark:bg-blue-900/20";
      case 'promo': return "bg-orange-50 dark:bg-orange-900/20";
      case 'system': return "bg-purple-50 dark:bg-purple-900/20";
      default: return "bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
      <div className="bg-white dark:bg-gray-900 px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Thông báo</h1>
        <button className="ml-auto text-sm text-blue-600 font-medium">Đã đọc tất cả</button>
      </div>

      <div className="px-4 py-2">
        {notifications.map((item) => (
          <div 
            key={item.id} 
            className={cn(
              "flex gap-4 p-4 mb-3 rounded-2xl border transition-colors cursor-pointer",
              item.read 
                ? "bg-transparent border-transparent" 
                : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm"
            )}
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", getBgColor(item.type))}>
              {getIcon(item.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className={cn("text-sm font-semibold", !item.read && "text-gray-900 dark:text-gray-100")}>
                  {item.title}
                </h3>
                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{item.time}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{item.message}</p>
            </div>
            {!item.read && (
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            )}
          </div>
        ))}
        
        <div className="text-center py-8">
          <p className="text-xs text-gray-400">Bạn đã xem hết thông báo</p>
        </div>
      </div>
    </div>
  );
}
