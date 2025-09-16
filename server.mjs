// server.mjs
import app from "./index.mjs";

  

//updating for port binding

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
