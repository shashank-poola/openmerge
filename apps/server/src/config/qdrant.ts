import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "./env";

const qdrantUrl =
  env.QDRANT_CLUSTER_ID;
const qdrantApiKey = env.QDRANT_URL || undefined;

export const qdrant = new QdrantClient({
  url: qdrantUrl,
  apiKey: qdrantApiKey,
});