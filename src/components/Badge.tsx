import { ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";
import { theme } from "@/theme/tokens";

export function Badge({
  tone = "brand", color, bg, icon, children,
}: {
  tone?: "brand" | "success" | "solid" | "neutral";
  color?: string; bg?: string; icon?: ReactNode; children: ReactNode;
}) {
  const presets = {
    brand: { bg: theme.color.brandTint, fg: theme.color.brand },
    success: { bg: theme.color.successTint, fg: theme.color.successStrong },
    solid: { bg: "rgba(255,255,255,0.22)", fg: "#fff" },
    neutral: { bg: theme.color.sunken, fg: theme.color.textBody },
  }[tone];
  return (
    <View style={[styles.base, { backgroundColor: bg ?? presets.bg }]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.text, { color: color ?? presets.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
    borderRadius: theme.radius.pill, paddingVertical: 6, paddingHorizontal: 12,
  },
  icon: { alignItems: "center", justifyContent: "center" },
  text: { fontFamily: theme.font.body.black, fontSize: 13 },
});
