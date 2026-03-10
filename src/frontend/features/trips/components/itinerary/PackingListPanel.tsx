"use client";

import { useState } from "react";

type PackingItem = {
  text: string;
  checked: boolean;
};

const initialPackingItems: PackingItem[] = [
  { text: "Travel adapters", checked: true },
  { text: "Passport & copies", checked: true },
  { text: "Formal dinner attire", checked: false },
  { text: "Walking shoes", checked: false },
];

export default function PackingListPanel() {
  const [packingItems, setPackingItems] = useState(initialPackingItems);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);

  const addPackingItem = () => {
    if (newItemText.trim()) {
      setPackingItems([
        ...packingItems,
        { text: newItemText.trim(), checked: false },
      ]);
      setNewItemText("");
      setIsExpanded(false);
    }
  };

  const deletePackingItem = (index: number) => {
    const newItems = [...packingItems];
    newItems.splice(index, 1);
    setPackingItems(newItems);
    setEditingIndex(null);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setNewItemText(packingItems[index].text);
  };

  const saveEdit = () => {
    if (editingIndex !== null && newItemText.trim()) {
      const newItems = [...packingItems];
      newItems[editingIndex].text = newItemText.trim();
      setPackingItems(newItems);
      setEditingIndex(null);
      setNewItemText("");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setNewItemText("");
  };

  return (
    <aside className="w-full shrink-0 space-y-6 xl:w-80">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-2xl border border-transparent bg-slate-100 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">Packing list</h4>
            <span className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-600">
              {packingItems.filter((item) => item.checked).length}/
              {packingItems.length}
            </span>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            {packingItems.map((item, index) => (
              <div key={index} className="relative">
                {editingIndex === index ? (
                  <div className="flex flex-col gap-2 rounded-lg border bg-white p-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveEdit();
                        } else if (e.key === "Escape") {
                          cancelEdit();
                        }
                      }}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-slate-900"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 sm:justify-start">
                      <button
                        onClick={saveEdit}
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-white">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded text-slate-900"
                      checked={item.checked}
                      onChange={(e) => {
                        const newItems = [...packingItems];
                        newItems[index].checked = e.target.checked;
                        setPackingItems(newItems);
                      }}
                    />
                    <span
                      className={`flex-1 cursor-pointer ${item.checked ? "line-through text-slate-500" : ""}`}
                      onClick={() => {
                        const newItems = [...packingItems];
                        newItems[index].checked = !newItems[index].checked;
                        setPackingItems(newItems);
                      }}
                    >
                      {item.text}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpenIndex(menuOpenIndex === index ? null : index)
                        }
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                      >
                        <span className="material-symbols-outlined text-sm">
                          more_horiz
                        </span>
                      </button>

                      {menuOpenIndex === index && (
                        <div className="absolute right-0 top-8 z-10 flex gap-1 rounded-lg border bg-white p-1 shadow-sm">
                          <button
                            onClick={() => {
                              startEditing(index);
                              setMenuOpenIndex(null);
                            }}
                            className="rounded p-2 text-slate-600 transition-colors hover:bg-slate-100"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              deletePackingItem(index);
                              setMenuOpenIndex(null);
                            }}
                            className="rounded p-2 text-red-600 transition-colors hover:bg-red-50"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="relative mt-4">
            <div
              className={`flex items-center transition-all duration-300 ease-in-out ${
                isExpanded ? "w-full" : "w-8"
              }`}
            >
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex h-8 items-center justify-center rounded-full bg-slate-900 text-white transition-all duration-300 hover:bg-slate-800 ${
                  isExpanded ? "w-8 rounded-r-none" : "w-8"
                }`}
              >
                <span className="material-symbols-outlined text-lg leading-none">
                  {isExpanded ? "close" : "lightbulb"}
                </span>
              </button>

              {isExpanded && (
                <div className="ml-2 flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addPackingItem();
                      }
                    }}
                    placeholder="Enter item name"
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm text-black focus:border-slate-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={addPackingItem}
                    className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
