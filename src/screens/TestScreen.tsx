import { useEffect, useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";
import { ProgressDots } from "@/components/ProgressDots";
import { LetterSlots } from "@/components/LetterSlots";
import { LetterTile } from "@/components/LetterTile";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { TopBar } from "./TopBar";
import { useSession } from "@/state/SessionContext";
import { speak } from "@/lib/speech";
import { buildTileBank } from "@/lib/tiles";
import { theme } from "@/theme/tokens";

export function TestScreen() {
  const router = useRouter();
  const { week, index, setIndex, statuses, setStatuses } = useSession();
  const target = week.words[index].word;
  const last = week.words.length - 1;

  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [tiles, setTiles] = useState<string[]>([]);
  const [usedIdx, setUsedIdx] = useState<number[]>([]);

  useEffect(() => {
    setTiles(buildTileBank(target));
    setAnswer(""); setAttempts(0); setResult(null); setUsedIdx([]);
    speak(target);
  }, [index, target]);

  const showHint = attempts >= 2 && result !== "correct";

  const tapTile = (ch: string, i: number) => {
    if (result === "correct" || answer.length >= target.length) return;
    setAnswer((a) => a + ch);
    setUsedIdx((u) => [...u, i]);
    setResult(null);
  };
  const backspace = () => {
    if (!answer) return;
    setAnswer((a) => a.slice(0, -1));
    setUsedIdx((u) => u.slice(0, -1));
    setResult(null);
  };
  const check = () => {
    if (answer.toLowerCase() === target.toLowerCase()) {
      setResult("correct");
      setStatuses((s) => { const n = [...s]; n[index] = "correct"; return n; });
    } else {
      setResult("wrong");
      setAttempts((a) => a + 1);
      setStatuses((s) => { const n = [...s]; if (n[index] !== "correct") n[index] = "wrong"; return n; });
    }
  };
  const advance = () => {
    if (index < last) setIndex(index + 1);
    else router.replace("/results");
  };

  const slotState = result === "correct" ? "correct" : result === "wrong" ? "wrong" : "active";
  const dotStatuses = statuses.map((s, i) => (i === index ? "current" : s ?? "upcoming")) as
    ("current" | "correct" | "wrong" | "upcoming")[];

  return (
    <Screen>
      <TopBar mode="test" onMode={(m) => { setIndex(0); router.replace(m === "practice" ? "/practice" : "/test"); }}
        onBack={() => router.replace("/home")} />

      <View style={styles.body}>
        <ProgressDots statuses={dotStatuses} />

        <View style={styles.listenRow}>
          <IconButton tone="brand" size="md" label="Hear the word" onPress={() => speak(target)}>
            <Icon name="volume-2" size={28} color="#fff" />
          </IconButton>
          <Pressable onPress={() => speak(target)} style={styles.playAgain}>
            <Icon name="rotate-ccw" size={16} color={theme.color.textMuted} />
            <Text style={styles.playAgainText}>Play again</Text>
          </Pressable>
        </View>
        <Text style={styles.prompt}>Spell the word you hear</Text>

        <LetterSlots value={answer} length={target.length} state={slotState} />

        {result === "correct" && (
          <FeedbackBanner status="correct" icon={<Icon name="party-popper" size={26} color={theme.color.successStrong} />} />
        )}
        {result === "wrong" && !showHint && (
          <FeedbackBanner status="try-again" message="Not quite — listen again and retry."
            icon={<Icon name="rotate-ccw" size={24} color={theme.color.tryAgainStrong} />} />
        )}
        {showHint && (
          <FeedbackBanner status="hint" title={`Starts with “${target[0]}”`}
            message={`${target.length} letters:  ${target[0]}${" _".repeat(target.length - 1)}`}
            icon={<Icon name="lightbulb" size={24} color="#D5871A" />} />
        )}

        <View style={{ flex: 1 }} />

        <View style={styles.bank}>
          {tiles.map((ch, i) => (
            <LetterTile key={i} letter={ch} used={usedIdx.includes(i)} onPress={() => tapTile(ch, i)} />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <IconButton tone="soft" label="Delete a letter" onPress={backspace} disabled={!answer || result === "correct"}>
          <Icon name="delete" size={24} color={theme.color.brand} />
        </IconButton>
        {result === "correct" ? (
          <Button variant="primary" size="md" fullWidth onPress={advance}
            iconRight={<Icon name="arrow-right" size={22} color="#fff" />}>
            {index < last ? "Next word" : "All done!"}
          </Button>
        ) : (
          <Button variant="success" size="md" fullWidth onPress={check} disabled={answer.length === 0}>
            Check it
          </Button>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", paddingHorizontal: 22, gap: 12, paddingTop: 4 },
  listenRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  playAgain: { flexDirection: "row", alignItems: "center", gap: 5 },
  playAgainText: { fontFamily: theme.font.body.black, fontSize: 15, color: theme.color.textMuted },
  prompt: { fontFamily: theme.font.body.bold, fontSize: 14, color: theme.color.textMuted },
  bank: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 320 },
  actions: { flexDirection: "row", gap: 12, alignItems: "center", paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30 },
});
