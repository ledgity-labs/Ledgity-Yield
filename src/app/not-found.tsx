"use client";

import { Button, Card } from "@/components/ui";
import Link from "next/link";

function NotFoundPage() {
  return (
    <Card asChild>
      <main className="flex justify-center items-center min-h-screen rounded-none before:!inset-5 before:drop-shadow-lg before:animate-fadeAndMoveIn ">
        <div className="w-[100vw] max-w-[400px] sm:p-0 p-10 flex flex-col justify-center items-center sm:gap-10 gap-14 animate-fadeAndMoveIn">
          <h1 className="sm:text-[10rem] text-9xl h-min font-extrabold font-heading text-center text-primary/50">
            404
          </h1>
          <p className="text-lg font-medium text-center sm:whitespace-nowrap">
            Oops! It looks like this page doesn&apos;t exist.
          </p>
          <Link href="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </main>
    </Card>
  );
}
export default NotFoundPage;
