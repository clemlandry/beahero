import jwt from "jsonwebtoken";

function readCookie(req, name) {
  const cookie = req.headers.cookie || "";
  const parts = cookie.split(";").map((v) => v.trim());
  const found = parts.find((p) => p.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
}

export default async (req, res) => {
  const { SESSION_SECRET } = process.env;
  const token = readCookie(req, "session");

  if (!token) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Non connecté" }));
    return;
  }

  try {
    const payload = jwt.verify(token, SESSION_SECRET);
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        avatar: payload.avatar,
      })
    );
  } catch {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Session invalide" }));
  }
};
