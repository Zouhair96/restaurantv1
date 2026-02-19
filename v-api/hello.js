export default async function handler(req, res) {
    return res.status(200).json({ message: "Hello from the backend! Functions are working on Vercel." });
}
