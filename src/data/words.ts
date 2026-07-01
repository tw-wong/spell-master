export type Difficulty = "easy" | "medium" | "hard";
export type Word = { word: string; sentence: string; difficulty: Difficulty };
export type Week = { week: number; theme: string; words: Word[] };

export const weeks: Week[] = [
  { week: 10, theme: "Tricky 'ough' words", words: [
    { word: "through", sentence: "We walked through the forest.", difficulty: "hard" },
    { word: "thought", sentence: "I thought about my answer.", difficulty: "hard" },
    { word: "enough", sentence: "We have enough apples.", difficulty: "medium" },
    { word: "bought", sentence: "Dad bought some milk.", difficulty: "medium" },
    { word: "rough", sentence: "The bark felt rough.", difficulty: "medium" },
  ] },
  { week: 11, theme: "Silent letters", words: [
    { word: "knight", sentence: "The knight rode a horse.", difficulty: "hard" },
    { word: "wrong", sentence: "That answer is wrong.", difficulty: "easy" },
    { word: "thumb", sentence: "She hurt her thumb.", difficulty: "medium" },
    { word: "climb", sentence: "Let's climb the hill.", difficulty: "medium" },
    { word: "listen", sentence: "Please listen carefully.", difficulty: "easy" },
  ] },
  { week: 12, theme: "Everyday words", words: [
    { word: "because", sentence: "I smiled because I was happy.", difficulty: "medium" },
    { word: "friend", sentence: "My friend is kind.", difficulty: "medium" },
    { word: "people", sentence: "Lots of people came.", difficulty: "medium" },
    { word: "school", sentence: "We learn at school.", difficulty: "easy" },
    { word: "beautiful", sentence: "What a beautiful day!", difficulty: "hard" },
    { word: "favourite", sentence: "Blue is my favourite colour.", difficulty: "hard" },
  ] },
  { week: 13, theme: "Adding -ed", words: [
    { word: "jumped", sentence: "The frog jumped away.", difficulty: "easy" },
    { word: "stopped", sentence: "The bus stopped here.", difficulty: "medium" },
    { word: "smiled", sentence: "She smiled at me.", difficulty: "easy" },
    { word: "carried", sentence: "He carried the bag.", difficulty: "medium" },
  ] },
];

const CURRENT_INDEX = 2; // Week 12. Date-derivation is a later enhancement (PRD open Q).

export const currentWeekNumber = weeks[CURRENT_INDEX].week;
export const getCurrentWeek = (): Week => weeks[CURRENT_INDEX];
export const getWeek = (n: number): Week => weeks.find((w) => w.week === n) ?? weeks[CURRENT_INDEX];

export type DictationSentence = { text: string; focus: string };

const DICTATION: Record<number, DictationSentence[]> = {
  12: [
    { text: "On Thursday, I go swimming.", focus: "Day names start with a capital letter." },
    { text: "We saw a beautiful rainbow.", focus: "Don't forget the full stop." },
    { text: "My friend has a new bike.", focus: "Start the sentence with a capital." },
  ],
  11: [
    { text: "The knight climbed the hill.", focus: "Silent letters: kn, mb." },
    { text: "Please listen to your teacher.", focus: "End with a full stop." },
  ],
};

export const getDictation = (n: number): DictationSentence[] => DICTATION[n] ?? DICTATION[12];
export const hasDictation = (n: number): boolean => !!DICTATION[n];
export const dictationCount = (n: number): number => DICTATION[n]?.length ?? 0;
