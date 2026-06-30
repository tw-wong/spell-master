import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useSession } from "@/state/SessionContext";
import { scoreWeek } from "@/lib/score";
import { theme } from "@/theme/tokens";

export function ResultsScreen() {
  const router = useRouter();
  const { week, statuses, setIndex } = useSession();
  const { correct, total, passed } = scoreWeek(statuses);
  const headline = passed ? "Brilliant work!" : correct >= total / 2 ? "Good effort!" : "Keep going!";
  const sub = passed
    ? "You've mastered this week's words."
    : "Practise the tricky ones and try again — you're getting there.";

  return (
    <Screen style={{ maxWidth: theme.contentMax }}>
      <View style={styles.header}>
        <Icon name={passed ? "party-popper" : "thumbs-up"} size={40} color={theme.color.gold300} />
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.sub}>{sub}</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{correct}</Text>
          <Text style={styles.scoreMax}> / {total}</Text>
        </View>
        <Text style={styles.scoreCaption}>words spelled correctly</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>THIS WEEK'S WORDS</Text>
        <View style={{ gap: 8 }}>
          {week.words.map((w, i) => {
            const ok = statuses[i] === "correct";
            return (
              <View key={i} style={styles.wordRow}>
                <View style={[styles.wordIcon, { backgroundColor: ok ? theme.color.successTint : theme.color.tryAgainTint }]}>
                  <Icon name={ok ? "check" : "rotate-ccw"} size={18} color={ok ? theme.color.successStrong : theme.color.tryAgainStrong} />
                </View>
                <Text style={styles.wordText}>{w.word}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button variant="primary" size="lg" fullWidth onPress={() => { setIndex(0); router.replace("/practice"); }}
          icon={<Icon name="rotate-ccw" size={22} color="#fff" />}>
          Practise again
        </Button>
        <Button variant="secondary" size="md" fullWidth onPress={() => router.replace("/home")}>
          Back home
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24, paddingTop: 18, paddingBottom: 26, alignItems: "center",
    backgroundColor: theme.color.brand, borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headline: { fontFamily: theme.font.display.bold, fontSize: 32, color: "#fff", marginTop: 6 },
  sub: { fontFamily: theme.font.body.bold, fontSize: 15, color: "rgba(255,255,255,0.9)", textAlign: "center", maxWidth: 280, marginTop: 6 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", marginTop: 18 },
  score: { fontFamily: theme.font.display.bold, fontSize: 56, color: "#fff" },
  scoreMax: { fontFamily: theme.font.display.semibold, fontSize: 26, color: theme.color.gold300 },
  scoreCaption: { fontFamily: theme.font.body.black, fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  eyebrow: { fontFamily: theme.font.body.black, fontSize: 12, letterSpacing: 1, color: theme.color.textMuted, marginBottom: 10 },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border, borderRadius: theme.radius.md, paddingVertical: 10, paddingHorizontal: 14 },
  wordIcon: { width: 30, height: 30, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  wordText: { fontFamily: theme.font.display.semibold, fontSize: 19, color: theme.color.textStrong, letterSpacing: 0.4 },
  actions: { gap: 12, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 30 },
});
