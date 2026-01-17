import { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
        {children}
      </main>
    </div>
  );
}
