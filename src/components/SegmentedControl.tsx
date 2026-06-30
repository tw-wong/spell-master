import { Pressable, Text, View, StyleSheet } from "react-native";
import { theme } from "@/theme/tokens";

export function SegmentedControl({
  options, value, onChange,
}: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.track}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.seg, active && styles.segActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, { color: active ? "#fff" : theme.color.textMuted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row", backgroundColor: theme.color.sunken,
    borderRadius: theme.radius.pill, padding: 4,
  },
  seg: { flex: 1, height: 44, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center" },
  segActive: { backgroundColor: theme.color.brand, ...theme.shadow("sm") },
  label: { fontFamily: theme.font.display.semibold, fontSize: 16 },
});
