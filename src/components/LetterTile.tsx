import { Pressable, Text, StyleSheet } from "react-native";
import { theme } from "@/theme/tokens";

export function LetterTile({ letter, used, onPress }: { letter: string; used?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={used}
      style={({ pressed }) => [
        styles.tile,
        used ? styles.used : styles.live,
        pressed && !used && { transform: [{ translateY: 2 }] },
      ]}
    >
      <Text style={[styles.ch, { color: used ? theme.color.textDisabled : theme.color.brand }]}>{letter}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: theme.tap.tile, height: theme.tap.tile, borderRadius: theme.radius.pill,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
  },
  live: { backgroundColor: theme.color.card, borderColor: theme.color.border, ...theme.shadow("sm") },
  used: { backgroundColor: theme.color.sunken, borderColor: theme.color.sunken },
  ch: { fontFamily: theme.font.display.bold, fontSize: 24 },
});
