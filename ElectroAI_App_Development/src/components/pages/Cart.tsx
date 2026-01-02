import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, TicketPercent, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { PRODUCTS, CartItem, AVAILABLE_VOUCHERS, Voucher } from '../../lib/data';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CartProps {
  onCheckout?: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onExplore?: () => void;
}

export function Cart({ onCheckout, items, onUpdateQuantity, onRemoveItem, onExplore }: CartProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 30000;
  
  // Calculate discount
  let discountAmount = 0;
  if (appliedVoucher) {
      if (appliedVoucher.type === 'shipping') {
          discountAmount = Math.min(appliedVoucher.discount, shipping);
      } else {
          discountAmount = appliedVoucher.discount;
      }
  }

  const total = Math.max(0, subtotal + shipping - discountAmount);

  const handleApplyVoucher = (code: string) => {
    const voucher = AVAILABLE_VOUCHERS.find(v => v.code === code);
    if (voucher) {
        if (subtotal >= voucher.minOrder) {
            setAppliedVoucher(voucher);
            setVoucherCode(voucher.code);
            setShowVoucherList(false);
        } else {
            alert(`Đơn hàng cần tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}đ để sử dụng mã này.`);
        }
    } else {
        alert('Mã giảm giá không hợp lệ');
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] pt-14 pb-20 px-4 text-center bg-[#F5F7FA] dark:bg-gray-950">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Trash2 size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold mb-2 dark:text-gray-100">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <button 
          onClick={onExplore}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          Khám phá sản phẩm
        </button>
      </div>
    );
  }

  return (
    <div className="h-full pt-16 pb-24 px-4 bg-[#F5F7FA] dark:bg-gray-950 overflow-y-auto animate-fade-in relative">
      {/* Voucher Modal */}
      {showVoucherList && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowVoucherList(false)} />
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative z-10 animate-in slide-in-from-bottom-1/2 duration-300 max-h-[80vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold dark:text-white">Chọn mã giảm giá</h3>
                    <button onClick={() => setShowVoucherList(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 space-y-3 -mx-2 px-2 pb-4 scrollbar-hide">
                    {AVAILABLE_VOUCHERS.map((voucher) => {
                        const isEligible = subtotal >= voucher.minOrder;
                        const isSelected = appliedVoucher?.code === voucher.code;

                        return (
                            <div 
                                key={voucher.code}
                                className={`p-4 rounded-xl border flex gap-4 transition-all ${
                                    isSelected 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
                                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950'
                                } ${!isEligible ? 'opacity-50 grayscale' : ''}`}
                            >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <TicketPercent size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{voucher.code}</h4>
                                        {isSelected && <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{voucher.description}</p>
                                    {!isEligible && (
                                        <p className="text-xs text-red-500 mt-2">
                                            Mua thêm {(voucher.minOrder - subtotal).toLocaleString('vi-VN')}đ để sử dụng
                                        </p>
                                    )}
                                </div>
                                {isEligible && (
                                    <div className="flex items-center">
                                        <button 
                                            onClick={() => handleApplyVoucher(voucher.code)}
                                            className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                                isSelected 
                                                    ? 'bg-blue-600 text-white shadow-sm' 
                                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400'
                                            }`}
                                        >
                                            {isSelected ? 'Đang dùng' : 'Dùng ngay'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Giỏ hàng ({items.length})</h1>
      
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl flex gap-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
              <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium line-clamp-2 pr-2 dark:text-gray-200">{item.name}</h3>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.category}</p>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {item.price.toLocaleString('vi-VN')}₫
                </span>
                
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded shadow-sm hover:text-blue-600 dark:text-gray-300"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-medium w-4 text-center dark:text-gray-200">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 rounded shadow-sm hover:text-blue-600 dark:text-gray-300"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
        {/* Voucher Input */}
        <div className="flex gap-2 mb-4">
            <div className="relative flex-1 cursor-pointer" onClick={() => setShowVoucherList(true)}>
                <TicketPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Chọn hoặc nhập mã giảm giá" 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl h-10 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400 cursor-pointer"
                    readOnly
                />
                 <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tạm tính</span>
          <span className="font-medium dark:text-gray-200">{subtotal.toLocaleString('vi-VN')}₫</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Phí vận chuyển</span>
          <span className="font-medium dark:text-gray-200">{shipping.toLocaleString('vi-VN')}₫</span>
        </div>
        
        {/* Discount Row */}
        {appliedVoucher && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-1">
                <span className="flex items-center gap-1">
                    <TicketPercent size={14} /> Voucher giảm giá
                </span>
                <span className="font-medium">-{discountAmount.toLocaleString('vi-VN')}₫</span>
            </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-end">
          <span className="font-bold dark:text-gray-100">Tổng cộng</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{total.toLocaleString('vi-VN')}₫</span>
        </div>
        
        <button 
          onClick={onCheckout}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
        >
          Thanh toán ngay <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}