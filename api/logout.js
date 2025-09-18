export default async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    "session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );
  res.writeHead(302, { Location: "/" });
  res.end();
};
