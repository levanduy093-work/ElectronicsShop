import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../common/Icon';
import { AddressFormValues, AddressType } from '../../types';
import { Theme, lightTheme, useTheme } from '../../theme';
import { useToast } from '../common/ToastProvider';
import { LocationFields } from './LocationFields';

interface AddressFormProps {
  title?: string;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: AddressFormValues) => void;
  initialValues?: Partial<AddressFormValues>;
  theme?: Theme;
}

const getEmptyForm = (t: (key: string) => string): AddressFormValues => ({
  name: '',
  phone: '',
  detailedAddress: '',
  ward: '',
  district: '',
  city: '',
  type: t('home') as AddressType,
  isDefault: false,
});

export function AddressForm({
  title,
  submitLabel,
  onCancel,
  onSubmit,
  initialValues,
  theme,
}: AddressFormProps) {
  const insets = useSafeAreaInsets();
  const { theme: ctxTheme } = useTheme();
  const { showToast } = useToast();
  const { t: translate } = useTranslation();
  const t = theme || ctxTheme || lightTheme;
  const defaultTitle = translate('addNewAddress');
  const defaultSubmitLabel = translate('saveAddress');

  const mergedInitial = useMemo(() => ({ ...getEmptyForm(translate), ...initialValues }), [initialValues, translate]);
  const [formData, setFormData] = useState<AddressFormValues>(mergedInitial);

  useEffect(() => {
    setFormData(mergedInitial);
  }, [mergedInitial]);

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.detailedAddress) {
      showToast(translate('fillFullInfo'), 'error');
      return;
    }
    onSubmit(formData);
  };

  const renderTypeButton = (type: AddressType, label: string, icon: string) => (
    <TouchableOpacity
      onPress={() => setFormData({ ...formData, type })}
      className={`flex-1 flex-row items-center justify-center gap-2 py-2 px-4 rounded-lg border`}
      style={{
        borderColor: formData.type === type ? t.primary : t.border,
        backgroundColor: formData.type === type ? (t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)') : t.surface,
      }}
      activeOpacity={0.7}
    >
      <AppIcon name={icon} size={16} color={formData.type === type ? t.primary : t.muted} />
      <Text
        className="text-sm font-medium"
        style={{ color: formData.type === type ? t.primary : t.text }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: t.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        className="flex-row items-center justify-between px-4 pb-3 border-b shadow-sm elevation-4"
        style={{
          paddingTop: Math.max(insets.top, 0),
          backgroundColor: t.card,
          borderBottomColor: t.border,
          shadowOpacity: 0.05,
        }}
      >
        <TouchableOpacity onPress={onCancel} className="p-2" activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text className="text-lg font-bold flex-1 ml-2" style={{ color: t.text }}>
          {title || defaultTitle}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl p-4 mb-4 gap-4" style={{ backgroundColor: t.card }}>
          <View className="gap-2">
            <Text className="text-sm font-medium mb-1" style={{ color: t.text }}>{translate('full_name_label')}</Text>
            <TextInput
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              className="rounded-xl p-3 border text-sm"
              style={{ backgroundColor: t.surface, borderColor: t.border, color: t.text }}
              placeholder={translate('enter_name_placeholder')}
              placeholderTextColor={t.muted}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium mb-1" style={{ color: t.text }}>{translate('phone_number_label')}</Text>
            <TextInput
              value={formData.phone}
              onChangeText={text => setFormData({ ...formData, phone: text })}
              className="rounded-xl p-3 border text-sm"
              style={{ backgroundColor: t.surface, borderColor: t.border, color: t.text }}
              placeholder={translate('enterPhone')}
              keyboardType="phone-pad"
              placeholderTextColor={t.muted}
            />
          </View>

          <LocationFields
            city={formData.city ?? ''}
            district={formData.district ?? ''}
            ward={formData.ward ?? ''}
            onCityChange={(city) => setFormData(prev => ({ ...prev, city }))}
            onDistrictChange={(district) => setFormData(prev => ({ ...prev, district }))}
            onWardChange={(ward) => setFormData(prev => ({ ...prev, ward }))}
            theme={t}
          />

          <View className="gap-2">
            <Text className="text-sm font-medium mb-1" style={{ color: t.text }}>{translate('detailed_address_label')}</Text>
            <TextInput
              value={formData.detailedAddress}
              onChangeText={text => setFormData({ ...formData, detailedAddress: text })}
              className="rounded-xl p-3 border text-sm"
              style={{ backgroundColor: t.surface, borderColor: t.border, color: t.text }}
              placeholder={translate('enterAddress')}
              placeholderTextColor={t.muted}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium mb-1" style={{ color: t.text }}>{translate('address_type_label')}</Text>
            <View className="flex-row gap-3">
              {renderTypeButton(translate('home') as AddressType, translate('home'), 'home')}
              {renderTypeButton(translate('office') as AddressType, translate('office'), 'briefcase')}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            className="flex-row items-center gap-3"
            activeOpacity={0.7}
          >
            <View
              className={`w-5 h-5 rounded border-2 justify-center items-center`}
              style={{
                borderColor: formData.isDefault ? t.primary : t.border,
                backgroundColor: formData.isDefault ? t.primary : t.surface
              }}
            >
              {formData.isDefault && <AppIcon name="check" size={14} color="#FFFFFF" />}
            </View>
            <Text className="text-sm" style={{ color: t.text }}>{translate('set_as_default_address')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          className="rounded-xl py-4 items-center mb-24 shadow-sm"
          style={{ backgroundColor: t.primary, shadowColor: t.primary }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">{submitLabel || defaultSubmitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
