import {
  Volume2, RotateCcw, Play, ChevronLeft, ChevronRight, ChevronDown,
  Pencil, Lightbulb, PartyPopper, Delete, Check, X, ArrowRight,
  CalendarDays, Sparkles, ThumbsUp, Ear, Snail, Type,
} from "lucide-react-native";

const MAP = {
  "volume-2": Volume2, "rotate-ccw": RotateCcw, play: Play,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight, "chevron-down": ChevronDown,
  pencil: Pencil, lightbulb: Lightbulb, "party-popper": PartyPopper, delete: Delete,
  check: Check, x: X, "arrow-right": ArrowRight, "calendar-days": CalendarDays,
  sparkles: Sparkles, "thumbs-up": ThumbsUp,
  ear: Ear, snail: Snail, type: Type,
} as const;

export type IconName = keyof typeof MAP;

export function Icon({ name, size = 24, color = "#241B47", strokeWidth = 2.4 }: {
  name: IconName; size?: number; color?: string; strokeWidth?: number;
}) {
  const Cmp = MAP[name];
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}
