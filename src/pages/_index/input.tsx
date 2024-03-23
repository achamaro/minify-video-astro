import Dropzone from "~/components/dropzone";

import Note from "./note";

interface InputProps {
  onInput: (file: File) => void;
}

export default function Input({ onInput }: InputProps) {
  return (
    <div>
      <Dropzone onInput={onInput} className="mx-auto" />
      <Note className="mt-5 max-w-[460px]" />
    </div>
  );
}
