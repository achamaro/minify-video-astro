import { createFFmpeg } from "@ffmpeg/ffmpeg";

const ffmpegPromise = (async () => {
  const ffmpeg = createFFmpeg({
    corePath: new URL("ffmpeg-core.js", window.location.origin).href,
    log: import.meta.env.DEV,
  });

  await ffmpeg.load();

  return ffmpeg;
})();

export type Format = "gif" | "webm" | "mp4";

const types = {
  webm: "video/webm",
  mp4: "video/mp4",
  gif: "image/gif",
};

export type MinifyOptions = {
  trim: [number, number] | null;
  fps: number;
  width: number;
  format: Format;
};

export default async function minify(
  file: File,
  { trim, fps, width, format }: MinifyOptions,
  onProgress?: (v: { ratio: number }) => void,
) {
  // パラメータを構築
  const input = file.name;
  const output = file.name.replace(/\.[^\.]+$/, `.${format}`);
  const args = [];

  if (trim) {
    args.push("-ss", String(trim[0]));
  }

  args.push("-i", input);

  if (trim) {
    args.push("-t", String(trim[1]));
  }

  switch (format) {
    case "gif":
      args.push(
        "-filter_complex",
        `[0:v] fps=${fps},scale=${width}:-1,split [a][b];[a] palettegen [p];[b][p] paletteuse=dither=floyd_steinberg`,
      );
      break;
    default:
      args.push("-vf", `fps=${fps},scale=${width}:-1`);
      break;
  }
  args.push(output);

  // コアファイルの読み込み完了を待機
  const ffmpeg = await ffmpegPromise;

  if (onProgress) {
    ffmpeg.setProgress(onProgress);
  }

  // 変換処理
  ffmpeg.FS("writeFile", input, new Uint8Array(await file.arrayBuffer()));
  await ffmpeg.run(...args);
  const data = ffmpeg.FS("readFile", output) as Uint8Array;

  return new File([data.buffer], output, {
    type: types[format],
  });
}
