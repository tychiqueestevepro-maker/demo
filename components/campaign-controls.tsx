"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Trash2 } from "lucide-react";

import { pauseCampaignAction, deleteCampaignAction } from "@/app/actions/campaign-controls";

export function CampaignControls({
  campaignId,
  currentStatus,
}: {
  campaignId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPausing, setIsPausing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const isPaused = currentStatus === "PAUSED";

  const handlePause = async () => {
    setIsPausing(true);
    try {
      await pauseCampaignAction(campaignId);
      router.refresh();
    } finally {
      setIsPausing(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteCampaignAction(campaignId);
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Pause / Resume */}
      <button
        onClick={handlePause}
        disabled={isPausing}
        className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
      >
        {isPausing ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-violet-700" />
        ) : isPaused ? (
          <Play className="h-4 w-4" />
        ) : (
          <Pause className="h-4 w-4" />
        )}
        {isPaused ? "Resume" : "Pause"}
      </button>

      {/* Delete */}
      {showDeleteConfirm ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
          <span className="text-sm font-semibold text-rose-700">Confirm?</span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg bg-rose-600 px-2 py-0.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {isDeleting ? "..." : "Yes, delete"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="text-xs text-rose-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      )}
    </div>
  );
}
