"use client";

import { useState } from "react";
import { CommunityRulesManager } from "@/components/communities/rules/edit/community-rules-manager";
import { CommunityAccessDenied } from "@/components/communities/settings/community-access-denied";
import { CommunityEditForm } from "@/components/communities/settings/community-edit-form";
import { CommunityMembersList } from "@/components/communities/settings/community-members-list";
import { CommunityModeratorsManager } from "@/components/communities/settings/community-moderators-manager";
import { CommunitySettingsTabPanel } from "@/components/communities/settings/community-settings-tab-panel";
import { useIsModerator } from "@/hooks/communities/use-is-moderator";
import { Community } from "@/lib/domain/communities/types";
import { BookOpen, Settings, Sword, Users } from "lucide-react";

interface CommunitySettingsClientProps {
  community: Community;
}

export function CommunitySettingsClient({ community }: CommunitySettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"general" | "moderators" | "members" | "rules">("general");
  const isModerator = useIsModerator(community);

  if (!isModerator) {
    return <CommunityAccessDenied />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Community Settings</h1>
        <p className="text-muted-foreground">
          Manage your community settings and moderators for <span className="font-semibold">{community.name}</span>
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-1 rounded-xl bg-white p-1 shadow-sm dark:border-gray-700/60 dark:bg-gray-800 sm:rounded-2xl">
          <button
            onClick={() => setActiveTab("general")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all sm:rounded-xl sm:px-6 sm:py-3 sm:text-sm ${
              activeTab === "general"
                ? "bg-primary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="mr-2 inline h-4 w-4" />
            General
          </button>
          <button
            onClick={() => setActiveTab("moderators")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all sm:rounded-xl sm:px-6 sm:py-3 sm:text-sm ${
              activeTab === "moderators"
                ? "bg-primary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sword className="mr-2 inline h-4 w-4" />
            Moderators
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all sm:rounded-xl sm:px-6 sm:py-3 sm:text-sm ${
              activeTab === "members"
                ? "bg-primary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="mr-2 inline h-4 w-4" />
            Members
          </button>
          <button
            disabled
            onClick={() => setActiveTab("rules")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all sm:rounded-xl sm:px-6 sm:py-3 sm:text-sm ${
              activeTab === "rules"
                ? "bg-primary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <BookOpen className="mr-2 inline h-4 w-4" />
            Rules
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-4xl">
        {activeTab === "general" && (
          <CommunitySettingsTabPanel icon={Settings} title="Community Information">
            <CommunityEditForm community={community} />
          </CommunitySettingsTabPanel>
        )}

        {activeTab === "moderators" && (
          <CommunitySettingsTabPanel icon={Users} title="Manage Moderators">
            <CommunityModeratorsManager community={community} />
          </CommunitySettingsTabPanel>
        )}

        {activeTab === "members" && (
          <CommunitySettingsTabPanel icon={Users} title="Community Members">
            <CommunityMembersList community={community} />
          </CommunitySettingsTabPanel>
        )}

        {activeTab === "rules" && (
          <CommunitySettingsTabPanel icon={BookOpen} title="Community Rules">
            <CommunityRulesManager community={community} />
          </CommunitySettingsTabPanel>
        )}
      </div>
    </div>
  );
}
