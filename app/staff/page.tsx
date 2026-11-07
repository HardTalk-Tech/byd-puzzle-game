import type { Metadata } from "next";
import { StaffDashboard } from "@/components/staff/StaffDashboard";
import { messages } from "@/content/messages";

export const metadata: Metadata = {
  title: messages.staff.title,
  robots: { index: false, follow: false, nocache: true },
};

// Not linked from the kiosk and never cached by the service worker.
export default function StaffPage() {
  return <StaffDashboard />;
}
