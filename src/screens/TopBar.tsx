import { View, StyleSheet } from "react-native";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/Icon";
import { SegmentedControl } from "@/components/SegmentedControl";
import { theme } from "@/theme/tokens";

export function TopBar({
  mode, onMode, onBack,
}: { mode: "practice" | "test"; onMode: (m: string) => void; onBack: () => void }) {
  return (
    <View style={styles.bar}>
      <IconButton tone="soft" label="Home" onPress={onBack} style={{ width: 44, height: 44 }}>
        <Icon name="chevron-left" size={24} color={theme.color.brand} />
      </IconButton>
      <View style={{ flex: 1 }}>
        <SegmentedControl
          options={[{ value: "practice", label: "Practise" }, { value: "test", label: "Test" }]}
          value={mode}
          onChange={onMode}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
});
