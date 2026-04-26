import React, { useState } from 'react';
import Markdown from 'react-markdown';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  value: string;
}

export const MarkdownField: React.FC<Props> = ({ label, value, onChange, placeholder, rows = 6, ...rest }) => {
  const [editing, setEditing] = useState(!value);

  const previewHeight = `${(rows as number) * 1.625}rem`;

  return (
    <div className="mb-4">
      {label && <label className="handwriting block text-lg text-encre mb-1">{label}</label>}

      {editing ? (
        <textarea
          autoFocus
          className="w-full bg-papier border-2 border-encre px-3 py-2.5 text-encre text-sm placeholder-crayon focus:outline-none resize-none transition-colors"
          value={value}
          onChange={onChange}
          onBlur={() => setEditing(false)}
          placeholder={placeholder}
          rows={rows as number}
          {...rest}
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          style={{ minHeight: previewHeight }}
          className="w-full bg-papier border-2 border-trait px-3 py-2.5 cursor-text hover:border-encre transition-colors
            [&_p]:mb-2 [&_p:last-child]:mb-0
            [&_strong]:text-encre [&_strong]:font-semibold
            [&_em]:italic
            [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-2
            [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-2
            [&_li]:mb-0.5
            [&_a]:text-rouge [&_a]:underline
            [&_code]:bg-papier-fonce [&_code]:px-1 [&_code]:text-xs [&_code]:font-mono
            [&_h1]:handwriting [&_h1]:text-2xl [&_h1]:text-encre [&_h1]:mb-1
            [&_h2]:handwriting [&_h2]:text-xl [&_h2]:text-encre [&_h2]:mb-1"
        >
          {value
            ? <div className="text-crayon text-sm leading-relaxed"><Markdown>{value}</Markdown></div>
            : <span className="text-crayon/50 text-sm">{placeholder}</span>
          }
        </div>
      )}
    </div>
  );
};
