import { verificationTarget as target } from "../../src/lib/disposable-verification";
/** Native PostgreSQL keeps its stricter options; PGlite compatibility is separately opted in. */
export function verificationTarget(env: Record<string, string | undefined>) { return target(env); }
