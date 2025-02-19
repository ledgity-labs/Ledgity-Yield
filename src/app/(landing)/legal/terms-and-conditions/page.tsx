import { type NextPage } from "next";

export const metadata = {
  title: "Terms & Conditions",
};

//
const Page: NextPage = () => {
  return (
    <div className="w-full flex justify-center flex-col items-center gap-10 py-10 px-5">
      <h2 className="text-center font-heading text-4xl font-bold text-fg/90">
        Terms & Conditions
      </h2>
      <iframe
        src="/docs/terms-and-conditions.pdf"
        className="w-[calc(100vh-97px)] max-w-full h-[calc(100vh-97px)]"
      ></iframe>
    </div>
  );
};
export default Page;
