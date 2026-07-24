import app from "./app.js";
import connectDB from "./config/db.js";
import "dotenv/config";

// Connects to MongoDB, then starts listening. Kept separate from app.js
// so tests can import the Express app without triggering either of these.
connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is started at ${PORT}`);
});
