"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/pages/protected-route";
import { ThreadReplyCard } from "@/components/thread/thread-reply-card";
import { RepliedToCard } from "@/components/thread/replied-to-card";
import { BackNavigationLink } from "@/components/ui/back-navigation-link";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useReply } from "@/hooks/queries/use-reply";

export default function ReplyPage() {
  const params = useParams();
  const { id: replyId } = params;

  // Fetch reply data
  const { data: reply, isLoading: replyLoading, error: replyError } = useReply(replyId as string);

  if (replyLoading) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
          <LoadingSpinner text="Loading reply..." />
        </div>
      </ProtectedRoute>
    );
  }

  if (replyError || !reply) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
          <div className="mb-2">
            <BackNavigationLink href="/communities">Back to Communities</BackNavigationLink>
          </div>
          <Card className="rounded-lg bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              <h1 className="mb-2 text-xl font-semibold text-foreground">Reply Not Found</h1>
              <p className="text-muted-foreground">
                The reply you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  // Determine back navigation - if we know the thread, go back to it, otherwise go to communities
  const backHref = reply.thread ? `/thread/${reply.thread}` : "/communities";

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <BackNavigationLink href={backHref}>
          {reply.thread ? "Back to Thread" : "Back to Communities"}
        </BackNavigationLink>

        {/* Replied To Context */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Replying To</h2>
          </div>
          <RepliedToCard reply={reply} />
        </div>

        {/* Featured Reply */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Reply</h2>

          {/* Reply with enhanced border and shadow */}
          <div className="relative">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-brand-200 to-brand-300 opacity-20 blur-sm dark:from-brand-600 dark:to-brand-700"></div>
            <div className="relative rounded-lg border-2 border-brand-200 bg-white shadow-lg dark:border-brand-600 dark:bg-gray-800">
              <ThreadReplyCard
                reply={reply}
                rootPostId={reply.parentReplyId || ""}
                threadAddress={reply.thread || ""}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}