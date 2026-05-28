'use client';

// Renders an assistant reply as formatted Markdown, styled inline with the brushed-steel
// design tokens (consistent with the project's inline-style approach). GFM tables/lists via
// remark-gfm; syntax highlighting via rehype-highlight (highlight.js token classes, themed
// in globals.css under `.zora-md`). NO rehype-raw — raw HTML in model output stays escaped.

import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Icon } from './logo';

function headingStyle(size: number): React.CSSProperties {
  return {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: size,
    color: 'var(--t-1)',
    margin: '18px 0 8px',
    letterSpacing: '-0.01em',
  };
}

// Recursively pull the plain-text source out of a React subtree. rehype-highlight turns the
// code into nested <span> elements, so we walk and concatenate the string leaves to recover
// the original code for the copy button.
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) return extractText(node.props.children);
  return '';
}

// A code block (```…```) rendered as the brushed-steel panel, with its own copy button in the
// top-right — separate from the message-level Copy (which copies the whole raw Markdown).
function CodeBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(extractText(children).replace(/\n$/, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.warn('Code copy failed:', e);
    }
  }

  return (
    <div style={{ position: 'relative', margin: '0 0 12px' }}>
      <button
        onClick={handleCopy}
        title={copied ? 'Copied' : 'Copy code'}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          background: 'var(--bg-2)',
          border: '1px solid var(--bd-2)',
          borderRadius: 6,
          padding: '4px 8px',
          cursor: 'pointer',
          color: copied ? 'var(--t-1)' : 'var(--t-3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <Icon name={copied ? 'check' : 'copy'} size={12} />
        {copied ? 'copied' : 'copy'}
      </button>
      <pre
        className="no-scrollbar"
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--bd-2)',
          borderRadius: 10,
          padding: '14px 16px',
          overflowX: 'auto',
          margin: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {children}
      </pre>
    </div>
  );
}

const components: Components = {
  p: ({ children }) => <p style={{ margin: '0 0 12px', lineHeight: 1.65 }}>{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: 'var(--t-1)', textDecoration: 'underline', textUnderlineOffset: 2 }}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0 0 12px', paddingLeft: 22, lineHeight: 1.65 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0 0 12px', paddingLeft: 22, lineHeight: 1.65 }}>{children}</ol>
  ),
  li: ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
  strong: ({ children }) => (
    <strong style={{ color: 'var(--t-1)', fontWeight: 600 }}>{children}</strong>
  ),
  em: ({ children }) => <em>{children}</em>,
  h1: ({ children }) => <h1 style={headingStyle(20)}>{children}</h1>,
  h2: ({ children }) => <h2 style={headingStyle(17)}>{children}</h2>,
  h3: ({ children }) => <h3 style={headingStyle(15)}>{children}</h3>,
  h4: ({ children }) => <h4 style={headingStyle(14)}>{children}</h4>,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: '0 0 12px',
        padding: '4px 0 4px 14px',
        borderLeft: '3px solid var(--bd-3)',
        color: 'var(--t-3)',
      }}
    >
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid var(--bd-2)', margin: '16px 0' }} />
  ),
  code: ({ node, className, children, ...props }) => {
    // rehype-highlight tags block code with `hljs language-xxx`; inline code has no such class.
    const isBlock = /language-|hljs/.test(className || '');
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        style={{
          background: 'var(--bg-3)',
          border: '1px solid var(--bd-2)',
          borderRadius: 5,
          padding: '1px 5px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.88em',
        }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '0 0 12px' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th
      style={{
        border: '1px solid var(--bd-2)',
        padding: '6px 10px',
        textAlign: 'left',
        background: 'var(--bg-2)',
        color: 'var(--t-1)',
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ border: '1px solid var(--bd-2)', padding: '6px 10px' }}>{children}</td>
  ),
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  img: ({ src, alt }) => (
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} style={{ maxWidth: '100%', borderRadius: 8 }} />
  ),
};

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="zora-md" style={{ fontSize: 14, color: 'var(--t-2)' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
