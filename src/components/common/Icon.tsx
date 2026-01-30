import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { IconName } from '../../types';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

// Map of common icon names to MaterialCommunityIcons
const iconMap: Record<string, string> = {
  'chip': 'chip',
  'wifi': 'wifi',
  'battery': 'battery',
  'cable-data': 'cable-data',
  'toolbox': 'toolbox',
  'integrated-circuit': 'integrated-circuit-chip',
  'integrated-circuit-chip': 'integrated-circuit-chip',
  'home': 'home',
  'grid': 'view-grid',
  'sparkles': 'auto-fix',
  'robot': 'robot',
  'bot': 'robot',
  'shopping-cart': 'cart',
  'user': 'account',
  'search': 'magnify',
  'bell': 'bell',
  'sliders-horizontal': 'tune',
  'chevron-right': 'chevron-right',
  'zap': 'lightning-bolt',
  'star': 'star',
  'arrow-left': 'arrow-left',
  'share2': 'share-variant',
  'heart': 'heart',
  'minus': 'minus',
  'plus': 'plus',
  'file-text': 'file-document',
  'download': 'download',
  'file-code': 'code-tags',
  'shield-check': 'shield-check',
  'cpu': 'chip',
  'trash': 'delete-outline',
  'ticket': 'ticket',
  'ticket-outline': 'ticket-outline',
  'arrow-right': 'arrow-right',
  'close': 'close',
  'check-circle': 'check-circle',
  'mail': 'email',
  'lock': 'lock',
  'eye': 'eye',
  'eye-off': 'eye-off',
  'package': 'package-variant',
  'map-pin': 'map-marker',
  'credit-card': 'credit-card',
  'settings': 'cog',
  'help-circle': 'help-circle',
  'lifebuoy': 'lifebuoy',
  'headset': 'headset',
  'log-out': 'logout',
  'tune': 'tune',
  'briefcase': 'briefcase',
  'edit': 'pencil',
  'check': 'check',
  'clock': 'clock-outline',
  'history': 'history',
  'time-outline': 'clock-outline',
  'trending-up': 'trending-up',

  'tag': 'tag',
  'info': 'information',

  'smartphone': 'cellphone',
  'moon': 'weather-night',
  'globe': 'web',
  'message-circle': 'message-text',
  'phone': 'phone',
  'chevron-up': 'chevron-up',
  'chevron-down': 'chevron-down',
  'file-upload': 'file-upload',
  'send': 'send',
  'mic': 'microphone',
  'copy': 'content-copy',
  'truck': 'truck',

  'cash': 'cash',
  'omega': 'omega',
  'capacitor': 'sine-wave',
  'sine-wave': 'sine-wave',
  'flash': 'flash',
  'lightbulb-on-outline': 'lightbulb-on-outline',
  'coil': 'current-ac',
  'switch': 'toggle-switch',
  'toggle-switch': 'toggle-switch',
  'package-variant': 'package-variant',
  'package-variant-closed': 'package-variant-closed',
  'puzzle-outline': 'puzzle-outline',
  'access-point': 'access-point',
  'fan': 'fan',
  'monitor': 'monitor',
  'server': 'server',
  'engine': 'engine',
  'engine-outline': 'engine-outline',
  'tune-vertical': 'tune-vertical',
  'power-plug': 'power-plug',
  'power-plug-outline': 'power-plug-outline',
  'music': 'music',

  // Biometric icons
  'scan-face': 'face-recognition',
  'face-recognition': 'face-recognition',
  'fingerprint': 'fingerprint',
};

export function AppIcon({ name, size = 24, color = '#000', style }: IconProps) {
  const iconName = iconMap[name] || name;
  try {
    return <Icon name={iconName} size={size} color={color} style={style} />;
  } catch {
    // Fallback to a default icon if the icon doesn't exist
    return <Icon name="help-circle" size={size} color={color} style={style} />;
  }
}
