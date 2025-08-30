import { useState } from "react";
import Link from "next/link";
import { ReplyVoting } from "../reply/reply-voting";
import { ThreadReplyBox } from "./thread-reply-box";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { TipGhoPopover } from "@/components/shared/tip-gho-popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reply as ReplyType } from "@/lib/domain/replies/types";
import { getRepliesByParentId } from "@/lib/services/reply/get-replies-by-parent-id";
import { getReply } from "@/lib/services/reply/get-reply";
import { getTimeAgo, removeTrailingEmptyPTags } from "@/lib/shared/utils";
import { useAuthStore } from "@/stores/auth-store";
import { PostId } from "@lens-protocol/client";
import { postId } from "@lens-protocol/react";
import { Coins, MessageSquare, Reply } from "lucide-react";
import { toast } from "sonner";

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
  replyingTo?: string | null;
  replyContent?: { [key: string]: string };
  setReplyingTo?: (id: string | null) => void;
  setReplyContent?: (fn: (c: any) => any) => void;
  handleReply?: (parentId: string, content: string) => Promise<void>;
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

  // State for copying reply link
  const [copied, setCopied] = useState(false);

  const { isLoggedIn } = useAuthStore();

  // Recursively fetch context chain, stopping at rootPostId
  const fetchContextChain = async (parentId: string, acc: ReplyType[] = []): Promise<ReplyType[]> => {
    if (!parentId || parentId === rootPostId) return acc;
    const result = await getReply(parentId);
    if (!result.success || !result.reply || result.reply.id === rootPostId) return acc;
    acc.unshift(result.reply); // prepend for top-down order
    if (result.reply.parentReplyId && result.reply.parentReplyId !== rootPostId) {
      return fetchContextChain(result.reply.parentReplyId, acc);
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
        const result = await getRepliesByParentId(postId(reply.id));
        if (result.success) {
          setChildReplies(result.replies || []);
        }
        setShowReplies(true);
      } finally {
        setLoadingReplies(false);
      }
    } else {
      setShowReplies(false);
    }
  };

  // Handler to copy reply link
  const handleCopyLink = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const url = `${window.location.origin}/reply/${reply.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Reply link copied to clipboard!");
    setTimeout(() => setCopied(false), 1200);
  };

  // Context chain UI
  const ContextChain = () => (
    <div className="mb-2 flex flex-col gap-2">
      {contextChain.map((ctx, idx) => (
        <div key={ctx.id} className="relative flex items-start gap-2 pl-3">
          {/* Vertical line for chain */}
          {idx < contextChain.length - 1 && (
            <span
              className="absolute left-0 top-5 h-full w-px bg-brand-100 dark:bg-gray-600"
              style={{ minHeight: 32 }}
            />
          )}
          <Avatar className="mt-0.5 h-4 w-4">
            <AvatarImage src={ctx.author.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-r from-brand-400 to-brand-600 text-[9px] text-white">
              {ctx.author.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded border border-brand-100 bg-slate-50 px-2 py-1 dark:border-gray-600 dark:bg-gray-700">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{ctx.author.name}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {ctx.createdAt ? getTimeAgo(new Date(ctx.createdAt)) : "Unknown date"}
              </span>
            </div>
            <div
              className="rich-text-content text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: removeTrailingEmptyPTags(ctx.content) }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2" id={reply.id}>
      <Card className="rounded-lg bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex flex-col items-center">
              <ReplyVoting postid={postId(reply.id)} />
            </div>
            <div className="min-w-0 flex-1">
              {/* Top row: author info and show context button at top right */}
              <div className="relative mb-3 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/u/${reply.author.username.replace("lens/", "")}`}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                      <AvatarImage src={reply.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                        {reply.author.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{reply.author.name}</span>
                  </Link>
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    {reply.createdAt ? getTimeAgo(new Date(reply.createdAt)) : "Unknown date"}
                  </span>
                </div>
                {/* Show context button at top right */}
                {reply.parentReplyId && reply.parentReplyId !== rootPostId && (
                  <div className="absolute right-0 top-0">
                    <button
                      className={
                        `inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ` +
                        (showContext
                          ? "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-600 dark:bg-brand-900/50 dark:text-brand-300 dark:hover:bg-brand-900/70"
                          : "bg-transparent text-brand-500 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300")
                      }
                      onClick={handleShowContext}
                      disabled={loadingContext}
                      aria-pressed={showContext}
                      title={showContext ? "Hide context" : "Show context"}
                    >
                      <span className="inline-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-3 w-3 sm:h-4 sm:w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </span>
                      <span className="hidden sm:inline">
                        {loadingContext ? "Loading..." : showContext ? "Hide parent reply" : "In reply to"}
                      </span>
                      <span className="sm:hidden">{showContext ? "Hide" : "Parent"}</span>
                    </button>
                  </div>
                )}
              </div>
              {/* Context chain UI below author row */}
              {reply.parentReplyId && reply.parentReplyId !== rootPostId && showContext && contextChain.length > 0 && (
                <ContextChain />
              )}
              {/* Content */}
              <ContentRenderer content={removeTrailingEmptyPTags(reply.content)} className="rich-text-content mb-2" />
              {/* Reply button and tip button bottom */}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                    <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>{loadingReplies ? "..." : reply.repliesCount || "0"}</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs text-gray-500 sm:text-sm">
                    <Coins className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{(reply as any).tips ?? 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {setReplyingTo && isLoggedIn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 sm:h-8 sm:px-3 sm:text-sm"
                      onClick={() => setReplyingTo(reply.id)}
                      disabled={!isLoggedIn}
                    >
                      <Reply className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Reply</span>
                      <span className="sm:hidden">Rep</span>
                    </Button>
                  )}
                  <TipGhoPopover to={reply.id as PostId} />
                  {/* Copy reply link button at the bottom right */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 text-xs text-green-600 hover:text-green-700 focus:outline-none dark:text-green-400 dark:hover:text-green-300 sm:h-8 sm:px-2 sm:text-sm ${copied ? "text-green-500" : ""}`}
                    title="Copy reply link"
                    onClick={handleCopyLink}
                  >
                    <svg
                      className="mr-1 h-3 w-3 sm:h-4 sm:w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 7h2a5 5 0 0 1 0 10h-2m-6 0H7a5 5 0 0 1 0-10h2m1 5h4"
                      />
                    </svg>
                    <span className="hidden sm:inline">{copied ? "Copied!" : "Copy link"}</span>
                    <span className="sm:hidden">{copied ? "✓" : "Copy"}</span>
                  </Button>
                </div>
              </div>
              {replyingTo === reply.id && replyContent && setReplyingTo && setReplyContent && handleReply && (
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
                <div className="mt-3 space-y-2 border-l-2 border-brand-100 pl-2 sm:mt-4 sm:space-y-3 sm:pl-4">
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
