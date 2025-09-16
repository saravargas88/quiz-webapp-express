// server.mjs
import app from "./index.mjs";

const port = 3000;
app.listen(port, () => {
  console.log(`✅ Local server running at http://localhost:${port}`);
});