"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/customer-actions";
import { toast } from "@/components/ui/toast";

export function FavoriteToggle({
  productId,
  saved,
}: {
  productId: string;
  saved: boolean;
}) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(saved);
  const [isPending, startTransition] = useTransition();

  function toggle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await toggleFavorite(formData);
        const nextSaved = !isSaved;
        setIsSaved(nextSaved);
        toast.add({
          description: nextSaved
            ? "You can find it in your saved favorites."
            : "This product has been removed from your favorites.",
          title: nextSaved ? "Added to favorites" : "Removed from favorites",
          type: "success",
        });
        router.refresh();
      } catch (error) {
        console.error("Could not update favorite:", error);
        toast.add({
          description: "Please try again in a moment.",
          title: "We couldn't update your favorites",
          type: "error",
        });
      }
    });
  }

  return (
    <form onSubmit={toggle}>
      <input name="productId" type="hidden" value={productId} />
      <button
        aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
        className="button-outline favorite-toggle"
        disabled={isPending}
        type="submit"
      >
        <Heart fill={isSaved ? "currentColor" : "none"} size={17} />
        {isSaved ? "Saved" : "Save favorite"}
      </button>
    </form>
  );
}
