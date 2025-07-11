"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CommunityJoinBanner } from "@/components/communities/community-join-banner";
import { ProtectedRoute } from "@/components/pages/protected-route";
import { ThreadMainCard } from "@/components/thread/thread-main-card";
import { ThreadRepliesList } from "@/components/thread/thread-replies-list";
import { ThreadRepliesPagination } from "@/components/thread/thread-replies-pagination";
import { BackNavigationLink } from "@/components/ui/back-navigation-link";
import { useCommunity } from "@/hooks/queries/use-community";
import { useThread } from "@/hooks/queries/use-thread";
import { useThreadReplies } from "@/hooks/queries/use-thread-replies";
import { Address } from "@/types/common";

export default function ThreadPage() {
  const params = useParams();
  const { address: threadAddress } = params;
  const [cursor, setCursor] = useState<string | null>(null);

  // Fetch thread and community data
  const { data: thread } = useThread(threadAddress as Address);
  const { data: community } = useCommunity(thread?.community || "");
  const { data: replies } = useThreadReplies(threadAddress as string, cursor);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div className="mb-2">
          <BackNavigationLink href={thread?.community ? `/communities/${thread.community}` : "/communities"}>
            Back to Community
          </BackNavigationLink>
        </div>

        {/* Community Join Banner - shown if user is not a member */}
        {community && <CommunityJoinBanner community={community} />}

        <ThreadMainCard threadAddress={threadAddress as string} />
        <ThreadRepliesList threadAddress={threadAddress as string} />
        <ThreadRepliesPagination
          pageInfo={replies?.pageInfo}
          onPrev={() => setCursor(replies?.pageInfo?.prev || null)}
          onNext={() => setCursor(replies?.pageInfo?.next || null)}
        />
      </div>
    </ProtectedRoute>
  );
}
