import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '../../components/common/Icon';
import { Theme } from '../../theme';
import { useToast } from '../../components/common/ToastProvider';
import { UploadImageFile } from '../../services/api';

// Dynamic import setup
let launchImageLibrary: any = null;
try {
    const ImagePicker = require('react-native-image-picker');
    launchImageLibrary = ImagePicker.launchImageLibrary;
} catch (error) {
    console.warn('react-native-image-picker not available:', error);
}

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    initialName: string;
    initialAvatar: string;
    onSave: (name: string, avatar: string, avatarFile: UploadImageFile | null) => void;
    onViewFullImage: (uri: string) => void;
    theme: Theme;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    visible,
    onClose,
    initialName,
    initialAvatar,
    onSave,
    onViewFullImage,
    theme: t,
}) => {
    const { t: translate } = useTranslation();
    const { showToast } = useToast();

    const [editingName, setEditingName] = useState(initialName);
    const [editingAvatar, setEditingAvatar] = useState(initialAvatar);
    const [avatarFile, setAvatarFile] = useState<UploadImageFile | null>(null);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    React.useEffect(() => {
        if (visible) {
            setEditingName(initialName);
            setEditingAvatar(initialAvatar);
            setAvatarFile(null);
            setShowUrlInput(false);
            setAvatarUrl('');
        }
    }, [visible, initialName, initialAvatar]);

    const handlePickImage = () => {
        if (!launchImageLibrary) {
            setShowUrlInput(true);
            setAvatarUrl(editingAvatar);
            return;
        }

        const options = {
            mediaType: 'photo' as any,
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800,
        };

        launchImageLibrary(options, (response: any) => {
            if (response.didCancel) return;

            if (response.errorCode) {
                showToast(translate('image_picker_error', { error: response.errorMessage || 'Unknown error' }), 'error');
                return;
            }

            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];
                const imageUri = asset.uri;
                if (imageUri) {
                    setEditingAvatar(imageUri);
                    setAvatarFile({
                        uri: imageUri,
                        name: asset.fileName || 'avatar.jpg',
                        type: asset.type || 'image/jpeg',
                    });
                    setShowUrlInput(false);
                    setAvatarUrl('');
                }
            }
        });
    };

    const handleSaveUrl = () => {
        if (avatarUrl.trim()) {
            setEditingAvatar(avatarUrl.trim());
        }
        setShowUrlInput(false);
        setAvatarUrl('');
        setAvatarFile(null);
    };

    const handleSave = () => {
        if (!editingName.trim()) {
            showToast(translate('enter_name_error'), 'error');
            return;
        }
        onSave(editingName, editingAvatar, avatarFile);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                className="flex-1 bg-black/50 justify-end"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View
                    className="bg-white rounded-t-3xl border-t max-h-[80%] pb-4"
                    style={{ backgroundColor: t.card, borderColor: t.border }}
                >
                    <View
                        className="flex-row items-center justify-between p-4 border-b"
                        style={{ borderBottomColor: t.border }}
                    >
                        <Text className="text-lg font-bold" style={{ color: t.text }}>{translate('edit_profile')}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="p-1"
                            activeOpacity={0.7}
                        >
                            <AppIcon name="close" size={24} color={t.muted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-4">
                        <View className="mb-5">
                            <Text className="text-sm font-medium mb-2" style={{ color: t.text }}>{translate('name')}</Text>
                            <TextInput
                                value={editingName}
                                onChangeText={setEditingName}
                                className="border rounded-lg px-3 text-base"
                                style={{
                                    backgroundColor: t.surface,
                                    borderColor: t.border,
                                    color: t.text,
                                    height: 48,
                                    textAlignVertical: 'center',
                                    includeFontPadding: false,
                                    paddingVertical: 0,
                                }}
                                placeholder={translate('enter_name_placeholder')}
                                placeholderTextColor={t.muted}
                            />
                        </View>

                        <View className="mb-5">
                            <Text className="text-sm font-medium mb-2" style={{ color: t.text }}>{translate('avatar')}</Text>
                            {!showUrlInput ? (
                                <>
                                    <View className="flex-row items-center gap-4 mb-3">
                                        {editingAvatar ? (
                                            <TouchableOpacity
                                                onPress={() => onViewFullImage(editingAvatar)}
                                                activeOpacity={0.8}
                                            >
                                                <Image
                                                    source={{ uri: editingAvatar }}
                                                    className="w-20 h-20 rounded-full border"
                                                    style={{ borderColor: t.border }}
                                                />
                                            </TouchableOpacity>
                                        ) : (
                                            <View
                                                className="w-20 h-20 rounded-full border justify-center items-center"
                                                style={{ backgroundColor: t.surface, borderColor: t.border }}
                                            >
                                                <AppIcon name="user" size={32} color={t.muted} />
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            onPress={handlePickImage}
                                            className="flex-row items-center gap-2 px-4 py-2.5 rounded-lg"
                                            style={{ backgroundColor: t.primary }}
                                            activeOpacity={0.8}
                                        >
                                            <AppIcon name="camera" size={18} color="#FFFFFF" />
                                            <Text className="text-white text-sm font-medium">{translate('pick_image')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {!launchImageLibrary && (
                                        <TouchableOpacity
                                            onPress={() => setShowUrlInput(true)}
                                            className="py-2"
                                            activeOpacity={0.7}
                                        >
                                            <Text className="text-sm" style={{ color: t.primary }}>{translate('or_enter_url')}</Text>
                                        </TouchableOpacity>
                                    )}
                                    {editingAvatar ? (
                                        <TouchableOpacity
                                            onPress={() => setEditingAvatar('')}
                                            className="py-2"
                                            activeOpacity={0.7}
                                        >
                                            <Text className="text-sm" style={{ color: t.muted }}>{translate('remove_image')}</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </>
                            ) : (
                                <View>
                                    <TextInput
                                        value={avatarUrl}
                                        onChangeText={setAvatarUrl}
                                        className="border rounded-lg px-3 text-base"
                                        style={{
                                            backgroundColor: t.surface,
                                            borderColor: t.border,
                                            color: t.text,
                                            height: 48,
                                            textAlignVertical: 'center',
                                            includeFontPadding: false,
                                            paddingVertical: 0,
                                        }}
                                        placeholder={translate('or_enter_url')}
                                        placeholderTextColor={t.muted}
                                        autoCapitalize="none"
                                        keyboardType="url"
                                    />
                                    <View className="flex-row justify-end gap-3 mt-2">
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowUrlInput(false);
                                                setAvatarUrl('');
                                            }}
                                            className="px-4 py-2 rounded-md border"
                                            style={{ borderColor: t.border }}
                                            activeOpacity={0.7}
                                        >
                                            <Text className="text-sm font-medium" style={{ color: t.muted }}>{translate('cancel')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleSaveUrl}
                                            className="px-4 py-2 rounded-md border border-transparent"
                                            style={{ backgroundColor: t.primary }}
                                            activeOpacity={0.8}
                                        >
                                            <Text className="text-sm font-medium text-white">{translate('save')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>

                        <View className="flex-row gap-3 mt-3">
                            <TouchableOpacity
                                onPress={onClose}
                                className="flex-1 py-3 rounded-lg items-center justify-center border"
                                style={{ borderColor: t.border }}
                                activeOpacity={0.7}
                            >
                                <Text className="text-base font-semibold" style={{ color: t.muted }}>{translate('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                className="flex-1 py-3 rounded-lg items-center justify-center border border-transparent"
                                style={{ backgroundColor: t.primary }}
                                activeOpacity={0.8}
                            >
                                <Text className="text-base font-semibold text-white">{translate('save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

