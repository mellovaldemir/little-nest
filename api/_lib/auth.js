// Admin auth: password from env ADMIN_PASSWORD, session = HMAC-signed token in an HttpOnly cookie.
const crypto = require("crypto");
const COOKIE = "arrow_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  // ADMIN_SECRET is optional; changing ADMIN_PASSWORD automatically logs out every session.
  return crypto.createHash("sha256").update((process.env.ADMIN_SECRET || "arrow") + ":" + pw).digest();
}
const b64 = (s) => Buffer.from(s).toString("base64url");
function sign(payload) {
  const k = secret();
  const body = b64(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", k).update(body).digest("base64url");
  return body + "." + sig;
}
function verify(token) {
  const k = secret();
  if (!k || !token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const good = crypto.createHmac("sha256", k).update(body).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(good);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const p = JSON.parse(Buffer.from(body, "base64url").toString());
  return p.exp > Date.now() ? p : null;
}
function cookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((c) => {
    const i = c.indexOf("=");
    if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}
function isAdmin(req) {
  return Boolean(verify(cookies(req)[COOKIE]));
}
function requireAdmin(req, res) {
  if (isAdmin(req)) return true;
  res.status(401).json({ error: "Not logged in" });
  return false;
}
function checkPassword(pw) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || typeof pw !== "string") return false;
  const a = crypto.createHash("sha256").update(pw).digest();
  const b = crypto.createHash("sha256").update(real).digest();
  return crypto.timingSafeEqual(a, b);
}
function setSession(req, res) {
  const token = sign({ role: "admin", exp: Date.now() + MAX_AGE * 1000 });
  const secure = (req.headers["x-forwarded-proto"] || "").includes("https") ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE}${secure}`);
}
function clearSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
}
module.exports = { isAdmin, requireAdmin, checkPassword, setSession, clearSession, configured: () => Boolean(process.env.ADMIN_PASSWORD) };
