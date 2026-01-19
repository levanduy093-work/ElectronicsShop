import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
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
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.modalContent, { backgroundColor: t.card, borderColor: t.border }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: t.text }]}>{translate('edit_profile')}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            activeOpacity={0.7}
                        >
                            <AppIcon name="close" size={24} color={t.muted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: t.text }]}>{translate('name')}</Text>
                            <TextInput
                                value={editingName}
                                onChangeText={setEditingName}
                                style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
                                placeholder={translate('enter_name_placeholder')}
                                placeholderTextColor={t.muted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: t.text }]}>{translate('avatar')}</Text>
                            {!showUrlInput ? (
                                <>
                                    <View style={styles.avatarPreviewContainer}>
                                        {editingAvatar ? (
                                            <TouchableOpacity
                                                onPress={() => onViewFullImage(editingAvatar)}
                                                activeOpacity={0.8}
                                            >
                                                <Image source={{ uri: editingAvatar }} style={[styles.avatarPreview, { borderColor: t.border }]} />
                                            </TouchableOpacity>
                                        ) : (
                                            <View style={[styles.avatarPreviewPlaceholder, { backgroundColor: t.surface, borderColor: t.border }]}>
                                                <AppIcon name="user" size={32} color={t.muted} />
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            onPress={handlePickImage}
                                            style={[styles.pickImageButton, { backgroundColor: t.primary }]}
                                            activeOpacity={0.8}
                                        >
                                            <AppIcon name="camera" size={18} color="#FFFFFF" />
                                            <Text style={styles.pickImageText}>{translate('pick_image')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {!launchImageLibrary && (
                                        <TouchableOpacity
                                            onPress={() => setShowUrlInput(true)}
                                            style={styles.urlInputToggle}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.urlInputToggleText, { color: t.primary }]}>{translate('or_enter_url')}</Text>
                                        </TouchableOpacity>
                                    )}
                                    {editingAvatar ? (
                                        <TouchableOpacity
                                            onPress={() => setEditingAvatar('')}
                                            style={styles.removeImageButton}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.removeImageText, { color: t.muted }]}>{translate('remove_image')}</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </>
                            ) : (
                                <View>
                                    <TextInput
                                        value={avatarUrl}
                                        onChangeText={setAvatarUrl}
                                        style={[styles.input, { backgroundColor: t.surface, borderColor: t.border, color: t.text }]}
                                        placeholder={translate('or_enter_url')}
                                        placeholderTextColor={t.muted}
                                        autoCapitalize="none"
                                        keyboardType="url"
                                    />
                                    <View style={styles.urlInputActions}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowUrlInput(false);
                                                setAvatarUrl('');
                                            }}
                                            style={[styles.urlActionButton, { borderColor: t.border }]}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.urlActionText, { color: t.muted }]}>{translate('cancel')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleSaveUrl}
                                            style={[styles.urlActionButton, { backgroundColor: t.primary }]}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.urlActionText, { color: '#FFFFFF' }]}>{translate('save')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={onClose}
                                style={[styles.modalButton, styles.cancelButton, { borderColor: t.border }]}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.modalButtonText, { color: t.muted }]}>{translate('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                style={[styles.modalButton, styles.saveButton, { backgroundColor: t.primary }]}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>{translate('save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        maxHeight: '80%',
        paddingBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    avatarPreviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 12,
    },
    avatarPreview: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
    },
    avatarPreviewPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    pickImageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    urlInputToggle: {
        paddingVertical: 8,
    },
    urlInputToggleText: {
        fontSize: 14,
    },
    removeImageButton: {
        paddingVertical: 8,
    },
    removeImageText: {
        fontSize: 14,
    },
    urlInputActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 8,
    },
    urlActionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    urlActionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cancelButton: {
        backgroundColor: 'transparent',
    },
    saveButton: {
        // bg color set in component
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
