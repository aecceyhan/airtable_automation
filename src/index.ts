import express, { Request, Response } from "express";
import AirtableService from "./services/AirtableService";

const app = express();
const port = 3000;

interface ShiftRecord {
  id: string; // Airtable record ID
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

const usd_try_rate = 39.34;

// Initialize AirtableService
AirtableService.initialize("patwrJut6eWMPuXKs.a296c9ea2548a802204430312ee944f4523f798d5bad5402e8b688cb87fea7d9", "appN05Jbm5tJPSi24");

app.get("/", async (req: Request, res: Response) => {
  try {
    const shift = (await AirtableService.fetchRecords("shift")) as ShiftRecord[];
    const tariff = (await AirtableService.fetchRecords("Tariff")) as TariffRecord[];

    const results = shift.map((shiftRecord: ShiftRecord) => {
      const clientId = shiftRecord.Client?.[0];
      const date = new Date(shiftRecord.Date);

      if (!clientId || !date) return { ...shiftRecord, ebtIncome: 0 };

      const matchedTariff = tariff.find((t: TariffRecord) => {
        const start = new Date(t.Start);
        const stop = new Date(t.Stop);
        return (
          t.Clients?.includes(clientId) &&
          date >= start &&
          date <= stop
        );
      });

      const ebtIncome = matchedTariff ? matchedTariff.Price * shiftRecord["Hobbs Total"] : 0;

      if (shiftRecord.id) {
        let currencyAsUSD = ebtIncome;
        let eat = ebtIncome;
        if (shiftRecord["Currency (from Client)"] == "recxwhA8UzCpaSyHV") { // todo make this dynamic
          currencyAsUSD = ebtIncome / usd_try_rate; 
        }
        if (shiftRecord["VAT (from Client)"][0] == true) {
          console.log("VAT is true");
          eat = currencyAsUSD * 1.2
        }
        console.log("Updating record:", shiftRecord.id, "with EBT Income:", ebtIncome, "Currency as USD:", currencyAsUSD, "EAT in USD:", eat);
        AirtableService.updateRecord("shift", shiftRecord.id, {
          "EBT Income": ebtIncome,
          "Currency as USD": currencyAsUSD,
          "EAT in USD": eat
        });
      }

      return { ...shiftRecord, ebtIncome };
    });


    res.json({ message: "Hello World", results });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
