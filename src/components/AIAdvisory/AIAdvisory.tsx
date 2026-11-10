
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import moment from "moment";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import {
  CalendarDays,
  ChevronDown,
  RefreshCw,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useAxios } from "@/hooks/useAxios";

// --------------------------------------------------
// Types
// --------------------------------------------------

type Period =
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "last_30_days"
  | "this_year"
  | "all_time"
  | "custom";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  id: string | number;
  role: MessageRole;
  content: string;
  time?: string;
}

interface HistoryMessage {
  id?: string | number;
  role?: string;
  sender?: string;
  content?: string;
  message?: string;
  question?: string;
  response?: string;
  created_at?: string;
  time?: string;
  user_message?: HistoryMessage;
  assistant_message?: HistoryMessage;
}

// --------------------------------------------------
// Constants
// --------------------------------------------------

const periods: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "This week", value: "this_week" },
  { label: "This month", value: "this_month" },
  { label: "Last month", value: "last_month" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "This year", value: "this_year" },
  { label: "All time", value: "all_time" },
  { label: "Custom date range", value: "custom" },
];

const quickQuestions = [
  "Where does most of my money go?",
  "What are my total expenses?",
  "Compare with last month",
  "Which category can I reduce?",
  "Show transactions above ₹1,000",
];

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function normalizeMessage(
  item: HistoryMessage,
  index: number
): ChatMessage {
  return {
    id: item.id ?? index,
    role:
      item.role === "user" || item.sender === "user"
        ? "user"
        : "assistant",
    content:
      item.content ??
      item.message ??
      item.question ??
      item.response ??
      "",
    time: item.created_at ?? item.time ?? "",
  };
}

function normalizeHistory(response: any): ChatMessage[] {
  const history =
    response?.data?.messages ??
    response?.data?.history ??
    response?.messages ??
    response?.history ??
    (Array.isArray(response?.data) ? response.data : []);

  if (!Array.isArray(history)) {
    return [];
  }

  const messages: ChatMessage[] = [];

  history.forEach((item: HistoryMessage, index: number) => {
    // Support records containing both user and assistant messages.
    if (item.user_message || item.assistant_message) {
      if (item.user_message) {
        messages.push(
          normalizeMessage(item.user_message, index * 2)
        );
      }

      if (item.assistant_message) {
        messages.push(
          normalizeMessage(item.assistant_message, index * 2 + 1)
        );
      }
    } else {
      messages.push(normalizeMessage(item, index));
    }
  });

  return messages.filter((message) => message.content.trim());
}

// Convert UTC timestamp to browser's system timezone
function getLocalDate(value?: string) {
  if (!value) return null;

  // Backend sends UTC timestamps.
  // Add Z if the timestamp has no timezone indicator.
  const utcValue =
    /Z$|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;

  const date = moment.utc(utcValue).local();

  return date.isValid() ? date : null;
}

function formatChatDate(value?: string): string {
  const date = getLocalDate(value);

  if (!date) return "";

  if (date.isSame(moment(), "day")) {
    return "Today";
  }

  if (date.isSame(moment().subtract(1, "day"), "day")) {
    return "Yesterday";
  }

  return date.format("DD MMM YYYY");
}

function formatChatTime(value?: string): string {
  const date = getLocalDate(value);

  return date ? date.format("hh:mm A") : "";
}



// --------------------------------------------------
// Component
// --------------------------------------------------

