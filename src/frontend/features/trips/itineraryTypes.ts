export type ItineraryItem = {
  icon: string;
  title: string;
  time: string;
  note: string;
  image?: string;
  muted?: boolean;
};

export type ItineraryDay = {
  label: string;
  date: string;
  active?: boolean;
  items: ItineraryItem[];
};
