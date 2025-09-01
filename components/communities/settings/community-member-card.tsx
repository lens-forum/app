import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GroupMember } from "@lens-protocol/client";

interface CommunityMemberCardProps {
  member: GroupMember;
}

export function CommunityMemberCard({ member }: CommunityMemberCardProps) {
  const { account, joinedAt } = member;
  const avatarUrl = account.metadata?.picture || "/logo.png";
  const username = account.username?.localName || account.username?.value || "Unknown";
  const name = account.metadata?.name || username;

  return (
    <li>
      <Link
        href={`/u/${username}`}
        className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:border-primary hover:bg-primary/5 dark:border-gray-700 dark:bg-gray-900"
      >
        <Image
          src={avatarUrl}
          alt={username}
          className="h-14 w-14 rounded-full border border-gray-200 object-cover dark:border-gray-700"
          width={56}
          height={56}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="truncate text-base font-semibold text-foreground">{name}</span>
            <span className="truncate text-xs text-muted-foreground">@{username}</span>
          </div>
          <div className="mt-1 break-all font-mono text-xs text-gray-500">{account.address}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Joined: {joinedAt ? new Date(joinedAt).toLocaleDateString() : "-"}
          </div>
        </div>
      </Link>
    </li>
  );
}
