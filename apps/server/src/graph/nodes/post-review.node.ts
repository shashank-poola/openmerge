import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { db } from "@repo/database";
import { env } from "../../config/env.config";
import type { PRReviewStateType } from "../review.state";
import { cleanupRepo } from "../context/clone-repo";
import { buildReviewComment } from "./post-review.formatter";
import { buildReviewCommentKey } from "../../utils/review-comment.utils";

const createInstallationOctokit = (githubInstallationId: string) =>
  new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: env.GITHUB_APP_ID,
      privateKey: env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
      installationId: Number(githubInstallationId),
    },
  });

export const postReview = async (state: PRReviewStateType): Promise<Partial<PRReviewStateType>> => {
  const startedAt = Date.now();
  const session = await db.reviewSession.findUnique({
    where: { id: state.reviewSessionId },
    select: {
      githubLoadingCommentId: true,
      createdAt: true,
      status: true,
      jobId: true,
      leaseId: true,
      workerId: true,
    },
  });

  if (
    !session ||
    session.status !== "RUNNING" ||
    session.jobId !== state.jobId ||
    session.leaseId !== state.leaseId ||
    session.workerId !== state.workerId
  ) {
    if (state.repoLocalPath) {
      await cleanupRepo(state.repoLocalPath);
    }
    return { error: "REVIEW_OWNERSHIP_LOST" };
  }

  const octokit = createInstallationOctokit(state.githubInstallationId);
  const loadingCommentId = session.githubLoadingCommentId ?? null;
  const queuedAt = session.createdAt?.getTime() ?? startedAt;
  const totalDurationMs = Date.now() - queuedAt;

  try {
    if (state.error) {
      if (loadingCommentId) {
        try {
          await octokit.rest.issues.updateComment({
            owner: state.owner,
            repo: state.repoName,
            comment_id: Number(loadingCommentId),
            body: "**PullRabbit** encountered an error during review. Please try again.",
          });
        } catch {
          // The review is already failing; preserving the original failure is more useful.
        }
      }
      return { error: state.error };
    }

    const comments = state.allComments;
    const reviewMarker = `<!-- pullrabbit-review:${state.reviewSessionId} -->`;
    const body = `${buildReviewComment(state, comments, totalDurationMs)}\n\n${reviewMarker}`;

    try {
      let updatedPersistedComment = false;
      if (loadingCommentId) {
        try {
          await octokit.rest.issues.updateComment({
            owner: state.owner,
            repo: state.repoName,
            comment_id: Number(loadingCommentId),
            body,
          });
          updatedPersistedComment = true;
        } catch (error) {
          console.warn("Persisted review comment update failed; using marker lookup:", error);
        }
      }

      if (!updatedPersistedComment) {
        const { data: existingComments } = await octokit.rest.issues.listComments({
          owner: state.owner,
          repo: state.repoName,
          issue_number: state.prNumber,
          per_page: 100,
        });
        const existingReviewComment = existingComments.find((comment) => comment.body?.includes(reviewMarker));

        if (existingReviewComment) {
          await octokit.rest.issues.updateComment({
            owner: state.owner,
            repo: state.repoName,
            comment_id: existingReviewComment.id,
            body,
          });
        } else {
          await octokit.rest.issues.createComment({
            owner: state.owner,
            repo: state.repoName,
            issue_number: state.prNumber,
            body,
          });
        }
      }
    } catch (error) {
      throw new Error(`GITHUB_COMMENT_FAILED: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (comments.length > 0) {
      await db.reviewComment.createMany({
        data: comments.map((comment) => ({
          reviewSessionId: state.reviewSessionId,
          commentKey: buildReviewCommentKey(state.reviewSessionId, comment),
          filePath: comment.filePath,
          line: comment.line,
          startLine: comment.startLine ?? null,
          body: comment.body,
          severity: comment.severity,
          category: comment.category,
          suggestion: comment.suggestion ?? null,
        })),
        skipDuplicates: true,
      });
    }

    return {};
  } catch (error) {
    console.error("postReview failed:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    if (state.repoLocalPath) {
      await cleanupRepo(state.repoLocalPath);
    }
  }
};
