import { createFFmpeg } from "@ffmpeg/ffmpeg";

const ffmpegPromise = (async () => {
  if (typeof window === "undefined") {
    return;
  }

  const ffmpeg = createFFmpeg({
    corePath: new URL("ffmpeg-core.js", window.location.origin).href,
    log: import.meta.env.DEV,
  });

  await ffmpeg.load();

  return ffmpeg;
})();

const gifsiclePromise = (async () => {
  if (typeof window === "undefined") {
    return;
  }

  return (await import("gifsicle-wasm-browser")).default;
})();

export type Format = "gif" | "webm" | "mp4";

export type GifsicleOptions = {
  optimize?: number;
  lossy?: number;
};

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
  gifsicleOptions?: GifsicleOptions;
};

export default async function minify(
  file: File,
  { trim, fps, width, format, gifsicleOptions }: MinifyOptions,
  onProgress?: (v: { ratio: number }) => void,
) {
  // パラメータを構築
  const inputFilename = file.name;
  const outputFilename = inputFilename.replace(/\.[^\.]+$/, `.${format}`);
  const args = [];

  if (trim) {
    args.push("-ss", String(trim[0]));
  }

  args.push("-i", inputFilename);

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
  args.push(outputFilename);

  // コアファイルの読み込み完了を待機
  const ffmpeg = await ffmpegPromise;
  if (!ffmpeg) {
    throw new Error("FFmpeg not created.");
  }

  if (onProgress) {
    ffmpeg.setProgress(onProgress);
  }

  // 変換処理
  ffmpeg.FS(
    "writeFile",
    inputFilename,
    new Uint8Array(await file.arrayBuffer()),
  );
  await ffmpeg.run(...args);
  const data = ffmpeg.FS("readFile", outputFilename) as Uint8Array;

  let outputFile = new File([data.buffer], outputFilename, {
    type: types[format],
  });

  // gifの場合は gifsicle で圧縮する
  if (format === "gif" && gifsicleOptions) {
    const gifsicle = await gifsiclePromise;
    if (gifsicle) {
      const { optimize, lossy } = gifsicleOptions;
      outputFile = (
        await gifsicle.run({
          input: [
            {
              file: outputFile,
              name: "1.gif",
            },
          ],
          command: [`-O${optimize} --lossy=${lossy} 1.gif -o /out/output.gif`],
        })
      )[0];

      // ファイル名を設定
      // gifsicleで扱いにくい文字を含む可能性があるので、あとから設定する
      outputFile = new File([outputFile], outputFilename, {
        type: outputFile.type,
      });
    }
  }

  return outputFile;
}
