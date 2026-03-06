import { TextStyle } from 'react-native';

export const TYPO_CLASS = {
  screenTitle: 'text-lg font-bold',
  sectionTitle: 'text-base font-semibold',
  fieldLabel: 'text-base font-medium',
  body: 'text-base',
  bodyStrong: 'text-base font-semibold',
  helper: 'text-sm',
  caption: 'text-xs',
} as const;

export const TEXT_INPUT_BASE_STYLE: TextStyle = {
  fontSize: 16,
  lineHeight: 22,
  textAlignVertical: 'center',
  includeFontPadding: false,
  paddingVertical: 0,
};

export const TEXT_INPUT_LARGE_STYLE: TextStyle = {
  fontSize: 18,
  lineHeight: 24,
  textAlignVertical: 'center',
  includeFontPadding: false,
  paddingVertical: 0,
};
