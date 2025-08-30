import ContentRenderer from "@/components/shared/content-renderer";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useReply } from "@/hooks/queries/use-reply";
import { useThread } from "@/hooks/queries/use-thread";
import { stripThreadArticleFormatting } from "@/lib/domain/threads/content";
import { getTimeAgo } from "@/lib/shared/utils";
import { Address } from "@/types/common";
import { Reply } from "@/lib/domain/replies/types";
import { Thread } from "@/lib/domain/threads/types";

interface RepliedToCardProps {
  reply: Reply;
}

function getThreadContent(thread: Thread): string {
  const metadata = thread?.rootPost?.metadata;
  if (metadata && typeof metadata === "object" && "content" in metadata) {
    return metadata.content ?? "";
  }
  return "";
}

export function RepliedToCard({ reply }: RepliedToCardProps) {
  // If reply has a parentReplyId, fetch that reply; otherwise fetch the thread
  const { data: parentReply, isLoading: parentReplyLoading } = useReply(
    reply.parentReplyId || ""
  );
  
  const { data: thread, isLoading: threadLoading } = useThread(
    reply.thread as Address
  );

  // Only show loading for the data we actually need
  const isLoading = reply.parentReplyId ? parentReplyLoading : threadLoading;

  if (isLoading) {
    return (
      <Card className="rounded-lg bg-gray-50/50 shadow-sm dark:border-gray-700/40 dark:bg-gray-800/50">
        <CardContent className="p-4">
          <LoadingSpinner text="Loading replied-to content..." />
        </CardContent>
      </Card>
    );
  }

  // If replying to another reply
  if (reply.parentReplyId && parentReply) {
    return (
      <Card className="rounded-lg bg-blue-50/50 shadow-sm dark:border-blue-700/40 dark:bg-blue-800/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Replying to a reply
              </span>
            </div>

            {/* Author info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {parentReply.author.name}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getTimeAgo(new Date(parentReply.createdAt))}
              </span>
            </div>

            {/* Content preview */}
            <div className="line-clamp-3 text-sm text-gray-700 dark:text-gray-300">
              <ContentRenderer 
                content={parentReply.content.slice(0, 200) + (parentReply.content.length > 200 ? "..." : "")}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If replying to the thread main post
  if (thread) {
    return (
      <Card className="rounded-lg bg-green-50/50 shadow-sm dark:border-green-700/40 dark:bg-green-800/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Replying to original thread
              </span>
            </div>

            {/* Thread Title */}
            <div>
              <h3 className="line-clamp-2 text-lg font-semibold text-foreground">
                {thread.title || "Untitled Thread"}
              </h3>
            </div>

            {/* Thread Content Preview - Truncated */}
            {getThreadContent(thread) && (
              <div className="line-clamp-3 text-sm text-muted-foreground">
                <ContentRenderer
                  content={stripThreadArticleFormatting(getThreadContent(thread)).slice(0, 200) + "..."}
                  className="text-sm"
                />
              </div>
            )}

            {/* Thread Stats */}
            <div className="flex items-center gap-3 border-t border-gray-200 pt-3 text-xs text-muted-foreground dark:border-gray-700">
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="font-medium">{thread.repliesCount || 0}</span>
                <span>replies</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>by</span>
                <span className="font-medium">{thread.author?.name || "Unknown"}</span>
              </div>
              {thread.created_at && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback if we can't determine what we're replying to
  return (
    <Card className="rounded-lg bg-gray-50/50 shadow-sm dark:border-gray-700/40 dark:bg-gray-800/50">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Replying to unknown content
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unable to load the content this reply is responding to.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}