import jwt from "jsonwebtoken";

function readCookie(req, name) {
  const cookie = req.headers.cookie || "";
  const parts = cookie.split(";").map(v => v.trim());
  const found = parts.find(p => p.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
}

export default async (req, res) => {
  const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    SESSION_SECRET,
    BASE_URL
  } = process.env;

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI || !SESSION_SECRET || !BASE_URL) {
    res.statusCode = 500;
    res.end("Missing env vars");
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const stateCookie = readCookie(req, "oauth_state");
  if (!code || !state || !stateCookie || state !== stateCookie) {
    res.statusCode = 400;
    res.end("Invalid or missing state/code");
    return;
  }

  try {
    jwt.verify(state, SESSION_SECRET);
  } catch {
    res.statusCode = 400;
    res.end("State expired/invalid");
    return;
  }

  // Échange code → token (fetch global)
  const tokenResp = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI
    })
  });

  if (!tokenResp.ok) {
    const text = await tokenResp.text();
    res.statusCode = 400;
    res.end("Token error: " + text);
    return;
  }

  const tokenJson = await tokenResp.json();

  const meResp = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` }
  });
  const me = await meResp.json();

  const session = jwt.sign(
    { sub: me.id, username: me.username, email: me.email || null, avatar: me.avatar || null },
    SESSION_SECRET,
    { expiresIn: "7d" }
  );

  const isProd = process.env.VERCEL === "1";
  const cookie = [
    `session=${session}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
    isProd ? "Secure" : null
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", [
    "oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
    cookie
  ]);

  // Redirige où tu veux (ta page Personnages par ex.)
  res.writeHead(302, { Location: `${BASE_URL}/` });
  res.end();
};