export default function AIAdvisory() {
  const { request } = useAxios<any>();

  const [period, setPeriod] = useState<Period>("this_month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const initialized = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --------------------------------------------------
  // Selected period label
  // --------------------------------------------------

  const selectedPeriodLabel =
    periods.find((item) => item.value === period)?.label ??
    "Select period";

  const customDateLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "dd MMM yyyy")} - ${format(
        dateRange.to,
        "dd MMM yyyy"
      )}`
      : dateRange?.from
        ? format(dateRange.from, "dd MMM yyyy")
        : "Select date range";

  // --------------------------------------------------
  // Scroll to latest message
  // --------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // --------------------------------------------------
  // Load chat history
  // --------------------------------------------------

  const refreshHistory = useCallback(async () => {
    setRefreshing(true);

    try {
      const response = await request({
        method: "GET",
        url: "/api/ai/history",
      });

      if (!response) {
        setMessages([]);
        return;
      }

      const history = normalizeHistory(response);

      setMessages(history);
    } catch (error) {
      console.error("Failed to load AI history:", error);
    } finally {
      setRefreshing(false);
    }
  }, [request]);

  // --------------------------------------------------
  // Initial history loading
  // --------------------------------------------------

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    refreshHistory();
  }, [refreshHistory]);

  // --------------------------------------------------
  // Period change
  // --------------------------------------------------

  const handlePeriodChange = (value: Period) => {
    setPeriod(value);

    if (value === "custom") {
      setCalendarOpen(true);
    } else {
      setDateRange(undefined);
      setCalendarOpen(false);
    }
  };

  // --------------------------------------------------
  // Send question to AI
  // --------------------------------------------------

  const handleAsk = async (value?: string) => {
    const userQuestion = (value ?? question).trim();

    if (!userQuestion || loading) return;

    if (
      period === "custom" &&
      (!dateRange?.from || !dateRange?.to)
    ) {
      setCalendarOpen(true);
      return;
    }

    const temporaryId = `temp-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const userMessage: ChatMessage = {
      id: temporaryId,
      role: "user",
      content: userQuestion,
      time: createdAt,
    };

    // Immediately show the user's message.
    setMessages((previous) => [...previous, userMessage]);

    setQuestion("");
    setLoading(true);

    try {
      const payload = {
        period,
        question: userQuestion,

        ...(period === "custom" && dateRange?.from && dateRange?.to
          ? {
            startdate: format(dateRange.from, "yyyy-MM-dd"),
            enddate: format(dateRange.to, "yyyy-MM-dd"),
          }
          : {}),
      };

      const response = await request({
        method: "POST",
        url: "/api/ai/chat",
        data: payload,
        timeout: 180000,
      });

      // useAxios returns response.data.
      // Actual backend structure:
      // {
      //   status: true,
      //   data: {
      //     assistant_message: {...},
      //     user_message: {...}
      //   }
      // }

      const assistantMessage =
        response?.data?.assistant_message;

      const aiResponse =
        assistantMessage?.content ??
        response?.data?.response ??
        response?.response ??
        "";

      if (!aiResponse) {
        throw new Error(
          "AI response is missing from the API response."
        );
      }

      const savedUserMessage = response?.data?.user_message;

      setMessages((previous) =>
        previous.map((message) =>
          message.id === temporaryId
            ? {
              ...message,
              id: savedUserMessage?.id ?? message.id,
              time:
                savedUserMessage?.created_at ??
                message.time,
            }
            : message
        ).concat({
          id: assistantMessage?.id ?? Date.now(),
          role: "assistant",
          content: aiResponse,
          time:
            assistantMessage?.created_at ??
            new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("AI chat request failed:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I couldn't process your request. Please try again.",
          time: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  // --------------------------------------------------
  // Keyboard handling
  // --------------------------------------------------

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAsk();
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 md:px-8">

        {/* Page title and refresh */}

        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Sparkles className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                AI Advisor
              </h1>

              <p className="text-sm text-muted-foreground">
                Ask anything about your finances.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={refreshHistory}
            disabled={refreshing || loading}
            title="Refresh chat history"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""
                }`}
            />
          </Button>
        </div>

        {/* Period selector */}

        <div className="mb-5">
          <Select
            value={period}
            onValueChange={(value) =>
              handlePeriodChange(value as Period)
            }
            disabled={loading}
          >
            <SelectTrigger className="h-12 w-full rounded-xl bg-background px-4 shadow-sm">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />

                <SelectValue placeholder="Select period">
                  {selectedPeriodLabel}
                </SelectValue>
              </div>
            </SelectTrigger>

            <SelectContent>
              {periods.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom date range */}

        {period === "custom" && (
          <div className="mb-6 rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  Custom date range
                </h3>

                <p className="text-xs text-muted-foreground">
                  Select the period for your financial analysis.
                </p>
              </div>

              {dateRange && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDateRange(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Popover
              open={calendarOpen}
              onOpenChange={setCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full justify-between rounded-lg font-normal"
                >
                  <span>{customDateLabel}</span>

                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="w-auto p-0"
              >
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={{ after: new Date() }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {dateRange?.from && dateRange?.to && (
              <p className="mt-3 text-xs text-muted-foreground">
                Selected: {customDateLabel}
              </p>
            )}
          </div>
        )}

        {/* Quick questions */}

        {messages.length === 0 && (
          <div className="mb-7">
            <p className="mb-3 text-sm font-semibold">
              Quick questions:
            </p>

            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 rounded-full px-4 text-xs"
                  disabled={loading || refreshing}
                  onClick={() => handleAsk(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}

        <div className="flex-1 space-y-6 pb-6">
          {refreshing && messages.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading chat history...
            </div>
          )}

          {!refreshing && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="mb-3 h-8 w-8 text-muted-foreground" />

              <p className="font-medium">
                How can I help you today?
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Ask questions about your income and expenses.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user"
                  ? "justify-end"
                  : "justify-start"
                }`}
            >
              {message.role === "assistant" && (
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
              )}

              <div
                className={`max-w-[88%] md:max-w-[82%] ${message.role === "user"
                    ? "items-end"
                    : "items-start"
                  }`}
              >
                {/* Message author and date */}

                <div
                  className={`mb-2 flex items-center gap-2 text-xs ${message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                    }`}
                >
                  {message.role === "user" ? (
                    <>
                      <span className="font-semibold">You</span>
                      <UserRound className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">
                        Montra AI
                      </span>
                      <Sparkles className="h-3.5 w-3.5" />
                    </>
                  )}

                  {message.time && (
                    <span className="text-muted-foreground">
                      {formatChatDate(message.time)}
                      {formatChatTime(message.time) &&
                        ` · ${formatChatTime(message.time)}`}
                    </span>
                  )}
                </div>

                {/* Message content */}

                <div
                  className={`rounded-2xl border px-4 py-3 text-sm leading-7 ${message.role === "user"
                      ? "rounded-tr-sm border-transparent bg-muted"
                      : "rounded-tl-sm bg-card"
                    }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none break-words dark:prose-invert prose-headings:font-semibold prose-p:leading-7 prose-table:block prose-table:overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>
              </div>

              {message.role === "user" && (
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <UserRound className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {/* AI loading indicator */}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold">
                  Montra AI
                </p>

                <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                  <span className="ml-1">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message composer */}

        <div className="sticky bottom-0 bg-background pb-4 pt-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 rounded-xl border bg-card p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
              <Textarea
                ref={textareaRef}
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your finances..."
                className="min-h-[52px] max-h-36 resize-none border-0 shadow-none focus-visible:ring-0"
                disabled={loading}
              />

              <div className="flex items-center justify-between px-2 pb-1">
                <span className="text-[11px] text-muted-foreground">
                  Enter to send · Shift + Enter for new line
                </span>

                {question.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {question.length} characters
                  </span>
                )}
              </div>
            </div>

            <Button
              type="button"
              size="icon"
              className="h-14 w-14 shrink-0 rounded-xl"
              onClick={() => handleAsk()}
              disabled={!question.trim() || loading}
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
