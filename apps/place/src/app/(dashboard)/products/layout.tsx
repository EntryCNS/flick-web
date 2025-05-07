import { PropsWithChildren } from "react";

export const metadata = {
  title: "상품 관리 | Flick Place",
  description: "Flick Place 상품 관리 페이지",
};

export default function ProductsLayout({ children }: PropsWithChildren) {
  return <>{children}</>;
}
