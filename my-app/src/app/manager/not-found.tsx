import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-text-primary">Page Not Found</h2>
      <p className="mt-2 max-w-md text-text-secondary">
        The page or resource you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        <Home className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}
