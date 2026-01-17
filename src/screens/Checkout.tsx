import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, StatusBar, Platform, Linking, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Address, AddressFormValues } from '../types';
import { DEFAULT_ADDRESSES } from '../constants/defaults';
import { buildFullAddress } from '../utils/address';
import { AddressForm } from '../components/address/AddressForm';
import { CartItem } from '../types';
import { formatPrice } from '../utils';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';
import { addAddress } from '../services/api';

interface CheckoutProps {
  onBack: () => void;
  onSuccess?: (orderId: string) => void;
  onPlaceOrder?: (params: {
    address?: Address;
    paymentMethod: string;
    shippingFee: number;
    items: CartItem[];
    totalAmount: number;
    subTotal: number;
    discount?: number;
  }) => Promise<{ id?: string; code?: string; paymentUrl?: string } | void>;
  onCheckPaymentStatus?: (orderId: string) => Promise<'paid' | 'failed' | 'pending' | undefined>;
  placingOrder?: boolean;
  cartItems: CartItem[];
  theme?: Theme;
  onAddAddress?: () => void;
  addresses?: Address[];
  onUpdateAddresses?: React.Dispatch<React.SetStateAction<Address[]>>;
  accessToken?: string | null;
}

type Step = 'address' | 'shipping' | 'payment' | 'waiting' | 'success';

