import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config: runs the Next.js server on Cloudflare Workers with
// Node.js compatibility. Add R2/KV-backed incremental cache here later if you
// enable ISR/on-demand revalidation at scale.
export default defineCloudflareConfig();
