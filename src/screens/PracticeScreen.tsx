import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { TopBar } from "./TopBar";
import { useSession } from "@/state/SessionContext";
import { speak } from "@/lib/speech";
import { theme } from "@/theme/tokens";

export function PracticeScreen() {
  const router = useRouter();
  const { week, index, setIndex } = useSession();
  const item = week.words[index];
  const last = week.words.length - 1;

  return (
    <Screen>
      <TopBar mode="practice" onMode={(m) => { setIndex(0); router.replace(m === "test" ? "/test" : "/practice"); }}
        onBack={() => router.replace("/home")} />

      <View style={styles.body}>
        <Badge tone="brand">Word {index + 1} of {week.words.length}</Badge>
        <Text style={styles.hint}>Tap to hear it</Text>
        <IconButton tone="brand" size="lg" label={`Listen to ${item.word}`} onPress={() => speak(item.word)}
          style={{ width: 120, height: 120, marginVertical: 8 }}>
          <Icon name="volume-2" size={52} color="#fff" />
        </IconButton>
        <Text style={styles.word}>{item.word}</Text>
        <Card tone="tint" pad="md" elevation="none" style={styles.sentence}>
          <Pressable onPress={() => speak(item.sentence)} accessibilityLabel="Hear the sentence" style={styles.playBtn}>
            <Icon name="play" size={20} color={theme.color.brand} />
          </Pressable>
          <Text style={styles.sentenceText}>{item.sentence}</Text>
        </Card>
      </View>

      <View style={styles.nav}>
        <IconButton tone="soft" label="Previous word" disabled={index === 0} onPress={() => setIndex(Math.max(0, index - 1))}>
          <Icon name="chevron-left" size={26} color={theme.color.brand} />
        </IconButton>
        <View style={{ flexDirection: "row", gap: 7 }}>
          {week.words.map((_, i) => (
            <View key={i} style={{ width: i === index ? 12 : 9, height: i === index ? 12 : 9, borderRadius: 999,
              backgroundColor: i === index ? theme.color.brand : theme.color.border }} />
          ))}
        </View>
        <IconButton tone="soft" label="Next word" disabled={index === last} onPress={() => setIndex(Math.min(last, index + 1))}>
          <Icon name="chevron-right" size={26} color={theme.color.brand} />
        </IconButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 8 },
  hint: { fontFamily: theme.font.body.bold, fontSize: 15, color: theme.color.textMuted, marginTop: 6 },
  word: { fontFamily: theme.font.display.bold, fontSize: theme.text.word, color: theme.color.textStrong, letterSpacing: theme.tracking.word, textAlign: "center" },
  sentence: { marginTop: 14, width: "100%", flexDirection: "row", alignItems: "center", gap: 12 },
  playBtn: { width: 40, height: 40, borderRadius: 999, backgroundColor: "#E7DEFF", alignItems: "center", justifyContent: "center" },
  sentenceText: { flex: 1, fontFamily: theme.font.body.semibold, fontSize: 15, color: theme.color.textBody },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 30 },
});
