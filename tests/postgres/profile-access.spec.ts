import { verificationTarget as localTarget } from "../../src/lib/disposable-verification";
import { assertVerifiedApplication } from "../support/verified-application";
import { randomUUID } from "node:crypto";
import { expect, request, test, type APIRequestContext } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { verificationTarget } from "./target";
import { changeProfileMedia } from "../../src/lib/profile-media";

const { app } = process.env.PNYX_PGLITE_UI === "1" ? localTarget(process.env, true) : verificationTarget(process.env);
const origin = app.origin;
const db = new PrismaClient();
let applicationVerified = false;
const prefix = `release-${randomUUID().slice(0, 8)}`;
const password = process.env.PNYX_FIXTURE_PASSWORD ?? `Fixture-A1-${randomUUID()}`;
const users = ["owner", "follower", "stranger", "deletable"].map(kind => ({ id: `${prefix}-${kind}`, username: `${prefix}-${kind}`, email: `${prefix}-${kind}@example.test`, displayName: `${prefix} ${kind}` }));
const [owner, follower, stranger, deletable] = users;
let publicSpace: {id:string;slug:string}; let privateSpace: {id:string;slug:string};
const posts: Record<string, {id:string;title:string;body:string}> = {};
const artifacts: Record<string, {id:string;title:string}> = {};
let publicReply: {id:string}; let privateReply: {id:string;body:string};
const clients = new Map<string,APIRequestContext>();
const contexts: APIRequestContext[] = [];
let anon: APIRequestContext;
const validProfile = (user=owner) => ({ username:user.username,displayName:user.displayName,headline:"Building useful things",location:"Lagos",websiteUrl:"https://example.test",githubUrl:null,linkedinUrl:null,bio:"A disposable profile fixture.",timezone:"Africa/Lagos",expertise:["TypeScript"],skills:["React"],interests:["Education"],links:["https://example.test/notes"],profileVisibility:"PUBLIC" });
async function login(user: typeof owner) {
  const client = await request.newContext({baseURL:origin}); contexts.push(client);
  const {csrfToken}=await (await client.get("/api/auth/csrf")).json();
  const response=await client.post("/api/auth/callback/credentials",{headers:{"X-Auth-Return-Redirect":"1"},form:{csrfToken,email:user.email,password,callbackUrl:`${origin}/profile`,json:"true"}});
  expect(response.status()).toBe(200); expect((await client.get("/api/account/profile")).status()).toBe(200); return client;
}

