import { NextResponse } from "next/server";
import { ArtifactStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recordKnowledgeMetric } from "@/lib/knowledge";
import { artifactSchema } from "@/lib/knowledge-validation";

const publishedStatuses: ArtifactStatus[] = ["PUBLISHED", "COMMUNITY_REVIEWED", "VERIFIED"];
export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status"); const space = url.searchParams.get("space")?.trim(); const type = url.searchParams.get("type")?.trim(); const query = url.searchParams.get("q")?.trim();
  const page = Math.max(1, Math.min(100, Number(url.searchParams.get("page") ?? 1) || 1)); const limit = 12;
  const where = { ...(status && publishedStatuses.includes(status as ArtifactStatus) ? { status: status as ArtifactStatus } : { status: { in: publishedStatuses } }), ...(space ? { space: { slug: space } } : {}), ...(type ? { type: type as never } : {}), ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" as const } }, { summary: { contains: query, mode: "insensitive" as const } }, { body: { contains: query, mode: "insensitive" as const } }] } : {}) };
  const artifacts = await prisma.artifact.findMany({ where, include: { author: { select: { displayName: true, username: true, avatarUrl: true } }, space: { select: { name: true, slug: true } }, _count: { select: { revisions: true, sources: true, contributors: true } } }, orderBy: { updatedAt: "desc" }, skip: (page - 1) * limit, take: limit + 1 });
  const hasMore = artifacts.length > limit; return NextResponse.json({ artifacts: artifacts.slice(0, limit), page, hasMore });
}
export async function POST(request: Request) { const session=await auth(); if(!session?.user?.id)return NextResponse.json({error:"Sign in required."},{status:401}); const parsed=artifactSchema.safeParse(await request.json().catch(()=>null)); if(!parsed.success)return NextResponse.json({error:"Check the artifact title, body, type, and Space.",issues:parsed.error.flatten()},{status:400}); const space=await prisma.space.findUnique({where:{slug:parsed.data.spaceSlug},select:{id:true,isPublic:true}}); if(!space?.isPublic)return NextResponse.json({error:"Space not found."},{status:404}); const artifact=await prisma.artifact.create({data:{authorId:session.user.id,spaceId:space.id,type:parsed.data.type,status:"DRAFT",title:parsed.data.title,summary:parsed.data.summary,body:parsed.data.body,sourcePostId:parsed.data.sourcePostId??null,sourceReplyId:parsed.data.sourceReplyId??null,publishedAt:null,contributors:{create:{userId:session.user.id,role:"AUTHOR"}}},include:{contributors:true}}); await prisma.artifactRevision.create({data:{artifactId:artifact.id,editorId:session.user.id,title:artifact.title,body:artifact.body,revisionNumber:1,changeSummary:"Initial artifact"}}); await recordKnowledgeMetric("artifact_created",session.user.id,artifact.id,"/knowledge"); return NextResponse.json({artifact},{status:201}); }