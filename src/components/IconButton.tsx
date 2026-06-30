import { ReactNode } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { theme } from "@/theme/tokens";

export function IconButton({
  tone, size = "md", onPress, disabled, label, children, style,
}: {
  tone: "brand" | "soft"; size?: "lg" | "md"; onPress?: () => void; disabled?: boolean;
  label: string; children: ReactNode; style?: ViewStyle;
}) {
  const d = size === "lg" ? 64 : 56;
  const brand = tone === "brand";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { width: d, height: d, borderRadius: theme.radius.pill },
        brand
          ? { backgroundColor: theme.color.brand }
          : { backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border },
        pressed && { transform: [{ translateY: 2 }] },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
});