test.beforeAll(async()=>{
 const guard=await request.newContext({baseURL:origin});try{await assertVerifiedApplication(guard); applicationVerified = true;}finally{await guard.dispose();}
 const passwordHash=await bcrypt.hash(password,10);
 for(const user of users)await db.user.create({data:{...user,passwordHash,emailVerifiedAt:new Date(),links:["https://example.test/notes"]}});
 publicSpace=await db.space.create({data:{slug:`${prefix}-public`,name:`${prefix} public Space`,description:"Disposable public Space"}});
 privateSpace=await db.space.create({data:{slug:`${prefix}-private`,name:`${prefix} secret Space`,description:"Disposable private Space",isPublic:false}});
 await db.spaceMember.createMany({data:[{userId:owner.id,spaceId:privateSpace.id},{userId:follower.id,spaceId:publicSpace.id}]});
 const yesterday=new Date(Date.now()-86400000);
 for(const [kind,visibility,isDraft,isDeleted,spaceId] of [
  ["public","PUBLIC",false,false,publicSpace.id],["private","PRIVATE",false,false,publicSpace.id],
  ["followers","FOLLOWERS_ONLY",false,false,publicSpace.id],["members","SPACE_ONLY",false,false,publicSpace.id],
  ["draft","PUBLIC",true,false,publicSpace.id],["deleted","PUBLIC",false,true,publicSpace.id],
  ["secretSpace","PUBLIC",false,false,privateSpace.id],
 ] as const)posts[kind]=await db.post.create({data:{authorId:owner.id,spaceId,type:"DISCUSSION",title:`${prefix} ${kind} title`,body:`${prefix} ${kind} body`,visibility,isDraft,isDeleted,createdAt:yesterday}});
 publicReply=await db.reply.create({data:{authorId:stranger.id,postId:posts.public.id,body:`${prefix} public reply`,createdAt:yesterday}});
 privateReply=await db.reply.create({data:{authorId:owner.id,postId:posts.private.id,body:`${prefix} PRIVATE REPLY`,createdAt:yesterday}});
 for(const [kind,visibility,status,spaceId] of [["public","PUBLIC","PUBLISHED",publicSpace.id],["private","PRIVATE","PUBLISHED",publicSpace.id],["draft","PUBLIC","DRAFT",publicSpace.id],["secretSpace","PUBLIC","PUBLISHED",privateSpace.id]] as const)artifacts[kind]=await db.artifact.create({data:{authorId:owner.id,spaceId,type:"GUIDE",status,visibility,title:`${prefix} ${kind} knowledge`,body:`${prefix} knowledge body`}});
 artifacts.sourceLeak=await db.artifact.create({data:{authorId:owner.id,spaceId:publicSpace.id,type:"GUIDE",status:"PUBLISHED",title:`${prefix} safe source metadata`,body:"Public text only.",sourceReplyId:privateReply.id}});
 anon=await request.newContext({baseURL:origin});contexts.push(anon);
 for(const user of users)clients.set(user.id,await login(user));
});
test.beforeEach(async()=>{
 await db.user.update({where:{id:owner.id},data:{username:owner.username,profileVisibility:"PUBLIC",suspendedUntil:null,avatarUrl:null,avatarKey:null}});
 await db.user.update({where:{id:stranger.id},data:{username:stranger.username}});
 await db.userBlock.deleteMany({where:{OR:[{blockerId:{in:users.map(u=>u.id)}},{blockedId:{in:users.map(u=>u.id)}}]}});
 await db.userFollow.deleteMany({where:{followerId:{in:[follower.id,stranger.id]},followingId:owner.id}});
 await db.userFollow.create({data:{followerId:follower.id,followingId:owner.id}});
});
test.afterAll(async()=>{
 if(!applicationVerified){await db.$disconnect();return;}
 for(const client of contexts)await client.dispose();
 await db.analyticsEvent.deleteMany({where:{OR:[{userId:{in:users.map(u=>u.id)}},{properties:{path:["artifactId"],equals:artifacts.sourceLeak?.id??""}}]}}).catch(()=>{});
 await db.space.deleteMany({where:{id:{in:[publicSpace?.id,privateSpace?.id].filter(Boolean)}}});
 await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});await db.$disconnect();
});

test("public profile hides private titles, draft knowledge, and private memberships",async()=>{
 const response=await anon.get(`/people/${owner.username}`);expect(response.status()).toBe(200);const html=await response.text();
 expect(html).toContain(posts.public.title);expect(html).toContain(artifacts.public.title);expect(html).toContain("https://example.test/notes");
 for(const kind of ["private","followers","members","draft","deleted","secretSpace"])expect(html).not.toContain(posts[kind].title);
 for(const kind of ["private","draft","secretSpace"])expect(html).not.toContain(artifacts[kind].title);
 expect(html).not.toContain(`${prefix} secret Space`);
});

test("direct post API, HTML and reply reads enforce visibility for unrelated readers",async()=>{
 expect((await anon.get(`/api/posts/${posts.public.id}`)).status()).toBe(200);
 for(const kind of ["private","followers","members","draft","deleted","secretSpace"]){
  expect((await anon.get(`/api/posts/${posts[kind].id}`)).status(),kind).toBe(404);
  expect((await anon.get(`/api/posts/${posts[kind].id}/replies`)).status(),kind).toBe(404);
  expect((await clients.get(stranger.id)!.get(`/posts/${posts[kind].id}`)).status(),kind).toBe(404);
 }
});

