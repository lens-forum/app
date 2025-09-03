/**
 * Thread Domain Validation
 * Simple validation for thread creation
 */
import { CreateThreadFormData } from "./types";

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validates thread creation form data
 */
export function validateCreateThreadForm(formData: CreateThreadFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Title validation
  if (!formData.title.trim()) {
    errors.push({
      field: "title",
      message: "Title is required",
      code: "TITLE_REQUIRED",
    });
  }

  // Summary validation
  if (!formData.summary.trim()) {
    errors.push({
      field: "summary",
      message: "Summary is required",
      code: "SUMMARY_REQUIRED",
    });
  }

  // Content validation
  if (!formData.content.trim()) {
    errors.push({
      field: "content",
      message: "Content is required",
      code: "CONTENT_REQUIRED",
    });
  }

  // Author validation
  if (!formData.author.trim()) {
    errors.push({
      field: "author",
      message: "Author address is required",
      code: "AUTHOR_REQUIRED",
    });
  }

  // Poll validation (if poll exists)
  if (formData.poll) {
    if (!formData.poll.question.trim()) {
      errors.push({
        field: "poll.question",
        message: "Poll question is required",
        code: "POLL_QUESTION_REQUIRED",
      });
    }

    if (formData.poll.options.length < 2) {
      errors.push({
        field: "poll.options",
        message: "Poll must have at least 2 options",
        code: "POLL_MIN_OPTIONS",
      });
    }

    if (formData.poll.options.some(option => !option.trim())) {
      errors.push({
        field: "poll.options",
        message: "All poll options must have text",
        code: "POLL_EMPTY_OPTIONS",
      });
    }

    if (formData.poll.duration <= 0) {
      errors.push({
        field: "poll.duration",
        message: "Poll duration must be greater than 0",
        code: "POLL_INVALID_DURATION",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
