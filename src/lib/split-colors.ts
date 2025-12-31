// Shared color palette for split groups
export const SPLIT_GROUP_COLORS = [
  {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    border: "border-blue-400 dark:border-blue-700",
    dot: "bg-blue-500"
  },
  {
    bg: "bg-orange-100 dark:bg-orange-900/40",
    border: "border-orange-400 dark:border-orange-700",
    dot: "bg-orange-500"
  },
  {
    bg: "bg-green-100 dark:bg-green-900/40",
    border: "border-green-400 dark:border-green-700",
    dot: "bg-green-500"
  },
  {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    border: "border-purple-400 dark:border-purple-700",
    dot: "bg-purple-500"
  },
  {
    bg: "bg-red-100 dark:bg-red-900/40",
    border: "border-red-400 dark:border-red-700",
    dot: "bg-red-500"
  },
  {
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    border: "border-yellow-400 dark:border-yellow-700",
    dot: "bg-yellow-500"
  },
  {
    bg: "bg-teal-100 dark:bg-teal-900/40",
    border: "border-teal-400 dark:border-teal-700",
    dot: "bg-teal-500"
  },
  {
    bg: "bg-pink-100 dark:bg-pink-900/40",
    border: "border-pink-400 dark:border-pink-700",
    dot: "bg-pink-500"
  },
  {
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    border: "border-indigo-400 dark:border-indigo-700",
    dot: "bg-indigo-500"
  },
  {
    bg: "bg-cyan-100 dark:bg-cyan-900/40",
    border: "border-cyan-400 dark:border-cyan-700",
    dot: "bg-cyan-500"
  },
  {
    bg: "bg-lime-100 dark:bg-lime-900/40",
    border: "border-lime-400 dark:border-lime-700",
    dot: "bg-lime-500"
  },
  {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    border: "border-emerald-400 dark:border-emerald-700",
    dot: "bg-emerald-500"
  },
];

export const getSplitGroupColor = (groupIndex: number) => {
  return SPLIT_GROUP_COLORS[groupIndex % SPLIT_GROUP_COLORS.length];
};
