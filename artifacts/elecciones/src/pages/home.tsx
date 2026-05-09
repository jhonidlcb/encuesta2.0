import { useState, useEffect } from "react";
import { useListCandidates, useCastVote, useCheckVoteStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getFingerprint } from "@/lib/fingerprint";

export default function HomePage() {
  const { data: candidates, isLoading } = useListCandidates();
  const castVote = useCastVote();
  const checkVote = useCheckVoteStatus();
  const queryClient = useQueryClient();

  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState<number | null>(null);
  const [fingerprint, setFingerprint] = useState<string>("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [voterName, setVoterName] = useState("");
  const [voteMessage, setVoteMessage] = useState("");
  const [checking, setChecking] = useState(true);
  const [annulling, setAnnulling] = useState(false);

  useEffect(() => {
    async function init() {
      const fp = await getFingerprint();
      setFingerprint(fp);
      try {
        const result = await checkVote.mutateAsync({ data: { fingerprint: fp } });
        if (result.hasVoted) {
          setHasVoted(true);
          setVotedCandidateId(result.candidateId ?? null);
        }
      } catch {}
      setChecking(false);
    }
    init();
  }, []);

  const handleAnonymousVote = async (candidateId: number) => {
    if (!fingerprint) return;
    try {
      const result = await castVote.mutateAsync({
        data: { candidateId, fingerprint, voterName: undefined },
      });
      if (result.success) {
        setHasVoted(true);
        setVotedCandidateId(candidateId);
        setVoteMessage("Tu voto ha sido registrado exitosamente");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Error al registrar tu voto";
      setVoteMessage(msg);
    }
  };

  const handleNamedVote = (candidateId: number) => {
    setSelectedCandidateId(candidateId);
    setShowNameModal(true);
  };

  const handleAnnulVote = async () => {
    if (!fingerprint || annulling) return;
    setAnnulling(true);
    try {
      const res = await fetch("/api/votes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint }),
      });
      const data = await res.json();
      if (res.ok) {
        setHasVoted(false);
        setVotedCandidateId(null);
        setVoteMessage("Tu voto fue anulado. Ya podes votar por otro candidato.");
      } else {
        setVoteMessage(data.error || "Error al anular el voto");
      }
    } catch {
      setVoteMessage("Error al anular el voto");
    } finally {
      setAnnulling(false);
    }
  };

  const submitNamedVote = async () => {
    if (!fingerprint || !selectedCandidateId || !voterName.trim()) return;
    try {
      const result = await castVote.mutateAsync({
        data: { candidateId: selectedCandidateId, fingerprint, voterName: voterName.trim() },
      });
      if (result.success) {
        setHasVoted(true);
        setVotedCandidateId(selectedCandidateId);
        setVoteMessage("Tu voto ha sido registrado exitosamente");
        setShowNameModal(false);
        setVoterName("");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Error al registrar tu voto";
      setVoteMessage(msg);
    }
  };

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f141e" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c9a03d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f141e" }}>
      <header className="py-8 px-4 text-center border-b border-[#1a2030]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🗳️</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Elecciones Municipales 2026
            </h1>
          </div>
          <p className="text-gray-400 mt-2 text-lg">
            Conoce a los candidatos y emiti tu voto de manera informada
          </p>
        </div>
      </header>

      {voteMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className={`p-4 rounded-lg text-center font-medium ${
            voteMessage.includes("exitosamente")
              ? "bg-green-900/30 border border-green-700 text-green-300"
              : "bg-red-900/30 border border-red-700 text-red-300"
          }`}>
            {voteMessage}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {hasVoted && (
          <div className="mb-8 p-4 rounded-lg bg-[#1a2030] border border-[#c9a03d]/30 text-center">
            <p className="text-[#c9a03d] font-medium text-lg mb-3">Ya has emitido tu voto. Gracias por participar.</p>
            <button
              onClick={handleAnnulVote}
              disabled={annulling}
              className="px-5 py-2 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {annulling ? "Anulando..." : "✗ Anular mi voto y votar nuevamente"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates?.map((candidate) => (
            <div
              key={candidate.id}
              className={`rounded-xl overflow-hidden transition-all duration-300 ${
                votedCandidateId === candidate.id
                  ? "ring-2 ring-[#c9a03d] bg-[#1a2030]"
                  : "bg-[#1a2030] hover:bg-[#232b3e]"
              }`}
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
            >
              <div className="w-full aspect-[4/3] overflow-hidden bg-[#232b3e] flex items-center justify-center">
                <img
                  src={candidate.photo}
                  alt={candidate.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold text-white text-center mb-1">{candidate.name}</h3>
                <p className="text-gray-400 text-sm text-center mb-4">Candidato a Intendente</p>

                {!hasVoted && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAnonymousVote(candidate.id)}
                      disabled={castVote.isPending}
                      className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 bg-[#232b3e] hover:bg-[#2a3348] text-gray-300 border border-[#2a3348] hover:border-[#c9a03d]/50 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>🔒</span> Voto Anonimo
                    </button>
                    <button
                      onClick={() => handleNamedVote(candidate.id)}
                      disabled={castVote.isPending}
                      className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 bg-[#c9a03d] hover:bg-[#d4b15a] text-[#0f141e] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>👤</span> Votar con mi nombre
                    </button>
                  </div>
                )}

                {votedCandidateId === candidate.id && (
                  <div className="text-center py-2">
                    <span className="text-[#c9a03d] font-medium text-sm">Votaste por este candidato</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center border-t border-[#1a2030] space-y-2">
        <p className="text-gray-500 text-sm">
          🗳️ Voto electronico simbolico - Esta encuesta es de caracter informativo
        </p>
        <p className="text-gray-600 text-xs">
          Desarrollado por{" "}
          <a
            href="https://softwarepar.lat/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c9a03d] hover:text-[#d4b15a] transition-colors"
          >
            SoftwarePar
          </a>
        </p>
      </footer>

      {showNameModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a2030] rounded-xl p-6 w-full max-w-md border border-[#2a3348]">
            <h3 className="text-xl font-bold text-white mb-4">Votar con tu nombre</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Ingresa tu nombre para que tu voto quede registrado de forma publica.
            </p>
            <input
              type="text"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full px-4 py-3 rounded-lg bg-[#232b3e] border border-[#2a3348] text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a03d] transition-colors"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNameModal(false);
                  setVoterName("");
                }}
                className="flex-1 py-2.5 rounded-lg bg-[#232b3e] text-gray-300 hover:bg-[#2a3348] transition-colors border border-[#2a3348]"
              >
                Cancelar
              </button>
              <button
                onClick={submitNamedVote}
                disabled={!voterName.trim() || castVote.isPending}
                className="flex-1 py-2.5 rounded-lg bg-[#c9a03d] hover:bg-[#d4b15a] text-[#0f141e] font-semibold transition-colors disabled:opacity-50"
              >
                Confirmar voto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
