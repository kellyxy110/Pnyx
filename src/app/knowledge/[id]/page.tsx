import { readableArtifactWhere, publicArtifactWhere } from "@/lib/content-access";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditArtifact } from "@/lib/knowledge";
import { KnowledgeDetail } from "@/components/knowledge-detail";
import { ProductNav } from "@/components/product-nav";

export default async function KnowledgeArtifactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const artifact = await prisma.artifact.findFirst({
    where: { id, AND: [readableArtifactWhere(session?.user?.id)] },
    include: {
      author: { select: { displayName: true, username: true } },
      space: { select: { name: true, slug: true } },
      sourcePost: { select: { id: true, title: true, isDeleted: true, isDraft: true, visibility: true, space: { select: { isPublic: true } } } },
      contributors: { include: { user: { select: { displayName: true, username: true } } } },
      sources: { orderBy: { addedAt: "asc" } },
      revisions: { orderBy: { revisionNumber: "desc" }, include: { editor: { select: { displayName: true, username: true } } } },
    },
  });
  if (!artifact) notFound();
  const canEdit = await canEditArtifact(session?.user?.id ?? "", id);
  if (artifact.status === "DRAFT" && !canEdit) notFound();
  const relatedKnowledge = await prisma.artifact.findMany({
    where: {
      id: { not: artifact.id },
      AND: [publicArtifactWhere(session?.user?.id)],
      spaceId: artifact.spaceId,
      status: { in: ["PUBLISHED", "COMMUNITY_REVIEWED", "VERIFIED"] },
      visibility: "PUBLIC",
    },
    select: { id: true, title: true, summary: true, type: true, status: true },
    orderBy: { updatedAt: "desc" },
    take: 4,
  });
  const sourcePost = artifact.sourcePost && !artifact.sourcePost.isDeleted && artifact.sourcePost.visibility === "PUBLIC" && !artifact.sourcePost.isDraft && artifact.sourcePost.space.isPublic
    ? { id: artifact.sourcePost.id, title: artifact.sourcePost.title }
    : null;
  return <main id="main-content" tabIndex={-1} className="app-shell"><ProductNav /><KnowledgeDetail artifact={artifact} canEdit={canEdit} sourcePost={sourcePost} relatedKnowledge={relatedKnowledge} /></main>;
}