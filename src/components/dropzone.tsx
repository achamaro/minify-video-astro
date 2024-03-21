import { type ChangeEvent, memo, useEffect } from "react";
import { cn } from "~/lib/cn";

interface DropzoneProps {
  className?: string;
  onInput: (file: File) => void;
}
export default memo(function Dropzone({ onInput, className }: DropzoneProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.currentTarget.files?.[0]) {
      onInput(e.currentTarget.files[0]);
    }
  }

  useEffect(() => {
    // Drag and Drop
    function dragover(e: DragEvent) {
      e.preventDefault();
    }
    function drop(e: DragEvent) {
      e.preventDefault();

      if (e.dataTransfer?.files[0]?.type.startsWith("video/")) {
        onInput(e.dataTransfer.files[0]);
      }
    }
    document.addEventListener("dragover", dragover);
    document.addEventListener("drop", drop);

    // Copy and Paste
    function paste(e: ClipboardEvent) {
      e.preventDefault();
      if (e.clipboardData?.files[0]?.type.startsWith("video/")) {
        onInput(e.clipboardData.files[0]);
      }
    }
    window.addEventListener("paste", paste);

    return () => {
      document.removeEventListener("dragover", dragover);
      document.removeEventListener("drop", drop);
      window.removeEventListener("paste", paste);
    };
  }, []);

  return (
    <label
      className={cn(
        "flex h-[180px] w-[360px] cursor-pointer flex-col items-center justify-center gap-2 rounded border border-dashed border-primary bg-primary-light/30 text-sm text-primary-dark transition-colors hover:bg-primary-light/20",
        className,
      )}
    >
      <input
        type="file"
        className="sr-only"
        onChange={handleChange}
        accept="video/*"
      />
      <p className="underline">ファイルを選択</p>
      <span className="text-xs">または</span>
      <p>ドラッグ＆ドロップ</p>
      <span className="text-xs">または</span>
      <p>コピー＆ペースト</p>
    </label>
  );
});
