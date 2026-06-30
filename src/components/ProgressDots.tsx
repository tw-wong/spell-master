import { View } from "react-native";
import { theme } from "@/theme/tokens";

const COLORS = {
  current: theme.color.brand,
  correct: theme.color.success,
  wrong: theme.color.tryAgain,
  upcoming: theme.color.border,
} as const;

export function ProgressDots({ statuses }: { statuses: (keyof typeof COLORS)[] }) {
  return (
    <View style={{ flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" }}>
      {statuses.map((s, i) => {
        const big = s === "current";
        const d = big ? 12 : 9;
        return <View key={i} style={{ width: d, height: d, borderRadius: 999, backgroundColor: COLORS[s] }} />;
      })}
    </View>
  );
}
