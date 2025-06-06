import express, { Request, Response } from "express";
import AirtableService from "./services/AirtableService";

const app = express();
const port = 3000;

// Initialize AirtableService
AirtableService.initialize("patwrJut6eWMPuXKs.a296c9ea2548a802204430312ee944f4523f798d5bad5402e8b688cb87fea7d9", "appN05Jbm5tJPSi24");

app.get("/", async (req: Request, res: Response) => {
  try {
    const tables = await AirtableService.fetchRecords("Clients");
    res.json({ message: "Hello World", tables });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

