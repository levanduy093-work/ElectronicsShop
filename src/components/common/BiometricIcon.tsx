import { Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppIcon } from './Icon';

interface BiometricIconProps {
    type: 'FaceID' | 'TouchID' | 'Biometrics' | string | null;
    size?: number;
    color?: string;
}

/**
 * Face ID icon matching Apple's design
 */
function FaceIDIcon({ size = 24, color = '#000' }: { size?: number; color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            {/* Top-left corner */}
            <Path
                d="M4 8V6C4 4.89543 4.89543 4 6 4H8"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
            />
            {/* Top-right corner */}
            <Path
                d="M16 4H18C19.1046 4 20 4.89543 20 6V8"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
            />
            {/* Bottom-left corner */}
            <Path
                d="M4 16V18C4 19.1046 4.89543 20 6 20H8"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
            />
            {/* Bottom-right corner */}
            <Path
                d="M16 20H18C19.1046 20 20 19.1046 20 18V16"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
            />
            {/* Left eye */}
            <Path
                d="M8.5 9V10.5"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
            />
            {/* Right eye */}
            <Path
                d="M15.5 9V10.5"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
            />
            {/* Nose */}
            <Path
                d="M12 10V13H13"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Mouth */}
            <Path
                d="M8.5 15.5C8.5 15.5 9.5 17 12 17C14.5 17 15.5 15.5 15.5 15.5"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
            />
        </Svg>
    );
}

/**
 * Biometric icon component that shows the appropriate icon for the biometric type
 * - FaceID: Apple-style Face ID icon (iOS only)
 * - TouchID/Biometrics: Fingerprint icon
 */
export function BiometricIcon({ type, size = 24, color = '#000' }: BiometricIconProps) {
    // While sensor type is unresolved, show neutral security icon to avoid UI flicker.
    if (!type || type === 'Unknown' || type === 'None') {
        return <AppIcon name="shield" size={size} color={color} />;
    }

    // Use Face ID icon for FaceID on iOS
    if (type === 'FaceID' && Platform.OS === 'ios') {
        return <FaceIDIcon size={size} color={color} />;
    }

    // Use fingerprint icon for all other cases
    return <AppIcon name="fingerprint" size={size} color={color} />;
}
