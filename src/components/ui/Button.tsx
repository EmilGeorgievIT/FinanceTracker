import { TouchableOpacity, Text, StyleSheet, type TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ title, variant = 'primary', style, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], style]}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={[styles.text, variant === 'secondary' ? styles.textSecondary : styles.textLight]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: '#4A90D9' },
  secondary: { backgroundColor: '#e9ecef' },
  danger: { backgroundColor: '#e74c3c' },
  text: { fontSize: 15, fontWeight: '600' },
  textLight: { color: '#fff' },
  textSecondary: { color: '#333' },
});
