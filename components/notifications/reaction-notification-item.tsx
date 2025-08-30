import { AvatarProfileLink } from "@/components/notifications/avatar-profile-link";
import { NotificationCard } from "@/components/notifications/notification-card";
import { getTimeAgo } from "@/lib/shared/utils";
import type { Account, NotificationAccountPostReaction, ReactionNotification } from "@lens-protocol/client";
import { PostReactionType } from "@lens-protocol/client";
import { ArrowDown, ArrowUp } from "lucide-react";

export function ReactionNotificationItem({ notification }: { notification: ReactionNotification }) {
  const reactions = notification.reactions;
  const post = notification.post;

  // Group reactions by type
  const upvoteReactions = reactions.filter(r =>
    r.reactions.some(reaction => reaction.reaction === PostReactionType.Upvote),
  );
  const downvoteReactions = reactions.filter(r =>
    r.reactions.some(reaction => reaction.reaction === PostReactionType.Downvote),
  );

  const totalReactions = reactions.length;
  const hasUpvotes = upvoteReactions.length > 0;
  const hasDownvotes = downvoteReactions.length > 0;

  // Get first reaction for main display
  const firstReaction = reactions[0] as NotificationAccountPostReaction;
  const firstAuthor: Account = firstReaction.account;

  // Build the reaction message
  const getReactionMessage = () => {
    const authorName = firstAuthor.metadata?.name || firstAuthor.username?.localName;

    if (hasUpvotes && hasDownvotes) {
      // Mixed reactions
      const additionalReactions = totalReactions - 1;
      if (additionalReactions === 0) {
        return `${authorName} reacted to your post`;
      } else if (additionalReactions === 1) {
        return `${authorName} and 1 other reacted to your post`;
      } else {
        return `${authorName} and ${additionalReactions} others reacted to your post`;
      }
    } else {
      // Single type of reaction
      const actionWord = hasUpvotes ? "upvoted" : "downvoted";
      const additionalReactions = totalReactions - 1;

      if (additionalReactions === 0) {
        return `${authorName} ${actionWord} your post`;
      } else if (additionalReactions === 1) {
        return `${authorName} and 1 other ${actionWord} your post`;
      } else {
        return `${authorName} and ${additionalReactions} others ${actionWord} your post`;
      }
    }
  };

  // Extract post title from metadata based on type
  const postTitle =
    post.metadata?.__typename === "ArticleMetadata"
      ? post.metadata.title
      : post.metadata?.__typename === "TextOnlyMetadata"
        ? post.metadata.content?.slice(0, 50) + "..."
        : "your post";

  // Determine if this is a reply or a thread
  const isReply = post.metadata?.__typename === "TextOnlyMetadata";
  const threadAddress = post.feed.address;
  const navigationUrl = `/thread/${threadAddress}${isReply ? "" : ""}`;
  const replyNavigationUrl = isReply ? `/reply/${post.id}` : navigationUrl;

  return (
    <NotificationCard href={isReply ? replyNavigationUrl : navigationUrl}>
      <div className="flex items-start gap-4">
        <AvatarProfileLink author={firstAuthor} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {/* Show reaction icons based on what types we have */}
                {hasUpvotes && (
                  <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    {upvoteReactions.length > 1 && (
                      <span className="ml-1 text-xs font-medium text-green-600 dark:text-green-400">
                        {upvoteReactions.length}
                      </span>
                    )}
                  </div>
                )}
                {hasDownvotes && (
                  <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/30">
                    <ArrowDown className="h-4 w-4 text-red-500" />
                    {downvoteReactions.length > 1 && (
                      <span className="ml-1 text-xs font-medium text-red-600 dark:text-red-400">
                        {downvoteReactions.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 dark:text-gray-100">
                  {getReactionMessage()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-gray-100">&ldquo;{postTitle}&rdquo;</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getTimeAgo(new Date(notification.reactions[0].reactions[0].reactedAt))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </NotificationCard>
  );
}
