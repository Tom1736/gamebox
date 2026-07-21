import { Check, UserPlus } from "lucide-react";
import { toggleFriendAction } from "@/app/actions/friends";
import { Button } from "@/components/ui/button";

export function FriendButton({
  username,
  isFriend,
}: {
  username: string;
  isFriend: boolean;
}) {
  return (
    <form action={toggleFriendAction}>
      <input type="hidden" name="username" value={username} />
      <Button
        type="submit"
        variant={isFriend ? "outline" : "default"}
        className={
          isFriend
            ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
            : "bg-lime-300 font-bold text-slate-950 hover:bg-lime-200"
        }
      >
        {isFriend ? <Check /> : <UserPlus />}
        {isFriend ? "Friends" : "Add friend"}
      </Button>
    </form>
  );
}
