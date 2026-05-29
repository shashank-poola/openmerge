// Worker is not needed yet — the graph runs async inside the server process.
// When you need to scale (multiple server instances, high PR volume), move the
// graph to a shared package and poll here instead.
//
// To enable: bun add @repo/graph (extract graph to packages/graph)
// Then: import { reviewGraph } from "@repo/graph"

console.log("Worker: currently unused. Graph runs async inside apps/server.");
