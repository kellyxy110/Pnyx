import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
const usernameSchema=z.string().trim().min(3).max(30).regex(/^[a-z0-9_-]+$/);
export async function GET(request:Request){const username=new URL(request.url).searchParams.get("username")?.toLowerCase()??"";const parsed=usernameSchema.safeParse(username);if(!parsed.success)return NextResponse.json({valid:false,available:false,error:"Use 3–30 lowercase letters, numbers, hyphens, or underscores."},{status:400});const existing=await prisma.user.findUnique({where:{username:parsed.data},select:{id:true}});return NextResponse.json({valid:true,available:!existing,username:parsed.data});}