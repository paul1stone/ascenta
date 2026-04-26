export const GET_TO_KNOW_FIELDS = [
  {
    key: "personalBio",
    label: "Personal bio",
    helper: "A short bit about you in your own voice.",
    multiline: true,
    placeholder:
      "I grew up in three cities and learned to write code on a hand-me-down ThinkPad...",
  },
  {
    key: "hobbies",
    label: "Hobbies and interests",
    helper: "What do you enjoy outside of work?",
    multiline: true,
    placeholder: "Long-distance trail running, vinyl collecting, learning languages slowly.",
  },
  {
    key: "askMeAbout",
    label: "Ask me about",
    helper: "Topics you enjoy chatting about.",
    multiline: false,
    placeholder: "Soundtrack analysis, regenerative agriculture, board games",
  },
  {
    key: "hometown",
    label: "Hometown or background",
    helper: "Where you're from or a meaningful place in your story.",
    multiline: false,
    placeholder: "Born in Lima, raised in Madrid",
  },
  {
    key: "currentlyConsuming",
    label: "Currently reading or listening to",
    helper: "Something you'd recommend right now.",
    multiline: false,
    placeholder: "Re-reading 'The Goal' and the Acquired podcast",
  },
] as const;

export type GetToKnowKey = (typeof GET_TO_KNOW_FIELDS)[number]["key"];

export const FUN_FACTS_MIN = 1;
export const FUN_FACTS_MAX = 3;

export const PHOTO_MAX_BASE64_BYTES = 280_000;
