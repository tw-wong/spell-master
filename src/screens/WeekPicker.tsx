import { ReactNode } from "react";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { useSession } from "@/state/SessionContext";
import { weeks, currentWeekNumber, hasDictation, dictationCount } from "@/data/words";
import { theme } from "@/theme/tokens";

function Chip({ bg, fg, icon, label }: { bg: string; fg: string; icon: ReactNode; label?: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg, paddingHorizontal: label === undefined ? 6 : 8 }]}>
      {icon}
      {label !== undefined ? <Text style={[styles.chipText, { color: fg }]}>{label}</Text> : null}
    </View>
  );
}

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
                style={StyleSheet.flatten([styles.card, { borderColor: isSelected ? theme.color.brand : theme.color.border }])}>
                <View style={[styles.num, { backgroundColor: isSelected ? theme.color.brand : theme.color.brandTint }]}>
                  <Text style={[styles.numText, { color: isSelected ? "#fff" : theme.color.brand }]}>{w.week}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.weekTheme} numberOfLines={1}>{w.theme}</Text>
                  <View style={styles.chipRow}>
                    <Chip bg={theme.color.tint} fg={theme.color.brandLedge}
                      icon={<Icon name="pencil" size={14} color={theme.color.brand} />} label={String(w.words.length)} />
                    {hasDictation(w.week) && (
                      <Chip bg={theme.color.infoTint} fg={theme.color.info}
                        icon={<Icon name="ear" size={14} color={theme.color.info} />} label={String(dictationCount(w.week))} />
                    )}
                    {isCurrent && (
                      <Chip bg={theme.color.accentTintStrong} fg={theme.color.accentLedge}
                        icon={<Icon name="star" size={14} color={theme.color.accentLedge} />} />
                    )}
                  </View>
                </View>
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
  card: { height: 84, flexDirection: "row", alignItems: "center", gap: 14 },
  num: { width: 48, height: 48, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center" },
  numText: { fontFamily: theme.font.display.bold, fontSize: 18 },
  weekTheme: { fontFamily: theme.font.display.semibold, fontSize: 18, color: theme.color.textStrong, lineHeight: 20 },
  chipRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 7 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: theme.radius.pill, paddingVertical: 3 },
  chipText: { fontFamily: theme.font.body.black, fontSize: 11.5 },
});
