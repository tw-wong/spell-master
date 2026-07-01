import { useState } from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { ProgressDots } from "@/components/ProgressDots";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { TopBar } from "./TopBar";
import { useSession } from "@/state/SessionContext";
import { getDictation } from "@/data/words";
import { gradeSentence, tokens } from "@/lib/dictation";
import { speak } from "@/lib/speech";
import { theme } from "@/theme/tokens";

export function DictationTest() {
  const router = useRouter();
  const {
    weekNumber, dictationIndex, setDictationIndex,
    dictationStatuses, setDictationStatuses, setDictationDetails,
  } = useSession();
  const sentences = getDictation(weekNumber);
  const item = sentences[dictationIndex];
  const target = item.text;
  const last = sentences.length - 1;

  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);

  const grade = gradeSentence(target, answer);
  const typedWords = tokens(answer.trim());

  const check = () => {
    const g = gradeSentence(target, answer);
    const r = g.exact ? "correct" : "wrong";
    setResult(r);
    setDictationStatuses((s) => {
      const n = [...s];
      if (r === "correct") n[dictationIndex] = "correct";
      else if (n[dictationIndex] !== "correct") n[dictationIndex] = "wrong";
      return n;
    });
    setDictationDetails((d) => {
      const n = [...d];
      n[dictationIndex] = { answer, exact: g.exact, caseOnly: g.caseOnly, correctCount: g.correctCount, total: g.total };
      return n;
    });
  };
  const tryAgain = () => { setResult(null); setAnswer(""); };
  const advance = () => {
    if (dictationIndex < last) { setDictationIndex(dictationIndex + 1); setAnswer(""); setResult(null); }
    else router.replace("/dictation/results");
  };

  return (
    <Screen>
      <TopBar mode="test"
        onMode={(m) => { setDictationIndex(0); router.replace(m === "practice" ? "/dictation" : "/dictation/test"); }}
        onBack={() => router.replace("/home")} />

      <View style={styles.body}>
        <ProgressDots statuses={dictationStatuses.map((s, i) => (i === dictationIndex ? "current" : s ?? "upcoming")) as ("current" | "correct" | "wrong" | "upcoming")[]} />

        <View style={styles.listenRow}>
          <IconButton tone="brand" size="md" label="Hear the sentence" onPress={() => speak(target)}>
            <Icon name="volume-2" size={28} color="#fff" />
          </IconButton>
          <Text style={styles.linkBtn} onPress={() => speak(target)}>
            <Icon name="rotate-ccw" size={15} color={theme.color.textMuted} /> Again
          </Text>
          <Text style={styles.linkBtn} onPress={() => speak(target, 0.55)}>
            <Icon name="snail" size={17} color={theme.color.textMuted} /> Slower
          </Text>
        </View>

        <View style={styles.promptRow}>
          <Icon name="pencil" size={15} color={theme.color.textMuted} />
          <Text style={styles.prompt}>Write the sentence you hear</Text>
        </View>

        {result ? (
          <View style={{ width: "100%" }}>
            <Text style={styles.eyebrowMuted}>YOU WROTE</Text>
            <View style={styles.wroteBox}>
              {grade.words.map((w, i) => (
                <View key={i} style={[styles.chip, { backgroundColor: w.ok ? theme.color.successTint : theme.color.tryAgainTint }]}>
                  <Text style={[styles.chipText, { color: w.ok ? theme.color.successStrong : theme.color.tryAgainStrong, textDecorationLine: w.ok ? "none" : "underline", textDecorationColor: theme.color.tryAgain }]}>
                    {w.typed || "—"}
                  </Text>
                </View>
              ))}
            </View>
            {result === "wrong" && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.eyebrowGreen}>THE SENTENCE IS</Text>
                <View style={styles.answerBox}>
                  {grade.words.map((w, i) => (
                    <View key={i} style={[styles.answerChip, !w.ok && { backgroundColor: "rgba(22,185,120,0.16)" }]}>
                      <Text style={styles.answerText}>{w.target}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            multiline
            placeholder="Tap here and start writing…"
            placeholderTextColor={theme.color.textDisabled}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            style={styles.input}
          />
        )}

        {result === "correct" && (
          <FeedbackBanner status="correct" title="Perfect sentence!" message="Capital letter and full stop — all correct."
            icon={<Icon name="party-popper" size={26} color={theme.color.successStrong} />} />
        )}
        {result === "wrong" && grade.caseOnly && (
          <FeedbackBanner status="hint" title="So close!" message="Check your capital letters and punctuation."
            icon={<Icon name="type" size={24} color={theme.color.accentLedge} />} />
        )}
        {result === "wrong" && !grade.caseOnly && (
          <FeedbackBanner status="try-again" title={`${grade.correctCount} of ${grade.total} words right`} message="Listen again and fix the underlined words."
            icon={<Icon name="rotate-ccw" size={24} color={theme.color.tryAgainStrong} />} />
        )}

        {!result && (
          <Text style={styles.counter}>{typedWords.length} word{typedWords.length === 1 ? "" : "s"} written</Text>
        )}
      </View>

      <View style={styles.actions}>
        {result ? (
          <>
            {result === "wrong" && (
              <IconButton tone="soft" label="Try again" onPress={tryAgain}>
                <Icon name="rotate-ccw" size={22} color={theme.color.brand} />
              </IconButton>
            )}
            <View style={{ flex: 1 }}>
              <Button variant="primary" size="lg" fullWidth onPress={advance} iconRight={<Icon name="arrow-right" size={22} color="#fff" />}>
                {dictationIndex < last ? "Next sentence" : "Finish"}
              </Button>
            </View>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <Button variant="success" size="lg" fullWidth onPress={check} disabled={answer.trim().length === 0}>
              Check it
            </Button>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", paddingHorizontal: 22, gap: 12, paddingTop: 4 },
  listenRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  linkBtn: { fontFamily: theme.font.body.black, fontSize: 14, color: theme.color.textMuted },
  promptRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  prompt: { fontFamily: theme.font.body.bold, fontSize: 14, color: theme.color.textMuted },
  input: {
    width: "100%", minHeight: 118, borderWidth: 2, borderColor: theme.color.border, borderRadius: theme.radius.lg,
    paddingHorizontal: 18, paddingVertical: 14, textAlignVertical: "top",
    fontFamily: theme.font.body.bold, fontSize: 21, lineHeight: 32, color: theme.color.textStrong, backgroundColor: theme.color.card,
  },
  eyebrowMuted: { fontFamily: theme.font.body.black, fontSize: 11, letterSpacing: 1, color: theme.color.textMuted, marginBottom: 6 },
  eyebrowGreen: { fontFamily: theme.font.body.black, fontSize: 11, letterSpacing: 1, color: theme.color.successStrong, marginBottom: 6 },
  wroteBox: { flexDirection: "row", flexWrap: "wrap", gap: 8, backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border, borderRadius: theme.radius.lg, padding: 14 },
  chip: { borderRadius: 8, paddingVertical: 2, paddingHorizontal: 8 },
  chipText: { fontFamily: theme.font.body.black, fontSize: 20 },
  answerBox: { flexDirection: "row", flexWrap: "wrap", gap: 8, backgroundColor: theme.color.successTint, borderWidth: 2, borderColor: "#C2F1DD", borderRadius: theme.radius.lg, padding: 14 },
  answerChip: { borderRadius: 6, paddingVertical: 1, paddingHorizontal: 5 },
  answerText: { fontFamily: theme.font.display.semibold, fontSize: 20, color: theme.color.successStrong },
  counter: { fontFamily: theme.font.body.bold, fontSize: 13, color: theme.color.textMuted },
  actions: { flexDirection: "row", gap: 12, alignItems: "center", paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30 },
});
