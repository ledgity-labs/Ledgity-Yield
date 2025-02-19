"use client";

import { Button, Card } from "@/components/ui";
import Link from "next/link";

function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card asChild>
      <main className="flex justify-center items-center min-h-screen rounded-none before:!inset-5 before:drop-shadow-lg before:animate-fadeAndMoveIn ">
        <div className="w-[100vw] max-w-[400px] sm:p-0 p-10 flex flex-col justify-center items-center sm:gap-16 gap-10 animate-fadeAndMoveIn">
          <h1 className="sm:text-8xl text-7xl font-extrabold font-heading text-center text-primary">
            Render
            <br />
            Error
          </h1>
          <div className="flex flex-col justify-center items-center gap-3">
            <p className="text-lg font-medium text-center sm:whitespace-nowrap">
              Oops! An error occured while rendering{" "}
              <br className="sm:inline hidden" />
              this page, with the following reason:
            </p>
            <code className="p-8 bg-fg text-bg font-['monospace'] rounded-3xl ">
              {error.name ? error.name + ":" : ""}{" "}
              {error.message || "Unknown error"}
            </code>
          </div>
          <div className="flex gap-6 justify-center items-center">
            <Link href="/">
              <Button>Go back</Button>
            </Link>
            <Button variant="outline" onClick={reset}>
              Retry
            </Button>
          </div>
        </div>
      </main>
    </Card>
  );
}
export default ErrorPage;
