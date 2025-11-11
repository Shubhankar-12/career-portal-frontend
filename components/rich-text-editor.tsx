"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link2,
  Code,
  Undo2,
  Redo2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  // ✅ Prevent SSR hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: { class: "list-disc list-inside space-y-1" },
        },
        orderedList: {
          HTMLAttributes: { class: "list-decimal list-inside space-y-1" },
        },
        heading: { levels: [1, 2, 3] },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-secondary/50 p-2 rounded font-mono text-sm",
          },
        },
      }),
      Link.configure({ openOnClick: false }),
    ],
    content: value || `<p>${placeholder || ""}</p>`,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[150px]",
      },
    },
    immediatelyRender: false, // ✅ critical to stop SSR rendering before hydration
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // ✅ Don’t render until mounted (prevents hydration errors)
  if (!isMounted || !editor) return null;

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleHeading = () =>
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleBulletList = () =>
    editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () =>
    editor.chain().focus().toggleOrderedList().run();
  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };
  const toggleCode = () => editor.chain().focus().toggleCode().run();
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();

  return (
    <div className="space-y-2 border border-border rounded overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 flex-wrap p-2 bg-secondary/50 border-b border-border">
        <ToolbarButton
          icon={<Bold size={18} />}
          active={editor.isActive("bold")}
          onClick={toggleBold}
          title="Bold"
        />
        <ToolbarButton
          icon={<Italic size={18} />}
          active={editor.isActive("italic")}
          onClick={toggleItalic}
          title="Italic"
        />
        <Divider />
        <ToolbarButton
          icon={<Heading2 size={18} />}
          active={editor.isActive("heading", { level: 2 })}
          onClick={toggleHeading}
          title="Heading"
        />
        <ToolbarButton
          icon={<List size={18} />}
          active={editor.isActive("bulletList")}
          onClick={toggleBulletList}
          title="Bullet List"
        />
        <ToolbarButton
          icon={<ListOrdered size={18} />}
          active={editor.isActive("orderedList")}
          onClick={toggleOrderedList}
          title="Ordered List"
        />
        <ToolbarButton
          icon={<Link2 size={18} />}
          active={editor.isActive("link")}
          onClick={addLink}
          title="Link"
        />
        <ToolbarButton
          icon={<Code size={18} />}
          active={editor.isActive("code")}
          onClick={toggleCode}
          title="Code"
        />
        <Divider />
        <ToolbarButton icon={<Undo2 size={18} />} onClick={undo} title="Undo" />
        <ToolbarButton icon={<Redo2 size={18} />} onClick={redo} title="Redo" />
      </div>

      {/* Editor */}
      <div className="prose prose-sm max-w-none px-4 py-3 bg-background min-h-32">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/* ---------- Small reusable toolbar helpers ---------- */
function ToolbarButton({
  icon,
  onClick,
  active,
  title,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary hover:bg-secondary/80"
      }`}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="w-px bg-border" />;
}
