import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

import Config from "./config";
import Input from "./input";

export default function Minify() {
  const [file, setFile] = useState<File>();
  const resetFile = useCallback(() => {
    setFile(undefined);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {file ? (
        <motion.div key="minify" animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Config file={file} resetFile={resetFile} />
        </motion.div>
      ) : (
        <motion.div key="input" animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Input onInput={setFile} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
