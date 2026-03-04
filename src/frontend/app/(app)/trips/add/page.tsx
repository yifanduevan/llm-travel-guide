"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DateRangePicker from "@/features/trips/components/DateRangePicker";
import { generateTrip } from "@/features/trips/api";

type UserPreferences = {
  destination: string;
  startDate: string | null;
  endDate: string | null;
  budget: "Budget" | "Medium" | "Luxury";
  interests: string[];
  travelers: "Solo" | "Couple" | "Family" | "Group";
};

const interestOptions = [
  "Food & Dining",
  "History & Culture",
  "Nature",
  "Adventure",
  "Shopping",
  "Relaxation",
  "Nightlife",
];

const travelerMap: Record<UserPreferences["travelers"], "SOLO" | "COUPLE" | "FAMILY" | "GROUP"> = {
  Solo: "SOLO",
  Couple: "COUPLE",
  Family: "FAMILY",
  Group: "GROUP",
};

const budgetMap: Record<UserPreferences["budget"], "BUDGET" | "MEDIUM" | "LUXURY"> = {
  Budget: "BUDGET",
  Medium: "MEDIUM",
  Luxury: "LUXURY",
};

export default function AddTripPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPreferences>({
    destination: "",
    startDate: null,
    endDate: null,
    budget: "Medium",
    interests: [],
    travelers: "Couple",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Control refs for cancellation and timeout management
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push('/trips');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  const selectedCount = useMemo(() => prefs.interests.length, [prefs.interests]);

  const isFormValid = useMemo(() => {
    const hasDestination = !!prefs.destination.trim();
    const hasStartDate = !!prefs.startDate;
    const hasEndDate = !!prefs.endDate;
    const datesValid = hasStartDate && hasEndDate && prefs.endDate! >= prefs.startDate!;
    return hasDestination && hasStartDate && hasEndDate && datesValid;
  }, [prefs]);

  const toggleInterest = (interest: string) => {
    setPrefs((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleCancel = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsGenerating(false);
    setSubmitError("Trip generation cancelled.");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isGenerating) {
      handleCancel();
      return;
    }

    if (!prefs.destination || !prefs.startDate || !prefs.endDate) return;

    setSubmitError(null);
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const trip = await generateTrip(
        {
          titleOrDestination: prefs.destination.trim(),
          startDate: prefs.startDate,
          endDate: prefs.endDate,
          travelers: travelerMap[prefs.travelers],
          budget: budgetMap[prefs.budget],
          interests: prefs.interests,
        },
        { signal: controller.signal },
      );

      setIsGenerating(false);
      abortControllerRef.current = null;
      router.push(trip.id ? `/trips/${trip.id}` : "/trips");
    } catch (err: unknown) {
      setIsGenerating(false);
      abortControllerRef.current = null;

      if (err instanceof Error && (err.name === "AbortError" || err.message === "Aborted")) {
        setSubmitError("Trip generation cancelled.");
        return;
      }

      if (err instanceof Error) {
        if (err.message.startsWith("400")) {
          setSubmitError("Trip generation request is invalid. Check the dates and required fields.");
          return;
        }
        if (err.message.startsWith("500")) {
          setSubmitError("Backend trip generation failed. Check the backend logs and database connection.");
          return;
        }
        setSubmitError(err.message);
        return;
      }

      setSubmitError("Trip generation failed.");
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] items-center justify-center overflow-hidden bg-slate-50 px-4">
      <div className="w-full max-w-3xl translate-y-2 rounded-2xl bg-white p-8 shadow-xl sm:p-10 relative">
        <button
          type="button"
          aria-label="Close"
          onClick={() => router.push('/trips')}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-600 hover:bg-slate-100 transition"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Plan your dream trip
          </h1>
          <p className="mt-2 text-slate-600">
            Let AI draft an itinerary in seconds. Tune preferences and generate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <span className="material-symbols-outlined text-base">location_on</span>
              Where to?
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Tokyo, Japan"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              value={prefs.destination}
              onChange={(e) =>
                setPrefs((prev) => ({ ...prev, destination: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <span className="material-symbols-outlined text-base">calendar_month</span>
              When?
            </label>
            <DateRangePicker
              startDate={prefs.startDate}
              endDate={prefs.endDate}
              onChange={(startDate, endDate) =>
                setPrefs((prev) => ({ ...prev, startDate, endDate }))
              }
              placeholder="Select departure and return dates"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <span className="material-symbols-outlined text-base">group</span>
                Who&apos;s going?
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                value={prefs.travelers}
                onChange={(e) =>
                  setPrefs((prev) => ({ ...prev, travelers: e.target.value as UserPreferences["travelers"] }))
                }
              >
                <option value="Solo">Solo traveler</option>
                <option value="Couple">Couple</option>
                <option value="Family">Family with kids</option>
                <option value="Group">Group of friends</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <span className="material-symbols-outlined text-base">savings</span>
              Budget level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["Budget", "Medium", "Luxury"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setPrefs((prev) => ({ ...prev, budget: level }))
                  }
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    prefs.budget === level
                      ? "border-slate-900 bg-slate-900 text-white shadow"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800">Interests</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    prefs.interests.includes(interest)
                      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-600">
              Selected {selectedCount} / {interestOptions.length}
            </p>
          </div>

          <button
            type="submit"
            disabled={!isGenerating && !isFormValid}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-white transition ${
              isGenerating 
                ? "bg-red-500 hover:bg-red-600 shadow-inner" 
                : "bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            }`}
          >
            {isGenerating ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">
                  autorenew
                </span>
                Generating... (Click to Cancel)
              </>
            ) : (
              <>Generate my guide</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
