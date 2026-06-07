import { cn } from "@/src/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  username?: string | null;
  publicId?: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "h-11 w-11 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-4xl",
};

function getInitials({
  name,
  username,
  publicId,
}: Pick<UserAvatarProps, "name" | "username" | "publicId">) {
  const source = name || username || publicId || "V";
  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function UserAvatar({
  name,
  username,
  publicId,
  image,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const src = avatarUrl || image;
  const label = name || username || publicId || "Viremo user";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[rgba(200,168,233,0.22)] font-bold text-[var(--accent)] ring-1 ring-[var(--accent-highlight)]",
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={label} className="h-full w-full object-cover" />
      ) : (
        getInitials({ name, username, publicId })
      )}
    </div>
  );
}
