import crypto from "crypto";
import jwt from "jsonwebtoken";

export default async (req, res) => {
  const { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI, SESSION_SECRET } = process.env;

  const stateRaw = crypto.randomBytes(16).toString("hex");
  const state = jwt.sign({ s: stateRaw, t: Date.now() }, SESSION_SECRET, {
    expiresIn: "10m",
  });

  // Cookie state pour CSRF
  res.setHeader("Set-Cookie", [
    `oauth_state=${state}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600`,
  ]);

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: "code",
    scope: "identify email",
    state,
  });

  res.writeHead(302, {
    Location: `https://discord.com/api/oauth2/authorize?${params.toString()}`,
  });
  res.end();
};
