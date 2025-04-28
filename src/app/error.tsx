// src/app/error.tsx
"use client";

export default function ErrorBoundary() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <h2 className="mb-4 text-2xl font-bold">Algo deu errado</h2>
      <p className="text-muted-foreground mb-6">Ocorreu um erro inesperado. Nossa equipe foi notificada.</p>
    </div>
  );
}
