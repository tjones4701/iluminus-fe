"use client";
import { Spinner } from "@/components/spinner";
import { useUser } from "@/hooks/use-user";
import style from "./layout.module.scss";
import { redirect } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading, user } = useUser();
  if (isLoading !== false) {
    return (
      <div className={style.center}>
        <Spinner />
      </div>
    );
  }
  if (user == null) {
    redirect("/auth/sign-in");
  }

  return <>{children}</>;
}
