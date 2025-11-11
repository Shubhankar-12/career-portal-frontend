"use client";

import { useState } from "react";

import type React from "react";
import { RichTextEditor } from "./rich-text-editor";

export interface SectionData {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
}

interface SectionEditorProps {
  section: SectionData;
  onUpdate: (section: SectionData) => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  index: number;
  isDragging?: boolean;
}

export function SectionEditor({
  section,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  index,
  isDragging,
}: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={`border-2 rounded transition-all ${
        isDragging
          ? "border-primary bg-primary/10 opacity-50"
          : "border-border hover:border-primary/50"
      } ${isExpanded ? "border-primary" : ""}`}
    >
      {/* Section Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 bg-secondary/50 cursor-move hover:bg-secondary/70 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg opacity-60">☰</span>
          <div>
            <p className="font-semibold capitalize">{section.type}</p>
            <p className="text-sm text-text-secondary">
              {section.title || "Untitled section"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-text-secondary hover:text-primary"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-red-400 hover:text-red-300 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Section Content Editor */}
      {isExpanded && (
        <div className="p-4 border-t border-border space-y-4 bg-background/50">
          <div>
            <label className="block text-sm font-medium mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={section.title}
              onChange={(e) => onUpdate({ ...section, title: e.target.value })}
              className="input"
              placeholder="e.g., About Our Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <RichTextEditor
              value={section.content}
              onChange={(content) => onUpdate({ ...section, content })}
              placeholder={`Enter ${section.type} section content...`}
            />
          </div>

          {/* Live Preview */}
          {section.content && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-text-secondary mb-2">
                Preview
              </p>
              <div
                className="p-3 bg-secondary/30 rounded text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
