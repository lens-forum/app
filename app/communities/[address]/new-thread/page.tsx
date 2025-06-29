"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { TextEditor } from "@/components/text-editor";
import { BackNavigationLink } from "@/components/ui/back-navigation-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateThreadFormData, useThreadCreation } from "@/hooks/use-thread-create";
import { useAuthStore } from "@/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";

export default function NewThreadPage() {
  const params = useParams();
  const router = useRouter();
  const communityAddress = params.address as string;

  const { createThread, isCreating } = useThreadCreation();
  const { account } = useAuthStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateThreadFormData>({
    title: "",
    summary: "",
    content: "",
    tags: "",
    author: account?.address || "", // Ensure author is always a string
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Invalidate and refetch threads for this community
      await queryClient.invalidateQueries({ queryKey: ["threads", communityAddress] });
      router.push(`/communities/${communityAddress}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackNavigationLink href={`/communities/${communityAddress}`}>Back to Community</BackNavigationLink>
            {/* Community info can be fetched here if needed */}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="rounded-xl border border-border bg-card shadow-md">
              <CardHeader>
                <h1 className="text-2xl font-bold text-slate-900">Create New Thread</h1>
                <p className="text-slate-600">Share your thoughts, questions, or ideas with the community</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium text-slate-900">
                      Thread Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="What's your thread about?"
                      className="h-12 border-slate-200 text-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      required
                    />
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <Label htmlFor="summary" className="text-base font-medium text-slate-900">
                      Summary
                    </Label>
                    <Input
                      id="summary"
                      value={formData.summary}
                      onChange={e => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="A short summary of your thread (max 100 chars)"
                      className="border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                      maxLength={100}
                    />
                  </div>

                  {/* Content Editor */}
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-base font-medium text-slate-900">
                      Content
                    </Label>
                    <TextEditor
                      value={formData.content}
                      onChange={function (value: string): void {
                        setFormData({ ...formData, content: value });
                      }}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-base font-medium text-slate-900">
                      Tags (optional)
                    </Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={e => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="development, discussion, help, tutorial (comma separated)"
                      className="border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                    />
                    {formData.tags && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.tags.split(",").map(
                          (tag: string, index: number) =>
                            tag.trim() && (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ),
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isCreating || !formData.title.trim() || !formData.content.trim()}
                      className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-6 font-semibold text-white shadow-lg hover:from-brand-600 hover:to-brand-700"
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guidelines */}
            <Card className="rounded-xl border border-border bg-card shadow-md">
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Posting Guidelines</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Be respectful and constructive</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Use clear, descriptive titles</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Add relevant tags to help others find your post</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Include context and details</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-500">×</span>
                  <span>No spam or self-promotion</span>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="rounded-xl border border-border bg-card shadow-md">
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-900">Preview</h3>
              </CardHeader>
              <CardContent>
                {formData.title || formData.content ? (
                  <div className="space-y-3">
                    {formData.title && <h4 className="text-lg font-semibold text-slate-900">{formData.title}</h4>}
                    {formData.content && (
                      <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">{formData.content}</p>
                    )}
                    {formData.tags && (
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.split(",").map(
                          (tag: string, index: number) =>
                            tag.trim() && (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ),
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Start typing to see a preview...</p>
                )}
              </CardContent>
            </Card>

            {/* Community Info */}
            {/* Community info can be added here if needed */}
          </div>
        </div>
      </main>
    </div>
  );
}
