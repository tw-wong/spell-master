import { View, StyleSheet } from "react-native";
import { theme } from "@/theme/tokens";

export function ProgressBar({
  value, max, tone = "gold", height = 10,
}: { value: number; max: number; tone?: "gold" | "brand"; height?: number }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const fill = tone === "gold" ? theme.color.accent : theme.color.brand;
  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <View style={{ width: `${pct * 100}%`, backgroundColor: fill, height, borderRadius: height }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: "rgba(255,255,255,0.28)", overflow: "hidden", width: "100%" },
});
