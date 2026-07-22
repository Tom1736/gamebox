"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function ratingLabel(rating: number) {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function StarFill({ fill }: { fill: number }) {
  const percent = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <span className="relative block size-full" aria-hidden="true">
      <Star className="absolute inset-0 size-full fill-transparent text-white/20" />
      <Star
        className="absolute inset-0 size-full fill-lime-300 text-lime-300"
        style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
      />
    </span>
  );
}

export function Stars({
  rating,
  className,
  label = `${ratingLabel(rating)} out of 5 stars`,
}: {
  rating: number;
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <span className="size-4" key={index}>
          <StarFill fill={rating - index} />
        </span>
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
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="relative size-8">
            <StarFill fill={rating - index} />
            {[0.5, 1].map((step) => {
              const value = index + step;
              return (
                <label
                  key={value}
                  className={cn(
                    "absolute inset-y-0 cursor-pointer rounded-sm focus-within:ring-2 focus-within:ring-lime-300",
                    step === 0.5 ? "left-0 w-1/2" : "right-0 w-1/2",
                  )}
                  title={`${ratingLabel(value)} star${value === 1 ? "" : "s"}`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="rating"
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    required
                  />
                  <span className="sr-only">{ratingLabel(value)} stars</span>
                </label>
              );
            })}
          </span>
        ))}
        <span className="ml-2 text-sm text-white/50">
          {rating ? `${ratingLabel(rating)}/5` : "Choose"}
        </span>
      </div>
      <p className="mt-2 text-xs text-white/30">Half stars are welcome.</p>
    </fieldset>
  );
}
