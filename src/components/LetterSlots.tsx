import { Text, View, StyleSheet } from "react-native";
import { theme } from "@/theme/tokens";

const BORDER = {
  active: theme.color.brand,
  correct: theme.color.success,
  wrong: theme.color.tryAgain,
} as const;

export function LetterSlots({
  value, length, state,
}: { value: string; length: number; state: keyof typeof BORDER }) {
  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const ch = value[i] ?? "";
        const filled = i < value.length;
        return (
          <View
            key={i}
            style={[
              styles.slot,
              { borderColor: filled ? BORDER[state] : theme.color.border,
                backgroundColor: filled ? theme.color.card : theme.color.sunken },
            ]}
          >
            <Text style={styles.ch}>{ch}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "center" },
  slot: {
    width: 38, height: 48, borderRadius: theme.radius.md, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  ch: { fontFamily: theme.font.display.semibold, fontSize: 26, color: theme.color.textStrong },
});
