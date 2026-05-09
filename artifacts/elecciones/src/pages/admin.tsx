import { useState, useEffect, useRef } from "react";
import {
  useAdminLogin,
  useGetAdminStats,
  useCreateCandidate,
  useUpdateCandidate,
  useDeleteCandidate,
  useChangeAdminPassword,
  getGetAdminStatsQueryKey,
  setAuthTokenGetter,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const adminLogin = useAdminLogin();

  const applyToken = (t: string | null) => {
    setToken(t);
    if (t) {
      setAuthTokenGetter(() => t);
      localStorage.setItem("admin_token", t);
    } else {
      setAuthTokenGetter(null);
      localStorage.removeItem("admin_token");
    }
  };

  const handleLogin = async () => {
    try {
      setLoginError("");
      const result = await adminLogin.mutateAsync({ data: { password } });
      if (result.success && result.token) {
        applyToken(result.token);
      }
    } catch {
      setLoginError("Contrasena incorrecta");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) {
      applyToken(saved);
    }
    return () => {
      setAuthTokenGetter(null);
    };
  }, []);

  if (!token) {
    return <LoginForm password={password} setPassword={setPassword} onLogin={handleLogin} error={loginError} loading={adminLogin.isPending} />;
  }

  return <AdminDashboard token={token} onLogout={() => applyToken(null)} />;
}

