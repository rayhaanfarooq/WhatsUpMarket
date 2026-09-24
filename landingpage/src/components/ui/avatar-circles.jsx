import { cn } from "../../lib/utils";

export function AvatarCircles({ avatars, numPeople, className }) {
  return (
    <div className={cn("flex -space-x-2", className)}>
      {avatars.map((avatar) => (
        <span
          key={avatar.initials}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white"
          style={{ background: avatar.color }}
        >
          {avatar.initials}
        </span>
      ))}
      {numPeople ? (
        <span className="flex h-9 items-center justify-center rounded-full border-2 border-white bg-zinc-900 px-2.5 text-xs font-semibold text-white">
          +{numPeople}
        </span>
      ) : null}
    </div>
  );
}
