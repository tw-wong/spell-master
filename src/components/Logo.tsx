import Svg, { Rect, Path } from "react-native-svg";
import { theme } from "@/theme/tokens";

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="6" y="6" width="88" height="88" rx="28" fill={theme.color.brand} />
      <Path
        d="M50 24 C53 40 60 47 76 50 C60 53 53 60 50 76 C47 60 40 53 24 50 C40 47 47 40 50 24 Z"
        fill={theme.color.accent}
      />
    </Svg>
  );
}
