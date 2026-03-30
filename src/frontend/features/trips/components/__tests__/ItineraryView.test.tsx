import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import ItineraryView from "../ItineraryView";
import { generateItinerary, getItinerary } from "@/features/trips/api";

const mockMoveItemForDrag = jest.fn();

jest.mock("@/features/trips/api", () => ({
  getItinerary: jest.fn(),
  generateItinerary: jest.fn(),
}));

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children, onDragStart, onDragOver, onDragEnd, onDragCancel }: {
    children: ReactNode;
    onDragStart?: (event: unknown) => void;
    onDragOver?: (event: unknown) => void;
    onDragEnd?: (event: unknown) => void;
    onDragCancel?: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onDragStart?.({ active: { id: "item-0-0" } })}>
        dnd-start-valid
      </button>
      <button type="button" onClick={() => onDragOver?.({ over: { id: "day-drop-0" } })}>
        dnd-over-day0
      </button>
      <button type="button" onClick={() => onDragEnd?.({ over: null })}>
        dnd-end-no-over
      </button>
      <button
        type="button"
        onClick={() => onDragEnd?.({ over: { id: "day-drop-1" } })}
      >
        dnd-end-with-over
      </button>
      <button type="button" onClick={() => onDragCancel?.()}>
        dnd-cancel
      </button>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: { children: ReactNode }) => (
    <div>drag-overlay-{children ? "active" : "empty"}</div>
  ),
  closestCenter: jest.fn(),
  pointerWithin: jest.fn(() => []),
  rectIntersection: jest.fn(() => []),
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => []),
  PointerSensor: function PointerSensor() {
    return null;
  },
  KeyboardSensor: function KeyboardSensor() {
    return null;
  },
}));

jest.mock("@dnd-kit/sortable", () => ({
  sortableKeyboardCoordinates: jest.fn(),
}));

jest.mock("../itinerary/dragDropUtils", () => ({
  findItemById: (days: Array<{ items?: Array<{ clientId: string }> }>, id: string) => {
    for (const day of days) {
      for (const item of day.items ?? []) {
        if (item.clientId === id) return item;
      }
    }
    return null;
  },
  getDayDropZoneId: (dayIndex: number) => `day-drop-${dayIndex}`,
  hydrateTimelineDays: (input: Array<{ label?: string; date?: string; items?: Array<Record<string, unknown>>; type?: string; dayNumber?: number; clientDayId?: string }>) =>
    input.map((entry, dayIndex) => {
      if (entry.type === "emptyDay") {
        return {
          ...entry,
          clientDayId: entry.clientDayId ?? `empty-${dayIndex}`,
        };
      }

      return {
        clientDayId: entry.clientDayId ?? `day-${dayIndex}`,
        label: entry.label ?? `Day ${dayIndex + 1}: New day`,
        date: entry.date ?? "Monday, Jan 1",
        active: false,
        items: (entry.items ?? []).map((item, itemIndex) => ({
          ...item,
          clientId: (item.clientId as string | undefined) ?? `item-${dayIndex}-${itemIndex}`,
        })),
      };
    }),
  isEmptyDayPlaceholder: (entry: { type?: string }) => entry.type === "emptyDay",
  moveItemForDrag: (entries: unknown, activeId: string, overId: string) =>
    mockMoveItemForDrag(entries, activeId, overId),
  toBuildableDay: (entry: { label: string; date: string; active?: boolean; items?: unknown[]; type?: string }) =>
    entry.type === "emptyDay"
      ? { label: `Day ${entry.dayNumber}: New day`, date: entry.date, active: false, items: [] }
      : { label: entry.label, date: entry.date, active: false, items: entry.items ?? [] },
  toClientDay: (entry: { label: string; date: string; items?: unknown[] }) => ({
    clientDayId: `${entry.label}-client`,
    label: entry.label,
    date: entry.date,
    active: false,
    items: (entry.items ?? []).map((item, itemIndex) => ({
      ...item,
      clientId: `new-item-${itemIndex}`,
    })),
  }),
  withClientItemId: (item: Record<string, unknown>) => ({ ...item, clientId: "new-activity-id" }),
}));

