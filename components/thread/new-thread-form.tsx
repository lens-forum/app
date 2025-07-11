import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextEditor } from "@/components/editor/text-editor";
import { ReputationStatusBanner } from "@/components/shared/reputation-status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLensReputationScore } from "@/hooks/common/use-lensreputation-score";
import { CreateThreadFormData, useThreadCreation } from "@/hooks/threads/use-thread-create";
import { useAuthStore } from "@/stores/auth-store";
import { Address } from "@/types/common";
import { useQueryClient } from "@tanstack/react-query";
import { Hash, Plus, Send, X } from "lucide-react";
import { toast } from "sonner";

interface NewThreadFormProps {
  communityAddress: string;
}

export function NewThreadForm({ communityAddress }: NewThreadFormProps) {
  const { createThread, isCreating } = useThreadCreation();
  const { account, walletAddress } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { reputation, canCreateThread } = useLensReputationScore(walletAddress as Address, account?.address);

  const [formData, setFormData] = useState<CreateThreadFormData>({
    title: "",
    summary: "",
    content: "",
    tags: "",
    author: account?.address || "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const suggestedTags = [
    "discussion",
    "help",
    "development",
    "question",
    "announcement",
    "tutorial",
    "feedback",
    "showcase",
    "governance",
    "research",
  ];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setFormData({ ...formData, tags: newTags.join(",") });
      setTagInput("");
    }
  };
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setFormData({ ...formData, tags: newTags.join(",") });
  };
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check reputation requirements
    if (!canCreateThread) {
      if (reputation === undefined) {
        toast.error("LensReputation NFT Required", {
          description: "You need to mint the LensReputation NFT to create threads.",
        });
      } else {
        toast.error("Insufficient Reputation", {
          description: `You need a reputation score of 400 or higher to create threads. Your current score is ${reputation}.`,
        });
      }
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Validation Error", { description: "Please enter a thread title." });
      return;
    }
    if (!formData.summary.trim()) {
      toast.error("Validation Error", { description: "Please enter a summary." });
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Validation Error", { description: "Please enter thread content." });
      return;
    }
    try {
      if (!account?.address) throw new Error("User address not found");
      await createThread(communityAddress, { ...formData, author: account.address }, () => {
        setFormData({ title: "", summary: "", content: "", tags: "", author: account.address });
      });
      await queryClient.invalidateQueries({ queryKey: ["threads", communityAddress] });
      router.push(`/communities/${communityAddress}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <Card className="rounded-3xl border border-brand-200/60 bg-white backdrop-blur-sm">
      <CardHeader className="pb-4">
        <h1 className="text-2xl font-medium text-slate-900">Create New Thread</h1>
        <p className="text-slate-600">Share your thoughts with the community</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's your thread about?"
              className="rounded-full border-brand-200/40 bg-white/50 backdrop-blur-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              required
            />
          </div>
          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-sm font-medium text-slate-700">
              Summary
            </Label>
            <Input
              id="summary"
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief description (max 100 chars)"
              className="rounded-2xl border-brand-200/40 bg-white/50 backdrop-blur-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              maxLength={100}
            />
          </div>
          {/* Content Editor */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-slate-700">
              Content
            </Label>
            <div className="rounded-2xl border border-brand-200/40 bg-white/50 p-4 backdrop-blur-sm">
              <TextEditor onChange={value => setFormData({ ...formData, content: value })} />
            </div>
          </div>
          {/* Tags Input */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-slate-700">
              Tags (optional) {tags.length > 0 && <span className="text-slate-500">({tags.length}/5)</span>}
            </Label>
            <div className="rounded-2xl border border-brand-200/40 bg-white/50 p-3 backdrop-blur-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
              {/* Selected Tags */}
              <div className="mb-2 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 rounded-full bg-brand-100 text-brand-700 hover:bg-brand-200"
                  >
                    <Hash className="h-3 w-3" />
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 rounded-full p-0 hover:bg-brand-300"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              {/* Tag Input */}
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder={tags.length === 0 ? "Type a tag and press Enter..." : "Add another tag..."}
                  className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={tags.length >= 5}
                />
                {tagInput.trim() && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 rounded-full bg-brand-100 p-0 hover:bg-brand-200"
                    onClick={() => addTag(tagInput)}
                  >
                    <Plus className="h-3 w-3 text-brand-600" />
                  </Button>
                )}
              </div>
              {/* Suggested Tags */}
              {tags.length < 5 && (
                <div className="mt-3 border-t border-brand-200 pt-2">
                  <p className="mb-2 text-xs text-slate-500">Popular tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestedTags
                      .filter(tag => !tags.includes(tag))
                      .slice(0, 6)
                      .map(tag => (
                        <Button
                          key={tag}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 rounded-full px-2 text-xs text-slate-600 hover:bg-brand-100 hover:text-brand-700"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Reputation Status */}
          <ReputationStatusBanner
            reputation={reputation}
            canPerformAction={canCreateThread}
            actionType="threads"
            requiredScore={400}
          />
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isCreating || !canCreateThread || !formData.title.trim() || !formData.content.trim()}
              className="rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Publishing...
                </div>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Publish Thread
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
