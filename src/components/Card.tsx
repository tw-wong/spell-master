import { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { theme } from "@/theme/tokens";

export function Card({
  tone = "paper", elevation = "sm", pad = "lg", style, children,
}: {
  tone?: "paper" | "brand" | "tint"; elevation?: "none" | "sm" | "lg";
  pad?: "md" | "lg"; style?: ViewStyle; children: ReactNode;
}) {
  const bg =
    tone === "brand" ? theme.color.brand : tone === "tint" ? theme.color.tint : theme.color.card;
  const border = tone === "brand" ? "transparent" : theme.color.border;
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, borderColor: border, padding: pad === "lg" ? theme.space[5] : theme.space[4] },
        elevation !== "none" && theme.shadow(elevation === "lg" ? "lg" : "sm"),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: theme.radius.lg, borderWidth: 2 },
});
