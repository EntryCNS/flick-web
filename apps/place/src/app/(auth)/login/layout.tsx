import { PropsWithChildren } from "react";

export const metadata = {
  title: "로그인 | Flick Place",
};

export default function LoginLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
