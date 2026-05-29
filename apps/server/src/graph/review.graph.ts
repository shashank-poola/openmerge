import { StateGraph, END, START } from "@langchain/langgraph";
import { PRReviewState } from "./review.state";
import { fetchContext } from "./nodes/fetch-context.node";
import { codeReviewAgent, securityAgent, performanceAgent } from "./nodes/review-agents.node";
import { aggregateComments } from "./nodes/aggregator.node";
import { postReview } from "./nodes/post-review.node";

const graph = new StateGraph(PRReviewState)
    .addNode("fetchContext", fetchContext)
    .addNode("codeReview", codeReviewAgent)
    .addNode("securityReview", securityAgent)
    .addNode("performanceReview", performanceAgent)
    .addNode("aggregate", aggregateComments)
    .addNode("postReview", postReview)
    .addEdge(START, "fetchContext")
    .addEdge("fetchContext", "codeReview")
    .addEdge("fetchContext", "securityReview")
    .addEdge("fetchContext", "performanceReview")
    .addEdge("codeReview", "aggregate")
    .addEdge("securityReview", "aggregate")
    .addEdge("performanceReview", "aggregate")
    .addEdge("aggregate", "postReview")
    .addEdge("postReview", END);

export const reviewGraph = graph.compile();

export type ReviewGraphInput = {
    reviewSessionId: string;
    repositoryId: string;
    githubInstallationId: string;
    prNumber: number;
    headSha: string;
    baseBranch: string;
    owner: string;
    repoName: string;
};
