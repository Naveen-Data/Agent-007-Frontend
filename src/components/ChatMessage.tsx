import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from './ui/utils';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessageModel {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  mode?: string;
}

interface ChatMessageProps {
  message: ChatMessageModel;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const formattedContent = useMemo(() => formatAgentMarkdown(message.content), [message.content]);

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl border px-5 py-4 text-[0.95rem] leading-relaxed shadow-sm transition',
          isUser
            ? 'border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
            : 'border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            strong: ({ node, ...props }) => (
              <strong
                className={cn(
                  'font-semibold',
                  isUser
                    ? 'text-zinc-50 dark:text-zinc-900'
                    : 'text-zinc-900 dark:text-zinc-50'
                )}
                {...props}
              />
            ),
            ul: ({ node, ...props }) => (
              <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />
            ),
            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          }}
        >
          {formattedContent}
        </ReactMarkdown>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-600">
          <span>{message.timestamp.toLocaleTimeString()}</span>
          {message.mode && (
            <span className="rounded-full border border-zinc-300/40 px-2 py-0.5 text-[10px] uppercase tracking-wide">
              {message.mode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const SECTION_HEADING_REGEX = /(\*\*[^*]+:\*\*)\s*/g;

function formatAgentMarkdown(text: string) {
  const withBreaks = text.replace(SECTION_HEADING_REGEX, (_match, heading) => `\n\n${heading} `);
  return withBreaks.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n').trim();
}
