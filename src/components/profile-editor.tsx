"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

type Counts = { posts: number; replies: number; artifacts: number; bookmarks: number; follows: number; followers: number; spaces: number };
type Activity = { spaces: { name: string; slug: string }[]; posts: { id: string; title: string; createdAt: string }[]; replies: { id: string; body: string; createdAt: string; post: { id: string; title: string } }[]; artifacts: { id: string; title: string; status: string; updatedAt: string }[]; bookmarks: { post: { id: string; title: string }; createdAt: string }[]; drafts: { id: string; title: string; updatedAt: string }[] };
type Profile = { username: string; displayName: string; avatarUrl: string | null; bannerUrl: string | null; bio: string | null; headline: string | null; location: string | null; websiteUrl: string | null; githubUrl: string | null; linkedinUrl: string | null; timezone: string | null; expertise: string[] | null; skills: string[] | null; interests: string[] | null; links: string[] | null; profileVisibility: "PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE"; counts: Counts; activity: Activity };

const splitList = (value: FormDataEntryValue | null) => String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
const nullable = (value: FormDataEntryValue | null) => String(value ?? "").trim() || null;

export function ProfileEditor() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [storageEnabled, setStorageEnabled] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("");
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);
  const [progress, setProgress] = useState(0);
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let active = true;
    async function loadProfile() {
      setError("");
      try {
        const profileResponse = await fetch("/api/account/profile", { cache: "no-store" });
        const profileData = await profileResponse.json().catch(() => null);
        if (!profileResponse.ok) {
          if (profileResponse.status === 401) throw new Error("SESSION_EXPIRED");
          throw new Error(profileData?.error ?? "PROFILE_LOAD_FAILED");
        }
        if (!active) return;
        setProfile(profileData);
        const mediaResponse = await fetch("/api/account/profile/media", { cache: "no-store" });
        const mediaData = await mediaResponse.json().catch(() => null);
        if (active && mediaResponse.ok) setStorageEnabled(Boolean(mediaData?.enabled));
      } catch (loadError) {
        if (!active) return;
        if (loadError instanceof Error && loadError.message === "SESSION_EXPIRED") setError("Your session has expired. Sign in again to continue editing your profile.");
        else setError(loadError instanceof Error && loadError.message !== "PROFILE_LOAD_FAILED" ? loadError.message : "Your profile could not be loaded. Try again in a moment.");
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, [reloadKey]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const data = new FormData(event.currentTarget);
    const payload = { username: String(data.get("username") ?? "").trim().toLowerCase(), displayName: String(data.get("displayName") ?? ""), headline: nullable(data.get("headline")), location: nullable(data.get("location")), websiteUrl: nullable(data.get("websiteUrl")), githubUrl: nullable(data.get("githubUrl")), linkedinUrl: nullable(data.get("linkedinUrl")), avatarUrl: profile?.avatarUrl ?? null, bio: nullable(data.get("bio")), timezone: nullable(data.get("timezone")), expertise: splitList(data.get("expertise")), skills: splitList(data.get("skills")), interests: splitList(data.get("interests")), links: String(data.get("links") ?? "").split("\n").map((item) => item.trim()).filter(Boolean), profileVisibility: data.get("profileVisibility") };
    const response = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => null);
    if (!response.ok) setError(result?.error ?? result?.fieldErrors?.username?.[0] ?? "Your profile could not be saved. Please check each field and try again.");
    else { setProfile((current) => current ? { ...current, ...result } : current); setMessage("Profile saved."); }
    setBusy(false);
  }

  function upload(kind: "avatar" | "banner", file: File) {
    setUploading(kind); setProgress(0); setError(""); setMessage("");
    const request = new XMLHttpRequest();
    request.open("POST", "/api/account/profile/media");
    request.upload.onprogress = (event) => { if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100)); };
    request.onerror = () => { setError("The image upload could not be completed. Please try again."); setUploading(null); };
    request.onload = () => {
      const result = (() => { try { return JSON.parse(request.responseText); } catch { return null; } })();
      if (request.status < 200 || request.status >= 300) setError(result?.error ?? "The image could not be saved. Please try again.");
      else { setProfile((current) => current ? { ...current, ...result, bannerUrl: kind === "banner" ? current.bannerUrl : current.bannerUrl } : current); setMessage(`${kind === "avatar" ? "Avatar" : "Banner"} updated.`); }
      setUploading(null); setProgress(0);
    };
    const form = new FormData(); form.append("kind", kind); form.append("file", file); request.send(form);
  }

  async function remove(kind: "avatar" | "banner") {
    setUploading(kind); setError("");
    const response = await fetch(`/api/account/profile/media?kind=${kind}`, { method: "DELETE" });
    if (!response.ok) setError("The image could not be removed. Please try again.");
    else { setProfile((current) => current ? { ...current, avatarUrl: kind === "avatar" ? null : current.avatarUrl, bannerUrl: kind === "banner" ? null : current.bannerUrl } : current); setMessage(`${kind === "avatar" ? "Avatar" : "Banner"} removed.`); }
    setUploading(null);
  }

  if (error && !profile) return <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"><p>{error}</p><div className="mt-4 flex gap-3"><button type="button" className="button-outline" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>{error.includes("session") && <a className="button-primary" href="/sign-in?returnTo=/profile">Sign in</a>}</div></section>;
  if (!profile) return <p role="status" className="text-slate-600">Loading your profile…</p>;
  const initials = profile.displayName.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  return <div className="profile-editor">
    <section className="profile-preview" aria-label="Profile preview">
      <div className="profile-banner" style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})` } : undefined} />
      <div className="profile-identity">
        {profile.avatarUrl ? <Image src={profile.avatarUrl} alt="" width={96} height={96} className="profile-avatar" /> : <span className="profile-avatar profile-avatar-fallback" aria-hidden="true">{initials}</span>}
        <div><p className="eyebrow">@{profile.username}</p><h2>{profile.displayName}</h2><p>{profile.headline || "Technology community member"}</p></div><button type="button" className="button-outline profile-edit-trigger" onClick={() => setEditing(true)}>Edit profile</button>
      </div>
      <dl className="profile-counts"><div><dt>Followers</dt><dd>{profile.counts.followers}</dd></div><div><dt>Following</dt><dd>{profile.counts.follows}</dd></div><div><dt>Discussions</dt><dd>{profile.counts.posts}</dd></div><div><dt>Knowledge</dt><dd>{profile.counts.artifacts}</dd></div></dl>
    </section>
{!editing && <section className="profile-readonly" aria-label="Saved profile details">
      <div className="profile-readonly-grid">
        <article className="profile-readonly-card"><p className="eyebrow">Identity</p><h2>About {profile.displayName}</h2><p>{profile.bio || "No bio added yet."}</p>{(profile.location || profile.timezone) && <dl className="profile-detail-list">{profile.location && <div><dt>Location</dt><dd>{profile.location}</dd></div>}{profile.timezone && <div><dt>Timezone</dt><dd>{profile.timezone}</dd></div>}</dl>}</article>
        <article className="profile-readonly-card"><p className="eyebrow">Expertise</p><h2>What I know</h2><div className="profile-tags">{[...(profile.expertise ?? []), ...(profile.skills ?? []), ...(profile.interests ?? [])].length ? [...(profile.expertise ?? []), ...(profile.skills ?? []), ...(profile.interests ?? [])].map((item) => <span key={item}>{item}</span>) : <p>No expertise added yet.</p>}</div></article>
        <article className="profile-readonly-card"><p className="eyebrow">Links</p><h2>Find me elsewhere</h2><div className="profile-link-list">{profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noreferrer">Website ↗</a>}{profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}{profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a>}{!profile.websiteUrl && !profile.githubUrl && !profile.linkedinUrl && <p>No public links added yet.</p>}</div></article>
      </div>
      <section className="profile-activity"><p className="eyebrow">Activity</p><h2>My work in the commons</h2><div className="profile-activity-grid"><article><h3>Joined Spaces</h3>{profile.activity.spaces.length ? <ul>{profile.activity.spaces.map((space) => <li key={space.slug}><a href={`/spaces/${space.slug}`}>{space.name}</a></li>)}</ul> : <p>Join a Space to start building your community.</p>}</article><article><h3>Discussions</h3>{profile.activity.posts.length ? <ul>{profile.activity.posts.map((post) => <li key={post.id}><a href={`/posts/${post.id}`}>{post.title}</a></li>)}</ul> : <p>Your published discussions will appear here.</p>}</article><article><h3>Knowledge</h3>{profile.activity.artifacts.length ? <ul>{profile.activity.artifacts.map((artifact) => <li key={artifact.id}><a href={`/knowledge/${artifact.id}`}>{artifact.title}</a><small>{artifact.status.replace(/_/g, " ")}</small></li>)}</ul> : <p>Your articles and research will appear here.</p>}</article><article><h3>Recent replies</h3>{profile.activity.replies.length ? <ul>{profile.activity.replies.map((reply) => <li key={reply.id}><a href={`/posts/${reply.post.id}#replies`}>{reply.body.slice(0, 90)}{reply.body.length > 90 ? "…" : ""}</a></li>)}</ul> : <p>Your replies will appear here.</p>}</article></div></section>
    </section>}
    {editing &&     <form onSubmit={save} className="profile-form">
      <section><p className="eyebrow">Identity</p><h2>Tell people what you are here to explore.</h2><div className="profile-fields two"><label>Username<input name="username" defaultValue={profile.username} required minLength={3} maxLength={30} pattern="[a-z0-9_-]+" onBlur={async (event) => { const value = event.currentTarget.value.trim().toLowerCase(); if (value === profile.username) return setUsernameStatus(""); const response = await fetch(`/api/account/username?username=${encodeURIComponent(value)}`); const result = await response.json().catch(() => null); setUsernameStatus(response.ok && result?.available ? "Username available." : result?.error ?? "Username unavailable."); }} /><small aria-live="polite">{usernameStatus || `Your public profile: /people/${profile.username}`}</small></label><label>Display name<input name="displayName" defaultValue={profile.displayName} required maxLength={80} /></label><label>Headline<input name="headline" defaultValue={profile.headline ?? ""} maxLength={120} placeholder="Builder, researcher, designer…" /></label><label>Location<input name="location" defaultValue={profile.location ?? ""} maxLength={100} placeholder="Lagos, Nigeria" /></label><label>Timezone<input name="timezone" defaultValue={profile.timezone ?? ""} maxLength={80} placeholder="Africa/Lagos" /></label></div><label>Bio<textarea name="bio" defaultValue={profile.bio ?? ""} rows={5} maxLength={500} placeholder="What do you build, study, or care about?" /></label></section>
      <section><p className="eyebrow">Expertise</p><h2>Make your knowledge easier to discover.</h2><div className="profile-fields two"><label>Expertise<input name="expertise" defaultValue={profile.expertise?.join(", ") ?? ""} placeholder="AI, TypeScript, Product" /></label><label>Skills<input name="skills" defaultValue={profile.skills?.join(", ") ?? ""} placeholder="React, PostgreSQL, Figma" /></label><label>Interests<input name="interests" defaultValue={profile.interests?.join(", ") ?? ""} placeholder="Open source, education, robotics" /></label><label>Visibility<select name="profileVisibility" defaultValue={profile.profileVisibility}><option value="PUBLIC">Public</option><option value="FOLLOWERS_ONLY">Followers only</option><option value="PRIVATE">Private</option></select></label></div></section>
      <section><p className="eyebrow">Links</p><h2>Give collaborators the right places to find you.</h2><div className="profile-fields two"><label>Website<input name="websiteUrl" type="url" defaultValue={profile.websiteUrl ?? ""} placeholder="https://…" /></label><label>GitHub<input name="githubUrl" type="url" defaultValue={profile.githubUrl ?? ""} placeholder="https://github.com/…" /></label><label>LinkedIn<input name="linkedinUrl" type="url" defaultValue={profile.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/…" /></label></div><label>Additional links<textarea name="links" defaultValue={profile.links?.join("\n") ?? ""} rows={3} placeholder="One secure https link per line" /></label></section>
      <section className="profile-activity"><p className="eyebrow">Your activity</p><h2>Your work in the commons.</h2><div className="profile-activity-grid"><article><h3>Joined Spaces</h3>{profile.activity.spaces.length ? <ul>{profile.activity.spaces.map((space) => <li key={space.slug}><a href={`/spaces/${space.slug}`}>{space.name}</a></li>)}</ul> : <p>Join a Space to start building your community.</p>}</article><article><h3>Recent discussions</h3>{profile.activity.posts.length ? <ul>{profile.activity.posts.map((post) => <li key={post.id}><a href={`/posts/${post.id}`}>{post.title}</a></li>)}</ul> : <p>Your published discussions will appear here.</p>}</article><article><h3>Knowledge contributions</h3>{profile.activity.artifacts.length ? <ul>{profile.activity.artifacts.map((artifact) => <li key={artifact.id}><a href={`/knowledge/${artifact.id}`}>{artifact.title}</a><small>{artifact.status.replace(/_/g, " ")}</small></li>)}</ul> : <p>Turn a useful discussion into knowledge when it is ready.</p>}</article><article><h3>Drafts and saved</h3>{profile.activity.drafts.length || profile.activity.bookmarks.length ? <ul>{profile.activity.drafts.map((draft) => <li key={`draft-${draft.id}`}><a href={`/posts/${draft.id}`}>Draft: {draft.title}</a></li>)}{profile.activity.bookmarks.map((bookmark) => <li key={`bookmark-${bookmark.post.id}`}><a href={`/posts/${bookmark.post.id}`}>Saved: {bookmark.post.title}</a></li>)}</ul> : <p>Private drafts and saved discussions will appear here.</p>}</article></div></section>
      <section><p className="eyebrow">Profile media</p><h2>Use images that belong to you.</h2>{!storageEnabled && <p className="help">Avatar and banner uploads are being prepared. Image storage must be configured before Pnyx can safely keep your files.</p>}{storageEnabled && <div className="profile-media-actions"><input ref={avatarInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && upload("avatar", event.target.files[0])} /><button type="button" className="button-outline" onClick={() => avatarInput.current?.click()} disabled={Boolean(uploading)}>Replace avatar</button>{profile.avatarUrl && <button type="button" className="text-link" onClick={() => remove("avatar")} disabled={Boolean(uploading)}>Remove avatar</button>}<input ref={bannerInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && upload("banner", event.target.files[0])} /><button type="button" className="button-outline" onClick={() => bannerInput.current?.click()} disabled={Boolean(uploading)}>Replace banner</button>{profile.bannerUrl && <button type="button" className="text-link" onClick={() => remove("banner")} disabled={Boolean(uploading)}>Remove banner</button>}</div>}{uploading && <p role="status">Uploading {uploading}… {progress}%</p>}</section>
      {error && <p role="alert" className="profile-message error">{error}</p>}{message && <p role="status" className="profile-message success">{message}</p>}<button disabled={busy} className="button-primary profile-save">{busy ? "Saving profile…" : "Save profile"}</button>
    </form>}
  </div>;
}
