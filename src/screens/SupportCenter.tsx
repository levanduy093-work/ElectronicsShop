import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { AppIcon } from '../components/common/Icon';

interface SupportCenterProps {
  onBack: () => void;
}

export function SupportCenter({ onBack }: SupportCenterProps) {
  const faqs = [
    { q: "Làm sao để theo dõi đơn hàng?", a: "Bạn có thể vào mục 'Đơn hàng của tôi' trong trang cá nhân, chọn đơn hàng cần xem để biết trạng thái chi tiết." },
    { q: "Chính sách đổi trả như thế nào?", a: "Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất. Vui lòng giữ nguyên bao bì và tem mác." },
    { q: "Phí vận chuyển được tính ra sao?", a: "Phí vận chuyển được tính dựa trên khoảng cách và khối lượng đơn hàng. Miễn phí vận chuyển cho đơn hàng từ 500.000đ." },
    { q: "Tôi có thể hủy đơn hàng không?", a: "Bạn có thể hủy đơn hàng khi trạng thái là 'Đang xử lý'. Nếu đơn hàng đã giao cho đơn vị vận chuyển, vui lòng liên hệ hotline để được hỗ trợ." },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Trung tâm hỗ trợ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Contact Channels */}
        <View style={styles.contactGrid}>
          <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
            <View style={[styles.contactIcon, { backgroundColor: '#EFF6FF' }]}>
              <AppIcon name="message-circle" size={20} color="#2563EB" />
            </View>
            <Text style={styles.contactLabel}>Chat ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
            <View style={[styles.contactIcon, { backgroundColor: '#D1FAE5' }]}>
              <AppIcon name="phone" size={20} color="#10B981" />
            </View>
            <Text style={styles.contactLabel}>Hotline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard} activeOpacity={0.7}>
            <View style={[styles.contactIcon, { backgroundColor: '#FED7AA' }]}>
              <AppIcon name="mail" size={20} color="#F97316" />
            </View>
            <Text style={styles.contactLabel}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Câu hỏi thường gặp</Text>
          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.faqCard}>
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        style={styles.faqHeader}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestion}>{question}</Text>
        <AppIcon
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color="#9CA3AF"
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 96,
    gap: 24,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  faqSection: {
    gap: 12,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
