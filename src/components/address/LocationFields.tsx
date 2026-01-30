import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../common/Icon';
import { Theme } from '../../theme';
import { useToast } from '../common/ToastProvider';
import { LocationSelectModal } from './LocationSelectModal';
import { getProvinces, getWards, LocationOption } from '../../services/locations';

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

    const wardValue = ward || district;

    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [wards, setWards] = useState<LocationOption[]>([]);
    const [provinceLoading, setProvinceLoading] = useState(false);
    const [wardLoading, setWardLoading] = useState(false);

    const [provinceModal, setProvinceModal] = useState(false);
    const [wardModal, setWardModal] = useState(false);

    const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);

    const loadProvinces = useCallback(async () => {
        setProvinceLoading(true);
        try {
            const data = await getProvinces();
            setProvinces(data);
        } catch {
            showToast(translate('cannotLoadProvinces'), 'error');
        } finally {
            setProvinceLoading(false);
        }
    }, [showToast, translate]);

    const loadWards = useCallback(async (provinceCode: number) => {
        setWardLoading(true);
        try {
            const data = await getWards(provinceCode);
            setWards(data);
        } catch {
            showToast(translate('cannotLoadWards'), 'error');
        } finally {
            setWardLoading(false);
        }
    }, [showToast, translate]);

    useEffect(() => {
        loadProvinces();
    }, [loadProvinces]);

    // Sync internal state with props if they change externally (or initially)
    useEffect(() => {
        if (!city || provinces.length === 0) return;
        const matched = provinces.find(p => p.name === city);
        if (matched && matched.code !== selectedProvinceCode) {
            setSelectedProvinceCode(matched.code);
            loadWards(matched.code);
        }
    }, [city, provinces, selectedProvinceCode, loadWards]);

    const handleSelectProvince = (option: LocationOption) => {
        setSelectedProvinceCode(option.code);
        setWards([]);

        onCityChange(option.name);
        onWardChange('');

        onDistrictChange('');
        loadWards(option.code);
    };

    const handleSelectWard = (option: LocationOption) => {
        if (!selectedProvinceCode) {
            showToast(translate('selectProvinceFirst'), 'info');
            return;
        }
        onWardChange(option.name);
        onDistrictChange('');
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
                        loadProvinces();
                    }
                    setProvinceModal(true);
                },
                provinceLoading,
            )}

            <View style={styles.inputGroup}>
                {renderSelect(
                    translate('ward_label'),
                    wardValue,
                    translate('enterWard'),
                    () => {
                        if (!selectedProvinceCode) {
                            showToast(translate('selectProvinceFirst'), 'info');
                            return;
                        }
                        setWardModal(true);
                        if (!wards.length && !wardLoading) {
                            loadWards(selectedProvinceCode);
                        }
                    },
                    wardLoading,
                )}
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
        fontSize: 16,
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
        fontSize: 16,
    },
});
