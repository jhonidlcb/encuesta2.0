import { useEffect, useState } from "react";
import {
  useGetAdminStats,
  useCloseSurvey,
  useOpenSurvey,
  setAuthTokenGetter,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#c9a03d", "#4a9eff", "#a855f7", "#22c55e", "#f97316", "#ef4444", "#06b6d4", "#f59e0b"];

export default function StatsPage() {
  const [, navigate] = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { navigate("/admin"); return; }
    setAuthTokenGetter(() => token);
    setReady(true);
    return () => { setAuthTokenGetter(null); };
  }, []);

  if (!ready) return null;
  return <StatsContent onBack={() => navigate("/admin")} />;
}

function StatsContent({ onBack }: { onBack: () => void }) {
  const { data: stats, isLoading, error, refetch } = useGetAdminStats();
  const closeSurvey = useCloseSurvey();
  const openSurvey = useOpenSurvey();
  const [, navigate] = useLocation();

  const [showVoterLists, setShowVoterLists] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [surveyActionMsg, setSurveyActionMsg] = useState("");
  const [showVoterNamesInPublic, setShowVoterNamesInPublic] = useState(false);

  useEffect(() => { if (error) navigate("/admin"); }, [error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f141e" }}>
        <div className="w-12 h-12 border-4 border-[#c9a03d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const candidates = stats?.candidates ?? [];
  const totalVotes = stats?.totalVotes ?? 0;
  const surveyClosed = stats?.surveyClosed ?? false;
  const sorted = [...candidates].sort((a, b) => b.totalVotes - a.totalVotes);

  const handleCloseSurvey = async () => {
    try {
      await closeSurvey.mutateAsync({ data: { showVoterNames: showVoterNamesInPublic } });
      setSurveyActionMsg("✅ Encuesta finalizada. Los resultados ya son públicos en /resultados");
      setShowPreview(false);
      refetch();
    } catch {
      setSurveyActionMsg("❌ Error al finalizar la encuesta");
    }
  };

  const handleOpenSurvey = async () => {
    if (!confirm("¿Reactivar la encuesta? Los resultados públicos dejarán de estar disponibles.")) return;
    try {
      await openSurvey.mutateAsync();
      setSurveyActionMsg("✅ Encuesta reactivada. Ya se pueden recibir nuevos votos.");
      refetch();
    } catch {
      setSurveyActionMsg("❌ Error al reactivar la encuesta");
    }
  };

  const pieData = candidates.map((c) => ({
    name: c.name, value: c.totalVotes, percentage: c.percentage, photo: c.photo,
  }));

  const barData = candidates.map((c) => ({
    name: c.name.length > 12 ? c.name.slice(0, 11) + "…" : c.name,
    fullName: c.name, Anonimos: c.anonymousVotes, "Con nombre": c.namedVotes,
    total: c.totalVotes, photo: c.photo,
  }));

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-[#1a2030] border border-[#2a3348] rounded-xl px-4 py-3 shadow-xl flex items-center gap-3">
        <img src={d.photo} alt={d.name} className="w-10 h-10 rounded-lg object-cover" />
        <div>
          <p className="text-white font-semibold text-sm">{d.name}</p>
          <p className="text-[#c9a03d] text-sm">{d.value} votos — {d.percentage}%</p>
        </div>
      </div>
    );
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const entry = barData.find((b) => b.name === label);
    return (
      <div className="bg-[#1a2030] border border-[#2a3348] rounded-xl px-4 py-3 shadow-xl flex items-center gap-3">
        {entry?.photo && <img src={entry.photo} alt={entry.fullName} className="w-10 h-10 rounded-lg object-cover" />}
        <div>
          <p className="text-white font-semibold text-sm mb-1">{entry?.fullName || label}</p>
          {payload.map((p: any) => <p key={p.name} className="text-xs" style={{ color: p.fill }}>{p.name}: {p.value}</p>)}
          <p className="text-gray-400 text-xs mt-1">Total: {entry?.total}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f141e" }}>
      <header className="bg-[#1a2030] border-b border-[#2a3348] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg bg-[#232b3e] hover:bg-[#2a3348] text-gray-300 transition-colors border border-[#2a3348] text-sm">
              ← Volver
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">📊 Estadísticas Electorales</h1>
              <p className="text-gray-400 text-xs mt-0.5">Elecciones Municipales 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-black text-[#c9a03d]">{totalVotes}</p>
              <p className="text-gray-400 text-xs">votos totales</p>
            </div>
            {surveyClosed ? (
              <div className="flex flex-col items-end gap-1">
                <span className="px-3 py-1 rounded-full bg-green-900/40 border border-green-700/50 text-green-300 text-xs font-semibold">
                  ✅ Encuesta finalizada
                </span>
                <button onClick={handleOpenSurvey} disabled={openSurvey.isPending}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline">
                  Reactivar encuesta
                </button>
              </div>
            ) : (
              <button onClick={() => setShowPreview(true)}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors text-sm shadow-lg">
                🔒 Finalizar encuesta
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {surveyActionMsg && (
          <div className={`p-3 rounded-lg text-center text-sm font-medium flex items-center justify-between ${
            surveyActionMsg.startsWith("✅")
              ? "bg-green-900/30 border border-green-700 text-green-300"
              : "bg-red-900/30 border border-red-700 text-red-300"
          }`}>
            <span>{surveyActionMsg}</span>
            <button onClick={() => setSurveyActionMsg("")} className="text-xs opacity-70 hover:opacity-100 ml-3">✕</button>
          </div>
        )}

        {surveyClosed && (
          <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-green-300 font-semibold">🌐 Resultados públicos activos</p>
              <p className="text-green-400/70 text-sm mt-0.5">La página pública está accesible en <span className="font-mono text-green-300">/resultados</span></p>
            </div>
            <button onClick={() => window.open("/resultados", "_blank")}
              className="px-4 py-2 rounded-lg bg-green-700/40 hover:bg-green-700/60 text-green-200 text-sm font-medium transition-colors border border-green-700/50 flex-shrink-0 ml-4">
              Ver página pública →
            </button>
          </div>
        )}

        {/* Candidate summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((c, i) => {
            const colorIdx = candidates.findIndex(x => x.id === c.id);
            return (
              <div key={c.id} className="bg-[#1a2030] rounded-xl border border-[#2a3348] overflow-hidden"
                style={{ borderLeftColor: COLORS[colorIdx % COLORS.length], borderLeftWidth: 4 }}>
                <div className="p-4 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img src={c.photo} alt={c.name} className="w-16 h-16 rounded-xl object-cover border-2"
                      style={{ borderColor: COLORS[colorIdx % COLORS.length] }} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-[#0f141e]"
                      style={{ backgroundColor: i === 0 ? "#c9a03d" : i === 1 ? "#9ca3af" : i === 2 ? "#a16207" : "#374151" }}>
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{c.name}</p>
                    <p className="text-3xl font-black" style={{ color: COLORS[colorIdx % COLORS.length] }}>{c.totalVotes}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 bg-[#232b3e] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${c.percentage}%`, backgroundColor: COLORS[colorIdx % COLORS.length] }} />
                      </div>
                      <span className="text-xs text-gray-400 ml-1 flex-shrink-0">{c.percentage}%</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>🔒 {c.anonymousVotes} anón.</span>
                      <span>👤 {c.namedVotes} nombr.</span>
                    </div>
                  </div>
                </div>

                {showVoterLists && (
                  <div className="border-t border-[#2a3348] bg-[#141c2b] px-4 py-3">
                    {c.allNamedVoters && c.allNamedVoters.length > 0 ? (
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        <p className="text-xs text-gray-500 font-semibold mb-2">👤 Votantes identificados:</p>
                        {c.allNamedVoters.map((v) => (
                          <div key={v.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-300">{v.voterName}</span>
                            <span className="text-gray-600">{new Date(v.createdAt).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        ))}
                        {c.anonymousVotes > 0 && (
                          <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-[#2a3348]">+ {c.anonymousVotes} votos anónimos</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">
                        {c.anonymousVotes > 0 ? `${c.anonymousVotes} votos anónimos, ninguno identificado` : "Sin votos registrados"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button onClick={() => setShowVoterLists(!showVoterLists)}
            className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              showVoterLists
                ? "bg-[#c9a03d]/20 border-[#c9a03d]/50 text-[#c9a03d]"
                : "bg-[#1a2030] border-[#2a3348] text-gray-400 hover:text-gray-200"
            }`}>
            {showVoterLists ? "👁️ Ocultar lista de votantes" : "👁️ Ver lista de votantes por candidato"}
          </button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1a2030] rounded-xl p-6 border border-[#2a3348]">
            <h3 className="text-lg font-bold text-white mb-1">🥧 Distribución de Votos</h3>
            <p className="text-gray-500 text-xs mb-4">Porcentaje por candidato</p>
            {totalVotes === 0 ? (
              <p className="text-gray-500 text-center py-16">Sin votos registrados</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={105} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {candidates.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <img src={c.photo} alt={c.name} className="w-7 h-7 rounded-md object-cover flex-shrink-0" />
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-300 text-sm truncate">{c.name}</span>
                      </div>
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: COLORS[i % COLORS.length] }}>{c.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="bg-[#1a2030] rounded-xl p-6 border border-[#2a3348]">
            <h3 className="text-lg font-bold text-white mb-1">📊 Votos por Candidato</h3>
            <p className="text-gray-500 text-xs mb-4">Anónimos vs identificados</p>
            {totalVotes === 0 ? (
              <p className="text-gray-500 text-center py-16">Sin votos registrados</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3348" />
                    <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#ffffff08" }} />
                    <Legend formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 12 }}>{v}</span>} />
                    <Bar dataKey="Anonimos" stackId="a" fill="#c9a03d" />
                    <Bar dataKey="Con nombre" stackId="a" fill="#4a9eff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                  <div className="bg-[#232b3e] rounded-lg p-2">
                    <p className="text-[#c9a03d] font-bold text-lg">{candidates.reduce((s, c) => s + c.anonymousVotes, 0)}</p>
                    <p className="text-gray-400">Anónimos</p>
                  </div>
                  <div className="bg-[#232b3e] rounded-lg p-2">
                    <p className="text-[#4a9eff] font-bold text-lg">{candidates.reduce((s, c) => s + c.namedVotes, 0)}</p>
                    <p className="text-gray-400">Con nombre</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Full ranking */}
        <div className="bg-[#1a2030] rounded-xl p-6 border border-[#2a3348]">
          <h3 className="text-lg font-bold text-white mb-5">🏆 Ranking Completo</h3>
          <div className="space-y-4">
            {sorted.map((c, i) => {
              const colorIdx = candidates.findIndex(x => x.id === c.id);
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
              return (
                <div key={c.id} className="flex items-center gap-4">
                  <span className="text-2xl w-8 text-center flex-shrink-0">
                    {medal || <span className="text-gray-500 font-bold text-lg">{i + 1}</span>}
                  </span>
                  <img src={c.photo} alt={c.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border-2"
                    style={{ borderColor: COLORS[colorIdx % COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-white font-semibold truncate pr-2">{c.name}</span>
                      <span className="text-gray-400 text-sm flex-shrink-0">{c.totalVotes} votos</span>
                    </div>
                    <div className="w-full bg-[#232b3e] rounded-full h-3 overflow-hidden">
                      <div className="h-3 rounded-full"
                        style={{ width: totalVotes > 0 ? `${c.percentage}%` : "0%", backgroundColor: COLORS[colorIdx % COLORS.length] }} />
                    </div>
                  </div>
                  <span className="text-lg font-black flex-shrink-0 w-14 text-right" style={{ color: COLORS[colorIdx % COLORS.length] }}>
                    {c.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      <footer className="py-6 text-center border-t border-[#1a2030]">
        <p className="text-gray-600 text-xs">
          Desarrollado por{" "}
          <a href="https://softwarepar.lat/" target="_blank" rel="noopener noreferrer" className="text-[#c9a03d] hover:text-[#d4b15a] transition-colors">SoftwarePar</a>
        </p>
      </footer>

      {/* Finalize modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
          <div className="bg-[#1a2030] rounded-2xl border border-[#2a3348] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a3348] flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">Vista previa — Página pública</h2>
                <p className="text-gray-400 text-sm mt-0.5">Así verá la gente <span className="font-mono text-[#c9a03d]">/resultados</span></p>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg bg-[#232b3e] hover:bg-[#2a3348] text-gray-400 transition-colors">✕</button>
            </div>

            {/* Voter names toggle — key setting */}
            <div className="px-6 py-4 border-b border-[#2a3348] flex-shrink-0 bg-[#141c2b]">
              <p className="text-sm font-semibold text-white mb-3">⚙️ Configuración de la página pública</p>
              <button
                onClick={() => setShowVoterNamesInPublic(!showVoterNamesInPublic)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  showVoterNamesInPublic
                    ? "bg-[#c9a03d]/10 border-[#c9a03d]/50"
                    : "bg-[#232b3e] border-[#2a3348]"
                }`}
              >
                <div className="text-left">
                  <p className={`font-semibold text-sm ${showVoterNamesInPublic ? "text-[#c9a03d]" : "text-gray-300"}`}>
                    👤 Mostrar nombres de votantes
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {showVoterNamesInPublic
                      ? "Los visitantes podrán ver quién votó a cada candidato"
                      : "Solo se verán totales, sin nombres individuales"}
                  </p>
                </div>
                <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${showVoterNamesInPublic ? "bg-[#c9a03d]" : "bg-[#374151]"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${showVoterNamesInPublic ? "translate-x-7" : "translate-x-1"}`} />
                </div>
              </button>
            </div>

            {/* Preview content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              <div className="bg-[#0f141e] rounded-xl p-5 border border-[#2a3348] text-center">
                <div className="text-3xl mb-2">🗳️</div>
                <h3 className="text-2xl font-black text-white">Resultados Oficiales</h3>
                <p className="text-[#c9a03d] font-semibold mt-1">Elecciones Municipales 2026</p>
                <div className="flex items-center justify-center gap-6 mt-3">
                  <div>
                    <p className="text-3xl font-black text-[#c9a03d]">{totalVotes}</p>
                    <p className="text-gray-400 text-xs">votos totales</p>
                  </div>
                  <div className="w-px h-8 bg-[#2a3348]" />
                  <div>
                    <p className="text-xl font-bold text-white">{candidates.length}</p>
                    <p className="text-gray-400 text-xs">candidatos</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {sorted.map((c, i) => {
                  const colorIdx = candidates.findIndex(x => x.id === c.id);
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}°`;
                  const namedVoters = c.allNamedVoters ?? [];
                  return (
                    <div key={c.id} className="bg-[#0f141e] rounded-xl border border-[#2a3348] overflow-hidden">
                      <div className={`p-4 flex items-center gap-3 ${i === 0 ? "border border-[#c9a03d] rounded-xl" : ""}`}>
                        <span className="text-2xl flex-shrink-0">{medal}</span>
                        <img src={c.photo} alt={c.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border-2"
                          style={{ borderColor: COLORS[colorIdx % COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold truncate">{c.name}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black" style={{ color: COLORS[colorIdx % COLORS.length] }}>{c.totalVotes}</span>
                            <span className="text-gray-400 text-sm">votos</span>
                          </div>
                          <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                            <span>🔒 {c.anonymousVotes} anón.</span>
                            <span>👤 {c.namedVotes} nombr.</span>
                          </div>
                          <div className="w-full bg-[#1a2030] rounded-full h-2 mt-1.5 overflow-hidden">
                            <div className="h-2 rounded-full" style={{ width: `${c.percentage}%`, backgroundColor: COLORS[colorIdx % COLORS.length] }} />
                          </div>
                        </div>
                        <span className="text-xl font-black flex-shrink-0" style={{ color: COLORS[colorIdx % COLORS.length] }}>{c.percentage}%</span>
                      </div>

                      {showVoterNamesInPublic && namedVoters.length > 0 && (
                        <div className="border-t border-[#1a2030] bg-[#0a0f1a] px-4 py-3">
                          <p className="text-xs text-gray-500 font-semibold mb-1.5">👤 Votantes identificados:</p>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {namedVoters.slice(0, 5).map((v) => (
                              <div key={v.id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-300">{v.voterName}</span>
                                <span className="text-gray-600">{new Date(v.createdAt).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            ))}
                            {namedVoters.length > 5 && <p className="text-xs text-gray-600">y {namedVoters.length - 5} más…</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {showVoterNamesInPublic && (
                <div className="bg-[#0f141e] rounded-xl p-3 border border-[#c9a03d]/20 flex items-center gap-2 text-xs text-[#c9a03d]/80">
                  <span>👁️</span>
                  <span>El botón "Mostrar/Ocultar nombre de votantes" también aparecerá en la página pública</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#2a3348] flex-shrink-0 space-y-3">
              <p className="text-yellow-400/80 text-sm text-center">
                ⚠️ Al confirmar, la encuesta se cerrará y esta página quedará pública. No se podrán recibir más votos.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowPreview(false)}
                  className="flex-1 py-3 rounded-xl bg-[#232b3e] text-gray-300 hover:bg-[#2a3348] transition-colors border border-[#2a3348] font-medium">
                  Cancelar
                </button>
                <button onClick={handleCloseSurvey} disabled={closeSurvey.isPending}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50">
                  {closeSurvey.isPending ? "Publicando..." : "🔒 Confirmar y publicar resultados"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
