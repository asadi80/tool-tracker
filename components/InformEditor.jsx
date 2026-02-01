"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
export default function InformEditor({ value, onChange, disabled = false }) {
  const [pasteTooltip, setPasteTooltip] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm",
        },
      }),
      Placeholder.configure({
        placeholder: "Start typing your inform content...",
      }),
    ],
    content: value,
    immediatelyRender: false,
    editable: !disabled,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  // Sync editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Update editable state when disabled changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // Handle paste events for images
  useEffect(() => {
    if (!editor || disabled) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                editor.chain().focus().setImage({ src: event.target.result }).run();
                
                // Show tooltip feedback
                setPasteTooltip(true);
                setTimeout(() => setPasteTooltip(false), 2000);
              }
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener("paste", handlePaste);
    
    return () => {
      editorElement.removeEventListener("paste", handlePaste);
    };
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <div className={`border-2 rounded-xl bg-white overflow-hidden shadow-md ${disabled ? "opacity-60" : "border-gray-300 hover:border-blue-300 transition-colors"}`}>
      {/* Toolbar */}
      <div className="flex gap-1.5 p-3 border-b-2 items-center bg-gradient-to-r from-gray-50 to-gray-100 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          disabled={disabled}
          title="Bold (Ctrl+B)"
          className="font-bold"
        >
          B
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          disabled={disabled}
          title="Italic (Ctrl+I)"
          className="italic"
        >
          I
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          disabled={disabled}
          title="Strikethrough"
          className="line-through"
        >
          S
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          disabled={disabled}
          title="Heading 2"
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          disabled={disabled}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          disabled={disabled}
          title="Bullet List"
        >
          •
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          disabled={disabled}
          title="Numbered List"
        >
          1.
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          disabled={disabled}
          title="Quote"
        >
          "
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
          title="Horizontal Rule"
        >
          —
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          ↷
        </ToolbarButton>

        {!disabled && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            {/* Paste Image Button */}
            <div className="relative">
              <ToolbarButton
                onClick={() => {
                  // Show instruction tooltip
                  setPasteTooltip(true);
                  setTimeout(() => setPasteTooltip(false), 3000);
                }}
                disabled={disabled}
                title="Paste Image from clipboard (Ctrl+V)"
                className="text-blue-600 font-medium"
              >
                📋 Paste Image
              </ToolbarButton>
              
              {/* Paste instruction tooltip */}
              {pasteTooltip && (
                <div className="absolute top-full left-0 mt-2 z-10 w-52 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-2xl">
                  <p className="font-semibold mb-1">💡 How to paste images:</p>
                  <p className="text-gray-300">Copy an image (Ctrl+C) and paste (Ctrl+V) into the editor</p>
                  <div className="absolute -top-1.5 left-4 w-3 h-3 bg-gray-900 transform rotate-45"></div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Editor container with relative positioning */}
      <div className="relative bg-white">
        <EditorContent
  editor={editor}
  className={`p-6 min-h-screen w-full prose prose-sm max-w-none focus:outline-none ${
    disabled ? "cursor-not-allowed" : ""
  }`}
/>
        
        {/* Paste hint overlay (only when editor is empty) */}
        {!disabled && !editor.getText() && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-lg max-w-md">
              <p className="text-2xl mb-3">💡</p>
              <p className="font-bold text-gray-900 mb-2">Quick Tip</p>
              <p className="text-sm text-gray-700">
                You can paste images directly into the editor
                <br />
                <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded mt-2 inline-block">
                  Copy an image and press Ctrl+V
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Character count */}
      {!disabled && (
        <div className="px-6 py-3 border-t-2 bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-600 flex items-center justify-between">
          <span>
            <span className="font-semibold">{editor.storage.characterCount?.characters() || 0}</span> characters
          </span>
          <span className="text-blue-600 font-medium">
            📋 Paste images directly into editor
          </span>
        </div>
      )}
    </div>
  );
}

// Reusable toolbar button component
function ToolbarButton({ onClick, isActive, disabled, title, className = "", children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        px-3 py-2 rounded-lg transition-all duration-150 text-sm font-medium
        ${isActive ? "bg-blue-600 text-white shadow-md scale-105" : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:shadow-md active:scale-95"}
        ${className}
      `}
      type="button"
    >
      {children}
    </button>
  );
}