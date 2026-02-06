import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useTheme } from '../theme';
import type { CreateProductInput } from '../services/api';
import { uploadImage, UploadImageFile } from '../services/api';
import { useAppOptional } from '../context';
import { AppIcon } from '../components/common/Icon';

type FormValues = {
    name: string;
    category: string;
    code: string;
    description: string;
    datasheet?: string;
    originalPrice: string;
    salePrice: string;
    stock: string;
    imagesCount: number;
    options?: string; // comma separated
    classifications?: string; // comma separated
    specs: string; // lines key:value
};

const splitList = (value?: string) =>
    (value || '')
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);

const parseSpecs = (value?: string) => {
    const specs: Record<string, string> = {};
    (value || '')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .forEach(line => {
            const [k, ...rest] = line.split(':');
            const v = rest.join(':').trim();
            if (k && v) specs[k.trim()] = v;
        });
    return specs;
};

export interface AdminAddProductProps {
    onBack: () => void;
    onCreate: (payload: CreateProductInput) => Promise<any>;
    isAdmin: boolean;
}

export const AdminAddProduct: React.FC<AdminAddProductProps> = ({ onBack, onCreate, isAdmin }) => {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const app = useAppOptional();
    const [images, setImages] = useState<{ id: string; uri: string; uploadedUrl?: string; uploading?: boolean }[]>([]);

    const parseNumberString = (value: string) => {
        const digits = (value || '').replace(/[^\d]/g, '');
        return digits ? Number(digits) : NaN;
    };

    const formatNumber = (digits: string) => {
        if (!digits) return '';
        try {
            return new Intl.NumberFormat(i18n.language || 'vi-VN').format(Number(digits));
        } catch {
            return digits;
        }
    };

    const schema = useMemo(() => {
        const tr = (key: string, fallback: string) => t(key) || fallback;
        return z
            .object({
                name: z.string().trim().min(1, tr('admin_product_name_required', 'Tên sản phẩm là bắt buộc')).max(200, tr('admin_too_long', 'Nội dung quá dài')),
                category: z.string().trim().min(1, tr('admin_category_required', 'Danh mục là bắt buộc')).max(120, tr('admin_too_long', 'Nội dung quá dài')),
                code: z.string().trim().min(1, tr('admin_code_required', 'Mã sản phẩm là bắt buộc')).max(120, tr('admin_too_long', 'Nội dung quá dài')),
                description: z.string().trim().min(1, tr('admin_description_required', 'Mô tả là bắt buộc')).max(2000, tr('admin_too_long', 'Nội dung quá dài')),
                datasheet: z
                    .string()
                    .trim()
                    .url(tr('admin_datasheet_invalid', 'Đường dẫn datasheet không hợp lệ'))
                    .optional()
                    .or(z.literal('').transform(() => undefined)),
                originalPrice: z
                    .string()
                    .trim()
                    .min(1, tr('admin_original_price_required', 'Giá gốc là bắt buộc'))
                    .refine((v) => Number.isFinite(parseNumberString(v)), tr('admin_original_price_invalid', 'Giá gốc không hợp lệ')),
                salePrice: z
                    .string()
                    .trim()
                    .min(1, tr('admin_sale_price_required', 'Giá bán là bắt buộc'))
                    .refine((v) => Number.isFinite(parseNumberString(v)), tr('admin_sale_price_invalid', 'Giá bán không hợp lệ')),
                stock: z
                    .coerce.number()
                    .min(0, tr('admin_stock_invalid', 'Tồn kho không hợp lệ'))
                    .refine((v) => Number.isInteger(v), tr('admin_stock_integer', 'Tồn kho phải là số nguyên')),
                imagesCount: z.coerce.number().min(1, tr('admin_images_required', 'Vui lòng thêm ít nhất 1 ảnh')),
                options: z.string().trim().max(500, tr('admin_too_long', 'Nội dung quá dài')).optional().or(z.literal('').transform(() => undefined)),
                classifications: z.string().trim().max(500, tr('admin_too_long', 'Nội dung quá dài')).optional().or(z.literal('').transform(() => undefined)),
                specs: z.string().trim().min(1, tr('admin_specs_required', 'Thông số là bắt buộc')).max(2000, tr('admin_too_long', 'Nội dung quá dài')),
            })
            .superRefine((data, ctx) => {
                const original = parseNumberString(data.originalPrice);
                const sale = parseNumberString(data.salePrice);
                if (Number.isFinite(original) && Number.isFinite(sale) && sale > original) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['salePrice'],
                        message: tr('admin_sale_price_leq', 'Giá bán phải nhỏ hơn hoặc bằng giá gốc'),
                    });
                }
            });
    }, [t]);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            category: '',
            code: '',
            description: '',
            datasheet: '',
            originalPrice: '',
            salePrice: '',
            stock: '0',
            imagesCount: 0,
            options: '',
            classifications: '',
            specs: '',
        },
    });

    useEffect(() => {
        setValue('imagesCount', images.length);
    }, [images.length, setValue]);

    const createProductMutation = useMutation({
        mutationFn: async (payload: CreateProductInput) => onCreate(payload),
    });

    const pickImages = async () => {
        try {
            const picker = await import('react-native-image-picker');
            const result = await picker.launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 6,
                quality: 0.85 as any,
            });
            if (result.didCancel || !result.assets) return;
            const picked = result.assets
                .filter(a => a.uri)
                .map((a, idx) => ({
                    id: `${Date.now()}-${idx}`,
                    uri: a.uri as string,
                }));
            setImages(prev => [...prev, ...picked].slice(0, 10));
        } catch (error: any) {
            Alert.alert(t('admin_error', 'Lỗi'), error?.message || t('admin_open_gallery_failed', 'Không thể mở thư viện ảnh'));
        }
    };

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const uploadAllImages = async (): Promise<string[]> => {
        if (!images.length) return [];
        const token = app?.authTokens?.accessToken;
        if (!token) {
            Alert.alert(t('admin_auth_required', 'Thiếu quyền'), t('admin_upload_need_login', 'Bạn cần đăng nhập để tải ảnh.'));
            throw new Error('missing_token');
        }
        const folder = `electronics-shop/products/admin-${Date.now()}`;
        const uploaded: string[] = [];
        for (const item of images) {
            if (item.uploadedUrl) {
                uploaded.push(item.uploadedUrl);
                continue;
            }
            const file: UploadImageFile = {
                uri: item.uri,
                name: `img-${item.id}.jpg`,
                type: Platform.OS === 'ios' ? 'image/jpeg' : 'image/*',
            };
            try {
                setImages(prev => prev.map(img => img.id === item.id ? { ...img, uploading: true } : img));
                const res = await uploadImage(file, { token, folder });
                const secureUrl = res?.secure_url || res?.url;
                if (secureUrl) {
                    uploaded.push(secureUrl);
                    setImages(prev => prev.map(img => img.id === item.id ? { ...img, uploadedUrl: secureUrl, uploading: false } : img));
                }
            } catch (error: any) {
                setImages(prev => prev.map(img => img.id === item.id ? { ...img, uploading: false } : img));
                Alert.alert(t('admin_upload_error', 'Lỗi tải ảnh'), error?.message || t('admin_upload_failed', 'Không thể tải ảnh lên máy chủ'));
                throw error;
            }
        }
        return uploaded;
    };

    const onSubmit = async (values: FormValues) => {
        const payload: CreateProductInput = {
            name: values.name.trim(),
            category: values.category.trim(),
            code: values.code.trim(),
            description: values.description.trim(),
            datasheet: values.datasheet?.trim() || undefined,
            options: splitList(values.options),
            classifications: splitList(values.classifications),
            specs: parseSpecs(values.specs),
            price: {
                originalPrice: parseNumberString(values.originalPrice),
                salePrice: parseNumberString(values.salePrice),
            },
            stock: Number(values.stock),
        };

        if (!payload.options?.length) delete payload.options;
        if (!payload.classifications?.length) delete payload.classifications;
        if (!payload.specs || Object.keys(payload.specs).length === 0) delete payload.specs;

        try {
            const uploadedImages = await uploadAllImages();
            if (uploadedImages.length) payload.images = uploadedImages;
            await createProductMutation.mutateAsync(payload);
            Alert.alert(t('admin_success', 'Thành công'), t('admin_product_created', 'Sản phẩm đã được tạo'));
            reset();
            setImages([]);
            onBack();
        } catch (error: any) {
            Alert.alert(t('admin_error', 'Lỗi'), error?.message || t('admin_create_failed', 'Không thể tạo sản phẩm'));
        }
    };

    if (!isAdmin) {
        return (
            <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.background }}>
                <Text className="text-lg font-semibold mb-2" style={{ color: theme.text }}>
                    {t('admin_only', 'Chỉ admin mới được truy cập')}
                </Text>
                <TouchableOpacity
                    onPress={onBack}
                    className="mt-4 px-4 py-2 rounded-xl"
                    style={{ backgroundColor: theme.primary }}
                >
                    <Text className="text-white font-semibold">{t('back', 'Quay lại')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderInput = (
        name: keyof FormValues,
        label: string,
        props?: { multiline?: boolean; keyboardType?: 'default' | 'numeric'; placeholder?: string; format?: 'currency' },
    ) => (
        <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        value={String(value || '')}
                        onChangeText={(text) => {
                            if (props?.format === 'currency') {
                                const digits = text.replace(/[^\d]/g, '');
                                onChange(formatNumber(digits));
                                return;
                            }
                            onChange(text);
                        }}
                        onBlur={onBlur}
                        placeholder={props?.placeholder}
                        placeholderTextColor={theme.muted}
                        className="rounded-xl border px-3 text-sm"
                        style={{
                            borderColor: theme.border,
                            color: theme.text,
                            backgroundColor: theme.surface,
                            height: props?.multiline ? undefined : 44,
                            paddingVertical: props?.multiline ? 10 : 10,
                            textAlignVertical: props?.multiline ? 'top' : (Platform.OS === 'android' ? 'center' : 'auto'),
                            includeFontPadding: Platform.OS === 'android' ? false : undefined,
                            lineHeight: props?.multiline ? 18 : undefined,
                        }}
                        multiline={props?.multiline}
                        numberOfLines={props?.multiline ? 3 : 1}
                        keyboardType={props?.keyboardType === 'numeric' ? 'numeric' : 'default'}
                    />
                )}
            />
            {errors[name] && (
                <Text className="text-xs mt-1" style={{ color: '#ef4444' }}>
                    {errors[name]?.message as string}
                </Text>
            )}
        </View>
    );

    return (
        <SafeAreaView edges={['top', 'left', 'right']} className="flex-1" style={{ backgroundColor: theme.background }}>
            <View
                className="flex-row items-center px-4 border-b"
                style={{
                    borderColor: theme.border,
                    paddingTop: Math.max(insets.top - 38, 0),
                    paddingBottom: 6,
                }}
            >
                <TouchableOpacity onPress={onBack} className="p-2 mr-3">
                    <AppIcon name="chevron-left" size={22} color={theme.text} />
                </TouchableOpacity>
                <Text className="text-xl font-semibold" style={{ color: theme.text }}>
                    {t('admin_add_product_title', 'Thêm sản phẩm (Admin)')}
                </Text>
            </View>
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 16 + insets.bottom,
                }}
                showsVerticalScrollIndicator={false}
            >
                {renderInput('name', t('admin_product_name', 'Tên sản phẩm'))}
                {renderInput('code', t('admin_product_code', 'Mã sản phẩm (code)'))}
                {renderInput('category', t('admin_category', 'Danh mục'))}
                {renderInput('datasheet', t('admin_datasheet', 'Link datasheet (URL)'))}
                {renderInput('originalPrice', t('admin_original_price', 'Giá gốc'), { keyboardType: 'numeric', format: 'currency' })}
                {renderInput('salePrice', t('admin_sale_price', 'Giá bán'), { keyboardType: 'numeric', format: 'currency' })}
                {renderInput('stock', t('admin_stock', 'Tồn kho'), { keyboardType: 'numeric' })}
                <View className="mb-4">
                    <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>
                        {t('admin_images', 'Hình ảnh')}
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                        {images.map((img) => (
                            <View key={img.id} style={{ width: 96 }}>
                                <View
                                    className="rounded-xl overflow-hidden bg-gray-200"
                                    style={{ aspectRatio: 1 }}
                                >
                                    <Image
                                        source={{ uri: img.uploadedUrl || img.uri }}
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        onPress={() => removeImage(img.id)}
                                        className="absolute top-1 right-1 w-7 h-7 rounded-full items-center justify-center bg-black/60"
                                        activeOpacity={0.8}
                                    >
                                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                                {img.uploading && (
                                    <Text className="text-xs mt-1" style={{ color: theme.muted }}>
                                        Đang tải...
                                    </Text>
                                )}
                            </View>
                        ))}
                        <TouchableOpacity
                            onPress={pickImages}
                            activeOpacity={0.8}
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: theme.border,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: theme.surface,
                            }}
                        >
                            <AppIcon name="image-plus" size={28} color={theme.muted} />
                            <Text className="text-xs mt-2" style={{ color: theme.muted }}>
                                {t('admin_add_image', 'Thêm ảnh')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {errors.imagesCount && (
                        <Text className="text-xs mt-2" style={{ color: '#ef4444' }}>
                            {errors.imagesCount.message as string}
                        </Text>
                    )}
                </View>

                {renderInput('options', t('admin_options', 'Tuỳ chọn (ngăn cách bằng dấu phẩy)'), {
                    placeholder: t('admin_options_placeholder', 'Ví dụ: Đài Loan, Trung Quốc, Nhật Bản'),
                })}
                {renderInput('classifications', t('admin_classifications', 'Phân loại (ngăn cách bằng dấu phẩy)'), {
                    placeholder: t('admin_classifications_placeholder', 'Ví dụ: 10A, 20A, 30A'),
                })}
                {renderInput('specs', t('admin_specs', 'Thông số (mỗi dòng dạng key:value)'), { multiline: true, placeholder: t('admin_specs_placeholder', 'power:10W\nvoltage:5V') })}
                {renderInput('description', t('admin_description', 'Mô tả'), { multiline: true })}

                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    className="mt-2 rounded-xl py-4 items-center"
                    style={{ backgroundColor: theme.primary, opacity: isSubmitting || createProductMutation.isPending ? 0.8 : 1 }}
                    disabled={isSubmitting || createProductMutation.isPending}
                >
                    <Text className="text-white font-semibold">
                        {isSubmitting || createProductMutation.isPending ? (t('processing') || 'Đang lưu...') : t('admin_save_product', 'Lưu sản phẩm')}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminAddProduct;
