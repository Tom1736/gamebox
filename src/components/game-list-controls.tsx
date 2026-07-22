import { Bookmark, Heart, X } from "lucide-react";
import {
  removeFavoriteAction,
  setFavoriteAction,
  toggleWishlistAction,
} from "@/app/actions/lists";
import { Button } from "@/components/ui/button";

export function GameListControls({
  gameId,
  isWishlisted,
  favoritePosition,
}: {
  gameId: number;
  isWishlisted: boolean;
  favoritePosition: number | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={toggleWishlistAction}>
        <input type="hidden" name="gameId" value={gameId} />
        <Button
          type="submit"
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <Bookmark className={isWishlisted ? "fill-lime-300 text-lime-300" : ""} />
          {isWishlisted ? "In wishlist" : "Add to wishlist"}
        </Button>
      </form>
      <form action={setFavoriteAction} className="flex items-center gap-2">
        <input type="hidden" name="gameId" value={gameId} />
        <label className="sr-only" htmlFor={`favorite-position-${gameId}`}>Favorite position</label>
        <select
          id={`favorite-position-${gameId}`}
          name="position"
          defaultValue={favoritePosition ?? 1}
          className="h-9 rounded-lg border border-white/10 bg-[#111622] px-3 text-sm text-white outline-none focus:ring-2 focus:ring-lime-300"
        >
          <option value="1">Favorite #1</option>
          <option value="2">Favorite #2</option>
          <option value="3">Favorite #3</option>
        </select>
        <Button type="submit" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
          <Heart className={favoritePosition ? "fill-fuchsia-400 text-fuchsia-400" : ""} />
          {favoritePosition ? "Move" : "Set favorite"}
        </Button>
      </form>
      {favoritePosition ? (
        <form action={removeFavoriteAction}>
          <input type="hidden" name="gameId" value={gameId} />
          <Button type="submit" variant="ghost" size="icon" aria-label="Remove from favorites" className="text-white/35 hover:text-rose-300">
            <X />
          </Button>
        </form>
      ) : null}
    </div>
  );
}
