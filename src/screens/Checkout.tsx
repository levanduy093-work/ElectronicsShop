import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AppIcon } from '../components/common/Icon';
import { formatPrice } from '../lib/utils';

interface CheckoutProps {
  onBack: () => void;
  onSuccess: () => void;
  totalAmount: number;
}

type Step = 'address' | 'shipping' | 'payment' | 'success';

export function Checkout({ onBack, onSuccess, totalAmount }: CheckoutProps) {
  const [step, setStep] = useState<Step>('address');
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(0);

  const steps = [
    { id: 'address', title: 'Địa chỉ', icon: 'map-pin' },
    { id: 'shipping', title: 'Vận chuyển', icon: 'truck' },
    { id: 'payment', title: 'Thanh toán', icon: 'credit-card' },
  ];

  const handleNext = () => {
    if (step === 'address') setStep('shipping');
    else if (step === 'shipping') setStep('payment');
    else if (step === 'payment') setStep('success');
  };

  if (step === 'success') {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <AppIcon name="check-circle" size={48} color="#10B981" />
        </View>
        <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
        <Text style={styles.successText}>
          Đơn hàng #ORD-2024-001 của bạn đang được xử lý. Chúng tôi sẽ thông báo khi hàng được gửi đi.
        </Text>
        <TouchableOpacity
          onPress={onSuccess}
          style={styles.successButton}
          activeOpacity={0.8}
        >
          <Text style={styles.successButtonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLine} />
        {steps.map((s, idx) => {
          const isActive = s.id === step;
          const isCompleted = currentStepIndex > idx;

          return (
            <View key={s.id} style={styles.progressStep}>
              <View style={[
                styles.progressCircle,
                (isActive || isCompleted) && styles.progressCircleActive,
              ]}>
                <AppIcon
                  name={s.icon}
                  size={18}
                  color={(isActive || isCompleted) ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
              <Text style={[
                styles.progressLabel,
                (isActive || isCompleted) && styles.progressLabelActive,
              ]}>
                {s.title}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'address' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Địa chỉ nhận hàng</Text>

            <View style={styles.addressCard}>
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Mặc định</Text>
              </View>
              <View style={styles.addressContent}>
                <View style={styles.addressIcon}>
                  <AppIcon name="map-pin" size={20} color="#2563EB" />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressType}>Nhà riêng</Text>
                  <Text style={styles.addressText}>
                    Số 1, Đại Cồ Việt, Hai Bà Trưng, Hà Nội
                  </Text>
                  <Text style={styles.addressPhone}>0987 654 321</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.addAddressButton} activeOpacity={0.7}>
              <Text style={styles.addAddressText}>+ Thêm địa chỉ mới</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'shipping' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Phương thức vận chuyển</Text>

            {[
              { name: "Nhanh (24h)", price: 30000, desc: "Nhận hàng vào ngày mai" },
              { name: "Tiêu chuẩn (2-3 ngày)", price: 15000, desc: "Nhận hàng T5, 20/01" },
            ].map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedShipping(i)}
                style={[
                  styles.optionCard,
                  selectedShipping === i && styles.optionCardSelected,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.radio}>
                  {selectedShipping === i && <View style={styles.radioSelected} />}
                </View>
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionName}>{opt.name}</Text>
                    <Text style={styles.optionPrice}>{formatPrice(opt.price)}</Text>
                  </View>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'payment' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Thanh toán</Text>

            {[
              { name: "Ví điện tử MoMo", icon: null },
              { name: "Thanh toán khi nhận hàng (COD)", icon: null },
              { name: "Thẻ ATM / Internet Banking", icon: null },
            ].map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedPayment(i)}
                style={[
                  styles.optionCard,
                  selectedPayment === i && styles.optionCardSelected,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.radio}>
                  {selectedPayment === i && <View style={styles.radioSelected} />}
                </View>
                <View style={styles.paymentOption}>
                  {opt.icon ? (
                    <Image source={{ uri: opt.icon }} style={styles.paymentIcon} />
                  ) : (
                    <View style={styles.paymentIconPlaceholder}>
                      <AppIcon name="credit-card" size={16} color="#6B7280" />
                    </View>
                  )}
                  <Text style={styles.optionName}>{opt.name}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(totalAmount - 30000)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                <Text style={styles.summaryValue}>30.000₫</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Thanh toán</Text>
                <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {step === 'payment' ? `Thanh toán ${formatPrice(totalAmount)}` : 'Tiếp tục'}
          </Text>
          {step !== 'payment' && <AppIcon name="chevron-right" size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 24,
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    top: '50%',
    left: 40,
    right: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: 0,
  },
  progressStep: {
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 8,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#9CA3AF',
  },
  progressLabelActive: {
    color: '#2563EB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepContent: {
    gap: 16,
    paddingBottom: 96,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6B7280',
    marginBottom: 8,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
    position: 'relative',
    overflow: 'hidden',
  },
  defaultBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addressContent: {
    flexDirection: 'row',
    gap: 12,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  addAddressButton: {
    paddingVertical: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  optionDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  paymentIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  successButton: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
