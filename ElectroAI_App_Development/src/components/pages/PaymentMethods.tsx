import React, { useState } from 'react';
import { ArrowLeft, Plus, CreditCard, Trash2, Smartphone, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaymentMethodsProps {
  onBack: () => void;
}

export function PaymentMethods({ onBack }: PaymentMethodsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState<'card' | 'wallet'>('card');

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  if (isAdding) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
        <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold flex-1">Thêm phương thức mới</h1>
        </div>

        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button 
              onClick={() => setAddType('card')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all",
                addType === 'card' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <CreditCard size={16} />
              Thẻ tín dụng
            </button>
            <button 
              onClick={() => setAddType('wallet')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all",
                addType === 'wallet' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Smartphone size={16} />
              Ví điện tử
            </button>
          </div>

          {addType === 'card' ? (
            <div className="space-y-4 animate-fade-in">
              {/* Card Preview */}
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden mb-6 h-48 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                   <CreditCard size={100} />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Card Preview</span>
                    {cardNumber.startsWith('4') && <span className="font-bold italic">VISA</span>}
                    {cardNumber.startsWith('5') && <span className="font-bold italic">MasterCard</span>}
                  </div>
                  <div className="text-xl sm:text-2xl font-mono tracking-widest">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] opacity-70 uppercase mb-1">Card Holder</div>
                      <div className="font-medium text-sm truncate max-w-[150px]">{cardHolder.toUpperCase() || 'YOUR NAME'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] opacity-70 uppercase mb-1">Expires</div>
                      <div className="font-medium text-sm">{expiry || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số thẻ</label>
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                    placeholder="0000 0000 0000 0000"
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên chủ thẻ</label>
                  <input 
                    type="text" 
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="NGUYEN VAN A"
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày hết hạn</label>
                    <input 
                      type="text" 
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5))}
                      placeholder="MM/YY"
                      className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV/CVC</label>
                    <input 
                      type="password" 
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="•••"
                      className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsAdding(false)}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold mt-6 shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.98] transition-transform"
              >
                Thêm thẻ
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-gray-500 mb-2">Chọn ví điện tử bạn muốn liên kết:</p>
              
              <div 
                onClick={() => setSelectedWallet('momo')}
                className={cn(
                  "flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border cursor-pointer transition-all",
                  selectedWallet === 'momo' ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                     <span className="text-pink-600 font-bold text-xs">Momo</span>
                  </div>
                  <span className="font-medium">Ví MoMo</span>
                </div>
                {selectedWallet === 'momo' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
              </div>

              <div 
                onClick={() => setSelectedWallet('zalo')}
                className={cn(
                  "flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border cursor-pointer transition-all",
                  selectedWallet === 'zalo' ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                     <span className="text-blue-600 font-bold text-xs">Zalo</span>
                  </div>
                  <span className="font-medium">ZaloPay</span>
                </div>
                {selectedWallet === 'zalo' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
              </div>

              <div 
                onClick={() => setSelectedWallet('shopee')}
                className={cn(
                  "flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border cursor-pointer transition-all",
                  selectedWallet === 'shopee' ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                     <span className="text-orange-600 font-bold text-xs">Shopee</span>
                  </div>
                  <span className="font-medium">ShopeePay</span>
                </div>
                {selectedWallet === 'shopee' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
              </div>

              <button 
                disabled={!selectedWallet}
                onClick={() => setIsAdding(false)}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold mt-6 shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all"
              >
                Liên kết ngay
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
      <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1">Phương thức thanh toán</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Visa Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
             <CreditCard size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm opacity-80">Debit Card</span>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 brightness-200 contrast-200" />
            </div>
            <div className="text-2xl font-mono tracking-widest mb-8">
              •••• •••• •••• 4589
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs opacity-70 uppercase mb-1">Card Holder</div>
                <div className="font-medium">NGUYEN VAN A</div>
              </div>
              <div>
                <div className="text-xs opacity-70 uppercase mb-1">Expires</div>
                <div className="font-medium">12/28</div>
              </div>
            </div>
          </div>
        </div>

        {/* E-wallets */}
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="p-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                 <span className="text-pink-600 font-bold text-xs">Momo</span>
              </div>
              <div>
                <div className="font-medium">Ví MoMo</div>
                <div className="text-xs text-gray-500">Đã liên kết - 090****567</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                 <span className="text-blue-600 font-bold text-xs">Zalo</span>
              </div>
              <div>
                <div className="font-medium">ZaloPay</div>
                <div className="text-xs text-gray-500">Đã liên kết - 090****567</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <Plus size={20} />
          Thêm thẻ / Ví mới
        </button>
      </div>
    </div>
  );
}