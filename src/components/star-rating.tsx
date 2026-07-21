"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  className,
  label = `${rating} out of 5 stars`,
}: {
  rating: number;
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < Math.round(rating)
              ? "fill-lime-300 text-lime-300"
              : "fill-transparent text-white/20",
          )}
        />
      ))}
    </span>
  );
}

export function StarInput({ defaultValue = 0 }: { defaultValue?: number }) {
  const [rating, setRating] = useState(defaultValue);

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-white">Your rating</legend>
      <div className="flex items-center gap-1.5" aria-label="Choose a rating">
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          return (
            <label
              key={value}
              className="cursor-pointer rounded-md p-0.5 focus-within:ring-2 focus-within:ring-lime-300"
              title={`${value} star${value === 1 ? "" : "s"}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
              />
              <Star
                className={cn(
                  "size-8 transition hover:scale-110",
                  value <= rating
                    ? "fill-lime-300 text-lime-300"
                    : "fill-transparent text-white/25 hover:text-lime-300/70",
                )}
              />
            </label>
          );
        })}
        <span className="ml-2 text-sm text-white/50">
          {rating ? `${rating}/5` : "Choose"}
        </span>
      </div>
    </fieldset>
  );
}
