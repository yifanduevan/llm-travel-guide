"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DateRangePicker from "@/features/trips/components/DateRangePicker";
import { createTrip } from "@/features/trips/api";

type BudgetTier = "Budget" | "Medium" | "Luxury";
type BudgetInputMode = "slider" | "custom";

type UserPreferences = {
  destination: string;
  startDate: string | null;
  endDate: string | null;
  budget: BudgetTier;
  dailyBudget: number;
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

const BUDGET_MARKS = {
  min: 80,
  mid: 150,
  max: 300,
} as const;

const DEFAULT_BUDGET_SLIDER_VALUE = 50;

const travelerToApiValue: Record<UserPreferences["travelers"], string> = {
  Solo: "SOLO",
  Couple: "COUPLE",
  Family: "FAMILY",
  Group: "GROUP",
};

const budgetToApiValue: Record<BudgetTier, string> = {
  Budget: "BUDGET",
  Medium: "MEDIUM",
  Luxury: "LUXURY",
};

function getBudgetLevelFromSlider(sliderValue: number): BudgetTier {
  if (sliderValue < 34) return "Budget";
  if (sliderValue < 67) return "Medium";
  return "Luxury";
}

function getDailyBudgetFromSlider(sliderValue: number): number {
  if (sliderValue <= 50) {
    const lowerRangeProgress = sliderValue / 50;
    return Math.round(
      BUDGET_MARKS.min + (BUDGET_MARKS.mid - BUDGET_MARKS.min) * lowerRangeProgress,
    );
  }

  const upperRangeProgress = (sliderValue - 50) / 50;
  return Math.round(
    BUDGET_MARKS.mid + (BUDGET_MARKS.max - BUDGET_MARKS.mid) * upperRangeProgress,
  );
}

export default function AddTripPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserPreferences>({
    destination: "",
    startDate: null,
    endDate: null,
    budget: getBudgetLevelFromSlider(DEFAULT_BUDGET_SLIDER_VALUE),
    dailyBudget: getDailyBudgetFromSlider(DEFAULT_BUDGET_SLIDER_VALUE),
    interests: [],
    travelers: "Couple",
  });
  const [budgetInputMode, setBudgetInputMode] = useState<BudgetInputMode>("slider");
  const [budgetSliderValue, setBudgetSliderValue] = useState(DEFAULT_BUDGET_SLIDER_VALUE);
  const [dailyBudgetInput, setDailyBudgetInput] = useState("");
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
  const sliderDailyBudget = useMemo(
    () => getDailyBudgetFromSlider(budgetSliderValue),
    [budgetSliderValue],
  );
  const sliderBudgetLevel = useMemo(
    () => getBudgetLevelFromSlider(budgetSliderValue),
    [budgetSliderValue],
  );

  const parsedCustomDailyBudget = Number(dailyBudgetInput);
  const hasValidCustomDailyBudget =
    dailyBudgetInput.trim() !== "" &&
    Number.isFinite(parsedCustomDailyBudget) &&
    parsedCustomDailyBudget > 0;
  const isSliderMode = budgetInputMode === "slider";
  const isCustomMode = budgetInputMode === "custom";
  const isBudgetInputValid = isSliderMode || hasValidCustomDailyBudget;
  const effectiveDailyBudget =
    isCustomMode && hasValidCustomDailyBudget
      ? parsedCustomDailyBudget
      : sliderDailyBudget;
  const showCustomBudgetValidation = isCustomMode && !hasValidCustomDailyBudget;

  const isFormValid = useMemo(() => {
    const hasDestination = !!prefs.destination.trim();
    const hasStartDate = !!prefs.startDate;
    const hasEndDate = !!prefs.endDate;
    const datesValid = hasStartDate && hasEndDate && prefs.endDate! >= prefs.startDate!;
    return hasDestination && hasStartDate && hasEndDate && datesValid && isBudgetInputValid;
  }, [prefs.destination, prefs.startDate, prefs.endDate, isBudgetInputValid]);

  const toggleInterest = (interest: string) => {
    setPrefs((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleBudgetSliderChange = (sliderValue: number) => {
    setBudgetSliderValue(sliderValue);
    const sliderBasedBudget = getDailyBudgetFromSlider(sliderValue);

    setPrefs((prev) => ({
      ...prev,
      budget: getBudgetLevelFromSlider(sliderValue),
      dailyBudget: isSliderMode ? sliderBasedBudget : prev.dailyBudget,
    }));
  };

  const handleBudgetInputModeChange = (mode: BudgetInputMode) => {
    setBudgetInputMode(mode);

    setPrefs((prev) => {
      if (mode === "slider") {
        return {
          ...prev,
          dailyBudget: getDailyBudgetFromSlider(budgetSliderValue),
        };
      }

      return {
        ...prev,
        dailyBudget: hasValidCustomDailyBudget ? parsedCustomDailyBudget : prev.dailyBudget,
      };
    });
  };

  const handleDailyBudgetInputChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/[^\d]/g, "");
    setDailyBudgetInput(digitsOnly);

    if (!digitsOnly) {
      if (isSliderMode) {
        setPrefs((prev) => ({
          ...prev,
          dailyBudget: getDailyBudgetFromSlider(budgetSliderValue),
        }));
      }
      return;
    }

    const numericDailyBudget = Number(digitsOnly);
    const hasValidNumericDailyBudget =
      Number.isFinite(numericDailyBudget) && numericDailyBudget > 0;

    setPrefs((prev) => ({
      ...prev,
      dailyBudget:
        isCustomMode && hasValidNumericDailyBudget
          ? numericDailyBudget
          : prev.dailyBudget,
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

    if (!prefs.destination || !prefs.startDate || !prefs.endDate || !isBudgetInputValid) {
      return;
    }

    setSubmitError(null);
    setIsGenerating(true);

    const dailyBudgetForGeneration = effectiveDailyBudget;

    setPrefs((prev) => ({
      ...prev,
      dailyBudget: dailyBudgetForGeneration,
    }));

    // Initialize abort controller and 10-second timeout
    const controller = new AbortController();
    abortControllerRef.current = controller;

    timeoutRef.current = setTimeout(() => {
      handleCancel();
    }, 10000);

    try {
      const notes = [
        prefs.interests.length > 0
          ? `Interests: ${prefs.interests.join(", ")}`
          : null,
        `Daily budget: ${dailyBudgetForGeneration} USD/day`,
      ]
        .filter(Boolean)
        .join(" | ");

      await createTrip(
        {
          titleOrDestination: prefs.destination.trim(),
          startDate: prefs.startDate,
          endDate: prefs.endDate,
          travelers: travelerToApiValue[prefs.travelers],
          budget: budgetToApiValue[prefs.budget],
          notes,
          status: "DRAFT",
        },
        controller.signal,
      );

      // Cleanup after successful completion
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsGenerating(false);
      abortControllerRef.current = null;
      router.push(trip.id ? `/trips/${trip.id}` : "/trips");
    } catch (err: unknown) {
      setIsGenerating(false);

      if (!(err instanceof Error && (err.name === "AbortError" || err.message === "Aborted"))) {
        console.error("Failed to create trip", err);
        alert("Failed to create trip. Please try again.");
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
            <label
              className="flex items-center gap-2 text-sm font-medium text-slate-800"
            >
              <span className="material-symbols-outlined text-base">savings</span>
              Budget level
            </label>

            <div role="radiogroup" aria-label="Budget input mode" className="space-y-4">
              <div className="space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                  <input
                    type="radio"
                    name="budget-input-mode"
                    value="slider"
                    checked={isSliderMode}
                    onChange={() => handleBudgetInputModeChange("slider")}
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span>Use budget slider</span>
                </label>

                <div
                  className={`rounded-xl border border-slate-200 bg-white px-4 py-4 transition ${
                    isCustomMode ? "pointer-events-none opacity-50" : "opacity-100"
                  }`}
                  aria-disabled={isCustomMode}
                >
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{sliderBudgetLevel}</span>
                    <span className="font-semibold text-slate-900">~ ${sliderDailyBudget} / day</span>
                  </div>
                  <input
                    id="budget-level-slider"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={budgetSliderValue}
                    onChange={(e) => handleBudgetSliderChange(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer accent-slate-900"
                    disabled={isCustomMode}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={budgetSliderValue}
                    aria-valuetext={`${sliderBudgetLevel}, approximately ${sliderDailyBudget} USD per day`}
                  />
                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>$80/day</span>
                    <span>$150/day</span>
                    <span>$300/day</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                  <input
                    type="radio"
                    name="budget-input-mode"
                    value="custom"
                    checked={isCustomMode}
                    onChange={() => handleBudgetInputModeChange("custom")}
                    className="h-4 w-4 accent-slate-900"
                  />
                  <span>Use exact daily budget</span>
                </label>

                <div
                  className={`relative transition ${
                    isCustomMode ? "opacity-100" : "pointer-events-none opacity-50"
                  }`}
                >
                  <label htmlFor="daily-budget-input" className="sr-only">
                    Daily budget per person
                  </label>
                  <input
                    id="daily-budget-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="150"
                    className={`w-full rounded-xl border px-4 py-3 pr-28 text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-200 ${
                      showCustomBudgetValidation
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-200 focus:border-slate-400"
                    } disabled:cursor-not-allowed disabled:bg-slate-100`}
                    value={dailyBudgetInput}
                    onChange={(e) => handleDailyBudgetInputChange(e.target.value)}
                    aria-describedby={showCustomBudgetValidation ? "daily-budget-validation" : undefined}
                    disabled={!isCustomMode}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">
                    USD / day
                  </span>
                </div>

                {showCustomBudgetValidation && (
                  <p id="daily-budget-validation" className="text-xs text-red-600">
                    Enter a daily budget greater than 0.
                  </p>
                )}
              </div>
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
