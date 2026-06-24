import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async <T = unknown>(
  ...args: Parameters<typeof fetch>
): Promise<T> => {
  const res = await fetch(...args);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return (await res.json()) as Promise<T>;
};

export function instanceUrl() {
  return process.env.NEXT_PUBLIC_APPLICATION_URL
    ? process.env.NEXT_PUBLIC_APPLICATION_URL
    : "http://localhost:3000";
}

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};

export const range = (start: number, stop: number): Array<number> =>
  Array.from({ length: stop - start + 1 }, (_, index) => start + index);
