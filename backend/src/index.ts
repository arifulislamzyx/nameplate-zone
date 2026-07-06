// Local / traditional server entry (Vercel uses api/index.ts instead)
import app from "./app";

const PORT = Number(process.env.PORT ?? 5000);
app.listen(PORT, () => {
  console.log(`✅ Nameplate Zone API running at http://localhost:${PORT}`);
});
