"use client"; // Error boundaries must be Client Components

import { RestartingScreen } from "@/components/system/RestartingScreen";

export default function Error({ error }: { error: unknown; retry: () => void }) {
  return <RestartingScreen error={error} />;
}
