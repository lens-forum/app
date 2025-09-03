"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Clock, Users } from "lucide-react";

export interface PollDisplayData {
  question: string;
  options: PollOptionResult[];
  allowMultipleVotes: boolean;
  totalVotes: number;
  endsAt: Date;
  hasVoted: boolean;
  userVotes?: string[]; // Option IDs the user voted for
}

export interface PollOptionResult {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface PollDisplayProps {
  poll: PollDisplayData;
  onVote?: (optionIds: string[]) => void;
  isVoting?: boolean;
}

export function PollDisplay({ poll, onVote, isVoting }: PollDisplayProps) {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const isActive = new Date() < poll.endsAt;
  const canVote = isActive && !poll.hasVoted && onVote;

  const handleOptionToggle = (optionId: string) => {
    if (!canVote) return;

    if (poll.allowMultipleVotes) {
      setSelectedOptions(prev => (prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]));
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = () => {
    if (onVote && selectedOptions.length > 0) {
      onVote(selectedOptions);
      setSelectedOptions([]);
    }
  };

  const formatTimeLeft = (endDate: Date) => {
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();

    if (timeDiff <= 0) return "Ended";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h left`;
    } else {
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes}m left`;
    }
  };

  return (
    <Card className="rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-500" />
            <h3 className="text-lg font-semibold text-foreground">{poll.question}</h3>
          </div>
          <div className="flex items-center gap-2">
            {poll.allowMultipleVotes && (
              <Badge variant="secondary" className="text-xs">
                Multiple choice
              </Badge>
            )}
            <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
              {formatTimeLeft(poll.endsAt)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Poll Options */}
        <div className="space-y-3">
          {poll.options.map(option => {
            const isSelected = selectedOptions.includes(option.id);
            const isUserVote = poll.userVotes?.includes(option.id);

            return (
              <div key={option.id} className="space-y-2">
                <div
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    canVote
                      ? isSelected
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                        : "border-gray-200 hover:border-brand-300 dark:border-gray-700"
                      : "border-gray-200 dark:border-gray-700"
                  } ${poll.hasVoted && isUserVote ? "ring-2 ring-brand-500/20" : ""}`}
                  onClick={() => handleOptionToggle(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{option.text}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{option.votes} votes</span>
                      <span className="text-sm font-medium text-foreground">{option.percentage}%</span>
                    </div>
                  </div>
                  {poll.totalVotes > 0 && (
                    <div className="mt-2">
                      <Progress value={option.percentage} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Vote Button */}
        {canVote && (
          <Button onClick={handleVote} disabled={selectedOptions.length === 0 || isVoting} className="w-full">
            {isVoting
              ? "Voting..."
              : `Vote${poll.allowMultipleVotes && selectedOptions.length > 1 ? ` (${selectedOptions.length})` : ""}`}
          </Button>
        )}

        {/* Poll Stats */}
        <div className="flex items-center justify-between border-t border-gray-200/60 pt-4 text-sm text-muted-foreground dark:border-gray-700/60">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{poll.totalVotes} total votes</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Ends {poll.endsAt.toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
