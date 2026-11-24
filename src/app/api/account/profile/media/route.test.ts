import { beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), configured: vi.fn(), put: vi.fn(), remove: vi.fn(), change: vi.fn(), cleanup: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/storage", () => ({ isStorageConfigured: mocks.configured, putImage: mocks.put, deleteObject: mocks.remove, publicUrlForKey: (key:string|null) => key ? `https://media.example.test/${key}` : null }));
vi.mock("@/lib/profile-media", () => ({ changeProfileMedia: mocks.change }));
vi.mock("@/lib/media-cleanup", () => ({ attemptMediaCleanup: mocks.cleanup }));
import { POST, DELETE } from "./route";
const stored={key:"users/fixture/avatar/new.webp",url:"https://media.example.test/new.webp",contentType:"image/webp",bytes:1200,width:256,height:256};
async function imageRequest(bytes?:Buffer, type="image/png") {
  const data=bytes??await sharp({create:{width:256,height:256,channels:3,background:"#2563eb"}}).png().toBuffer();
  const form=new FormData();form.append("kind","avatar");form.append("file",new File([new Uint8Array(data)],"fixture.png",{type}));return new Request("http://localhost/api/account/profile/media",{method:"POST",body:form});
}
describe("profile media failure boundaries",()=>{
 beforeEach(()=>{vi.resetAllMocks();mocks.auth.mockResolvedValue({user:{id:"fixture"}});mocks.configured.mockReturnValue(true);mocks.put.mockResolvedValue(stored);mocks.remove.mockResolvedValue(undefined);mocks.cleanup.mockResolvedValue(true);mocks.change.mockResolvedValue({oldKey:"users/fixture/avatar/old.webp",updated:{avatarUrl:stored.url,avatarKey:stored.key,bannerKey:null},cleanupIds:["cleanup-fixture"]});});
 it("normalizes a valid upload and removes only the prior owned pointer",async()=>{
  const response=await POST(await imageRequest());expect(response.status).toBe(200);
  expect(mocks.put.mock.calls[0][0].contentType).toBe("image/webp");expect(mocks.put.mock.calls[0][0].key).toMatch(/^users\/fixture\/avatar\/.*\.webp$/);
  expect(mocks.change).toHaveBeenCalledWith("fixture","avatar",stored);expect(mocks.cleanup).toHaveBeenCalledWith(["cleanup-fixture"]);
 });
 it("cleans up the new object after any pointer persistence failure",async()=>{
  mocks.change.mockRejectedValue(new Error("Database unavailable"));expect((await POST(await imageRequest())).status).toBe(503);expect(mocks.remove).toHaveBeenCalledExactlyOnceWith(stored.key);
 });
 it("rejects corrupt image bytes as an input error before storage",async()=>{
  expect((await POST(await imageRequest(Buffer.from("invalid image")))).status).toBe(400);expect(mocks.put).not.toHaveBeenCalled();
 });
 it("rejects SVG bytes disguised as a PNG",async()=>{
  const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="blue"/></svg>');
  expect((await POST(await imageRequest(svg))).status).toBe(400);expect(mocks.put).not.toHaveBeenCalled();
 });
 it("does not accept unauthenticated uploads",async()=>{mocks.auth.mockResolvedValue(null);expect((await POST(await imageRequest())).status).toBe(401);expect(mocks.put).not.toHaveBeenCalled();});
 it("returns a recoverable deletion error when the pointer cannot be safely cleared",async()=>{
  mocks.change.mockRejectedValue(new Error("Storage unavailable"));expect((await DELETE(new Request("http://localhost/api/account/profile/media?kind=avatar",{method:"DELETE"}))).status).toBe(503);expect(mocks.remove).not.toHaveBeenCalled();
 });
});

it("reports a durable pending receipt when provider cleanup fails",async()=>{mocks.auth.mockResolvedValue({user:{id:"fixture"}});mocks.change.mockResolvedValue({cleanupIds:["pending-fixture"],updated:{avatarKey:null,bannerKey:null}});mocks.cleanup.mockResolvedValue(false);const response=await DELETE(new Request("http://localhost/api/account/profile/media?kind=avatar",{method:"DELETE"}));expect(response.status).toBe(200);expect(await response.json()).toMatchObject({deleted:true,cleanupPending:true});});
