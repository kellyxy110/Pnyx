# Deployment status

The active Pnyx production deployment is `https://pnyx-psi.vercel.app`.

The current production build is deployed from the GitHub `main` branch and includes the repaired discussion-loop migration. Production smoke checks cover the home page, feed, health endpoint, Auth.js session endpoint, and posts feed.

`pnyx.vercel.app` remains a separate domain-ownership task and is not the canonical deployment URL for this stage.

Preview environment configuration remains dependent on the Vercel Git integration recognizing the repository branch.
