import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { IconName } from '../../lib/data';

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
  'integrated-circuit': 'integrated-circuit',
  'home': 'home',
  'grid': 'view-grid',
  'sparkles': 'auto-fix',
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
  'ticket': 'ticket-percent',
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
  'log-out': 'logout',
  'tune': 'tune',
};

export function AppIcon({ name, size = 24, color = '#000', style }: IconProps) {
  const iconName = iconMap[name] || name;
  try {
    return <Icon name={iconName} size={size} color={color} style={style} />;
  } catch (error) {
    // Fallback to a default icon if the icon doesn't exist
    return <Icon name="help-circle" size={size} color={color} style={style} />;
  }
}
