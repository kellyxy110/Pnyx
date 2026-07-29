import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ModerationQueue } from "@/components/moderation-queue"; import { ProductNav } from "@/components/product-nav";
export default async function ModerationPage(){const session=await auth();if(!session?.user?.id)redirect("/sign-in?callbackUrl=/moderation");const user=await prisma.user.findUnique({where:{id:session.user.id},select:{role:true}});if(user?.role!=="ADMIN"&&user?.role!=="MODERATOR")redirect("/feed");return <><ProductNav/><ModerationQueue/></>}