test("private-content writes reject unrelated users before creating records",async()=>{
 const client=clients.get(stranger.id)!;const base=`/api/posts/${posts.private.id}`;
 for(const [suffix,data] of [["replies",{body:"An unauthorized reply"}],["bookmark",{}],["reactions",{type:"LIKE"}],["report",{reason:"SPAM"}]] as const)expect((await client.post(`${base}/${suffix}`,{data})).status(),suffix).toBe(404);
 expect(await db.bookmark.count({where:{userId:stranger.id,postId:posts.private.id}})).toBe(0);
 expect(await db.reply.count({where:{postId:posts.private.id,authorId:stranger.id}})).toBe(0);
});

test("followers and members can read their scopes while private remains owner-only",async()=>{
 const client=clients.get(follower.id)!;
 expect((await client.get(`/api/posts/${posts.followers.id}`)).status()).toBe(200);
 expect((await client.get(`/api/posts/${posts.members.id}`)).status()).toBe(200);
 expect((await client.get(`/api/posts/${posts.private.id}`)).status()).toBe(404);
 expect((await clients.get(owner.id)!.get(`/api/posts/${posts.private.id}`)).status()).toBe(200);
});

test("owned drafts reopen the composer and are never public detail pages",async()=>{
 const client=clients.get(owner.id)!;expect((await client.get(`/api/posts/${posts.draft.id}`)).status()).toBe(200);
 const html=await client.get(`/posts/${posts.draft.id}`,{maxRedirects:0});expect(html.status()).toBe(307);expect(html.headers().location).toContain(`/feed?draft=${posts.draft.id}`);
});

test("feed, knowledge and search discovery omit restricted and private-Space content",async()=>{
 const feed=JSON.stringify(await (await anon.get("/api/posts")).json());
 const knowledge=JSON.stringify(await (await anon.get("/api/artifacts")).json());
 const search=JSON.stringify(await (await anon.get(`/api/search?q=${prefix}`)).json());
 for(const kind of ["private","followers","members","draft","deleted","secretSpace"]){expect(feed).not.toContain(posts[kind].id);expect(search).not.toContain(posts[kind].title);}
 for(const kind of ["private","draft","secretSpace"]){expect(knowledge).not.toContain(artifacts[kind].id);expect(search).not.toContain(artifacts[kind].title);}
 expect(search).not.toContain(privateReply.body);
});

test("private and followers-only profiles protect their follower lists",async()=>{
 await db.user.update({where:{id:owner.id},data:{profileVisibility:"PRIVATE"}});
 for(const suffix of ["","/followers","/following"]){expect((await anon.get(`/people/${owner.username}${suffix}`)).status()).toBe(404);expect((await clients.get(follower.id)!.get(`/people/${owner.username}${suffix}`)).status()).toBe(404);}
 await db.user.update({where:{id:owner.id},data:{profileVisibility:"FOLLOWERS_ONLY"}});
 expect((await anon.get(`/people/${owner.username}`)).status()).toBe(404);
 expect((await clients.get(stranger.id)!.get(`/people/${owner.username}`)).status()).toBe(404);
 expect((await clients.get(follower.id)!.get(`/people/${owner.username}`)).status()).toBe(200);
});

test("blocking removes follow edges and prevents profile, content and follow access",async()=>{
 const client=clients.get(follower.id)!;
 expect((await client.post(`/api/users/${owner.id}/block`)).status()).toBe(200);
 expect(await db.userFollow.count({where:{followerId:follower.id,followingId:owner.id}})).toBe(0);
 expect((await client.get(`/people/${owner.username}`)).status()).toBe(404);
 expect((await client.get(`/api/posts/${posts.public.id}`)).status()).toBe(404);
 expect((await client.post(`/api/users/${owner.id}/follow`)).status()).toBe(404);
 const found=await (await client.get(`/api/search?q=${prefix}`)).json();expect(found.results.posts.some((p:{id:string})=>p.id===posts.public.id)).toBe(false);
});

