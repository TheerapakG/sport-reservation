import dayjs from "dayjs";

/** Example: events keyed by "YYYY-MM-DD" string */
export const mockEventsByDate: Record<
  string,
  Array<{
    id: string;
    dateTime: string;
    title: string;
    description: string;
    location: string;
    participants: string;
  }>
> = {
  // "Today" example: "2025-03-14"
  [dayjs().format("YYYY-MM-DD")]: [
    {
      id: "1",
      dateTime: "Fri, 14 Mar (3:00 - 5:00 PM)",
      title: "Hey! Badminton",
      description: "Short description about this activity over here.",
      location: "81 badminton court",
      participants: "5/10",
    },
  ],
  // Another date example
  "2025-03-15": [
    {
      id: "2",
      dateTime: "Sat, 15 Mar (1:00 - 2:00 PM)",
      title: "101 Friendly Match Badminton",
      description: "Short description about this activity over here.",
      location: "101 Badminton Club",
      participants: "8/10",
    },
    {
      id: "3",
      dateTime: "Sat, 15 Mar (3:00 - 5:00 PM)",
      title: "Evening Football",
      description: "Short description about this activity over here.",
      location: "Local Stadium",
      participants: "20/20",
    },
  ],
  // Add more dates...
};
