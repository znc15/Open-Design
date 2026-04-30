"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Star, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { CritiqueResult, CritiqueDimension } from "@/types/discovery";

/** 维度中文名 */
const DIMENSION_LABELS: Record<CritiqueDimension, string> = {
  philosophy: "设计哲学",
  hierarchy: "信息层级",
  detail: "细节执行",
  function: "功能完整",
  restraint: "克制程度",
};

/** 维度说明 */
const DIMENSION_DESCRIPTIONS: Record<CritiqueDimension, string> = {
  philosophy: "设计哲学是否一致？调性是否匹配选定方向？",
  hierarchy: "信息层级是否清晰？视觉优先级是否正确？",
  detail: "细节执行是否到位？间距、字体、颜色是否协调？",
  function: "功能是否完整？交互是否合理？",
  restraint: "是否克制？是否有过度设计或 AI slop？",
};

/** 星级评分 */
function StarRating({
  score,
  onChange,
  readonly = false,
}: {
  score: number;
  onChange?: (score: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              "size-4",
              star <= score
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function CritiquePanel({
  results,
  onScoreChange,
  onCommentChange,
  onRunCritique,
  isRunning,
}: {
  results: CritiqueResult[];
  onScoreChange?: (dimension: CritiqueDimension, score: number) => void;
  onCommentChange?: (dimension: CritiqueDimension, comment: string) => void;
  onRunCritique?: () => void;
  isRunning?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  const allPassed = results.length > 0 && results.every((r) => r.passed);
  const anyFailed = results.some((r) => !r.passed);
  const avgScore = results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0;

  return (
    <div className="border border-border/60 rounded-lg bg-card/95 backdrop-blur-sm">
      {/* 头部 */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">五维评审</span>
          {results.length > 0 && (
            <>
              <span className={cn("text-xs font-mono", allPassed ? "text-green-500" : "text-red-500")}>
                {avgScore.toFixed(1)}/5
              </span>
              {allPassed ? (
                <CheckCircle2 className="size-3 text-green-500" />
              ) : (
                <AlertTriangle className="size-3 text-red-500" />
              )}
            </>
          )}
        </div>

        {onRunCritique && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRunCritique();
            }}
            disabled={isRunning}
            className="h-6 text-xs"
          >
            {isRunning ? "评审中..." : "运行评审"}
          </Button>
        )}
      </div>

      {/* 评审结果 */}
      {expanded && results.length > 0 && (
        <ScrollArea className="max-h-[200px] px-3 pb-3">
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.dimension}
                className={cn(
                  "flex items-start gap-2 rounded-md px-2 py-1.5",
                  result.passed ? "bg-green-500/5" : "bg-red-500/5"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {DIMENSION_LABELS[result.dimension]}
                    </span>
                    <StarRating score={result.score} readonly />
                    {result.passed ? (
                      <CheckCircle2 className="size-3 text-green-500" />
                    ) : (
                      <XCircle className="size-3 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{result.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* 空状态 */}
      {expanded && results.length === 0 && (
        <div className="px-3 pb-3 text-center">
          <p className="text-xs text-muted-foreground">
            在输出 artifact 之前运行五维评审，确保设计质量
          </p>
        </div>
      )}
    </div>
  );
}

/** 导出维度标签和描述 */
export { DIMENSION_LABELS, DIMENSION_DESCRIPTIONS };