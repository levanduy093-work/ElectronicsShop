import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Linking, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../components/common/Icon';
import { Address, AddressFormValues, CartItem, Voucher } from '../types';
import { DEFAULT_ADDRESSES } from '../constants/defaults';
import { buildFullAddress } from '../utils/address';
import { AddressForm } from '../components/address/AddressForm';
import { formatPrice } from '../utils';
import { Theme, lightTheme, useTheme } from '../theme';
import { useToast } from '../components/common/ToastProvider';
import { addAddress } from '../services/api';
import { AddressSection } from '../components/checkout/AddressSection';
import { PaymentMethodSection } from '../components/checkout/PaymentMethodSection';
import { OrderSummary } from '../components/checkout/OrderSummary';
import { CheckoutSuccessView } from '../components/checkout/CheckoutSuccessView';
import { PaymentWaitingView } from '../components/checkout/PaymentWaitingView';
import { TYPO_CLASS } from '../theme/typography';

interface CheckoutProps {
  onBack: () => void;
  onSuccess?: (orderId: string) => void;
  onPlaceOrder?: (params: {
    items: CartItem[];
    totals: { subTotal: number; shippingFee: number; discount: number; total: number };
    paymentMethod: string;
    shippingAddress?: Address;
  }) => Promise<{ id?: string; code?: string; paymentUrl?: string } | void>;
  onCheckPaymentStatus?: (orderId: string) => Promise<'paid' | 'failed' | 'pending' | undefined>;
  placingOrder?: boolean;
  cartItems: CartItem[];
  theme?: Theme;
  onAddAddress?: () => void;
  addresses?: Address[];
  onUpdateAddresses?: React.Dispatch<React.SetStateAction<Address[]>>;
  accessToken?: string | null;
  voucher?: Voucher | null;
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
  voucher,
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

  // Calculate discount from voucher
  let discountAmount = 0;
  if (voucher) {
    const voucherType = voucher.type || 'fixed';
    if (voucherType === 'shipping') {
      discountAmount = Math.min(voucher.discountPrice, shippingFee);
    } else if (voucherType === 'percentage') {
      const rate = Number(voucher.discountRate ?? 0);
      const rawDiscount = Math.max(0, subTotal * (rate / 100));
      const cap = voucher.maxDiscountPrice ?? Number.POSITIVE_INFINITY;
      discountAmount = Math.min(rawDiscount, cap);
    } else {
      discountAmount = voucher.discountPrice;
    }
  }

  const discount = discountAmount;
  const total = subTotal + shippingFee - discount;
  const lineBg = t === lightTheme ? '#E5E7EB' : t.border;

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
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [, setPollCount] = useState(0);
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
          items: cartItems,
          totals: { subTotal, shippingFee, discount, total },
          paymentMethod: selectedPaymentOption?.name || 'cod',
          shippingAddress: selectedAddress,
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

