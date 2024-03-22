declare module "gifsicle-wasm-browser" {
  function run(options: {
    input: { file: File; name: string }[];
    command: string[];
  }): Promise<File[]>;
}
