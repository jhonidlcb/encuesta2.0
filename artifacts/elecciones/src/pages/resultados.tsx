import { useState } from "react";
import { useGetPublicResults, type PublicResults } from "@workspace/api-client-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#c9a03d", "#4a9eff", "#a855f7", "#22c55e", "#f97316", "#ef4444", "#06b6d4", "#f59e0b"];

export default function ResultadosPage() {
  const { data, isLoading, error } = useGetPublicResults();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f141e" }}>
        <div className="w-12 h-12 border-4 border-[#c9a03d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0f141e" }}>
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🗳️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Resultados no disponibles</h1>
          <p className="text-gray-400">La encuesta aún no ha sido finalizada. Los resultados serán publicados cuando el administrador cierre la votación.</p>
        </div>
      </div>
    );
  }

  return <ResultadosContent data={data} />;
}

function ResultadosContent({ data }: { data: PublicResults }) {
  const [showVoterLists, setShowVoterLists] = useState(data.showVoterNames);

  const candidates = data.candidates ?? [];
  const totalVotes = data.totalVotes ?? 0;
  const closedAt = data.closedAt ? new Date(data.closedAt).toLocaleString("es-AR") : "";
  const sorted = [...candidates].sort((a, b) => b.totalVotes - a.totalVotes);

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
      <header className="bg-[#1a2030] border-b border-[#2a3348] px-4 py-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-4xl mb-2">🗳️</div>
          <h1 className="text-3xl font-black text-white">Resultados Oficiales</h1>
          <p className="text-[#c9a03d] font-semibold mt-1">Elecciones Municipales 2026</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-4xl font-black text-[#c9a03d]">{totalVotes}</p>
              <p className="text-gray-400 text-sm">votos totales</p>
            </div>
            <div className="w-px h-10 bg-[#2a3348]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{candidates.length}</p>
              <p className="text-gray-400 text-sm">candidatos</p>
            </div>
          </div>
          {closedAt && <p className="text-gray-500 text-xs mt-3">Encuesta cerrada el {closedAt}</p>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Candidate cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((c, i) => {
            const colorIdx = candidates.findIndex(x => x.id === c.id);
            return (
              <div key={c.id} className="bg-[#1a2030] rounded-xl border border-[#2a3348] overflow-hidden"
                style={{ borderLeftColor: COLORS[colorIdx % COLORS.length], borderLeftWidth: 4 }}>
                <div className="p-4 flex items-center gap-3">
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

                {showVoterLists && data.showVoterNames && c.allNamedVoters && c.allNamedVoters.length > 0 && (
                  <div className="border-t border-[#2a3348] bg-[#141c2b] px-4 py-3">
                    <p className="text-xs text-gray-500 font-semibold mb-2">👤 Votantes identificados:</p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
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
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Toggle voter names — only shown if admin enabled it */}
        {data.showVoterNames && (
          <div className="flex justify-center">
            <button onClick={() => setShowVoterLists(!showVoterLists)}
              className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                showVoterLists
                  ? "bg-[#c9a03d]/20 border-[#c9a03d]/50 text-[#c9a03d]"
                  : "bg-[#1a2030] border-[#2a3348] text-gray-400 hover:text-gray-200"
              }`}>
              {showVoterLists ? "👁️ Ocultar nombre de votantes" : "👁️ Mostrar nombre de votantes"}
            </button>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a2030] rounded-xl p-6 border border-[#2a3348]">
            <h3 className="text-lg font-bold text-white mb-1">🥧 Distribución</h3>
            <p className="text-gray-500 text-xs mb-4">Porcentaje por candidato</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {candidates.map((c, i) => (
                <div key={c.id} className="flex items-center gap-2">
                  <img src={c.photo} alt={c.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-300 text-sm truncate flex-1">{c.name}</span>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: COLORS[i % COLORS.length] }}>{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a2030] rounded-xl p-6 border border-[#2a3348]">
            <h3 className="text-lg font-bold text-white mb-1">📊 Comparativo</h3>
            <p className="text-gray-500 text-xs mb-4">Anónimos vs identificados</p>
            <ResponsiveContainer width="100%" height={240}>
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
                <p className="text-gray-400">Identificados</p>
              </div>
            </div>
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
                      <div className="h-3 rounded-full" style={{ width: totalVotes > 0 ? `${c.percentage}%` : "0%", backgroundColor: COLORS[colorIdx % COLORS.length] }} />
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

      <footer className="py-8 text-center border-t border-[#1a2030] space-y-1">
        <p className="text-gray-500 text-sm">🗳️ Voto electrónico simbólico — Resultado de carácter informativo</p>
        <p className="text-gray-600 text-xs">
          Desarrollado por{" "}
          <a href="https://softwarepar.lat/" target="_blank" rel="noopener noreferrer" className="text-[#c9a03d] hover:text-[#d4b15a] transition-colors">SoftwarePar</a>
        </p>
      </footer>
    </div>
  );
}
