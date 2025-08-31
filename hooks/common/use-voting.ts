import { useCallback, useEffect, useState } from "react";
import { fetchPost } from "@/lib/external/lens/primitives/posts";
import { vote } from "@/lib/services/vote/vote";
import { PostId, PostReactionType, useSessionClient } from "@lens-protocol/react";
import { toast } from "sonner";

interface UseVotingOptions {
  postid: PostId;
}

export function useVoting({ postid }: UseVotingOptions) {
  const [hasUserUpvoted, setHasUserUpvoted] = useState(false);
  const [hasUserDownvoted, setHasUserDownvoted] = useState(false);
  const [isLoading, setIsLoading] = useState<"up" | "down" | "score" | null>("score");
  const [scoreState, setScoreState] = useState(0);

  const sessionClient = useSessionClient();

  useEffect(() => {
    if (sessionClient.loading) return;
    setIsLoading("score");
    const checkReactions = async () => {
      if (!sessionClient.data) {
        setIsLoading(null);
        return;
      }
      try {
        const post = await fetchPost(postid, sessionClient.data);
        if (!post) {
          setIsLoading(null);
          return;
        }
        setHasUserUpvoted(!!post.operations?.hasUpvoted);
        setHasUserDownvoted(!!post.operations?.hasDownvoted);
        const upvotes = post.stats?.upvotes ?? 0;
        const downvotes = post.stats?.downvotes ?? 0;
        setScoreState(upvotes - downvotes);
      } catch (error) {
        console.error("Error checking reactions:", error);
      } finally {
        setIsLoading(null);
      }
    };
    checkReactions();
  }, [sessionClient.data, sessionClient.loading, postid]);

  const handleVote = useCallback(
    async (
      type: "up" | "down",
      reactionType: PostReactionType,
      hasUserReacted: boolean,
      setHasUserReacted: (v: boolean) => void,
    ) => {
      if (!sessionClient.data) {
        toast.error("Not logged in", {
          description: `Please log in to ${type === "up" ? "upvote" : "downvote"} posts.`,
        });
        return;
      }
      setIsLoading(type);
      if (hasUserReacted) {
        try {
          const result = await vote(sessionClient.data, postid, type, reactionType, hasUserReacted);
          if (!result.success) {
            setIsLoading(null);
            return;
          }
          setHasUserReacted(result.hasReacted);
          setScoreState(prev => prev + result.scoreDelta);
          toast.success(type === "up" ? `Upvote removed` : `Downvote removed`);
        } catch {
          toast.error(type === "up" ? `Failed to remove upvote.` : `Failed to remove downvote.`);
        } finally {
          setIsLoading(null);
        }
        return;
      }
      // Add reaction
      try {
        const result = await vote(sessionClient.data, postid, type, reactionType, hasUserReacted);
        if (!result.success) {
          setIsLoading(null);
          return;
        }
        setHasUserReacted(result.hasReacted);
        setScoreState(prev => prev + result.scoreDelta);
        toast.success(type === "up" ? `Upvoted!` : `Downvoted!`);
      } catch {
        toast.error(type === "up" ? `Failed to upvote. Please try again.` : `Failed to downvote. Please try again.`);
      } finally {
        setIsLoading(null);
      }
    },
    [sessionClient.data, postid],
  );

  const handleUpvote = useCallback(
    () => handleVote("up", PostReactionType.Upvote, hasUserUpvoted, setHasUserUpvoted),
    [handleVote, hasUserUpvoted],
  );
  const handleDownvote = useCallback(
    () => handleVote("down", PostReactionType.Downvote, hasUserDownvoted, setHasUserDownvoted),
    [handleVote, hasUserDownvoted],
  );

  return {
    hasUserUpvoted,
    hasUserDownvoted,
    isLoading,
    scoreState,
    handleUpvote,
    handleDownvote,
  };
}
