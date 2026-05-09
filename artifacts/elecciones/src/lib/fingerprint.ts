export async function getFingerprint(): Promise<string> {
  const stored = localStorage.getItem("voter_fingerprint");
  if (stored) return stored;

  const components: string[] = [];
  components.push(navigator.userAgent);
  components.push(navigator.language);
  components.push(screen.width + "x" + screen.height);
  components.push(screen.colorDepth.toString());
  components.push(new Date().getTimezoneOffset().toString());
  components.push(navigator.hardwareConcurrency?.toString() || "unknown");

  const raw = components.join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fp = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  localStorage.setItem("voter_fingerprint", fp);
  return fp;
}
