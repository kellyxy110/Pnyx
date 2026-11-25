import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function ExploreDiscovery() {
  const [posts, spaces, artifacts, people, topicSpaces] = await Promise.all([
    prisma.post.findMany({ where: { isDeleted: false, isDraft: false, visibility: "PUBLIC" }, select: { id: true, title: true, type: true, space: { select: { name: true, slug: true } }, _count: { select: { replies: true, reactions: true } } }, orderBy: [{ reactions: { _count: "desc" } }, { replies: { _count: "desc" } }, { createdAt: "desc" }], take: 5 }),
    prisma.space.findMany({ where: { isPublic: true }, select: { slug: true, name: true, description: true, tags: true, _count: { select: { members: true, posts: true } } }, orderBy: [{ members: { _count: "desc" } }, { posts: { _count: "desc" } }], take: 5 }),
    prisma.artifact.findMany({ where: { status: { in: ["PUBLISHED", "COMMUNITY_REVIEWED", "VERIFIED"] }, visibility: "PUBLIC" }, select: { id: true, title: true, type: true, status: true, space: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.user.findMany({ where: { profileVisibility: "PUBLIC", suspendedUntil: null }, select: { username: true, displayName: true, headline: true, skills: true, _count: { select: { followers: true, posts: true } } }, orderBy: [{ followers: { _count: "desc" } }, { posts: { _count: "desc" } }], take: 5 }),
    prisma.space.findMany({ where: { isPublic: true }, select: { slug: true, tags: true }, take: 30 }),
  ]);
  const topics = [...new Set(topicSpaces.flatMap((space) => space.tags.map((tag) => tag.trim()).filter(Boolean)))].slice(0, 12);
  return <section className="surface-section discovery" aria-labelledby="discover-heading">
    <div className="section-heading"><div><p className="eyebrow">Discover</p><h2 id="discover-heading">Explore the community</h2></div><p>Discover conversations worth joining and people worth learning from.</p></div>
    <div className="discovery-grid">
      <section className="panel"><h3>Popular discussions</h3>{posts.length ? <ul className="space-y-4">{posts.map((post) => <li key={post.id}><span className="badge">{post.type.toLowerCase()}</span><Link className="mt-2 block font-semibold" href={`/posts/${post.id}`}>{post.title}</Link><p className="help">{post.space.name} · {post._count.replies} {post._count.replies === 1 ? "reply" : "replies"} · {post._count.reactions} {post._count.reactions === 1 ? "reaction" : "reactions"}</p></li>)}</ul> : <p className="help">Discussions will appear here once the community starts responding.</p>}</section>
      <section className="panel"><h3>Active Spaces</h3>{spaces.length ? <ul className="space-y-4">{spaces.map((space) => <li key={space.slug}><Link className="font-semibold" href={`/spaces/${space.slug}`}>{space.name}</Link><p className="help">{space.description}</p><p className="help">{space._count.members} {space._count.members === 1 ? "member" : "members"} · {space._count.posts} {space._count.posts === 1 ? "discussion" : "discussions"}</p></li>)}</ul> : <p className="help">Public Spaces will appear here.</p>}</section>
      <section className="panel"><h3>Recently updated knowledge</h3>{artifacts.length ? <ul className="space-y-4">{artifacts.map((artifact) => <li key={artifact.id}><span className="badge">{artifact.status.toLowerCase().replace("_", " ")}</span><Link className="mt-2 block font-semibold" href={`/knowledge/${artifact.id}`}>{artifact.title}</Link><p className="help">{artifact.space.name} · {artifact.type.toLowerCase()}</p></li>)}</ul> : <p className="help">No published knowledge yet. Start with a discussion, or save your own ideas as a private draft.</p>}</section>
    </div>
    <div className="discovery-secondary">
      <section className="panel"><h3>Suggested people</h3>{people.length ? <ul className="space-y-4">{people.map((person) => { const skills = Array.isArray(person.skills) ? person.skills.slice(0, 3).map(String) : []; return <li key={person.username}><Link className="font-semibold" href={`/people/${person.username}`}>{person.displayName}</Link><p className="help">@{person.username}{person.headline ? ` · ${person.headline}` : ""}</p>{skills.length > 0 && <p className="help">{skills.join(" · ")}</p>}<p className="help">{person._count.followers} {person._count.followers === 1 ? "follower" : "followers"} · {person._count.posts} {person._count.posts === 1 ? "discussion" : "discussions"}</p></li>; })}</ul> : <p className="help">Public member profiles will appear here as people join Pnyx.</p>}</section>
      <section className="panel"><h3>Browse topics</h3>{topics.length ? <div className="profile-tags">{topics.map((topic) => <Link key={topic} href={`/spaces?topic=${encodeURIComponent(topic)}`}>{topic}</Link>)}</div> : <p className="help">Topics will appear when public Spaces add them.</p>}<p className="help mt-4">Topics link to Spaces where the community is already working on them.</p></section>
    </div>
  </section>;
}