export function Checkout({
  onBack,
  onSuccess,
  onPlaceOrder,
  placingOrder,
  cartItems,
  theme,
  onAddAddress,
  addresses,
  onUpdateAddresses,
  accessToken,
  onCheckPaymentStatus = async () => 'pending',
}: CheckoutProps) {
  const { theme: ctxTheme, isDarkMode } = useTheme();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('address');
  const [selectedShipping, setSelectedShipping] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(0);
  const [localAddresses, setLocalAddresses] = useState<Address[]>(addresses ?? DEFAULT_ADDRESSES);
  const addressList = addresses ?? localAddresses;
  const updateAddresses = onUpdateAddresses ?? setLocalAddresses;
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(
    addressList.find(a => a.isDefault)?.id || addressList[0]?.id
  );
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const shippingOptions = [
    { name: translate('fastShipping'), price: 30000, desc: translate('fastShippingDesc') },
    { name: translate('standardShipping'), price: 15000, desc: translate('standardShippingDesc') },
  ];
  const subTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = shippingOptions[selectedShipping]?.price ?? 30000;
  const discount = 0;
  const total = subTotal + shippingFee - discount;
  const accentBg = t === lightTheme ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.06)';
  const paymentOptions = [
    {
      name: 'vnpay',
      label: 'VNPAY',
      desc: translate('vnpayDesc'),
      icon: null,
    },
    {
      name: 'cod',
      label: translate('codLabel'),
      desc: translate('codDesc'),
      icon: null,
      iconName: 'cash',
    },
  ];
  const lineBg = t === lightTheme ? '#E5E7EB' : t.border;
  const selectedPaymentOption = paymentOptions[selectedPayment];
  const isVnpaySelected = selectedPaymentOption?.name === 'vnpay';

  useEffect(() => {
    if (addresses) {
      setLocalAddresses(addresses);
    }
  }, [addresses]);

  useEffect(() => {
    const exists = selectedAddressId && addressList.some(a => a.id === selectedAddressId);
    if (exists) {
      return;
    }
    const defaultAddr = addressList.find(a => a.isDefault);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
    } else if (addressList[0]) {
      setSelectedAddressId(addressList[0].id);
    } else {
      setSelectedAddressId(undefined);
    }
  }, [addressList, selectedAddressId]);

  const steps = [
    { id: 'address', title: translate('address'), icon: 'map-pin' },
    { id: 'shipping', title: translate('shipping'), icon: 'truck' },
    { id: 'payment', title: translate('payment'), icon: 'credit-card' },
  ];

  const [orderId, setOrderId] = useState<string>('');
  const [pendingPayment, setPendingPayment] = useState<{ url: string; code?: string; amount: number; id?: string }>({
    url: '',
    amount: 0,
  });
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ code?: string; amount: number; payment?: string }>({
    amount: 0,
  });

  const handleNext = async () => {
    if (isSubmitting || placingOrder) return;
    if (step === 'address') {
      setStep('shipping');
      return;
    }
    if (step === 'shipping') {
      setStep('payment');
      return;
    }
    if (step === 'payment') {
      const selectedAddress = addressList.find(a => a.id === selectedAddressId);
      if (!selectedAddress) {
        showToast(translate('selectShippingAddress'), 'error');
        return;
      }
      const fallbackCode = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      if (!onPlaceOrder) {
        setOrderId(fallbackCode);
        setSuccessInfo({ code: fallbackCode, amount: total, payment: selectedPaymentOption?.label });
        setStep('success');
        return;
      }

      setIsSubmitting(true);
      try {
        const created = await onPlaceOrder({
          address: selectedAddress,
          paymentMethod: selectedPaymentOption?.name || 'cod',
          shippingFee,
          items: cartItems,
          totalAmount: total,
          subTotal,
          discount,
        });
        const newId = created?.code || created?.id || fallbackCode;
        setOrderId(newId);
        setSuccessInfo({ code: newId, amount: total, payment: selectedPaymentOption?.label });
        if (isVnpaySelected && created?.paymentUrl) {
          setPendingPayment({ url: created.paymentUrl, code: newId, amount: total, id: created?.id || created?.code });
          setStep('waiting');
          Linking.openURL(created.paymentUrl).catch(() => {
            showToast(translate('cannotOpenVnpay'), 'error');
          });
          return;
        }
        setStep('success');
      } catch (error: any) {
        showToast(error?.message || translate('cannotPlaceOrder'), 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveAddress = async (data: AddressFormValues) => {
    if (isSavingAddress) return;
    setIsSavingAddress(true);
    try {
      if (accessToken) {
        const updated = await addAddress(
          {
            ...data,
            detailedAddress: data.detailedAddress,
            address: buildFullAddress(data),
          },
          accessToken,
        );
        updateAddresses(() => updated);
        const preferred = updated.find(a => a.isDefault) || updated[updated.length - 1];
        setSelectedAddressId(preferred?.id);
      } else {
        const newId = `addr-${Date.now()}`;
        const fullAddress = buildFullAddress(data);
        updateAddresses(prev => {
          const updatedExisting = data.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : [...prev];
          const newAddress: Address = {
            ...data,
            id: newId,
            address: fullAddress,
          };
          return [...updatedExisting, newAddress];
        });
        setSelectedAddressId(newId);
      }
      setIsAddingAddress(false);
    } catch (error: any) {
      showToast(error?.message || translate('cannotSaveAddress'), 'error');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!pendingPayment.id || !onCheckPaymentStatus) return;
    setCheckingPayment(true);
    try {
      const status = await onCheckPaymentStatus(pendingPayment.id);
      if (status === 'paid') {
        setSuccessInfo({
          code: pendingPayment.code || pendingPayment.id,
          amount: pendingPayment.amount,
          payment: 'VNPAY',
        });
        setStep('success');
      } else if (status === 'failed') {
        showToast(translate('payment_failed'), 'error');
      } else {
        showToast(translate('paymentProcessing'), 'info');
      }
    } catch (error: any) {
      showToast(error?.message || translate('cannotCheckPaymentStatus'), 'error');
    } finally {
      setCheckingPayment(false);
    }
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && step === 'waiting' && pendingPayment.id) {
        void handleCheckPayment();
      }
    });
    return () => sub.remove();
  }, [step, pendingPayment.id]);

  if (isAddingAddress) {
    return (
      <AddressForm
        theme={t}
        onCancel={() => setIsAddingAddress(false)}
        onSubmit={handleSaveAddress}
        initialValues={{ isDefault: addressList.length === 0, type: translate('home') as AddressType }}
        title="Thêm địa chỉ mới"
      />
    );
  }

  if (step === 'waiting') {
    return (
      <View style={[styles.waitingContainer, { backgroundColor: t.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={t.background} />
        <View style={[styles.waitingCard, { backgroundColor: t.card, shadowColor: t.text }]}>
          <View style={[styles.waitingIcon, { backgroundColor: t === lightTheme ? '#DBEAFE' : 'rgba(59,130,246,0.16)' }]}>
            <AppIcon name="clock" size={32} color={t.primary} />
          </View>
          <Text style={[styles.waitingTitle, { color: t.text }]}>Đang chờ thanh toán</Text>
          <Text style={[styles.waitingSub, { color: t.muted }]}>
            Đơn hàng {pendingPayment.code ? `#${pendingPayment.code}` : ''} • {formatPrice(pendingPayment.amount)}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (!pendingPayment.url) return;
              Linking.openURL(pendingPayment.url).catch(() => {
                showToast(translate('cannotOpenVnpay'), 'error');
              });
            }}
            style={[styles.waitingButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
            activeOpacity={0.85}
          >
            <Text style={styles.waitingButtonText}>Mở lại cổng VNPAY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!checkingPayment) void handleCheckPayment();
            }}
            style={[
              styles.waitingSecondary,
              { borderColor: t.border, backgroundColor: t.surface },
              checkingPayment && { opacity: 0.7 },
            ]}
            activeOpacity={0.8}
            disabled={checkingPayment}
          >
            <AppIcon name="check-circle" size={16} color={t.muted} />
            <Text style={[styles.waitingSecondaryText, { color: t.muted }]}>
              {checkingPayment ? 'Đang kiểm tra...' : 'Tôi đã thanh toán'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setStep('payment');
              setPendingPayment({ url: '', amount: 0 });
            }}
            style={[styles.waitingTertiary, { color: t.muted }]}
          >
            <Text style={[styles.waitingTertiaryText, { color: t.muted }]}>Chọn phương thức khác</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'success') {
    return (
      <View style={[styles.successContainer, { backgroundColor: t.background }]}>
        <View style={[styles.successIcon, { backgroundColor: t === lightTheme ? '#D1FAE5' : 'rgba(74,222,128,0.16)' }]}>
          <AppIcon name="check-circle" size={48} color="#10B981" />
        </View>
        <Text style={[styles.successTitle, { color: t.text }]}>Đặt hàng thành công!</Text>
        <Text style={[styles.successText, { color: t.muted }]}>
          Đơn hàng {successInfo.code ? `#${successInfo.code}` : orderId ? `#${orderId}` : ''} •{' '}
          {formatPrice(successInfo.amount || total)} {successInfo.payment ? `• ${successInfo.payment}` : ''}
        </Text>
        <TouchableOpacity
          onPress={() => {
            onSuccess?.(successInfo.code || orderId);
          }}
          style={[styles.successButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.successButtonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const effectiveStepIndex = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={t.card}
        translucent={false}
      />
      <View style={[
        styles.header,
        {
          backgroundColor: t.card,
          borderBottomColor: t.border,
          paddingTop: Math.max(insets.top, 0),
        }
      ]}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>{translate('payment')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={[styles.progressContainer, { backgroundColor: t.background }]}>
        <View style={[styles.progressLine, { backgroundColor: lineBg }]} />
        {steps.map((s, idx) => {
          const isActive = s.id === step;
          const isCompleted = effectiveStepIndex > idx;

          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.progressStep, { backgroundColor: t.background }]}
              onPress={() => setStep(s.id as Step)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.progressCircle,
                { backgroundColor: t.surface, borderColor: t.border },
                (isActive || isCompleted) && { backgroundColor: t.primary, borderColor: t.primary },
              ]}>
                <AppIcon
                  name={s.icon}
                  size={18}
                  color={(isActive || isCompleted) ? '#FFFFFF' : t.muted}
                />
              </View>
              <Text style={[
                styles.progressLabel,
                { color: t.muted },
                (isActive || isCompleted) && { color: t.primary },
              ]}>
                {s.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120, backgroundColor: t.background }}
        showsVerticalScrollIndicator={false}
      >
        {step === 'address' && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: t.muted }]}>Địa chỉ nhận hàng</Text>

            {addressList.map((addr) => {
              const isSelected = addr.id === selectedAddressId;
              const contactLine = addr.name ? `${addr.name} | ${addr.phone}` : addr.phone;
              return (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => setSelectedAddressId(addr.id)}
                  style={[
                    styles.addressCard,
                    { backgroundColor: t.card, borderColor: isSelected ? t.primary : t.border },
                    isSelected && styles.addressCardDefault,
                  ]}
                  activeOpacity={0.8}
                >
                  {addr.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: t.primary }]}>
                      <Text style={styles.defaultBadgeText}>Mặc định</Text>
                    </View>
                  )}
                  <View style={styles.addressContent}>
                    <View style={[styles.addressIcon, { backgroundColor: accentBg }]}>
                      <AppIcon name="map-pin" size={20} color={t.primary} />
                    </View>
                    <View style={styles.addressInfo}>
                      <Text style={[styles.addressType, { color: t.text }]}>{addr.type}</Text>
                      <Text style={[styles.addressText, { color: t.text }]}>{addr.address}</Text>
                      <Text style={[styles.addressPhone, { color: t.muted }]}>{contactLine}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.addAddressButton, { borderColor: t.border }]}
              activeOpacity={0.7}
              onPress={() => {
                if (onAddAddress) {
                  onAddAddress();
                } else {
                  setIsAddingAddress(true);
                }
              }}
            >
              <Text style={[styles.addAddressText, { color: t.text }]}>+ Thêm địa chỉ mới</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'shipping' && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: t.muted }]}>Phương thức vận chuyển</Text>

            {shippingOptions.map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedShipping(i)}
                style={[
                  styles.optionCard,
                  { backgroundColor: t.card, borderColor: t.border },
                  selectedShipping === i && { borderColor: t.primary, borderWidth: 2 },
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, { borderColor: t.border }]}>
                  {selectedShipping === i && <View style={[styles.radioSelected, { backgroundColor: t.primary }]} />}
                </View>
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text style={[styles.optionName, { color: t.text }]}>{opt.name}</Text>
                    <Text style={[styles.optionPrice, { color: t.primary }]}>{formatPrice(opt.price)}</Text>
                  </View>
                  <Text style={[styles.optionDesc, { color: t.muted }]}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'payment' && (
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, { color: t.muted }]}>{translate('payment')}</Text>

        {paymentOptions.map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedPayment(i)}
                style={[
                  styles.optionCard,
                  { backgroundColor: t.card, borderColor: t.border },
                  selectedPayment === i && { borderColor: t.primary, borderWidth: 2 },
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, { borderColor: t.border }]}>
                  {selectedPayment === i && <View style={[styles.radioSelected, { backgroundColor: t.primary }]} />}
                </View>
                <View style={styles.optionContent}>
                  <View style={styles.paymentOption}>
                    {opt.icon ? (
                      <Image source={{ uri: opt.icon }} style={styles.paymentIcon} />
                    ) : opt.iconName ? (
                      <View style={[styles.paymentIconPlaceholder, { backgroundColor: accentBg }]}>
                        <AppIcon name={opt.iconName} size={16} color={t.muted} />
                      </View>
                  ) : (
                    <View style={[styles.paymentIconPlaceholder, { backgroundColor: accentBg }]}>
                      <AppIcon name="credit-card" size={16} color={t.muted} />
                    </View>
                  )}
                  <Text style={[styles.optionName, { color: t.text }]}>{opt.label || opt.name}</Text>
                  </View>
                  {opt.desc ? (
                    <Text style={[styles.optionDesc, { color: t.muted, marginTop: 4 }]}>
                      {opt.desc}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}

            <Text style={[styles.optionDesc, { color: t.muted, marginTop: 8 }]}>
              Bạn có thể thanh toán qua VNPAY hoặc trả tiền mặt khi nhận hàng (COD).
            </Text>

            <View style={[styles.summaryCard, { backgroundColor: t.surface }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: t.muted }]}>Tổng tiền hàng</Text>
                <Text style={[styles.summaryValue, { color: t.text }]}>
                  {formatPrice(subTotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: t.muted }]}>Phí vận chuyển</Text>
                <Text style={[styles.summaryValue, { color: t.text }]}>{formatPrice(shippingFee)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: t.text }]}>{translate('payment')}</Text>
                <Text style={[styles.totalValue, { color: t.primary }]}>{formatPrice(total)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Action */}
      <View style={[
        styles.footer, 
        { 
          backgroundColor: t.card, 
          borderTopColor: t.border,
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}>
        <TouchableOpacity
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
          activeOpacity={0.8}
          disabled={isSubmitting || placingOrder}
        >
          <Text style={styles.nextButtonText}>
            {step === 'payment' ? translate('payAmount', { amount: formatPrice(total) }) : translate('continue')}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
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
    backgroundColor: 'transparent',
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
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  waitingCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  waitingIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  waitingSub: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  waitingButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  waitingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  waitingSecondary: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  waitingSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  waitingTertiary: {
    marginTop: 12,
  },
  waitingTertiaryText: {
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
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
