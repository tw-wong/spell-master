import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Icon } from "@/components/Icon";
import { useSession } from "@/state/SessionContext";
import { weeks, currentWeekNumber } from "@/data/words";
import { theme } from "@/theme/tokens";

export function WeekPicker() {
  const router = useRouter();
  const { weekNumber, setWeekNumber } = useSession();
  const select = (w: number) => { setWeekNumber(w); router.replace("/home"); };

  return (
    <Screen style={{ paddingHorizontal: 22, paddingBottom: 24, paddingTop: 8 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/home")} accessibilityLabel="Close" style={styles.close}>
          <Icon name="x" size={24} color={theme.color.brand} />
        </Pressable>
        <Text style={styles.title}>Spelling weeks</Text>
      </View>
      <Text style={styles.subtitle}>Catch up on a missed week or look ahead.</Text>

      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
        {weeks.map((w) => {
          const isCurrent = w.week === currentWeekNumber;
          const isSelected = w.week === weekNumber;
          return (
            <Pressable key={w.week} onPress={() => select(w.week)}>
              <Card tone={isSelected ? "tint" : "paper"} elevation={isSelected ? "none" : "sm"} pad="md"
                style={{ borderColor: isSelected ? theme.color.brand : theme.color.border, flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={[styles.num, { backgroundColor: isSelected ? theme.color.brand : theme.color.brandTint }]}>
                  <Text style={[styles.numText, { color: isSelected ? "#fff" : theme.color.brand }]}>{w.week}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.weekTheme}>{w.theme}</Text>
                  <Text style={styles.weekCount}>{w.words.length} words</Text>
                </View>
                {isCurrent && <Badge tone="success">This week</Badge>}
                {isSelected && !isCurrent && <Icon name="check" size={22} color={theme.color.brand} />}
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  close: { width: 44, height: 44, borderRadius: 999, borderWidth: 2, borderColor: theme.color.border, backgroundColor: theme.color.card, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: theme.font.display.bold, fontSize: 24, color: theme.color.textStrong },
  subtitle: { fontFamily: theme.font.body.semibold, fontSize: 14, color: theme.color.textMuted, marginBottom: 14 },
  num: { width: 48, height: 48, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center" },
  numText: { fontFamily: theme.font.display.bold, fontSize: 18 },
  weekTheme: { fontFamily: theme.font.display.semibold, fontSize: 18, color: theme.color.textStrong },
  weekCount: { fontFamily: theme.font.body.bold, fontSize: 13, color: theme.color.textMuted, marginTop: 2 },
});
