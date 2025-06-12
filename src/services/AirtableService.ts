import Airtable from 'airtable';

export default class AirtableService {
  private static base: Airtable.Base;

  public static initialize(apiKey: string, baseId: string): void {
    Airtable.configure({ apiKey });
    this.base = Airtable.base(baseId);
  }

  public static async listTables(): Promise<string[]> {
    try {
      const tables = await this.base('meta').select({}).all();
      return tables.map((table) => table.get('name') as string);
    } catch (error) {
      console.error('Error listing tables:', error);
      throw new Error(`Failed to list tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  static async updateRecord(table: string, recordId: string, fields: Record<string, any>) {
    const base = this.base;
    return base(table).update(recordId, fields); // FIXED LINE
  }


  public static async fetchRecords(tableName: string): Promise<Record<string, any>[]> {
    const records: Record<string, any>[] = [];
    await this.base(tableName)
      .select()
      .eachPage((pageRecords, fetchNextPage) => {
        records.push(...pageRecords.map((record) => ({
          id: record.id, // Include record ID for updates
          ...record.fields
        })));
        fetchNextPage();
      });
    return records;
  }
}
