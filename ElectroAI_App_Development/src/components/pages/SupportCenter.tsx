import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';

interface SupportCenterProps {
  onBack: () => void;
}

export function SupportCenter({ onBack }: SupportCenterProps) {
  const faqs = [
    { q: "Làm sao để theo dõi đơn hàng?", a: "Bạn có thể vào mục 'Đơn hàng của tôi' trong trang cá nhân, chọn đơn hàng cần xem để biết trạng thái chi tiết." },
    { q: "Chính sách đổi trả như thế nào?", a: "Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất. Vui lòng giữ nguyên bao bì và tem mác." },
    { q: "Phí vận chuyển được tính ra sao?", a: "Phí vận chuyển được tính dựa trên khoảng cách và khối lượng đơn hàng. Miễn phí vận chuyển cho đơn hàng từ 500.000đ." },
    { q: "Tôi có thể hủy đơn hàng không?", a: "Bạn có thể hủy đơn hàng khi trạng thái là 'Đang xử lý'. Nếu đơn hàng đã giao cho đơn vị vận chuyển, vui lòng liên hệ hotline để được hỗ trợ." }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950 pb-24 animate-slide-up-fade">
      <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold flex-1">Trung tâm hỗ trợ</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact Channels */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <span className="text-xs font-medium">Chat ngay</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <Phone size={20} />
            </div>
            <span className="text-xs font-medium">Hotline</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <Mail size={20} />
            </div>
            <span className="text-xs font-medium">Email</span>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="text-lg font-bold mb-3">Câu hỏi thường gặp</h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-medium text-sm"
      >
        {question}
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-gray-500 border-t border-gray-50 dark:border-gray-800 pt-3">
          {answer}
        </div>
      )}
    </div>
  )
}