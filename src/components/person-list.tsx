import Image from "next/image";
import Link from "next/link";

export type ListedPerson = { username: string; displayName: string; avatarUrl: string | null; headline: string | null };

export function PersonList({ people, empty }: { people: ListedPerson[]; empty: string }) {
  if (!people.length) return <div className="panel"><p className="help">{empty}</p></div>;
  return <ul className="public-profile-list">{people.map((person) => (
    <li key={person.username} className="flex items-center gap-3">
      {person.avatarUrl ? <Image src={person.avatarUrl} alt="" width={40} height={40} className="rounded-full" /> : <span aria-hidden="true" className="profile-avatar-fallback flex h-10 w-10 items-center justify-center rounded-full bg-[var(--navy)] text-sm text-white">{person.displayName.slice(0, 1).toUpperCase()}</span>}
      <div>
        <Link href={`/people/${person.username}`} className="font-semibold text-[var(--navy)]">{person.displayName}</Link>
        <p className="help">@{person.username}{person.headline ? ` · ${person.headline}` : ""}</p>
      </div>
    </li>
  ))}</ul>;
}
