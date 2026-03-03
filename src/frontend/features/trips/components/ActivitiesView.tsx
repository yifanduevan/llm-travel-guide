"use client";

import { useEffect, useMemo, useState } from "react";
import { getActivities } from "@/features/trips/api";
import type { ActivityDto } from "@/lib/types";

type TripInfo = {
  titleOrDestination?: string;
  startDate?: string | null;
  endDate?: string | null;
};

type ActivityItem = {
  title: string;
  price?: string;
  rating?: string;
  badge?: string | null;
  badgeTone?: string | null;
  image?: string | null;
  description?: string | null;
  pills?: string[];
};

type Props = {
  trip?: TripInfo;
  tripId: string;
  activities?: ActivityItem[];
};

const fallbackActivities: ActivityItem[] = [];

export default function ActivitiesView({ trip, tripId, activities }: Props) {
  const initial = useMemo(
    () => (activities && activities.length > 0 ? activities : fallbackActivities),
    [activities],
  );
  const [activityState, setActivityState] = useState<ActivityItem[]>(initial);
  const [loading, setLoading] = useState(false);

  function mapActivityDto(api: ActivityDto): ActivityItem {
    return {
      title: (api.title as string) || "",
      price: (api.price as string) || "",
      rating: (api.rating as string) || "",
      badge: (api.badge as string | null) ?? null,
      badgeTone: (api.badgeTone as string | null) ?? null,
      image: (api.imageUrl as string | null) ?? null,
      description: ((api.description as string | null) || null) ?? null,
      pills: (api.pills as string[]) || [],
    };
  }

  useEffect(() => {
    const load = async () => {
      if (!tripId) return;
      try {
        setLoading(true);
        const data = await getActivities(tripId);
        setActivityState(data.map(mapActivityDto));
      } finally {
        setLoading(false);
      }
    };
    if (!activities || activities.length === 0) {
      load().catch(() => setLoading(false));
    }
  }, [tripId, activities]);

  const noData = !activityState || activityState.length === 0;

  const header = trip?.titleOrDestination ?? "Activities & Tours";

  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex-1">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">{header}</h2>
            <p className="mt-1 text-sm text-slate-600">Must-see attractions and local experiences</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button className="flex items-center justify-center rounded-lg bg-white p-2 text-slate-900 shadow-sm">
                <span className="material-symbols-outlined text-lg">grid_view</span>
              </button>
              <button className="ml-1 flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-white/70">
                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
              </button>
            </div>
            <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm btn-primary">
              <span className="material-symbols-outlined text-lg">add_location_alt</span>
              Find new tour
            </button>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-600">Loading activities...</p>}

        {noData && !loading ? (
          <p className="text-sm text-slate-600">No activities found for this trip.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {activityState.map((activity) => (
              <div
                key={activity.title}
                className="group flex flex-col overflow-hidden rounded-2xl border-white bg-white shadow-sm transition duration-300 hover:shadow-xl"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${activity.image ?? ""}')` }}
                  />
                  {activity.badge ? (
                    <div
                      className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
                        activity.badgeTone === "primary" ? "bg-slate-900 text-white" : "bg-red-400 text-white"
                      }`}
                    >
                      {activity.badge}
                    </div>
                  ) : null}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
                    <span className="material-symbols-outlined text-sm text-orange-400">star</span>
                    {activity.rating}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">{activity.title}</h3>
                    <span className="text-lg font-bold text-slate-900">{activity.price}</span>
                  </div>
                  <p className="mb-4 line-clamp-2 text-sm text-slate-600">{activity.description}</p>
                  <div className="mb-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                    {(activity.pills ?? []).map((pill) => (
                      <div key={pill} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5">
                        <span className="material-symbols-outlined text-sm">{pillIcon[pill] ?? "info"}</span>
                        {pill}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex gap-3">
                    <button className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800">Book now</button>
                    <button className="rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-50">
                      <span className="material-symbols-outlined text-lg">favorite</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="w-full shrink-0 lg:w-80">
        <div className="sticky top-28 space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg shadow-slate-900/30">
            <div className="mb-2 flex items-start gap-3">
              <span className="material-symbols-outlined text-white/80">wb_sunny</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Weather forecast</p>
                <h5 className="text-xl font-semibold">Perfect for walking</h5>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/90">Expect sunny skies for your outdoor tours this week. Highs of 22°C.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

const pillIcon: Record<string, string> = {
  "3 Hours": "timer",
  "1 Hour": "timer",
  "3.5 Hours": "timer",
  "English / French": "language",
  "Audio Guide": "headphones",
  "Mobile Ticket": "confirmation_number",
  "Food Inc.": "restaurant",
};


