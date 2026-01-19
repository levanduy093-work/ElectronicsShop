import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../common/Icon';
import { Theme } from '../../theme';
import { useToast } from '../common/ToastProvider';
import { LocationSelectModal } from './LocationSelectModal';
import { getDistricts, getProvinces, getWards, LocationOption } from '../../services/locations';

interface LocationFieldsProps {
    city: string;
    district: string;
    ward: string;
    onCityChange: (city: string) => void;
    onDistrictChange: (district: string) => void;
    onWardChange: (ward: string) => void;
    theme: Theme;
}

export function LocationFields({
    city,
    district,
    ward,
    onCityChange,
    onDistrictChange,
    onWardChange,
    theme: t,
}: LocationFieldsProps) {
    const { t: translate } = useTranslation();
    const { showToast } = useToast();

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
        loadProvinces();
    }, []);

    // Sync internal state with props if they change externally (or initially)
    useEffect(() => {
        if (!city || provinces.length === 0) return;
        const matched = provinces.find(p => p.name === city);
        if (matched && matched.code !== selectedProvinceCode) {
            setSelectedProvinceCode(matched.code);
            void loadDistricts(matched.code);
        }
    }, [city, provinces]);

    useEffect(() => {
        if (!district || districts.length === 0) return;
        const matched = districts.find(d => d.name === district);
        if (matched && matched.code !== selectedDistrictCode) {
            setSelectedDistrictCode(matched.code);
            void loadWards(matched.code);
        }
    }, [district, districts]);

    const handleSelectProvince = (option: LocationOption) => {
        setSelectedProvinceCode(option.code);
        setSelectedDistrictCode(null);
        setDistricts([]);
        setWards([]);

        onCityChange(option.name);
        onDistrictChange('');
        onWardChange('');

        void loadDistricts(option.code);
    };

    const handleSelectDistrict = (option: LocationOption) => {
        if (!selectedProvinceCode) {
            showToast(translate('selectProvinceFirst'), 'info');
            return;
        }
        setSelectedDistrictCode(option.code);
        setWards([]);

        onDistrictChange(option.name);
        onWardChange('');

        void loadWards(option.code);
    };

    const handleSelectWard = (option: LocationOption) => {
        if (!selectedDistrictCode) {
            showToast(translate('selectDistrictFirst'), 'info');
            return;
        }
        onWardChange(option.name);
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

    return (
        <View style={styles.container}>
            {renderSelect(
                translate('province_city_label'),
                city,
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
                        district,
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
                        ward,
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        marginBottom: 4,
    },
    selectBox: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectText: {
        fontSize: 14,
    },
});
