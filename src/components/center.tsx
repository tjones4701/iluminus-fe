import style from "./center.module.scss";
export function Center({ children }: { children: React.ReactNode }) {
  return <span className={style.center}>{children}</span>;
}
