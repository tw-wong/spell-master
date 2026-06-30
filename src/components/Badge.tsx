import { ReactNode } from "react";
import { Text, View, StyleSheet } from "react-native";
import { theme } from "@/theme/tokens";

export function Badge({
  tone = "brand", color, bg, children,
}: { tone?: "brand" | "success" | "solid"; color?: string; bg?: string; children: ReactNode }) {
  const presets = {
    brand: { bg: theme.color.brandTint, fg: theme.color.brand },
    success: { bg: theme.color.successTint, fg: theme.color.successStrong },
    solid: { bg: "rgba(255,255,255,0.22)", fg: "#fff" },
  }[tone];
  return (
    <View style={[styles.base, { backgroundColor: bg ?? presets.bg }]}>
      <Text style={[styles.text, { color: color ?? presets.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignSelf: "flex-start", borderRadius: theme.radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  text: { fontFamily: theme.font.body.black, fontSize: 13 },
});
