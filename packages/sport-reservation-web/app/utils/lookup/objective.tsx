export const objectives = {
  casual_match: {
    label: "Casual Match",
    value: "casual_match",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🎮</span>
    ),
  },
  for_fitness: {
    label: "For Fitness",
    value: "for_fitness",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>💪</span>
    ),
  },
  for_fun: {
    label: "For Fun",
    value: "for_fun",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>😄</span>
    ),
  },
  love_challenge: {
    label: "Love Challenge",
    value: "love_challenge",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🏆</span>
    ),
  },
  love_competition: {
    label: "Love Competition",
    value: "love_competition",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🥇</span>
    ),
  },
  meet_new_friends: {
    label: "Meet New Friends",
    value: "meet_new_friends",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>👋</span>
    ),
  },
  play_to_win: {
    label: "Play to Win",
    value: "play_to_win",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🏅</span>
    ),
  },
  push_limits: {
    label: "Push Limits",
    value: "push_limits",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🚀</span>
    ),
  },
  relax_rally: {
    label: "Relax Rally",
    value: "relax_rally",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🧘</span>
    ),
  },
  self_improvement: {
    label: "Self Improvement",
    value: "self_improvement",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>📈</span>
    ),
  },
  serious_play: {
    label: "Serious Play",
    value: "serious_play",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🎯</span>
    ),
  },
  stay_active: {
    label: "Stay Active",
    value: "stay_active",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🏃‍♀️</span>
    ),
  },
};

export const objectivesList = Object.values(objectives);
