import type { ReactNode } from "react";

declare global {
  type FCProps<T extends object = object> = {
    className?: string;
    children?: ReactNode;
  } & T;
}
