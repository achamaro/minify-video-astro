import type { ReactNode } from "react";

import { cn } from "~/lib/cn";

export default function Note({ className }: FCProps) {
  return (
    <ul
      className={cn(
        "whitespace-pre-line text-left text-sm text-gray-500",
        className,
      )}
    >
      <ListItem>
        このサービスは
        <a
          className="mx-1 underline"
          target="_blank"
          href="https://github.com/ffmpegwasm/ffmpeg.wasm"
          rel="noreferrer"
        >
          ffmpeg.wasm
          <i className="ml-1 align-middle i-[ic/round-open-in-new]"></i>
        </a>
        を使用してお使いのブラウザ上で動画のサイズを縮小するサービスです。サーバーへのアップロードは一切行わないため安心してご利用いただけます。
      </ListItem>
      <ListItem>動画の出力形式はgif|mp4|webm形式から選択できます。</ListItem>
      <ListItem>
        gif形式は動画の内容によって元のサイズより大きくなることがあります。
      </ListItem>
      <ListItem>入力ファイルのサイズ上限は2GBです。</ListItem>
      <ListItem>
        ソースコードは
        <a
          className="mx-1 underline"
          href="https://github.com/achamaro/minify-video-astro"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/achamaro/minify-video-astro
          <i className="ml-1 align-middle i-[ic/round-open-in-new]"></i>
        </a>
        で公開しています。
      </ListItem>
    </ul>
  );
}

function ListItem({ children }: { children: ReactNode }) {
  return (
    <li className="mt-2 pl-3 before:absolute before:-ml-3 before:content-['-']">
      {children}
    </li>
  );
}
