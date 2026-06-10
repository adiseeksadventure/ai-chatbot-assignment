import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4 dark:bg-brand-bg-dark">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-2xl font-medium text-brand-fg dark:text-brand-fg-dark">
          FAQ Assistant
        </h1>
        <p className="text-sm text-brand-fg/60 dark:text-brand-fg-dark/60 leading-relaxed">
          A production-quality AI chat assistant with provider-abstracted LLM
          support, streaming responses, and persistent conversation history.
        </p>
        <Link
          href="/chat"
          className="inline-block rounded-md bg-brand-accent px-6 py-2.5 text-sm font-medium text-brand-bg hover:opacity-90 transition-opacity"
        >
          Open Chat
        </Link>
      </div>
    </div>
  );
}
