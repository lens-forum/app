"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { BarChart3, Plus, X } from "lucide-react";

export interface PollOption {
  id: string;
  text: string;
}

export interface PollData {
  question: string;
  options: PollOption[];
  allowMultipleVotes: boolean;
  duration: number; // in days
}

export interface PollCreatorProps {
  pollData: PollData;
  onPollDataChange: (pollData: PollData) => void;
  onRemovePoll: () => void;
}

export function PollCreator({ pollData, onPollDataChange, onRemovePoll }: PollCreatorProps) {
  const addOption = () => {
    if (pollData.options.length >= 6) return; // Max 6 options

    const newOption: PollOption = {
      id: Date.now().toString(),
      text: "",
    };

    onPollDataChange({
      ...pollData,
      options: [...pollData.options, newOption],
    });
  };

  const removeOption = (optionId: string) => {
    if (pollData.options.length <= 2) return; // Min 2 options

    onPollDataChange({
      ...pollData,
      options: pollData.options.filter(option => option.id !== optionId),
    });
  };

  const updateOption = (optionId: string, text: string) => {
    onPollDataChange({
      ...pollData,
      options: pollData.options.map(option => (option.id === optionId ? { ...option, text } : option)),
    });
  };

  const updateQuestion = (question: string) => {
    onPollDataChange({ ...pollData, question });
  };

  const updateMultipleVotes = (allowMultipleVotes: boolean) => {
    onPollDataChange({ ...pollData, allowMultipleVotes });
  };

  const updateDuration = (duration: number) => {
    onPollDataChange({ ...pollData, duration });
  };

  return (
    <Card className="rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-500" />
            <h3 className="text-lg font-semibold text-foreground">Poll</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemovePoll}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Poll Question */}
        <div className="space-y-2">
          <Label htmlFor="poll-question" className="text-sm font-medium text-foreground">
            Question
          </Label>
          <Input
            id="poll-question"
            value={pollData.question}
            onChange={e => updateQuestion(e.target.value)}
            placeholder="What would you like to ask?"
            maxLength={200}
          />
        </div>

        {/* Poll Options */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Options ({pollData.options.length}/6)</Label>
          <div className="space-y-2">
            {pollData.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {index + 1}
                </span>
                <Input
                  value={option.text}
                  onChange={e => updateOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                  className="flex-1"
                />
                {pollData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {pollData.options.length < 6 && (
            <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          )}
        </div>

        {/* Poll Settings */}
        <div className="space-y-4 border-t border-gray-200/60 pt-4 dark:border-gray-700/60">
          {/* Multiple Votes */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-foreground">Multiple choices</Label>
              <p className="text-xs text-muted-foreground">Allow voters to select multiple options</p>
            </div>
            <Switch checked={pollData.allowMultipleVotes} onCheckedChange={updateMultipleVotes} />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Poll duration</Label>
            <RadioGroup
              value={pollData.duration.toString()}
              onValueChange={value => updateDuration(parseInt(value))}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="duration-1" />
                <Label htmlFor="duration-1" className="text-sm">
                  1 day
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="duration-3" />
                <Label htmlFor="duration-3" className="text-sm">
                  3 days
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7" id="duration-7" />
                <Label htmlFor="duration-7" className="text-sm">
                  7 days
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="duration-30" />
                <Label htmlFor="duration-30" className="text-sm">
                  30 days
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
