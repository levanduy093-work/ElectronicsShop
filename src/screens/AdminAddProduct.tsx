import React, { useMemo } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useTheme } from '../theme';
import type { CreateProductInput } from '../services/api';
import { AppIcon } from '../components/common/Icon';

type FormValues = {
    name: string;
    category?: string;
    code?: string;
    description?: string;
    datasheet?: string;
    originalPrice: string;
    salePrice: string;
    stock: string;
    images?: string; // comma separated
    options?: string; // comma separated
    classifications?: string; // comma separated
    specs?: string; // lines key:value
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
    const { t } = useTranslation();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const schema = useMemo(
        () =>
            z
                .object({
                    name: z.string().trim().min(1, 'Tên sản phẩm là bắt buộc'),
                    category: z.string().trim().optional(),
                    code: z.string().trim().optional(),
                    description: z.string().trim().optional(),
                    datasheet: z
                        .string()
                        .trim()
                        .url('Đường dẫn datasheet không hợp lệ')
                        .optional()
                        .or(z.literal('').transform(() => undefined)),
                    originalPrice: z.coerce.number().min(0, 'Giá gốc không hợp lệ'),
                    salePrice: z.coerce.number().min(0, 'Giá bán không hợp lệ'),
                    stock: z.coerce.number().min(0, 'Tồn kho không hợp lệ'),
                    images: z.string().optional(),
                    options: z.string().optional(),
                    classifications: z.string().optional(),
                    specs: z.string().optional(),
                })
                .superRefine((data, ctx) => {
                    if (data.salePrice > data.originalPrice) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: ['salePrice'],
                            message: 'Giá bán phải nhỏ hơn hoặc bằng giá gốc',
                        });
                    }
                }),
        []
    );

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
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
            images: '',
            options: '',
            classifications: '',
            specs: '',
        },
    });

    const createProductMutation = useMutation({
        mutationFn: async (payload: CreateProductInput) => onCreate(payload),
    });

    const onSubmit = async (values: FormValues) => {
        const payload: CreateProductInput = {
            name: values.name.trim(),
            category: values.category?.trim() || undefined,
            code: values.code?.trim() || undefined,
            description: values.description?.trim() || undefined,
            datasheet: values.datasheet?.trim() || undefined,
            images: splitList(values.images),
            options: splitList(values.options),
            classifications: splitList(values.classifications),
            specs: parseSpecs(values.specs),
            price: {
                originalPrice: Number(values.originalPrice),
                salePrice: Number(values.salePrice),
            },
            stock: Number(values.stock),
        };

        if (!payload.images?.length) delete payload.images;
        if (!payload.options?.length) delete payload.options;
        if (!payload.classifications?.length) delete payload.classifications;
        if (!payload.specs || Object.keys(payload.specs).length === 0) delete payload.specs;

        try {
            await createProductMutation.mutateAsync(payload);
            Alert.alert('Thành công', 'Sản phẩm đã được tạo');
            reset();
            onBack();
        } catch (error: any) {
            Alert.alert('Lỗi', error?.message || 'Không thể tạo sản phẩm');
        }
    };

    if (!isAdmin) {
        return (
            <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.background }}>
                <Text className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Chỉ admin mới được truy cập</Text>
                <TouchableOpacity
                    onPress={onBack}
                    className="mt-4 px-4 py-2 rounded-xl"
                    style={{ backgroundColor: theme.primary }}
                >
                    <Text className="text-white font-semibold">Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderInput = (
        name: keyof FormValues,
        label: string,
        props?: { multiline?: boolean; keyboardType?: 'default' | 'numeric'; placeholder?: string },
    ) => (
        <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: theme.text }}>{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={props?.placeholder}
                        placeholderTextColor={theme.muted}
                        className="rounded-xl border px-3 py-3 text-sm"
                        style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }}
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
                <Text className="text-xl font-semibold" style={{ color: theme.text }}>Tạo sản phẩm (Admin)</Text>
            </View>
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 16 + insets.bottom,
                }}
                showsVerticalScrollIndicator={false}
            >
                {renderInput('name', 'Tên sản phẩm')}
                {renderInput('code', 'Mã sản phẩm (code)')}
                {renderInput('category', 'Danh mục')}
                {renderInput('datasheet', 'Link datasheet (URL)')}
                {renderInput('originalPrice', 'Giá gốc', { keyboardType: 'numeric' })}
                {renderInput('salePrice', 'Giá bán', { keyboardType: 'numeric' })}
                {renderInput('stock', 'Tồn kho', { keyboardType: 'numeric' })}
                {renderInput('images', 'Ảnh (ngăn cách bằng dấu phẩy)')}
                {renderInput('options', 'Tuỳ chọn (ngăn cách bằng dấu phẩy)')}
                {renderInput('classifications', 'Phân loại (ngăn cách bằng dấu phẩy)')}
                {renderInput('specs', 'Thông số (mỗi dòng dạng key:value)', { multiline: true, placeholder: 'power:10W\nvoltage:5V' })}
                {renderInput('description', 'Mô tả', { multiline: true })}

                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    className="mt-2 rounded-xl py-3 items-center"
                    style={{ backgroundColor: theme.primary, opacity: isSubmitting || createProductMutation.isPending ? 0.8 : 1 }}
                    disabled={isSubmitting || createProductMutation.isPending}
                >
                    <Text className="text-white font-semibold">
                        {isSubmitting || createProductMutation.isPending ? (t('processing') || 'Đang lưu...') : 'Lưu sản phẩm'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminAddProduct;
