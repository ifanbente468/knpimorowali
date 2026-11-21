import Link from "next/link";
import { Alert } from "@/components/ui";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function AdminNotice({
  notice,
  error,
}: {
  notice?: string;
  error?: string;
}) {
  if (!notice && !error) return null;
  return (
    <div className="mb-5">
      <Alert tone={error ? "danger" : "success"}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>{safeDecode(error ?? notice ?? "")}</span>
          <Link href="?" className="text-xs font-bold underline">
            Tutup
          </Link>
        </div>
      </Alert>
    </div>
  );
}
