import React from 'react';
import { ArrowLeft, Package, ChevronRight, Clock, CheckCircle2, Truck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OrderHistoryProps {
  onBack: () => void;
  onViewDetail?: (orderId: string) => void;
}

export function OrderHistory({ onBack, onViewDetail }: OrderHistoryProps) {
  const orders = [
    {
      id: "ORD-2024-001",
      date: "20/01/2026",
      status: "processing",
      items: ["Arduino Uno R3", "Cảm biến siêu âm HC-SR04"],
      total: 175000
    },
    {
      id: "ORD-2023-128",
      date: "15/12/2025",
      status: "completed",
      items: ["Mỏ hàn 60W", "Thiếc hàn"],
      total: 250000
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'processing': return "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
      case 'shipping': return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case 'completed': return "text-green-500 bg-green-50 dark:bg-green-900/20";
      default: return "text-gray-500 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'processing': return "Đang xử lý";
      case 'shipping': return "Đang giao";
      case 'completed': return "Hoàn thành";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
      <div className="bg-white dark:bg-gray-900 px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Đơn hàng của tôi</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
             <div className="flex justify-between items-start mb-3">
               <div>
                 <span className="text-xs font-bold text-gray-400 block mb-1">#{order.id}</span>
                 <span className="text-xs text-gray-500">{order.date}</span>
               </div>
               <span className={cn(
                 "px-2.5 py-1 rounded-full text-xs font-bold",
                 getStatusColor(order.status)
               )}>
                 {getStatusText(order.status)}
               </span>
             </div>
             
             <div className="border-t border-gray-50 dark:border-gray-800 py-3 mb-2">
               {order.items.map((item, i) => (
                 <p key={i} className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 mb-1">• {item}</p>
               ))}
               {order.items.length > 2 && <p className="text-xs text-gray-400 italic">+ {order.items.length - 2} sản phẩm khác</p>}
             </div>
             
             <div className="flex justify-between items-center">
               <div>
                 <span className="text-xs text-gray-400 block">Tổng tiền</span>
                 <span className="font-bold text-blue-600">{order.total.toLocaleString()}₫</span>
               </div>
               <button 
                 onClick={() => onViewDetail?.(order.id)}
                 className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                 Xem chi tiết
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
