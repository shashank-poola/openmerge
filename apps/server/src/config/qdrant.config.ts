import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "./env.config";

const qdrantUrl = env.QDRANT_URL;
const qdrantApiKey = env.QDRANT_CLUSTER_ID || undefined;

export const qdrant = new QdrantClient({
  url: qdrantUrl,
  apiKey: qdrantApiKey,
});