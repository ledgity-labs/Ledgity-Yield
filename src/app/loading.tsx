import Image from "next/image";
import logoIconLight from "~/assets/logo/iconLight.svg";
import { Spinner } from "@/components/ui";

export function LoadingPage() {
  return (
    <main className="fixed inset-0 z-[10000000000000000000000] flex h-full w-screen animate-fadeIn flex-col items-center justify-end gap-3 bg-gradient-to-tr from-bg to-accent pb-6 transition-opacity duration-1000">
      <Image
        src={logoIconLight}
        alt="loader logo"
        width={35}
        className="animate-pulse duration-[2000ms]"
      />
      <Spinner />
    </main>
  );
}

export default LoadingPage;
