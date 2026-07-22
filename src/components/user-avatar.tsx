import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function UserAvatar({
  username,
  hasAvatar = false,
  className,
  fallbackClassName,
}: {
  username: string;
  hasAvatar?: boolean;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={cn("size-10", className)}>
      {hasAvatar ? (
        <AvatarImage src={`/api/users/${encodeURIComponent(username)}/avatar`} alt={`@${username}`} />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 font-black text-white",
          fallbackClassName,
        )}
      >
        {username[0]?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