function LoginForm({ password, setPassword, onLogin, error, loading }: {
  password: string;
  setPassword: (v: string) => void;
  onLogin: () => void;
  error: string;
  loading: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0f141e" }}>
      <div className="w-full max-w-sm bg-[#1a2030] rounded-xl p-8 border border-[#2a3348]">
        <div className="text-center mb-6">
          <span className="text-4xl">🔐</span>
          <h2 className="text-2xl font-bold text-white mt-2">Panel de Administracion</h2>
          <p className="text-gray-400 text-sm mt-1">Ingrese su contrasena</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin()}
          placeholder="Contrasena"
          className="w-full px-4 py-3 rounded-lg bg-[#232b3e] border border-[#2a3348] text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a03d] transition-colors mb-4"
          autoFocus
        />

        <button
          onClick={onLogin}
          disabled={loading || !password}
          className="w-full py-3 rounded-lg bg-[#c9a03d] hover:bg-[#d4b15a] text-[#0f141e] font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { data: stats, isLoading, error: statsError } = useGetAdminStats();

  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const deleteCandidate = useDeleteCandidate();
  const changePassword = useChangeAdminPassword();

  const [candidateName, setCandidateName] = useState("");
  const [candidatePhoto, setCandidatePhoto] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (statsError) {
      onLogout();
    }
  }, [statsError]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCandidatePhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const refreshStats = () => {
    queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
  };

  const handleSaveCandidate = async () => {
    if (!candidateName.trim() || !candidatePhoto) {
      setMessage("Nombre y foto son requeridos");
      return;
    }

    try {
      if (editingId) {
        await updateCandidate.mutateAsync({
          id: editingId,
          data: { name: candidateName, photo: candidatePhoto },
        });
        setMessage("Candidato actualizado");
      } else {
        await createCandidate.mutateAsync({
          data: { name: candidateName, photo: candidatePhoto },
        });
        setMessage("Candidato creado");
      }
      setCandidateName("");
      setCandidatePhoto("");
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      refreshStats();
    } catch {
      setMessage("Error al guardar candidato");
    }
  };

  const handleEdit = (candidate: any) => {
    setEditingId(candidate.id);
    setCandidateName(candidate.name);
    setCandidatePhoto(candidate.photo);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Estas seguro de eliminar este candidato?")) return;
    try {
      await deleteCandidate.mutateAsync({ id });
      setMessage("Candidato eliminado");
      refreshStats();
    } catch {
      setMessage("Error al eliminar candidato");
    }
  };

  const handleChangePassword = async () => {
    try {
      await changePassword.mutateAsync({
        data: { currentPassword: currentPwd, newPassword: newPwd },
      });
      setMessage("Contrasena actualizada correctamente");
      setShowPasswordForm(false);
      setCurrentPwd("");
      setNewPwd("");
    } catch {
      setMessage("Error al cambiar contrasena. Verifica la contrasena actual.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f141e" }}>
        <div className="w-12 h-12 border-4 border-[#c9a03d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f141e" }}>
      <header className="bg-[#1a2030] border-b border-[#2a3348] px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🛡️ Panel de Administracion
            </h1>
            <p className="text-gray-400 text-sm mt-1">Sistema seguro - Todos los datos estan cifrados</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/stats")}
              className="px-4 py-2 rounded-lg bg-[#c9a03d] hover:bg-[#d4b15a] text-[#0f141e] font-semibold transition-colors text-sm"
            >
              📊 Ver Estadísticas
            </button>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-4 py-2 rounded-lg bg-[#232b3e] text-gray-300 hover:bg-[#2a3348] transition-colors border border-[#2a3348] text-sm"
            >
              Cambiar contrasena
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-red-900/40 text-red-300 hover:bg-red-900/60 transition-colors border border-red-800/50 text-sm"
            >
              Cerrar Sesion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {message && (
          <div className={`p-3 rounded-lg text-center text-sm font-medium ${
            message.includes("Error") || message.includes("error")
              ? "bg-red-900/30 border border-red-700 text-red-300"
              : "bg-green-900/30 border border-green-700 text-green-300"
          }`}>
            {message}
            <button onClick={() => setMessage("")} className="ml-3 text-xs opacity-70 hover:opacity-100">x</button>
          </div>
        )}

        {showPasswordForm && (
          <div className="bg-[#1a2030] rounded-xl p-6 border border-[#2a3348]">
            <h3 className="text-lg font-bold text-white mb-4">Cambiar Contrasena</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Contrasena actual"
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#232b3e] border border-[#2a3348] text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a03d]"
              />
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Nueva contrasena"
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#232b3e] border border-[#2a3348] text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a03d]"
              />
              <button
                onClick={handleChangePassword}
                disabled={!currentPwd || !newPwd}
                className="px-6 py-2.5 rounded-lg bg-[#c9a03d] hover:bg-[#d4b15a] text-[#0f141e] font-semibold transition-colors disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.candidates?.map((c) => (
            <div key={c.id} className="bg-[#1a2030] rounded-xl p-4 border border-[#2a3348]">
              <div className="flex items-start gap-3 mb-3">
                <img src={c.photo} alt={c.name} className="w-14 h-14 rounded-lg object-cover bg-[#232b3e] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold truncate">{c.name}</h4>
                  <p className="text-3xl font-bold text-[#c9a03d]">{c.totalVotes}</p>
                  <p className="text-gray-400 text-sm">{c.percentage}% del total</p>
                </div>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <p>🔒 Anonimos: {c.anonymousVotes}</p>
                <p>👤 Con nombre: {c.namedVotes}</p>
              </div>
              {c.recentVotes && c.recentVotes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#2a3348]">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Ultimos votos:</p>
                  {c.recentVotes.map((v) => (
                    <p key={v.id} className="text-xs text-gray-400">
                      {v.voterName ? `👤 ${v.voterName}` : "🔒 Voto anonimo"}
                      {" - "}
                      <span className="text-gray-500">
                        {new Date(v.createdAt).toLocaleString("es-AR")}
                      </span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#1a2030] rounded-xl p-6 border border-[#2a3348]">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            📊 Resumen General
          </h3>
          <p className="text-4xl font-bold text-[#c9a03d]">{stats?.totalVotes || 0}</p>
          <p className="text-gray-400 text-sm mb-3">Votos totales emitidos</p>
          <div className="text-sm text-gray-400 space-y-1">
            <p>👥 Candidatos: {stats?.candidateCount || 0}</p>
            <p>📊 Promedio: {stats?.candidateCount && stats.candidateCount > 0 ? ((stats.totalVotes || 0) / stats.candidateCount).toFixed(1) : "0"} votos por candidato</p>
          </div>
        </div>

        <div className="bg-[#1a2030] rounded-xl p-6 border border-[#2a3348]">
          <h3 className="text-lg font-bold text-white mb-4">
            {editingId ? "✏️ Editar Candidato" : "➕ Agregar Candidato"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">📝 Nombre completo:</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Ej. Juan Perez"
                className="w-full px-4 py-3 rounded-lg bg-[#232b3e] border border-[#2a3348] text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a03d] transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">🖼️ Foto del candidato:</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#c9a03d] file:text-[#0f141e] file:font-medium file:cursor-pointer hover:file:bg-[#d4b15a]"
              />
              {candidatePhoto && (
                <div className="mt-3">
                  <img src={candidatePhoto} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-[#2a3348]" />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveCandidate}
                disabled={createCandidate.isPending || updateCandidate.isPending}
                className="px-6 py-2.5 rounded-lg bg-[#c9a03d] hover:bg-[#d4b15a] text-[#0f141e] font-semibold transition-colors disabled:opacity-50"
              >
                🔒 {editingId ? "Actualizar" : "Guardar"} Candidato
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setCandidateName("");
                    setCandidatePhoto("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#232b3e] text-gray-300 hover:bg-[#2a3348] transition-colors border border-[#2a3348]"
                >
                  📋 Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#1a2030] rounded-xl p-6 border border-[#2a3348]">
          <h3 className="text-lg font-bold text-white mb-4">📋 Lista de Candidatos</h3>
          <div className="space-y-3">
            {stats?.candidates?.map((c) => (
              <div key={c.id} className="flex items-center gap-4 bg-[#232b3e] rounded-lg p-3 border border-[#2a3348]">
                <img src={c.photo} alt={c.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{c.name}</p>
                  <p className="text-gray-400 text-sm">{c.totalVotes} votos</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(c)}
                    className="px-4 py-1.5 rounded-lg bg-green-700/30 text-green-300 hover:bg-green-700/50 transition-colors text-sm border border-green-700/50"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-4 py-1.5 rounded-lg bg-red-700/30 text-red-300 hover:bg-red-700/50 transition-colors text-sm border border-red-700/50"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
            {(!stats?.candidates || stats.candidates.length === 0) && (
              <p className="text-gray-500 text-center py-4">No hay candidatos registrados</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
