import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { TopBar } from "./TopBar";
import { useSession } from "@/state/SessionContext";
import { getDictation } from "@/data/words";
import { tokens } from "@/lib/dictation";
import { speak } from "@/lib/speech";
import { theme } from "@/theme/tokens";

export function DictationPractice() {
  const router = useRouter();
  const { weekNumber, dictationIndex, setDictationIndex } = useSession();
  const sentences = getDictation(weekNumber);
  const item = sentences[dictationIndex];
  const last = sentences.length - 1;

  return (
    <Screen>
      <TopBar mode="practice"
        onMode={(m) => { setDictationIndex(0); router.replace(m === "test" ? "/dictation/test" : "/dictation"); }}
        onBack={() => router.replace("/home")} />

      <View style={styles.body}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Badge tone="brand" icon={<Icon name="ear" size={14} color={theme.color.brand} />}>Dictation</Badge>
          <Badge tone="neutral">Sentence {dictationIndex + 1} of {sentences.length}</Badge>
        </View>

        <Text style={styles.lead}>Listen, then tap any word to hear it</Text>

        <IconButton tone="brand" size="lg" label="Listen to the sentence" onPress={() => speak(item.text)}
          style={{ width: 104, height: 104, marginVertical: 4 }}>
          <Icon name="volume-2" size={46} color="#fff" />
        </IconButton>

        <Card tone="paper" elevation="sm" style={{ width: "100%" }}>
          <View style={styles.sentence}>
            {tokens(item.text).map((w, i) => (
              <Pressable key={i} onPress={() => speak(w.replace(/[^A-Za-z']/g, ""))}
                style={({ pressed }) => [styles.wordChip, pressed && { backgroundColor: theme.color.tint }]}>
                <Text style={styles.word}>{w}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable onPress={() => speak(item.text)} style={styles.pill}>
            <Icon name="rotate-ccw" size={17} color={theme.color.brand} />
            <Text style={styles.pillText}>Play again</Text>
          </Pressable>
          <Pressable onPress={() => speak(item.text, 0.55)} style={styles.pill}>
            <Icon name="snail" size={18} color={theme.color.brand} />
            <Text style={styles.pillText}>Slower</Text>
          </Pressable>
        </View>

        <View style={styles.focus}>
          <Icon name="lightbulb" size={18} color={theme.color.accentLedge} />
          <Text style={styles.focusText}>{item.focus}</Text>
        </View>
      </View>

      <View style={styles.nav}>
        <IconButton tone="soft" label="Previous sentence" disabled={dictationIndex === 0} onPress={() => setDictationIndex(Math.max(0, dictationIndex - 1))}>
          <Icon name="chevron-left" size={26} color={theme.color.brand} />
        </IconButton>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {sentences.map((_, i) => (
            <View key={i} style={{ width: i === dictationIndex ? 12 : 9, height: i === dictationIndex ? 12 : 9, borderRadius: 999, backgroundColor: i === dictationIndex ? theme.color.brand : theme.color.border }} />
          ))}
        </View>
        <IconButton tone="soft" label="Next sentence" disabled={dictationIndex === last} onPress={() => setDictationIndex(Math.min(last, dictationIndex + 1))}>
          <Icon name="chevron-right" size={26} color={theme.color.brand} />
        </IconButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 12 },
  lead: { fontFamily: theme.font.body.bold, fontSize: 15, color: theme.color.textMuted, marginTop: 4 },
  sentence: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", alignItems: "center" },
  wordChip: { paddingVertical: 2, paddingHorizontal: 4, borderRadius: 8 },
  word: { fontFamily: theme.font.display.semibold, fontSize: 30, color: theme.color.textStrong },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, height: 44, paddingHorizontal: 16, borderWidth: 2, borderColor: theme.color.border, backgroundColor: theme.color.card, borderRadius: 999 },
  pillText: { fontFamily: theme.font.body.black, fontSize: 14, color: theme.color.textBody },
  focus: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: theme.color.accentTint, borderWidth: 2, borderColor: "#FFEFC2", borderRadius: theme.radius.md, paddingVertical: 10, paddingHorizontal: 14, marginTop: 2 },
  focusText: { flexShrink: 1, fontFamily: theme.font.body.bold, fontSize: 13.5, color: theme.color.textBody },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 30 },
});
