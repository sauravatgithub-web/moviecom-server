export const corsOptions = {
    origin: [ "http://localhost:5173", "http://localhost:4173", process.env.CLIENT_URL, "https://moviecom-client.vercel.app/" ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}