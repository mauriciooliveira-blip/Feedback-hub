import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Por favor, informe seu email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await User.login(email);
      navigate(createPageUrl("Dashboard"));
    } catch (err) {
      setError(err.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-full">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Feedback Hub
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Faça login para acessar o sistema
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">
              Emails de teste disponíveis:
            </p>
            <div className="space-y-2">
              {[
                "mfo.oliveira0013@gmail.com",
                "gestor@nefadv.com.br",
                "ana@nefadv.com.br",
                "bruno@nefadv.com.br",
              ].map((testEmail) => (
                <button
                  key={testEmail}
                  onClick={() => setEmail(testEmail)}
                  className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 p-2 rounded border border-gray-200 text-gray-700 transition"
                >
                  {testEmail}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
