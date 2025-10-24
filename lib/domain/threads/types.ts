import { Address } from "@/types/common";
import { Account, Post } from "@lens-protocol/client";

export interface Thread {
  id: string;
  community: Address;
  author: Account;
  rootPost: Post;
  title: string;
  summary: string;
  repliesCount: number;
  isVisible: boolean;
  slug: string;
  created_at: string;
  updatedAt: string;
  app?: string;
}

export interface CreateThreadFormData {
  title: string;
  summary: string;
  content: string;
  tags?: string;
  author: Address;
  poll?: ThreadPoll;
}

export interface ThreadPoll {
  question: string;
  options: string[];
  allowMultipleVotes: boolean;
  duration: number; // in days
}
