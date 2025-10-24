import { useState } from "react";
import { PollData } from "@/components/polls/poll-creator";

export function usePollForm() {
  const [hasPoll, setHasPoll] = useState(false);
  const [pollData, setPollData] = useState<PollData>({
    question: "",
    options: [
      { id: "1", text: "" },
      { id: "2", text: "" },
    ],
    allowMultipleVotes: false,
    duration: 7, // Default to 7 days
  });

  const addPoll = () => {
    setHasPoll(true);
    // Reset poll data when adding a new poll
    setPollData({
      question: "",
      options: [
        { id: Date.now().toString(), text: "" },
        { id: (Date.now() + 1).toString(), text: "" },
      ],
      allowMultipleVotes: false,
      duration: 7,
    });
  };

  const removePoll = () => {
    setHasPoll(false);
    setPollData({
      question: "",
      options: [
        { id: "1", text: "" },
        { id: "2", text: "" },
      ],
      allowMultipleVotes: false,
      duration: 7,
    });
  };

  const updatePollData = (newPollData: PollData) => {
    setPollData(newPollData);
  };

  const isPollValid = () => {
    if (!hasPoll) return true;

    return (
      pollData.question.trim() !== "" &&
      pollData.options.length >= 2 &&
      pollData.options.every(option => option.text.trim() !== "")
    );
  };

  const getPollForSubmission = () => {
    if (!hasPoll || !isPollValid()) return null;

    return {
      question: pollData.question,
      options: pollData.options.map(option => option.text),
      allowMultipleVotes: pollData.allowMultipleVotes,
      duration: pollData.duration,
    };
  };

  return {
    hasPoll,
    pollData,
    addPoll,
    removePoll,
    updatePollData,
    isPollValid,
    getPollForSubmission,
  };
}
