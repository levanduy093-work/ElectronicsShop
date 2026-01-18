import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../common/Icon';
import { AddressFormValues, AddressType } from '../../types';
import { Theme, lightTheme, useTheme } from '../../theme';
import { useToast } from '../common/ToastProvider';
import { getDistricts, getProvinces, getWards, LocationOption } from '../../services/locations';

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

interface LocationSelectModalProps {
  visible: boolean;
  title: string;
  options: LocationOption[];
  onClose: () => void;
  onSelect: (option: LocationOption) => void;
  theme: Theme;
  loading?: boolean;
}

function LocationSelectModal({
  visible,
  title,
  options,
  onClose,
  onSelect,
  theme,
  loading,
}: LocationSelectModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(opt => opt.name.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose} activeOpacity={0.7}>
              <AppIcon name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { marginBottom: 12 }]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('search')}
              placeholderTextColor={theme.muted}
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            />
          </View>
          {loading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.muted }]}>{t('loading')}</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => `${item.code}`}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={[styles.optionRow, { borderColor: theme.border }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, { color: theme.text }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.muted }]}>{t('no_results')}</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

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
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);
  const [provinceModal, setProvinceModal] = useState(false);
  const [districtModal, setDistrictModal] = useState(false);
  const [wardModal, setWardModal] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);

  const loadProvinces = async () => {
    setProvinceLoading(true);
    try {
      const data = await getProvinces();
      setProvinces(data);
    } catch (error: any) {
      showToast(translate('cannotLoadProvinces'), 'error');
    } finally {
      setProvinceLoading(false);
    }
  };

  const loadDistricts = async (provinceCode: number) => {
    setDistrictLoading(true);
    try {
      const data = await getDistricts(provinceCode);
      setDistricts(data);
    } catch (error: any) {
      showToast(translate('cannotLoadDistricts'), 'error');
    } finally {
      setDistrictLoading(false);
    }
  };

  const loadWards = async (districtCode: number) => {
    setWardLoading(true);
    try {
      const data = await getWards(districtCode);
      setWards(data);
    } catch (error: any) {
      showToast(translate('cannotLoadWards'), 'error');
    } finally {
      setWardLoading(false);
    }
  };

  useEffect(() => {
    setFormData(mergedInitial);
  }, [mergedInitial]);

  useEffect(() => {
    loadProvinces();
  }, []);

  useEffect(() => {
    if (!formData.city || provinces.length === 0) return;
    const matched = provinces.find(p => p.name === formData.city);
    if (matched && matched.code !== selectedProvinceCode) {
      setSelectedProvinceCode(matched.code);
      void loadDistricts(matched.code);
    }
  }, [formData.city, provinces]);

  useEffect(() => {
    if (!formData.district || districts.length === 0) return;
    const matched = districts.find(d => d.name === formData.district);
    if (matched && matched.code !== selectedDistrictCode) {
      setSelectedDistrictCode(matched.code);
      void loadWards(matched.code);
    }
  }, [formData.district, districts]);

  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.detailedAddress) {
      showToast(translate('fillFullInfo'), 'error');
      return;
    }
    onSubmit(formData);
  };

  const handleSelectProvince = (option: LocationOption) => {
    setSelectedProvinceCode(option.code);
    setSelectedDistrictCode(null);
    setDistricts([]);
    setWards([]);
    setFormData(prev => ({
      ...prev,
      city: option.name,
      district: '',
      ward: '',
    }));
    void loadDistricts(option.code);
  };

  const handleSelectDistrict = (option: LocationOption) => {
    if (!selectedProvinceCode) {
      showToast(translate('selectProvinceFirst'), 'info');
      return;
    }
    setSelectedDistrictCode(option.code);
    setWards([]);
    setFormData(prev => ({
      ...prev,
      district: option.name,
      ward: '',
    }));
    void loadWards(option.code);
  };

  const handleSelectWard = (option: LocationOption) => {
    if (!selectedDistrictCode) {
      showToast(translate('selectDistrictFirst'), 'info');
      return;
    }
    setFormData(prev => ({
      ...prev,
      ward: option.name,
    }));
  };

  const renderSelect = (label: string, value: string, placeholder: string, onPress: () => void, loading?: boolean) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: t.text }]}>{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.selectBox, { borderColor: t.border, backgroundColor: t.surface }]}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.selectText,
          { color: value ? t.text : t.muted },
        ]}>
          {value || placeholder}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={t.primary} />
        ) : (
          <AppIcon name="chevron-down" size={16} color={t.muted} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderTypeButton = (type: AddressType, label: string, icon: string) => (
    <TouchableOpacity
      onPress={() => setFormData({ ...formData, type })}
      style={[
        styles.typeButton,
        formData.type === type && styles.typeButtonSelected,
        { borderColor: t.border, backgroundColor: t.surface },
        formData.type === type && { borderColor: t.primary, backgroundColor: t === lightTheme ? '#EFF6FF' : 'rgba(37,99,235,0.12)' },
      ]}
      activeOpacity={0.7}
    >
      <AppIcon name={icon} size={16} color={formData.type === type ? t.primary : t.muted} />
      <Text style={[
        styles.typeText,
        { color: t.text },
        formData.type === type && { color: t.primary },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: t.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar 
        barStyle={t === lightTheme ? 'dark-content' : 'light-content'} 
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 0), backgroundColor: t.card, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton} activeOpacity={0.7}>
          <AppIcon name="arrow-left" size={24} color={t.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>
          {title || defaultTitle}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContent} contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: t.card }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>{translate('full_name_label')}</Text>
            <TextInput
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
              style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
              placeholder={translate('enter_name_placeholder')}
              placeholderTextColor={t.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>{translate('phone_number_label')}</Text>
            <TextInput
              value={formData.phone}
              onChangeText={text => setFormData({ ...formData, phone: text })}
              style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
              placeholder={translate('enterPhone')}
              keyboardType="phone-pad"
              placeholderTextColor={t.muted}
            />
          </View>

          {renderSelect(
            translate('province_city_label'),
            formData.city,
            translate('enterCity'),
            () => {
              if (!provinces.length && !provinceLoading) {
                void loadProvinces();
              }
              setProvinceModal(true);
            },
            provinceLoading,
          )}

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              {renderSelect(
                translate('district_label'),
                formData.district,
                translate('enterDistrict'),
                () => {
                  if (!selectedProvinceCode) {
                    showToast(translate('selectProvinceFirst'), 'info');
                    return;
                  }
                  setDistrictModal(true);
                  if (!districts.length && !districtLoading) {
                    void loadDistricts(selectedProvinceCode);
                  }
                },
                districtLoading,
              )}
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              {renderSelect(
                translate('ward_label'),
                formData.ward,
                translate('enterWard'),
                () => {
                  if (!selectedDistrictCode) {
                    showToast(translate('selectDistrictFirst'), 'info');
                    return;
                  }
                  setWardModal(true);
                  if (!wards.length && !wardLoading) {
                    void loadWards(selectedDistrictCode);
                  }
                },
                wardLoading,
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>{translate('detailed_address_label')}</Text>
            <TextInput
              value={formData.detailedAddress}
              onChangeText={text => setFormData({ ...formData, detailedAddress: text })}
              style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
              placeholder={translate('enterAddress')}
              placeholderTextColor={t.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: t.text }]}>{translate('address_type_label')}</Text>
            <View style={styles.typeContainer}>
              {renderTypeButton(translate('home') as AddressType, translate('home'), 'home')}
              {renderTypeButton(translate('office') as AddressType, translate('office'), 'briefcase')}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            style={styles.checkboxContainer}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              formData.isDefault && styles.checkboxSelected,
              { borderColor: t.border, backgroundColor: t.surface },
              formData.isDefault && { backgroundColor: t.primary, borderColor: t.primary },
            ]}>
              {formData.isDefault && <AppIcon name="check" size={14} color="#FFFFFF" />}
            </View>
            <Text style={[styles.checkboxLabel, { color: t.text }]}>{translate('set_as_default_address')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: t.primary, shadowColor: t.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>{submitLabel || defaultSubmitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>

      <LocationSelectModal
        visible={provinceModal}
        title={translate('selectProvince')}
        options={provinces}
        onClose={() => setProvinceModal(false)}
        onSelect={handleSelectProvince}
        theme={t}
        loading={provinceLoading}
      />
      <LocationSelectModal
        visible={districtModal}
        title={translate('selectDistrict')}
        options={districts}
        onClose={() => setDistrictModal(false)}
        onSelect={handleSelectDistrict}
        theme={t}
        loading={districtLoading}
      />
      <LocationSelectModal
        visible={wardModal}
        title={translate('selectWard')}
        options={wards}
        onClose={() => setWardModal(false)}
        onSelect={handleSelectWard}
        theme={t}
        loading={wardLoading}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#111827',
  },
  selectBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 14,
    color: '#111827',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalClose: {
    padding: 4,
  },
  modalLoading: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  optionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 96,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 14,
  },
});