  const handleCheckPayment = useCallback(async () => {
    if (!pendingPayment.id || !onCheckPaymentStatus) return;
    setCheckingPayment(true);
    setPaymentError(null);
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
        setPaymentError('failed');
        showToast(translate('payment_failed'), 'error');
      } else {
        let nextCount = 0;
        setPollCount(prev => (nextCount = prev + 1));
        if (nextCount >= 10) {
          setPaymentError('timeout');
        } else if (nextCount > 0) {
          showToast(translate('paymentProcessing'), 'info');
        }
      }
    } catch (error: any) {
      setPaymentError('error');
      showToast(error?.message || translate('cannotCheckPaymentStatus'), 'error');
    } finally {
      setCheckingPayment(false);
    }
  }, [pendingPayment.id, pendingPayment.amount, pendingPayment.code, onCheckPaymentStatus, translate, showToast]);

  // Poll payment status automatically when in waiting step
  useEffect(() => {
    if (step !== 'waiting' || !pendingPayment.id || !onCheckPaymentStatus) return;
    setPollCount(0);
    setPaymentError(null);
    const initialTimeout = setTimeout(() => void handleCheckPayment(), 3000);
    let pollAttempts = 0;
    const interval = setInterval(() => {
      pollAttempts++;
      if (pollAttempts < 10) void handleCheckPayment();
      else clearInterval(interval);
    }, 5000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [step, pendingPayment.id, handleCheckPayment, onCheckPaymentStatus]);

  // Check payment when app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && step === 'waiting' && pendingPayment.id) {
        void handleCheckPayment();
      }
    });
    return () => sub.remove();
  }, [step, pendingPayment.id, handleCheckPayment]);

  if (isAddingAddress) {
    return (
      <AddressForm
        theme={t}
        onCancel={() => setIsAddingAddress(false)}
        onSubmit={handleSaveAddress}
        initialValues={{ isDefault: addressList.length === 0, type: 'home' as any }}
        title="Thêm địa chỉ mới"
      />
    );
  }

  if (step === 'waiting') {
    return (
      <PaymentWaitingView
        paymentError={paymentError}
        pendingPayment={pendingPayment}
        checkingPayment={checkingPayment}
        onRetry={() => {
          if (!pendingPayment.url) return;
          setPaymentError(null);
          setPollCount(0);
          Linking.openURL(pendingPayment.url).catch(() => showToast(translate('cannotOpenVnpay'), 'error'));
        }}
        onCheckPayment={() => {
          if (!checkingPayment) {
            setPaymentError(null);
            setPollCount(0);
            void handleCheckPayment();
          }
        }}
        onChangeMethod={() => {
          setStep('payment');
          setPendingPayment({ url: '', amount: 0 });
          setPaymentError(null);
          setPollCount(0);
        }}
        theme={t}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (step === 'success') {
    return (
      <CheckoutSuccessView
        orderId={orderId}
        successInfo={successInfo}
        total={total}
        onSuccess={onSuccess}
        theme={t}
      />
    );
  }

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const effectiveStepIndex = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;


  return (
    <View className="flex-1" style={{ backgroundColor: t.background }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={t.card}
        translucent={false}
      />
      <View
        className="flex-row items-center justify-between px-4 pb-4 border-b shadow-sm"
        style={{
          backgroundColor: t.card,
          borderBottomColor: t.border,
          paddingTop: Math.max(insets.top, 0),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text className={`${TYPO_CLASS.screenTitle} flex-1 ml-3`} style={{ color: t.text }}>{translate('payment')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View className="flex-row justify-between px-8 py-6 relative" style={{ backgroundColor: t.background }}>
        <View className="absolute top-1/2 left-10 right-10 h-0.5 z-0" style={{ backgroundColor: lineBg }} />
        {steps.map((s, idx) => {
          const isActive = s.id === step;
          const isCompleted = effectiveStepIndex > idx;

          return (
            <TouchableOpacity
              key={s.id}
              className="items-center z-10 px-2"
              onPress={() => setStep(s.id as Step)}
              style={{ backgroundColor: t.background, gap: 8 }}
              activeOpacity={0.8}
            >
              <View
                className="w-10 h-10 rounded-full border-2 justify-center items-center"
                style={{
                  borderColor: isActive || isCompleted ? t.primary : '#D1D5DB',
                  backgroundColor: isActive || isCompleted ? t.primary : '#FFFFFF',
                }}
              >
                <AppIcon
                  name={s.icon}
                  size={18}
                  color={(isActive || isCompleted) ? '#FFFFFF' : t.muted}
                />
              </View>
              <Text
                className={`${TYPO_CLASS.caption} font-bold uppercase`}
                style={{ color: isActive || isCompleted ? t.primary : t.muted }}
              >
                {s.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: 120, backgroundColor: t.background }}
        showsVerticalScrollIndicator={false}
      >
        {step === 'address' && (
          <AddressSection
            addressList={addressList}
            selectedAddressId={selectedAddressId}
            onSelectAddress={setSelectedAddressId}
            onAddAddress={() => onAddAddress ? onAddAddress() : setIsAddingAddress(true)}
            theme={t}
          />
        )}

        {step === 'shipping' && (
          <View className="gap-4 pb-24">
            <Text className={`${TYPO_CLASS.caption} font-bold uppercase tracking-wider`} style={{ color: t.muted }}>Phương thức vận chuyển</Text>

            {shippingOptions.map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedShipping(i)}
                className="flex-row items-start p-4 rounded-xl border gap-3"
                style={{
                  backgroundColor: t.card,
                  borderColor: selectedShipping === i ? t.primary : t.border,
                  borderWidth: selectedShipping === i ? 2 : 1,
                }}
                activeOpacity={0.7}
              >
                <View
                  className="w-5 h-5 rounded-full border-2 justify-center items-center mt-0.5"
                  style={{ borderColor: t.border }}
                >
                  {selectedShipping === i && <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.primary }} />}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className={TYPO_CLASS.bodyStrong} style={{ color: t.text }}>{opt.name}</Text>
                    <Text className={TYPO_CLASS.bodyStrong} style={{ color: t.primary }}>{formatPrice(opt.price)}</Text>
                  </View>
                  <Text className={`${TYPO_CLASS.helper} leading-5`} style={{ color: t.muted }}>{opt.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'payment' && (
          <>
            <PaymentMethodSection
              paymentOptions={paymentOptions}
              selectedPayment={selectedPayment}
              onSelectPayment={setSelectedPayment}
              theme={t}
            />
            <OrderSummary
              subTotal={subTotal}
              shippingFee={shippingFee}
              voucher={voucher}
              discount={discount}
              total={total}
              theme={t}
            />
          </>
        )}
      </ScrollView>

      {/* Footer Action */}
      <View
        className="absolute bottom-0 left-0 right-0 pt-4 px-4 border-t"
        style={{
          backgroundColor: t.card,
          borderTopColor: t.border,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <TouchableOpacity
          onPress={handleNext}
          className="h-[50px] rounded-full flex-row justify-center items-center gap-2 shadow-sm"
          style={{
            backgroundColor: t.primary,
            shadowColor: t.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4
          }}
          activeOpacity={0.8}
          disabled={isSubmitting || placingOrder}
        >
          <Text className={`${TYPO_CLASS.bodyStrong} text-white`}>
            {step === 'payment' ? translate('payAmount', { amount: formatPrice(total) }) : translate('continue')}
          </Text>
          {step !== 'payment' && <AppIcon name="chevron-right" size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
