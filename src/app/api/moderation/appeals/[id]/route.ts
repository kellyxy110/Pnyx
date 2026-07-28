import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageModeration } from "@/lib/moderation";
import { recordAuditEvent } from "@/lib/audit";
const schema=z.object({status:z.enum(["RESOLVED","DISMISSED","REVIEWING"]),resolution:z.string().trim().min(3).max(2000)});
export async function PATCH(request:Request,c:{params:Promise<{id:string}>}){const s=await auth();if(!s?.user?.id||!(await canManageModeration(s.user.id)))return NextResponse.json({error:"Moderator access required."},{status:403});const p=schema.safeParse(await request.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"A resolution is required."},{status:400});const {id}=await c.params;const appeal=await prisma.moderationAppeal.update({where:{id},data:{status:p.data.status,resolution:p.data.resolution,reviewerId:s.user.id}});await recordAuditEvent({actorId:s.user.id,action:`APPEAL_${p.data.status}`,entityType:"MODERATION_APPEAL",entityId:id});return NextResponse.json({appeal});}