import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostDetail } from "@/components/post-detail";
import { ProductNav } from "@/components/product-nav";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const viewerId = session?.user?.id ?? null;
  const post = await prisma.post.findFirst({
    where: { id, isDeleted: false, isDraft: false },
    include: {
      author: { select: { id: true, displayName: true, username: true } },
      space: { select: { name: true, slug: true } },
      reactions: { where: { userId: viewerId ?? "__anonymous__" }, select: { userId: true } },
      bookmarks: { where: { userId: viewerId ?? "__anonymous__" }, select: { userId: true } },
      replies: { where: { isDeleted: false }, orderBy: [{ isAccepted: "desc" }, { createdAt: "asc" }], include: { author: { select: { id: true, displayName: true, username: true } } } },
    },
  });
  if (!post) notFound();
  return <main id="main-content" tabIndex={-1} className="app-shell"><ProductNav /><PostDetail viewerId={viewerId} post={post} /></main>;
}
