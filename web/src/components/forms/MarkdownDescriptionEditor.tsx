import React, { useRef, useEffect, useCallback } from 'react';
import TurndownService from 'turndown';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MarkdownDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
});

// Helper: convert simple/standard markdown to html for contentEditable initialization
function markdownToHtml(md: string): string {
  if (!md || !md.trim()) return '';

  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Escape HTML brackets
    const formatted = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/__(.*?)__/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/_(.*?)_/g, '<i>$1</i>')
      // Inline code
      .replace(/`(.*?)`/g, '<code style="background:hsl(var(--muted));padding:2px 4px;border-radius:4px;font-family:monospace;font-size:0.9em;">$1</code>');

    // Headings
    if (/^###\s+(.*)/.test(line)) {
      if (inUl) { htmlLines.push('</ul>'); inUl = false; }
      if (inOl) { htmlLines.push('</ol>'); inOl = false; }
      if (inBlockquote) { htmlLines.push('</blockquote>'); inBlockquote = false; }
      htmlLines.push(`<h3>${formatted.replace(/^###\s+/, '')}</h3>`);
      continue;
    }
    if (/^##\s+(.*)/.test(line)) {
      if (inUl) { htmlLines.push('</ul>'); inUl = false; }
      if (inOl) { htmlLines.push('</ol>'); inOl = false; }
      if (inBlockquote) { htmlLines.push('</blockquote>'); inBlockquote = false; }
      htmlLines.push(`<h2>${formatted.replace(/^##\s+/, '')}</h2>`);
      continue;
    }
    if (/^#\s+(.*)/.test(line)) {
      if (inUl) { htmlLines.push('</ul>'); inUl = false; }
      if (inOl) { htmlLines.push('</ol>'); inOl = false; }
      if (inBlockquote) { htmlLines.push('</blockquote>'); inBlockquote = false; }
      htmlLines.push(`<h1>${formatted.replace(/^#\s+/, '')}</h1>`);
      continue;
    }

    // Unordered lists
    if (/^\s*[-*]\s+(.*)/.test(line)) {
      if (!inUl) {
        if (inOl) { htmlLines.push('</ol>'); inOl = false; }
        htmlLines.push('<ul class="list-disc pl-5 my-1">');
        inUl = true;
      }
      htmlLines.push(`<li>${formatted.replace(/^\s*[-*]\s+/, '')}</li>`);
      continue;
    }

    // Ordered lists
    if (/^\s*\d+\.\s+(.*)/.test(line)) {
      if (!inOl) {
        if (inUl) { htmlLines.push('</ul>'); inUl = false; }
        htmlLines.push('<ol class="list-decimal pl-5 my-1">');
        inOl = true;
      }
      htmlLines.push(`<li>${formatted.replace(/^\s*\d+\.\s+/, '')}</li>`);
      continue;
    }

    // Blockquote
    if (/^&gt;\s+(.*)/.test(formatted) || /^>\s+(.*)/.test(line)) {
      if (!inBlockquote) {
        if (inUl) { htmlLines.push('</ul>'); inUl = false; }
        if (inOl) { htmlLines.push('</ol>'); inOl = false; }
        htmlLines.push('<blockquote class="border-l-4 border-primary pl-3 my-1 italic text-muted-foreground">');
        inBlockquote = true;
      }
      htmlLines.push(`<p>${formatted.replace(/^(&gt;|>)\s+/, '')}</p>`);
      continue;
    }

    // Close any open lists/quotes on blank or regular lines
    if (inUl) { htmlLines.push('</ul>'); inUl = false; }
    if (inOl) { htmlLines.push('</ol>'); inOl = false; }
    if (inBlockquote) { htmlLines.push('</blockquote>'); inBlockquote = false; }

    if (line.trim() === '') {
      htmlLines.push('<p><br></p>');
    } else {
      htmlLines.push(`<p>${formatted}</p>`);
    }
  }

  if (inUl) htmlLines.push('</ul>');
  if (inOl) htmlLines.push('</ol>');
  if (inBlockquote) htmlLines.push('</blockquote>');

  return htmlLines.join('');
}

export function MarkdownDescriptionEditor({
  value,
  onChange,
  placeholder = 'Provide detailed business context, scope, deliverables, and architecture alignment...',
  className,
}: MarkdownDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value to contentEditable HTML only if it wasn't triggered by internal typing
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (editorRef.current) {
      const currentMd = turndownService.turndown(editorRef.current.innerHTML || '');
      if (currentMd.trim() !== (value || '').trim()) {
        editorRef.current.innerHTML = markdownToHtml(value || '');
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    const html = editorRef.current.innerHTML;
    const md = turndownService.turndown(html);
    onChange(md);
  }, [onChange]);

  const execFormat = (command: string, formatValue: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, formatValue);
    handleInput();
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-background text-foreground overflow-hidden shadow-xs transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary',
        className,
      )}
    >
      {/* Visual Formatting Toolbar */}
      <div className="bg-muted/60 border-b border-border px-3 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('bold');
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors font-bold cursor-pointer"
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('italic');
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors italic cursor-pointer"
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('formatBlock', '<h2>');
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
            title="Heading"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('insertUnorderedList');
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('insertOrderedList');
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('formatBlock', '<blockquote>');
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('formatBlock', '<pre>');
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
            title="Code Block"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className="text-[10px] text-muted-foreground font-medium select-none pr-1 uppercase tracking-wider">
          Markdown Rich Text
        </span>
      </div>

      {/* Visual ContentEditable Canvas */}
      <div className="p-3 min-h-[120px] relative bg-background">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
          role="textbox"
          aria-multiline="true"
          className="prose prose-sm max-w-none text-xs text-foreground leading-relaxed focus:outline-none min-h-[100px]"
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
}
