import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";
import { Icon } from "@/components/Icon";
import { useSession } from "@/state/SessionContext";
import { scoreWeek } from "@/lib/score";
import { theme } from "@/theme/tokens";

export function HomeScreen() {
  const router = useRouter();
  const { week, statuses } = useSession();
  const { correct, total } = scoreWeek(statuses);

  return (
    <Screen style={{ paddingHorizontal: 24, paddingBottom: 28, paddingTop: 8 }}>
      <View style={styles.header}>
        <Logo size={44} />
        <Text style={styles.brand}>Spell Master</Text>
      </View>
      <Text style={styles.hello}>Hello! Ready to practise?</Text>

      <Card tone="brand" elevation="lg" style={{ marginTop: 16 }}>
        <View style={styles.cardTop}>
          <Badge tone="solid">This week</Badge>
          <Pressable onPress={() => router.push("/weeks")} style={styles.weekChip}>
            <Text style={styles.weekChipText}>Week {week.week}</Text>
            <Icon name="chevron-down" size={16} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.theme}>{week.theme}</Text>
        <View style={styles.progressRow}>
          <Text style={styles.learned}>{correct}/{total} learned</Text>
          <View style={{ flex: 1 }}>
            <ProgressBar value={correct} max={total} tone="gold" height={10} />
          </View>
        </View>
      </Card>

      <View style={{ flex: 1 }} />

      <View style={{ gap: 14 }}>
        <Button variant="primary" size="lg" fullWidth onPress={() => router.push("/practice")}
          icon={<Icon name="volume-2" size={26} color="#fff" />}>
          Practise words
        </Button>
        <Button variant="success" size="lg" fullWidth onPress={() => router.push("/test")}
          icon={<Icon name="pencil" size={24} color="#fff" />}>
          Take the test
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  brand: { fontFamily: theme.font.display.bold, fontSize: 24, color: theme.color.textStrong },
  hello: { fontFamily: theme.font.body.bold, fontSize: 16, color: theme.color.textMuted },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  weekChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12,
  },
  weekChipText: { fontFamily: theme.font.body.black, fontSize: 13, color: "#fff" },
  theme: { fontFamily: theme.font.display.bold, fontSize: 30, color: "#fff", lineHeight: 32 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  learned: { fontFamily: theme.font.body.black, fontSize: 13, color: theme.color.gold300 },
});
