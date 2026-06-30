import { ReactNode } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { theme } from "@/theme/tokens";

type Variant = "primary" | "success" | "secondary" | "ghost";
const RAISED: Record<"primary" | "success", { face: string; ledge: string }> = {
  primary: { face: theme.color.brand, ledge: theme.color.brandLedge },
  success: { face: theme.color.success, ledge: theme.color.successLedge },
};

export function Button({
  variant, size = "md", fullWidth, onPress, disabled, icon, iconRight, children,
}: {
  variant: Variant; size?: "lg" | "md"; fullWidth?: boolean; onPress?: () => void;
  disabled?: boolean; icon?: ReactNode; iconRight?: ReactNode; children: ReactNode;
}) {
  const h = size === "lg" ? theme.tap.large : theme.tap.min;
  const raised = variant === "primary" || variant === "success";
  const textColor =
    variant === "secondary" ? theme.color.brand : variant === "ghost" ? theme.color.textMuted : "#fff";
  const fontSize = size === "lg" ? 20 : 18;

  const label = (
    <View style={styles.row}>
      {icon ? <View style={styles.slot}>{icon}</View> : null}
      <Text style={[styles.text, { color: textColor, fontSize }]}>{children}</Text>
      {iconRight ? <View style={styles.slot}>{iconRight}</View> : null}
    </View>
  );

  if (!raised) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.flat,
          { height: h, alignSelf: fullWidth ? "stretch" : "auto" },
          variant === "secondary" && styles.secondary,
          variant === "ghost" && styles.ghost,
          pressed && { opacity: 0.85 },
          disabled && { opacity: 0.5 },
        ]}
      >
        {label}
      </Pressable>
    );
  }

  const v = RAISED[variant];
  return (
    <View style={[styles.shell, { height: h + 6, alignSelf: fullWidth ? "stretch" : "auto" }]}>
      <View style={[styles.ledge, { height: h, backgroundColor: v.ledge }]} />
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.face,
          { height: h, backgroundColor: v.face, top: pressed ? 4 : 0 },
          disabled && { opacity: 0.5 },
        ]}
      >
        {label}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { position: "relative", borderRadius: theme.radius.pill },
  ledge: { position: "absolute", left: 0, right: 0, top: 6, borderRadius: theme.radius.pill },
  face: {
    position: "absolute", left: 0, right: 0, borderRadius: theme.radius.pill,
    alignItems: "center", justifyContent: "center", paddingHorizontal: theme.space[6],
  },
  flat: {
    borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center",
    paddingHorizontal: theme.space[6], flexDirection: "row",
  },
  secondary: { backgroundColor: theme.color.brandTint, borderWidth: 2, borderColor: theme.color.border },
  ghost: { backgroundColor: "transparent" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  slot: { alignItems: "center", justifyContent: "center" },
  text: { fontFamily: theme.font.display.semibold },
});
