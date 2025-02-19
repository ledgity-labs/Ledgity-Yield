import { type NextPage } from "next";

interface Props {
  children: React.ReactNode;
}

export const metadata = {
  title: "Stable Yield For Stablecoins",
};

const AppLayout: NextPage<Props> = ({ children }) => children;

export default AppLayout;
