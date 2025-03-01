import { Metadata } from "next";
import clsx from "clsx";
import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: "登录 - Dify Dashboard",
  description: "登录到 Dify Dashboard 管理您的应用",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={clsx(
      "min-h-screen bg-background font-sans antialiased",
      fontSans.variable,
    )}>
      <main className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
