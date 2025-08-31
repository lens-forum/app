import { adaptFeedToThread } from "@/lib/adapters/thread-adapter";
import { Thread } from "@/lib/domain/threads/types";
import { fetchAccountFromLens } from "@/lib/external/lens/primitives/accounts";
import { fetchFeed } from "@/lib/external/lens/primitives/feeds";
import { fetchPost } from "@/lib/external/lens/primitives/posts";
import { client } from "@/lib/external/lens/protocol-client";
import { fetchThread as fetchThreadDb } from "@/lib/external/supabase/threads";
import { Post, SessionClient } from "@lens-protocol/client";

export interface ThreadResult {
  success: boolean;
  thread?: Thread;
  error?: string;
}

/**
 * Gets a single thread by its Lens feed address
 * Orchestrates database, Lens Protocol calls, and data transformation
 */
export async function getThread(threadAddress: string, sessionClient?: SessionClient): Promise<ThreadResult> {
  try {
    // 1. Fetch thread record from database
    const threadRecord = await fetchThreadDb(threadAddress);
    if (!threadRecord) {
      return {
        success: false,
        error: "Thread not found in database",
      };
    }

    // 2. Fetch feed from Lens Protocol
    const feed = await fetchFeed(threadAddress);
    if (!feed) {
      return {
        success: false,
        error: "Thread feed not found on Lens Protocol",
      };
    }

    // 3. Fetch author account from Lens Protocol
    const author = await fetchAccountFromLens(threadRecord.author);
    if (!author) {
      return {
        success: false,
        error: "Thread author not found on Lens Protocol",
      };
    }

    // 4. Fetch root post if not already included in threadRecord
    const lensClient = sessionClient || client;
    const rootPost = await fetchPost(threadRecord.root_post_id as string, lensClient);

    // 5. Transform data using adapter
    const thread = await adaptFeedToThread(feed, threadRecord, author, rootPost as Post);

    return {
      success: true,
      thread,
    };
  } catch (error) {
    console.error("Failed to get thread:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get thread",
    };
  }
}
