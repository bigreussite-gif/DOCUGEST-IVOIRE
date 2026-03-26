import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    // Force la page de connexion Next.js la plus récente.
    window.location.replace("/login");
  }, []);

  return (
    <div className="p-6 text-center text-sm text-slate-600">
      Redirection vers la page de connexion...
    </div>
  );
}

