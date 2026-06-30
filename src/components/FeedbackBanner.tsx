import { ReactNode, useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet, Easing } from "react-native";
import { theme } from "@/theme/tokens";

const TONES = {
  correct: { bg: theme.color.successTint, fg: theme.color.successStrong, defaultTitle: "Great spelling!" },
  "try-again": { bg: theme.color.tryAgainTint, fg: theme.color.tryAgainStrong, defaultTitle: "Almost — try again!" },
  hint: { bg: "#FFF8E6", fg: "#D5871A", defaultTitle: "Hint" },
} as const;

export function FeedbackBanner({
  status, title, message, icon,
}: { status: keyof typeof TONES; title?: string; message?: string; icon: ReactNode }) {
  const t = TONES[status];
  const scale = useRef(new Animated.Value(0.94)).current;
  useEffect(() => {
    scale.setValue(0.94);
    Animated.timing(scale, {
      toValue: 1, duration: 220, easing: Easing.bezier(0.34, 1.56, 0.64, 1), useNativeDriver: true,
    }).start();
  }, [status, message, scale]);

  return (
    <Animated.View style={[styles.base, { backgroundColor: t.bg, transform: [{ scale }] }]}>
      <View style={styles.icon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: t.fg }]}>{title ?? t.defaultTitle}</Text>
        {message ? <Text style={[styles.msg, { color: theme.color.textBody }]}>{message}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%", flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: theme.radius.lg, padding: theme.space[4],
  },
  icon: { width: 32, alignItems: "center" },
  title: { fontFamily: theme.font.display.semibold, fontSize: 18 },
  msg: { fontFamily: theme.font.body.semibold, fontSize: 14, marginTop: 2 },
});
