import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useSession } from "@/state/SessionContext";
import { theme } from "@/theme/tokens";

export function WelcomeScreen() {
  const router = useRouter();
  const { week } = useSession();
  return (
    <Screen style={{ paddingHorizontal: 28, paddingBottom: 30 }}>
      <View style={styles.hero}>
        <Logo size={116} />
        <Text style={styles.title}>Spell Master</Text>
        <Text style={styles.tag}>Hear it, practise it, spell it. Let's learn this week's words!</Text>
        <View style={styles.chip}>
          <Icon name="calendar-days" size={18} color={theme.color.brand} />
          <Text style={styles.chipText}>Week {week.week} · {week.theme}</Text>
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <Button variant="primary" size="lg" fullWidth onPress={() => router.push("/practice")}
          iconRight={<Icon name="arrow-right" size={24} color="#fff" />}>
          Let's practise!
        </Button>
        <Button variant="ghost" size="md" fullWidth onPress={() => router.push("/weeks")}>
          Choose a different week
        </Button>
      </View>
      <Text style={styles.foot}>For grown-ups: works offline · no account needed</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  title: { fontFamily: theme.font.display.bold, fontSize: 44, color: theme.color.textStrong, marginTop: 18 },
  tag: { fontFamily: theme.font.body.bold, fontSize: 17, color: theme.color.textMuted, textAlign: "center", maxWidth: 260 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6,
    backgroundColor: theme.color.card, borderWidth: 2, borderColor: theme.color.border,
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16,
  },
  chipText: { fontFamily: theme.font.body.black, fontSize: 14, color: theme.color.textStrong },
  foot: { textAlign: "center", marginTop: 14, fontFamily: theme.font.body.semibold, fontSize: 12, color: theme.color.textMuted },
});
