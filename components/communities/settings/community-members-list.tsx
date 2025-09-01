import React, { useEffect, useState } from "react";
import { CommunityMemberCard } from "./community-member-card";
import { CursorPagination } from "@/components/shared/cursor-pagination";
import { Community } from "@/lib/domain/communities/types";
import { client } from "@/lib/external/lens/protocol-client";
import { GroupMember, PageSize, PaginatedResultInfo, evmAddress } from "@lens-protocol/client";
import { fetchGroupMembers } from "@lens-protocol/client/actions";

interface CommunityMembersListProps {
  community: Community;
}

export function CommunityMembersList({ community }: CommunityMembersListProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo | null>(null);

  const groupAddress = community?.group?.address;

  const fetchMembers = async (cursor?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchGroupMembers(client, {
        group: evmAddress(groupAddress),
        pageSize: PageSize.Ten,
        ...(cursor ? { cursor } : {}),
      });
      if (result.isErr()) {
        setError(result.error.message || "Failed to fetch members");
        setLoading(false);
        return;
      }
      const { items, pageInfo } = result.value;
      setMembers(items as GroupMember[]);
      setPageInfo(pageInfo as PaginatedResultInfo);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupAddress) fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupAddress]);

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          Members
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {community.memberCount} member{community.memberCount === 1 ? "" : "s"}
          </span>
        </h2>
      </div>
      {loading && <div className="text-center text-muted-foreground">Loading members…</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {!loading && !error && members.length === 0 && (
        <div className="text-center text-muted-foreground">No members found.</div>
      )}
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {members.map(member => (
          <CommunityMemberCard key={member.account.address} member={member} />
        ))}
      </ul>
      <CursorPagination
        hasPrev={!!(pageInfo && pageInfo.prev)}
        hasNext={!!(pageInfo && pageInfo.next)}
        loading={loading}
        onPrev={pageInfo && pageInfo.prev ? () => fetchMembers(pageInfo.prev) : undefined}
        onNext={pageInfo && pageInfo.next ? () => fetchMembers(pageInfo.next) : undefined}
      />
    </div>
  );
}
