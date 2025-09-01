import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CursorPaginationProps {
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  loading?: boolean;
}

export function CursorPagination({ onPrev, onNext, hasPrev, hasNext, loading }: CursorPaginationProps) {
  if (!hasPrev && !hasNext) return null;
  return (
    <nav role="navigation" aria-label="pagination" className={`mx-auto mt-8 flex w-full justify-center`}>
      <div className="flex flex-row items-center gap-2">
        {hasPrev && (
          <Button variant="link" size="default" onClick={onPrev} disabled={loading} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            <span>Prev</span>
          </Button>
        )}
        {hasNext && (
          <Button variant="link" size="default" onClick={onNext} disabled={loading} className="gap-2">
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </nav>
  );
}
