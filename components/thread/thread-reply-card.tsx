import { useState } from "react";
import Link from "next/link";
import { VotingActions } from "../shared/voting-actions";
import { ThreadReplyBox } from "./thread-reply-box";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { TipGhoPopover } from "@/components/shared/tip-gho-popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchReply } from "@/lib/fetchers/reply";
import { fetchRepliesByParentId } from "@/lib/fetchers/reply";
import { getTimeAgo, removeTrailingEmptyPTags } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Reply as ReplyType } from "@/types/common";
import { PostId } from "@lens-protocol/client";
import { postId } from "@lens-protocol/react";
import { Coins, MessageSquare, Reply } from "lucide-react";

export function ThreadReplyCard({
  reply,
  replyingTo,
  replyContent,
  setReplyingTo,
  setReplyContent,
  handleReply,
  children,
  rootPostId,
  threadAddress,
}: {
  reply: ReplyType & { _depth?: number };
  replyingTo: string | null;
  replyContent: { [key: string]: string };
  setReplyingTo: (id: string | null) => void;
  setReplyContent: (fn: (c: any) => any) => void;
  handleReply: (parentId: string, content: string) => Promise<void>;
  children?: React.ReactNode;
  depth?: number;
  rootPostId: string;
  threadAddress: string;
}) {
  // State for showing context
  const [showContext, setShowContext] = useState(false);
  const [contextChain, setContextChain] = useState<ReplyType[]>([]);
  const [loadingContext, setLoadingContext] = useState(false);

  // State and logic for showing child replies
  const [showReplies, setShowReplies] = useState(false);
  const [childReplies, setChildReplies] = useState<ReplyType[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const { isLoggedIn } = useAuthStore();

  // Recursively fetch context chain, stopping at rootPostId
  const fetchContextChain = async (parentId: string, acc: ReplyType[] = []): Promise<ReplyType[]> => {
    if (!parentId || parentId === rootPostId) return acc;
    const parent = await fetchReply(parentId);
    if (!parent || parent.id === rootPostId) return acc;
    acc.unshift(parent); // prepend for top-down order
    if (parent.parentReplyId && parent.parentReplyId !== rootPostId) {
      return fetchContextChain(parent.parentReplyId, acc);
    }
    return acc;
  };

  // Handler to fetch and show context chain
  const handleShowContext = async () => {
    if (!reply.parentReplyId || reply.parentReplyId === rootPostId) return;
    setLoadingContext(true);
    try {
      if (!showContext) {
        const chain = await fetchContextChain(reply.parentReplyId);
        setContextChain(chain);
        setShowContext(true);
      } else {
        setShowContext(false);
      }
    } finally {
      setLoadingContext(false);
    }
  };

  // Handler to show/hide child replies
  const handleShowReplies = async () => {
    if (!showReplies) {
      setLoadingReplies(true);
      try {
        const replies = await fetchRepliesByParentId(reply.id, threadAddress);
        setChildReplies(replies);
        setShowReplies(true);
      } finally {
        setLoadingReplies(false);
      }
    } else {
      setShowReplies(false);
    }
  };

  // Context chain UI
  const ContextChain = () => (
    <div className="mb-2 flex flex-col gap-2">
      {contextChain.map((ctx, idx) => (
        <div key={ctx.id} className="relative flex items-start gap-2 pl-3">
          {/* Vertical line for chain */}
          {idx < contextChain.length - 1 && (
            <span className="absolute left-0 top-5 h-full w-px bg-brand-100" style={{ minHeight: 32 }} />
          )}
          <Avatar className="mt-0.5 h-4 w-4">
            <AvatarImage src={ctx.author.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-r from-brand-400 to-brand-600 text-[9px] text-white">
              {ctx.author.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded border border-brand-100 bg-slate-50 px-2 py-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-xs font-medium text-gray-900">{ctx.author.name}</span>
              <span className="text-[10px] text-gray-400">
                {ctx.createdAt ? getTimeAgo(new Date(ctx.createdAt)) : "Unknown date"}
              </span>
            </div>
            <div
              className="rich-text-content text-gray-700"
              dangerouslySetInnerHTML={{ __html: removeTrailingEmptyPTags(ctx.content) }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2" id={reply.id}>
      <Card className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <VotingActions postid={postId(reply.id)} score={reply.upvotes - reply.downvotes} />
            </div>
            <div className="min-w-0 flex-1">
              {/* Top row: author info */}
              <div className="mb-2 flex items-center gap-2">
                <Link
                  href={`/u/${reply.author.username.replace("lens/", "")}`}
                  className="flex items-center gap-2 hover:text-gray-900"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reply.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gray-200 text-xs text-gray-700">
                      {reply.author.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900">{reply.author.name}</span>
                </Link>
                <span className="text-sm text-gray-500">
                  {reply.createdAt ? getTimeAgo(new Date(reply.createdAt)) : "Unknown date"}
                </span>
              </div>
              {/* Context fetcher for parent post chain */}
              {reply.parentReplyId && reply.parentReplyId !== rootPostId && (
                <div className="mb-2">
                  <button
                    className={
                      `inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ` +
                      (showContext
                        ? "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                        : "bg-transparent text-brand-500 hover:text-brand-700")
                    }
                    onClick={handleShowContext}
                    disabled={loadingContext}
                    aria-pressed={showContext}
                    title={showContext ? "Hide context" : "Show context"}
                  >
                    {/* Use a Lucide icon for context, e.g. LucideLink2 */}
                    <span className="inline-block">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 7h2a5 5 0 0 1 0 10h-2m-6 0H7a5 5 0 0 1 0-10h2m1 5h4"
                        />
                      </svg>
                    </span>
                    {loadingContext ? "Loading..." : showContext ? "Hide context" : "Show context"}
                  </button>
                  {showContext && contextChain.length > 0 && <ContextChain />}
                </div>
              )}
              {/* Content */}
              <ContentRenderer content={removeTrailingEmptyPTags(reply.content)} className="rich-text-content mb-2" />
              {/* Reply button and tip button bottom */}
              <div className="mt-3 flex items-center justify-between">
                {/* Tips counter and replies button bottom left */}
                <div className="flex items-center gap-2">
                  {/* Button to show child replies */}
                  <button
                    className={
                      `flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all duration-200 ` +
                      (showReplies
                        ? "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                        : "border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700")
                    }
                    onClick={handleShowReplies}
                    disabled={loadingReplies}
                    title={showReplies ? "Hide replies" : "Show replies"}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{loadingReplies ? "..." : reply.repliesCount || "0"}</span>
                  </button>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Coins className="h-4 w-4" />
                    <span>{(reply as any).tips ?? 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-sm text-gray-600 hover:text-gray-900"
                    onClick={() => setReplyingTo(reply.id)}
                    disabled={!isLoggedIn}
                  >
                    <Reply className="mr-1 h-4 w-4" />
                    Reply
                  </Button>
                  <TipGhoPopover to={reply.id as PostId} />
                </div>
              </div>
              {replyingTo === reply.id && (
                <ThreadReplyBox
                  value={replyContent[reply.id] || ""}
                  onCancel={() => {
                    setReplyingTo(null);
                    setReplyContent(c => ({ ...c, [reply.id]: "" }));
                  }}
                  onSubmit={async () => {
                    const raw = replyContent[reply.id] || "";
                    const withoutTrailingPTags = removeTrailingEmptyPTags(raw);
                    const trimmed = withoutTrailingPTags.replace(/(\S)(\s+)$/g, "$1");
                    if (!trimmed.trim()) return;
                    await handleReply(reply.id, trimmed);
                    setReplyContent(c => ({ ...c, [reply.id]: "" }));
                  }}
                  onChange={val => {
                    const trimmed = val.replace(/(\S)(\s+)$/g, "$1");
                    setReplyContent(c => ({ ...c, [reply.id]: trimmed }));
                  }}
                />
              )}

              {/* Recursive rendering of child replies */}
              {showReplies && childReplies.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-brand-100 pl-4">
                  {childReplies.map(child => (
                    <ThreadReplyCard
                      key={child.id}
                      reply={child}
                      replyingTo={replyingTo}
                      replyContent={replyContent}
                      setReplyingTo={setReplyingTo}
                      setReplyContent={setReplyContent}
                      handleReply={handleReply}
                      rootPostId={rootPostId}
                      threadAddress={threadAddress}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {children}
    </div>
  );
}
