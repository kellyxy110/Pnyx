"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Person = { username: string; displayName: string; avatarUrl: string | null };

function PeopleList({ title, people, empty }: { title: string; people: Person[]; empty: string }) {
  return <section className="profile-network-list"><h2>{title}</h2>{people.length ? <ul>{people.map((person) => <li key={person.username}><Link href={`/people/${person.username}`}>{person.avatarUrl ? <Image src={person.avatarUrl} alt="" width={32} height={32} /> : <span aria-hidden="true">{person.displayName.slice(0, 1).toUpperCase()}</span>}<strong>{person.displayName}</strong><small>@{person.username}</small></Link></li>)}</ul> : <p>{empty}</p>}</section>;
}

export function ProfileNetwork() {
  const [network, setNetwork] = useState<{ followers: Person[]; following: Person[] } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetch("/api/account/network").then(async (response) => { if (!response.ok) throw new Error(); setNetwork(await response.json()); }).catch(() => setError("Your network could not be loaded.")); }, []);
  if (error) return <p role="alert" className="profile-message error">{error}</p>;
  if (!network) return <p role="status">Loading your network…</p>;
  return <section className="profile-network"><p className="eyebrow">Your network</p><div><PeopleList title="Followers" people={network.followers} empty="People who follow you will appear here." /><PeopleList title="Following" people={network.following} empty="Follow people whose work you want to keep up with." /></div></section>;
}