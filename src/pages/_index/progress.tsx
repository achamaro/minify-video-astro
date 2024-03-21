import { useEffect, useRef } from "react";

export type ProgressProps = { open?: boolean; progress: number };
export default function Progress({ open, progress }: ProgressProps) {
  const el = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) {
      el.current?.showModal();
    } else {
      el.current?.close();
    }
  }, [open]);
  return (
    <dialog
      ref={el}
      className="-translate-y-14 rounded border bg-white p-4 outline-none drop-shadow-lg backdrop:backdrop-blur-[1px]"
    >
      <section className="flex h-[180px] w-[360px] flex-col drop-shadow-[0_1px_1px_theme(colors.primary.dark)]">
        <h3 className="mb-3 text-center">Minify Video</h3>
        <div className="flex grow flex-col items-center justify-center">
          <p className="mb-3 text-center leading-none">処理中</p>
          <div className="relative w-[200px] overflow-hidden rounded bg-primary-light">
            <div
              key={String(open)}
              className="skeleton bg-accent relative h-2 rounded transition-all duration-500 before:opacity-70"
              style={{
                width: `${Math.min(100, Math.round(progress * 100))}%`,
              }}
            ></div>
          </div>
        </div>
      </section>
    </dialog>
  );
}
