"use client";

import {
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "~/lib/cn";
import minify, {
  type Format,
  type GifsicleOptions,
  type MinifyOptions,
} from "~/lib/minify";
import { metadata } from "~/lib/video";

import Progress from "./progress";

interface MinifyProps {
  file: File;
  resetFile: () => void;
}

const formats = ["gif", "mp4", "webm"] as const;
const optimizeLevels = [1, 2, 3];

export default memo(function Minify({ file, resetFile }: MinifyProps) {
  const [start, setStart] = useInput(0);
  const [end, setEnd] = useInput(0);
  const [fps] = useInput(10);
  const [width] = useInput(640);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [format, setFormat] = useState<Format>("gif");
  const [progress, setProgress] = useState(0);
  const [progressOpened, setProgressOpened] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);

  // gifsicleオプション
  const [gifsicleOptions, setGifsicleOptions] = useState<GifsicleOptions>();

  useEffect(() => {
    (async () => {
      videoRef.current!.src = URL.createObjectURL(file);
      const [w, , duration] = await metadata(file);
      setMaxWidth(w);
      setEnd(duration);
      durationRef.current = duration;
    })();
    return () => {
      const video = document.querySelector("video");
      if (video?.src) {
        URL.revokeObjectURL(video.src);
      }
    };
  }, [file, setMaxWidth, setEnd]);

  async function handleStart() {
    const startTime = Number(start.value);
    const endTime = Number(end.value);
    let trim = null;
    if (
      Number.isFinite(startTime) &&
      Number.isFinite(endTime) &&
      startTime >= 0 &&
      endTime <= durationRef.current
    ) {
      if (startTime > 0 || endTime < durationRef.current) {
        trim = [startTime, endTime] as [number, number];
      }
    }
    const options: MinifyOptions = {
      trim,
      fps: fps.value,
      width: width.value,
      format,
      gifsicleOptions,
    };

    const onProgress: (v: { ratio: number }) => void = ({ ratio }) =>
      setProgress(ratio);

    setProgress(0);
    setProgressOpened(true);

    // 縮小
    const output = await minify(file, options, onProgress);

    // ダウンロード
    const a = document.createElement("a");
    a.download = output.name;
    a.href = URL.createObjectURL(output);
    a.click();
    URL.revokeObjectURL(a.href);

    resetFile();
  }

  return (
    <section>
      <div className="mb-10 h-[280px] w-full">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          className="h-full w-full object-contain drop-shadow-xl"
          ref={videoRef}
          controls
          muted
        ></video>
      </div>

      <dl className="mx-auto mt-5 grid w-fit grid-cols-[auto,1fr] items-center gap-6">
        <dt>形式</dt>
        <dd className="flex items-center gap-5">
          {formats.map((f) => (
            <label key={f} className="flex items-center gap-1">
              <input
                type="radio"
                value={f}
                checked={f === format}
                onChange={({
                  target: { value },
                }: ChangeEvent<HTMLInputElement>) =>
                  setFormat(value as (typeof formats)[number])
                }
              />
              {f}
            </label>
          ))}
        </dd>

        <dt className="flex items-center gap-2">開始</dt>
        <dd className="relative">
          <InputText className="w-full" {...start} />
          <div className="absolute w-full text-right">
            <Button onClick={() => setStart(videoRef.current!.currentTime)}>
              現在の再生時間を設定
            </Button>
          </div>
        </dd>

        <dt className="mt-4 flex items-center gap-2">終了</dt>
        <dd className="relative mt-4">
          <InputText className="w-full" {...end} />
          <div className="absolute w-full text-right">
            <Button onClick={() => setEnd(videoRef.current!.currentTime)}>
              現在の再生時間を設定
            </Button>
          </div>
        </dd>

        <dt className="mt-4">fps</dt>
        <dd className="mt-4 flex items-center gap-3">
          <input type="range" step={1} min={1} max={30} {...fps} />
          <InputText {...fps} />
        </dd>

        <dt>横幅</dt>
        <dd className="flex items-center gap-3">
          <input type="range" step={1} min={10} max={maxWidth} {...width} />
          <InputText {...width} />
        </dd>

        {format === "gif" && (
          <>
            <dt className="self-start">
              <button
                className={cn(
                  "transition-opacity hover:opacity-70",
                  !gifsicleOptions && "opacity-40",
                )}
                onClick={() =>
                  setGifsicleOptions(
                    gifsicleOptions ? undefined : { optimize: 1, lossy: 30 },
                  )
                }
              >
                gifsicle
              </button>
            </dt>
            <dd>
              {gifsicleOptions && (
                <dl className="mt-0.5">
                  <dt className="text-sm text-gray-500">-O</dt>
                  <dd className="mt-1 flex gap-5">
                    {optimizeLevels.map((v) => (
                      <label key={v} className="flex items-center gap-1">
                        <input
                          type="radio"
                          value={v}
                          checked={v === gifsicleOptions.optimize}
                          onChange={() =>
                            setGifsicleOptions((state) => ({
                              ...state,
                              optimize: v,
                            }))
                          }
                        />
                        {`-O${v}`}
                      </label>
                    ))}
                  </dd>

                  <dt className="mt-3 text-sm text-gray-500">--lossy</dt>
                  <dd className="mt-1 flex gap-3">
                    <input
                      type="range"
                      step={1}
                      min={1}
                      max={200}
                      value={gifsicleOptions.lossy}
                      onChange={(e) =>
                        setGifsicleOptions({
                          ...gifsicleOptions,
                          lossy: Number(e.currentTarget.value),
                        })
                      }
                    />
                    <InputText
                      value={gifsicleOptions.lossy}
                      onChange={(e) =>
                        setGifsicleOptions({
                          ...gifsicleOptions,
                          lossy: Number(e.currentTarget.value),
                        })
                      }
                    />
                  </dd>
                </dl>
              )}
            </dd>
          </>
        )}
      </dl>

      <div className="mt-14 flex flex-col items-center">
        <p className="">
          <a
            className="mx-1 text-primary-dark underline"
            href="/term-of-use/"
            target="_blank"
            rel="noreferrer"
          >
            利用規約
            <i className="ml-1 align-middle i-[ic/round-open-in-new]"></i>
          </a>
          <button className="underline" onClick={handleStart}>
            に同意して開始する
          </button>
        </p>
        <button className="mt-5 text-sm underline" onClick={resetFile}>
          戻る
        </button>
      </div>

      <Progress open={progressOpened} progress={progress} />
    </section>
  );
});

function InputText({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-[4.5em] rounded border border-accent px-1 py-px outline-none",
        className,
      )}
      type="text"
      onFocus={selectOnFocus}
      {...props}
    />
  );
}

function Button({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("text-xs text-primary-dark underline", className)}
      {...props}
    >
      {children}
    </button>
  );
}

function selectOnFocus(e: FocusEvent<HTMLInputElement>) {
  e.currentTarget.select();
}

function useInput<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value as T),
    [],
  );
  return [{ value, onChange }, setValue] as const;
}
