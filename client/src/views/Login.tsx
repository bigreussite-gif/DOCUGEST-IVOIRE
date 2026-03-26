import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);

  return (
    <div className="p-6 text-center text-sm text-slate-600">
      Redirection vers la page de connexion...
    </div>
  );
}