test("profile links reject unsafe protocols and normal saves cannot replace managed media",async()=>{
 const client=clients.get(owner.id)!;
 for(const link of ["javascript:alert(1)","data:text/html,test","https://user:secret@example.test"]){expect((await client.patch("/api/account/profile",{data:{...validProfile(),websiteUrl:link}})).status()).toBe(400);}
 await db.user.update({where:{id:owner.id},data:{avatarKey:"fixture/old.webp",avatarUrl:"https://media.example.test/old.webp"}});
 expect((await client.patch("/api/account/profile",{data:{...validProfile(),avatarUrl:"https://unrelated.example.test/new.webp"}})).status()).toBe(200);
 expect((await db.user.findUniqueOrThrow({where:{id:owner.id}})).avatarUrl).toBe("https://media.example.test/old.webp");
 const saved=await (await client.get("/api/account/profile")).json();expect(saved.links).toEqual(["https://example.test/notes"]);
});

test("conflicting username changes return a recoverable conflict",async()=>{
 expect((await clients.get(owner.id)!.patch("/api/account/profile",{data:{...validProfile(),username:stranger.username}})).status()).toBe(409);
 const username=`${prefix}-collision`;
 const responses=await Promise.all([clients.get(owner.id)!.patch("/api/account/profile",{data:{...validProfile(),username}}),clients.get(stranger.id)!.patch("/api/account/profile",{data:{...validProfile(stranger),username}})]);
 expect(responses.map(r=>r.status()).sort()).toEqual([200,409]);
});

test("knowledge reads enforce visibility and sanitize inaccessible source replies",async()=>{
 for(const kind of ["private","draft","secretSpace"]){expect((await anon.get(`/api/artifacts/${artifacts[kind].id}`)).status()).toBe(404);expect((await anon.get(`/knowledge/${artifacts[kind].id}`)).status()).toBe(404);}
 const response=await anon.get(`/api/artifacts/${artifacts.sourceLeak.id}`);expect(response.status()).toBe(404);expect(await response.text()).not.toContain(privateReply.body);
});

test("knowledge creation rejects inaccessible or mismatched source references",async()=>{
 const data={spaceSlug:publicSpace.slug,type:"GUIDE",title:"A verified source boundary",body:"A meaningful knowledge body."};
 expect((await clients.get(stranger.id)!.post("/api/artifacts",{data:{...data,sourcePostId:posts.private.id}})).status()).toBe(404);
 expect((await clients.get(owner.id)!.post("/api/artifacts",{data:{...data,sourcePostId:posts.public.id,sourceReplyId:privateReply.id}})).status()).toBe(404);
 const response=await clients.get(owner.id)!.post("/api/artifacts",{data:{...data,sourcePostId:posts.private.id}});expect(response.status()).toBe(201);expect((await response.json()).artifact.visibility).toBe("PRIVATE");
 const reused=await clients.get(follower.id)!.post("/api/artifacts",{data:{...data,sourcePostId:posts.followers.id}});expect(reused.status()).toBe(201);expect((await reused.json()).artifact.visibility).toBe("PRIVATE");
 expect((await clients.get(owner.id)!.post(`/api/posts/${posts.public.id}/artifact`,{data:{sourceReplyId:privateReply.id}})).status()).toBe(404);
 const converted=await clients.get(owner.id)!.post(`/api/posts/${posts.public.id}/artifact`,{data:{sourceReplyId:publicReply.id}});expect(converted.status()).toBe(201);const convertedId=(await converted.json()).artifact.id;
 expect(await db.artifactRevision.count({where:{artifactId:convertedId,revisionNumber:1}})).toBe(1);
});

test("reply author filters apply to the reply author rather than the discussion author",async()=>{
 const response=await anon.get(`/api/search?q=${prefix}&type=replies&author=${stranger.username}`);expect(response.status()).toBe(200);const result=await response.json();expect(result.results.replies.map((r:{id:string})=>r.id)).toContain(publicReply.id);
});

