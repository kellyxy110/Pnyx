import { describe, expect, it, vi } from "vitest";
import type { APIRequestContext } from "@playwright/test";
import { assertVerifiedApplication } from "../../tests/support/verified-application";
import { verificationProof } from "./disposable-verification";
const env = { PNYX_DISPOSABLE_POSTGRES: "1", DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1/pnyx_verify_challenge", APP_URL: "http://127.0.0.1:3000", PNYX_VERIFICATION_SECRET: "a".repeat(64) };
function client(status: number, proof: (nonce:string)=>string|null) {
 const get=vi.fn(async (_url:string,options:{headers:Record<string,string>})=>({status:()=>status,headers:()=>({"x-pnyx-verification-proof":proof(options.headers["X-Pnyx-Verification-Nonce"])})}));
 return {request:{get} as unknown as APIRequestContext,get};
}
describe("before-write application target handshake",()=>{
 it("accepts the correct app and prohibits redirect following",async()=>{
  const c=client(200,nonce=>verificationProof(env,nonce));await expect(assertVerifiedApplication(c.request,env)).resolves.toBeUndefined();expect(c.get).toHaveBeenCalledExactlyOnceWith("/api/health",expect.objectContaining({maxRedirects:0}));
 });
 it("rejects a healthy app connected to another disposable database",async()=>{
  const c=client(200,nonce=>verificationProof({...env,DATABASE_URL:env.DATABASE_URL.replace("pnyx_verify_challenge","pnyx_verify_other")},nonce));await expect(assertVerifiedApplication(c.request,env)).rejects.toThrow("did not prove");expect(c.get).toHaveBeenCalledTimes(1);
 });
 it.each([200,302,503])("rejects missing proof or unavailable/redirecting app (%i)",async status=>{
  const c=client(status,()=>null);await expect(assertVerifiedApplication(c.request,env)).rejects.toThrow("did not prove");
 });
});
