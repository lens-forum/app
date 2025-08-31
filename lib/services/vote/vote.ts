import { addReaction, undoReaction } from "@lens-protocol/client/actions";
import { PostId, PostReactionType, SessionClient } from "@lens-protocol/react";

interface VoteResult {
  success: boolean;
  hasReacted: boolean;
  scoreDelta: number;
}

export async function vote(
  sessionClient: SessionClient,
  postid: PostId,
  type: "up" | "down",
  reactionType: PostReactionType,
  hasUserReacted: boolean,
): Promise<VoteResult> {
  if (!sessionClient) {
    return { success: false, hasReacted: hasUserReacted, scoreDelta: 0 };
  }

  if (hasUserReacted) {
    // Remove reaction
    const result = await undoReaction(sessionClient, {
      post: postid,
      reaction: reactionType,
    });
    if (result.isErr()) {
      return { success: false, hasReacted: hasUserReacted, scoreDelta: 0 };
    }
    return {
      success: true,
      hasReacted: false,
      scoreDelta: type === "up" ? -1 : 1,
    };
  } else {
    // Add reaction
    const result = await addReaction(sessionClient, {
      post: postid,
      reaction: reactionType,
    });
    if (result.isErr()) {
      return { success: false, hasReacted: hasUserReacted, scoreDelta: 0 };
    }
    return {
      success: true,
      hasReacted: true,
      scoreDelta: type === "up" ? 1 : -1,
    };
  }
}