jest.mock("../itinerary/ItineraryDaySection", () => ({
  __esModule: true,
  default: ({
    day,
    dayIndex,
    onEditItem,
    onDeleteItem,
    onAddActivity,
    onEditDayTitle,
    onDeleteDay,
    isEditingDayTitle,
    dayTitleDraft,
    dayTitlePrefix,
    onDayTitleDraftChange,
    onSaveDayTitle,
    onCancelDayTitle,
  }: {
    day: { label: string; items: Array<{ title: string; clientId: string; icon: string; time: string; note: string }> };
    dayIndex: number;
    onEditItem: (dayIndex: number, itemIndex: number, item: { title: string; clientId: string; icon: string; time: string; note: string }) => void;
    onDeleteItem: (dayIndex: number, itemIndex: number, title: string) => void;
    onAddActivity: (dayIndex: number) => void;
    onEditDayTitle: (dayIndex: number) => void;
    onDeleteDay: (dayIndex: number, dayLabel: string) => void;
    isEditingDayTitle: boolean;
    dayTitleDraft: string;
    dayTitlePrefix: string;
    onDayTitleDraftChange: (nextValue: string) => void;
    onSaveDayTitle: () => void;
    onCancelDayTitle: () => void;
  }) => (
    <div>
      <h4>{day.label}</h4>
      {day.items.map((item, itemIndex) => (
        <span key={item.clientId}>{item.title}-{itemIndex}</span>
      ))}
      {day.items.length > 0 && (
        <>
          <button type="button" onClick={() => onEditItem(dayIndex, 0, day.items[0])}>
            open-edit-item-{dayIndex}
          </button>
          <button
            type="button"
            onClick={() => onDeleteItem(dayIndex, 0, day.items[0].title)}
          >
            delete-item-{dayIndex}
          </button>
        </>
      )}
      <button type="button" onClick={() => onAddActivity(dayIndex)}>
        add-activity-{dayIndex}
      </button>
      <button type="button" onClick={() => onEditDayTitle(dayIndex)}>
        edit-day-title-{dayIndex}
      </button>
      <button type="button" onClick={() => onDeleteDay(dayIndex, day.label)}>
        delete-day-{dayIndex}
      </button>
      {isEditingDayTitle && (
        <div>
          <span>{dayTitlePrefix}</span>
          <input
            aria-label={`day-title-input-${dayIndex}`}
            value={dayTitleDraft}
            onChange={(event) => onDayTitleDraftChange(event.target.value)}
          />
          <button type="button" onClick={onSaveDayTitle}>
            save-day-title-{dayIndex}
          </button>
          <button type="button" onClick={onCancelDayTitle}>
            cancel-day-title-{dayIndex}
          </button>
        </div>
      )}
    </div>
  ),
}));

jest.mock("../itinerary/ItineraryEmptyDaySection", () => ({
  __esModule: true,
  default: ({
    entry,
    dayIndex,
    onAddDay,
  }: {
    entry: { dayNumber: number };
    dayIndex: number;
    onAddDay: (dayIndex: number) => void;
  }) => (
    <div>
      <span>empty-day-{entry.dayNumber}</span>
      <button type="button" onClick={() => onAddDay(dayIndex)}>
        add-day-from-empty-{dayIndex}
      </button>
    </div>
  ),
}));

jest.mock("../itinerary/EditItineraryItemModal", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    saveLabel,
    onFormChange,
    onSave,
    onClose,
  }: {
    open: boolean;
    title?: string;
    saveLabel?: string;
    onFormChange: (nextForm: { title: string; time: string; note: string }) => void;
    onSave: () => void;
    onClose: () => void;
  }) => {
    if (!open) return null;
    const resolvedSaveLabel = saveLabel ?? "Save changes";

    return (
      <div>
        <p>{title ?? "Edit activity"}</p>
        <button
          type="button"
          onClick={() =>
            onFormChange({
              title: "Updated activity",
              time: "10:30",
              note: "Updated note",
            })
          }
        >
          fill-form-{resolvedSaveLabel}
        </button>
        <button
          type="button"
          onClick={() => onFormChange({ title: "", time: "", note: "" })}
        >
          clear-form-{resolvedSaveLabel}
        </button>
        <button type="button" onClick={onSave}>
          {resolvedSaveLabel}
        </button>
        <button type="button" onClick={onClose}>
          close-{resolvedSaveLabel}
        </button>
      </div>
    );
  },
}));

jest.mock("../ConfirmOverlay", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    open ? (
      <div>
        <h5>{title}</h5>
        <p>{message}</p>
        <button type="button" onClick={onConfirm}>
          confirm-{title}
        </button>
        <button type="button" onClick={onCancel}>
          cancel-{title}
        </button>
      </div>
    ) : null,
}));

jest.mock("../itinerary/ItineraryItemCard", () => ({
  __esModule: true,
  default: ({ item }: { item: { title: string } }) => <div>overlay-card-{item.title}</div>,
}));

jest.mock("../itinerary/PackingListPanel", () => ({
  __esModule: true,
  default: () => <div>packing-panel</div>,
}));