test("follow actions are idempotent and notification links point to the actor",async()=>{
 const client=clients.get(stranger.id)!;
 const responses=await Promise.all(Array.from({length:5},()=>client.post(`/api/users/${owner.id}/follow`)));
 for(const response of responses)expect(response.status()).toBe(200);
 expect(await db.userFollow.count({where:{followerId:stranger.id,followingId:owner.id}})).toBe(1);
 expect(await db.notification.count({where:{userId:owner.id,type:"FOLLOW",href:`/people/${stranger.username}`}})).toBe(1);
});

test("media pointer swaps are serialized and unavailable removal keeps the old key",async()=>{
 const image=(key:string)=>({key,url:`https://media.example.test/${key}`,contentType:"image/webp",bytes:1200,width:256,height:256});
 const a=image("fixture/a.webp"),b=image("fixture/b.webp");
 const changes=await Promise.all([changeProfileMedia(owner.id,"avatar",a),changeProfileMedia(owner.id,"avatar",b)]);
 expect(changes.filter(c=>c.oldKey===null)).toHaveLength(1);
 const current=await db.user.findUniqueOrThrow({where:{id:owner.id}});
 expect([a.key,b.key]).toContain(current.avatarKey);
 expect(changes.map(c=>c.oldKey).filter(Boolean)).toEqual([current.avatarKey===a.key?b.key:a.key]);
 await expect(changeProfileMedia(owner.id,"avatar",null,false)).rejects.toThrow("Storage unavailable");
 expect((await db.user.findUniqueOrThrow({where:{id:owner.id}})).avatarKey).toBe(current.avatarKey);
 const removed=await changeProfileMedia(owner.id,"avatar",null);expect(removed.oldKey).toBe(current.avatarKey);
 expect((await db.user.findUniqueOrThrow({where:{id:owner.id}})).avatarKey).toBeNull();
});

test("malformed list filters return validation errors rather than server failures",async()=>{
 for(const url of ["/api/posts?page=oops","/api/artifacts?type=NOT_A_TYPE","/api/artifacts?page=1.2","/api/search?q=valid&from=2026-10-30&to=2026-01-01"]){expect((await anon.get(url)).status(),url).toBe(400);}
});

test("draft creation, recovery, publication, reply and removal form one persisted journey",async()=>{
 const client=clients.get(owner.id)!;const data={spaceSlug:publicSpace.slug,type:"QUESTION",title:`${prefix} full journey`,body:"A disposable end-to-end question.",visibility:"PUBLIC",isDraft:true};
 const created=await client.post("/api/posts",{data});expect(created.status()).toBe(201);const id=(await created.json()).post.id;
 expect((await anon.get(`/api/posts/${id}`)).status()).toBe(404);
 expect((await client.patch(`/api/posts/${id}`,{data:{...data,isDraft:false}})).status()).toBe(200);
 expect((await anon.get(`/api/posts/${id}`)).status()).toBe(200);
 const reply=await clients.get(stranger.id)!.post(`/api/posts/${id}/replies`,{data:{body:"A disposable answer."}});expect(reply.status()).toBe(201);const replyId=(await reply.json()).reply.id;
 expect((await client.post(`/api/posts/${id}/accept`,{data:{replyId}})).status()).toBe(200);
 expect((await client.delete(`/api/posts/${id}`)).status()).toBe(200);
 expect((await anon.get(`/api/posts/${id}/replies`)).status()).toBe(404);
});

test("account deletion requires confirmation and revokes its fixture session",async()=>{
 const client=clients.get(deletable.id)!;
 expect((await client.delete("/api/account/delete",{data:{confirmation:"wrong"}})).status()).toBe(400);
 expect((await client.delete("/api/account/delete",{data:{confirmation:"DELETE MY ACCOUNT"}})).status()).toBe(200);
 expect((await client.get("/api/account/profile")).status()).toBe(401);
});
