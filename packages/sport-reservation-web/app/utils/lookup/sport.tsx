export const sports = {
  badminton: {
    label: "Badminton",
    value: "badminton",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🏸</span>
    ),
  },
  tennis: {
    label: "Tennis",
    value: "tennis",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🎾</span>
    ),
  },
  running: {
    label: "Running",
    value: "running",
    icon: ({ className }: { className?: string }) => (
      <span className={className}>🏃</span>
    ),
  },
};

export const sportsList = Object.values(sports);