const mockedGetItinerary = jest.mocked(getItinerary);
const mockedGenerateItinerary = jest.mocked(generateItinerary);

describe("ItineraryView", () => {
  beforeEach(() => {
    mockedGetItinerary.mockReset();
    mockedGenerateItinerary.mockReset();
    mockMoveItemForDrag.mockReset();
    mockMoveItemForDrag.mockImplementation((entries) => entries);

    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    };
    window.cancelAnimationFrame = jest.fn();
  });

  it("retries itinerary load after initial failure", async () => {
    mockedGetItinerary
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce([
        {
          label: "Day 1: Arrival",
          date: "Friday, Apr 4",
          active: true,
          items: [
            {
              icon: "flight",
              title: "Flight to Tokyo",
              time: "9:00 AM",
              note: "Direct flight",
            },
          ],
        },
      ]);

    render(<ItineraryView tripId="trip-1" />);

    expect(await screen.findByText("Unable to load itinerary. Please try again.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Day 1: Arrival")).toBeInTheDocument();
    expect(mockedGetItinerary).toHaveBeenCalledTimes(2);
  });

  it("handles generate error and retries generation when days already exist", async () => {
    mockedGetItinerary.mockResolvedValue([
      {
        label: "Day 1: Existing",
        date: "Friday, Apr 4",
        active: true,
        items: [
          {
            icon: "event",
            title: "Existing Item",
            time: "9:00 AM",
            note: "Keep",
          },
        ],
      },
    ]);

    mockedGenerateItinerary
      .mockRejectedValueOnce(new Error("Generation failed."))
      .mockResolvedValueOnce([
        {
          label: "Day 1: Generated",
          date: "Saturday, Apr 5",
          active: true,
          items: [
            {
              icon: "event",
              title: "Generated item",
              time: "10:00 AM",
              note: "Auto",
            },
          ],
        },
      ]);

    render(<ItineraryView tripId="trip-generate" editable={false} />);

    expect(await screen.findByText("Day 1: Existing")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /generate itinerary/i }));
    expect(await screen.findByText("Generation failed.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Day 1: Generated")).toBeInTheDocument();
    expect(mockedGenerateItinerary).toHaveBeenCalledTimes(2);
  });

  it("supports editable item/day actions and drag callbacks", async () => {
    mockedGetItinerary.mockResolvedValue([
      {
        label: "Day 1: Arrival",
        date: "Friday, Apr 4",
        active: true,
        items: [
          {
            icon: "flight",
            title: "Flight to Tokyo",
            time: "9:00 AM",
            note: "Direct",
          },
        ],
      },
      {
        label: "Day 2: Explore",
        date: "Saturday, Apr 5",
        active: false,
        items: [
          {
            icon: "restaurant",
            title: "Dinner",
            time: "7:00 PM",
            note: "Booked",
          },
        ],
      },
    ]);

    render(
      <ItineraryView
        editable
        tripId="trip-edit"
        trip={{ id: "trip-edit", startDate: "2026-04-04", endDate: "2026-04-10" }}
      />,
    );

    expect(await screen.findByText("Day 1: Arrival")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "dnd-start-valid" }));
    fireEvent.click(screen.getByRole("button", { name: "dnd-over-day0" }));
    fireEvent.click(screen.getByRole("button", { name: "dnd-end-with-over" }));
    fireEvent.click(screen.getByRole("button", { name: "dnd-cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "dnd-end-no-over" }));

    fireEvent.click(screen.getByRole("button", { name: "open-edit-item-0" }));
    fireEvent.click(screen.getByRole("button", { name: "fill-form-Save changes" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByText("Updated activity-0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "add-activity-0" }));
    fireEvent.click(screen.getByRole("button", { name: "fill-form-Add activity" }));
    fireEvent.click(screen.getByRole("button", { name: "Add activity" }));
    expect(screen.getByText("Updated activity-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "edit-day-title-1" }));
    fireEvent.change(screen.getByLabelText("day-title-input-1"), {
      target: { value: "Food Tour" },
    });
    fireEvent.click(screen.getByRole("button", { name: "save-day-title-1" }));
    expect(screen.getByText("Day 2: Food Tour")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "delete-day-0" }));
    fireEvent.click(screen.getByRole("button", { name: "confirm-Delete this day?" }));
    expect(screen.getByText("empty-day-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "add-day-from-empty-0" }));
    expect(screen.getByText("Day 1: New day")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add new day/i }));
    expect(screen.getByText("Day 3: New day")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockMoveItemForDrag).toHaveBeenCalled();
    });
  });
});
