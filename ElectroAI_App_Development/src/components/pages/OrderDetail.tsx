import React from 'react';
import { ArrowLeft, MapPin, Package, CreditCard, Clock, Truck, CheckCircle } from 'lucide-react';

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
}

// Mock data for a specific order
const MOCK_ORDER_DETAIL = {
  id: 'ORD-2024-001',
  date: '20/01/2026 14:30',
  status: 'processing', // processing, shipping, completed, cancelled
  statusText: 'Đang xử lý',
  items: [
    {
      id: 1,
      name: 'Arduino Uno R3',
      price: 150000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=100'
    },
    {
      id: 2,
      name: 'Cảm biến siêu âm HC-SR04',
      price: 25000,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=100'
    }
  ],
  shippingAddress: {
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh'
  },
  payment: {
    method: 'Thanh toán khi nhận hàng (COD)',
    subtotal: 175000,
    shippingFee: 15000,
    discount: 0,
    total: 190000
  },
  timeline: [
    { time: '14:30 20/01/2026', title: 'Đặt hàng thành công', active: true },
    { time: '14:45 20/01/2026', title: 'Đã xác nhận đơn hàng', active: true },
    { time: '15:00 20/01/2026', title: 'Đang đóng gói', active: true },
    { time: '', title: 'Đang giao hàng', active: false },
    { time: '', title: 'Giao hàng thành công', active: false },
  ]
};

export function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  // In a real app, use orderId to fetch data
  const order = MOCK_ORDER_DETAIL;

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1">Chi tiết đơn hàng</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-gray-900 dark:text-gray-100">Mã đơn: #{orderId}</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              {order.statusText}
            </span>
          </div>
          
          {/* Timeline - Vertical */}
          <div className="relative pl-4 space-y-6 border-l-2 border-gray-100 dark:border-gray-800 ml-2">
            {order.timeline.map((item, index) => (
              <div key={index} className="relative pl-4">
                <div className={`absolute -left-[21px] top-0 w-4 h-4 rounded-full border-2 ${item.active ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-700'}`}></div>
                <h4 className={`text-sm font-medium ${item.active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>{item.title}</h4>
                {item.time && <p className="text-xs text-gray-400 mt-1">{item.time}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-gray-100 font-bold">
            <MapPin size={18} className="text-blue-600" />
            <h3>Địa chỉ nhận hàng</h3>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{order.shippingAddress.name} | {order.shippingAddress.phone}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{order.shippingAddress.address}</p>
        </div>

        {/* Products */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-gray-100 font-bold">
            <Package size={18} className="text-blue-600" />
            <h3>Sản phẩm</h3>
          </div>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{item.name}</h4>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                    <p className="text-sm font-bold text-blue-600">{item.price.toLocaleString()}đ</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-gray-100 font-bold">
            <CreditCard size={18} className="text-blue-600" />
            <h3>Thanh toán</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng tiền hàng</span>
              <span className="font-medium">{order.payment.subtotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phí vận chuyển</span>
              <span className="font-medium">{order.payment.shippingFee.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Giảm giá</span>
              <span className="font-medium text-green-500">-{order.payment.discount.toLocaleString()}đ</span>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2 flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-gray-100">Thành tiền</span>
              <span className="font-bold text-lg text-blue-600">{order.payment.total.toLocaleString()}đ</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500">
            Phương thức: {order.payment.method}
          </div>
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 z-30">
        <button className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300">
          Liên hệ hỗ trợ
        </button>
        <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-none">
          Mua lại
        </button>
      </div>
    </div>
  );
}