import React, { useState } from 'react';
import { ArrowLeft, MapPin, Truck, CreditCard, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CheckoutProps {
  onBack: () => void;
  onSuccess: () => void;
  totalAmount: number;
}

type Step = 'address' | 'shipping' | 'payment' | 'success';

export function Checkout({ onBack, onSuccess, totalAmount }: CheckoutProps) {
  const [step, setStep] = useState<Step>('address');
  
  const steps = [
    { id: 'address', title: 'Địa chỉ', icon: MapPin },
    { id: 'shipping', title: 'Vận chuyển', icon: Truck },
    { id: 'payment', title: 'Thanh toán', icon: CreditCard },
  ];

  const handleNext = () => {
    if (step === 'address') setStep('shipping');
    else if (step === 'shipping') setStep('payment');
    else if (step === 'payment') setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white dark:bg-gray-950 animate-slide-up-fade text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 text-green-600">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-500 mb-8 max-w-xs">
          Đơn hàng #ORD-2024-001 của bạn đang được xử lý. Chúng tôi sẽ thông báo khi hàng được gửi đi.
        </p>
        <button 
          onClick={onSuccess}
          className="w-full max-w-xs bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 transition-all"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 flex flex-col animate-slide-up-fade">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Thanh toán</h1>
      </div>

      {/* Progress */}
      <div className="px-8 py-6 flex justify-between relative">
        <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-gray-200 dark:bg-gray-800 -z-10" />
        {steps.map((s, idx) => {
          const isActive = s.id === step;
          const isCompleted = steps.findIndex(x => x.id === step) > idx;
          
          return (
            <div key={s.id} className="flex flex-col items-center gap-2 bg-[#F5F7FA] dark:bg-gray-950 px-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                isActive || isCompleted 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-700"
              )}>
                <s.icon size={18} />
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wide",
                isActive || isCompleted ? "text-blue-600" : "text-gray-400"
              )}>{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 space-y-4">
        {step === 'address' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Địa chỉ nhận hàng</h2>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-blue-500 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                Mặc định
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold">Nhà riêng</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội
                  </p>
                  <p className="text-sm text-gray-500 mt-1">0987 654 321</p>
                </div>
              </div>
            </div>

            <button className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              + Thêm địa chỉ mới
            </button>
          </div>
        )}

        {step === 'shipping' && (
          <div className="space-y-4">
             <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Phương thức vận chuyển</h2>
             
             {[
               { name: "Nhanh (24h)", price: 30000, desc: "Nhận hàng vào ngày mai" },
               { name: "Tiêu chuẩn (2-3 ngày)", price: 15000, desc: "Nhận hàng T5, 20/01" }
             ].map((opt, i) => (
               <label key={i} className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-blue-500 transition-colors">
                 <input type="radio" name="shipping" defaultChecked={i === 0} className="w-5 h-5 text-blue-600" />
                 <div className="flex-1">
                   <div className="flex justify-between">
                     <span className="font-bold">{opt.name}</span>
                     <span className="font-bold text-blue-600">{opt.price.toLocaleString()}₫</span>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                 </div>
               </label>
             ))}
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
             <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Thanh toán</h2>
             
             {[
               { name: "Ví điện tử MoMo", icon: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" },
               { name: "Thanh toán khi nhận hàng (COD)", icon: null },
               { name: "Thẻ ATM / Internet Banking", icon: null }
             ].map((opt, i) => (
               <label key={i} className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-blue-500 transition-colors">
                 <input type="radio" name="payment" defaultChecked={i === 0} className="w-5 h-5 text-blue-600" />
                 <div className="flex items-center gap-3">
                    {opt.icon ? (
                      <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden">
                        <img src={opt.icon} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                        <CreditCard size={16} className="text-gray-500" />
                      </div>
                    )}
                   <span className="font-medium">{opt.name}</span>
                 </div>
               </label>
             ))}

             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng tiền hàng</span>
                  <span>{(totalAmount - 30000).toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span>30.000₫</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-lg">
                  <span>Thanh toán</span>
                  <span className="text-blue-600">{totalAmount.toLocaleString()}₫</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 md:max-w-md md:mx-auto">
        <button 
          onClick={handleNext}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {step === 'payment' ? `Thanh toán ${totalAmount.toLocaleString()}₫` : 'Tiếp tục'}
          {step !== 'payment' && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
}
