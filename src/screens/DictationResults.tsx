import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useSession } from "@/state/SessionContext";
import { getDictation } from "@/data/words";
import { scoreDictation, capMissCount } from "@/lib/dictation";
import { theme } from "@/theme/tokens";

export function DictationResults() {
  const router = useRouter();
  const { weekNumber, dictationStatuses, dictationDetails, resetDictation } = useSession();
  const sentences = getDictation(weekNumber);
  const { correct, total, passed } = scoreDictation(dictationStatuses);
  const caps = capMissCount(dictationDetails);

  const headline = passed ? "Super writing!" : correct >= total / 2 ? "Good effort!" : "Keep going!";
  const sub = passed
    ? "You spelled the sentences correctly."
    : caps > 0
      ? "Watch your capital letters and full stops."
      : "Listen carefully and try the tricky sentences again.";

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
        <Text style={styles.scoreCaption}>sentences written correctly</Text>
      </View>

      {caps > 0 && (
        <View style={styles.capChip}>
          <View style={styles.capIcon}><Icon name="type" size={20} color={theme.color.accentLedge} /></View>
          <Text style={styles.capText}>{caps} sentence{caps === 1 ? "" : "s"} just needed a capital letter or full stop.</Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 16 }}>
        <Text style={styles.eyebrow}>YOUR SENTENCES</Text>
        <View style={{ gap: 8 }}>
          {sentences.map((s, i) => {
            const ok = dictationStatuses[i] === "correct";
            const d = dictationDetails[i];
            const capOnly = !!d && !d.exact && d.caseOnly;
            const iconName = ok ? "check" : capOnly ? "type" : "rotate-ccw";
            const tint = ok ? theme.color.successTint : capOnly ? theme.color.accentTint : theme.color.tryAgainTint;
            const fg = ok ? theme.color.successStrong : capOnly ? theme.color.accentLedge : theme.color.tryAgainStrong;
            return (
              <View key={i} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: tint }]}>
                  <Icon name={iconName} size={17} color={fg} />
                </View>
                <Text style={styles.rowText}>{s.text}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" fullWidth onPress={() => { resetDictation(); router.replace("/dictation"); }}
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
  header: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 26, alignItems: "center", backgroundColor: theme.color.brand, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headline: { fontFamily: theme.font.display.bold, fontSize: 32, color: "#fff", marginTop: 6 },
  sub: { fontFamily: theme.font.body.bold, fontSize: 15, color: "rgba(255,255,255,0.9)", textAlign: "center", maxWidth: 290, marginTop: 6 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", marginTop: 18 },
  score: { fontFamily: theme.font.display.bold, fontSize: 56, color: "#fff" },
  scoreMax: { fontFamily: theme.font.display.semibold, fontSize: 26, color: theme.color.gold300 },
  scoreCaption: { fontFamily: theme.font.body.black, fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  capChip: { marginHorizontal: 24, marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.color.accentTint, borderWidth: 2, borderColor: "#FFEFC2", borderRadius: theme.radius.md, paddingVertical: 12, paddingHorizontal: 16 },
  capIcon: { width: 36, height: 36, borderRadius: 999, backgroundColor: "#FFEFC2", alignItems: "center", justifyContent: "center" },
  capText: { flexShrink: 1, fontFamily: theme.font.body.bold, fontSize: 14, color: theme.color.textBody },
  eyebrow: { fontFamily: theme.font.body.black, fontSize: 12, letterSpacing: 1, color: theme.color.textMuted, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border, borderRadius: theme.radius.md, paddingVertical: 10, paddingHorizontal: 14 },
  rowIcon: { width: 30, height: 30, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, fontFamily: theme.font.body.bold, fontSize: 15, color: theme.color.textStrong, lineHeight: 20 },
  footer: { gap: 12, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 30 },
});
