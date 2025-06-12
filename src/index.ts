import express, { Request, Response } from "express";
import AirtableService from "./services/AirtableService";

const app = express();
const port = 3000;

interface ShiftRecord {
  Date: string;
  Client: string[];
  ["Hobbs Total"]: number;
  [key: string]: any;
}

interface TariffRecord {
  Start: string;
  Stop: string;
  Price: number;
  Clients: string[];
  [key: string]: any;
}

// Initialize AirtableService
AirtableService.initialize("patwrJut6eWMPuXKs.a296c9ea2548a802204430312ee944f4523f798d5bad5402e8b688cb87fea7d9", "appN05Jbm5tJPSi24");

app.get("/", async (req: Request, res: Response) => {
  try {
    const shift = await AirtableService.fetchRecords("shift");
    const tariff = await AirtableService.fetchRecords("Tariff");

    shift.forEach(element => {
      console.log("Element Keys:", Object.keys(element));

      console.log("Shift Record:", element.Date);
    });

    res.json({ message: "Hello World", shift, tariff });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

