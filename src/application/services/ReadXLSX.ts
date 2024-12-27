import { ECODES } from '@interface/mappers/error';
import XLSX from 'xlsx';

/**
 * Reads data from an Excel (.xlsx) file and returns its content as a 2D array.
 * 
 * This function reads the first sheet of an Excel file and converts its content into a 2D array, 
 * excluding the header row. It uses the `xlsx` library to handle the file reading and parsing.
 * 
 * @throws {Error} Throws an error if the file cannot be read or parsed.
 * 
 * @example
 * const data = ReadXLSXFile("data.xlsx");
 * console.log(data);
 * // Example output:
 * // [
 * //   ["John", 25, "Developer"],
 * //   ["Jane", 30, "Designer"]
 * // ]
 */
function ReadXLSXFile(filename: string): { data: any[][], err?: ECODES } {
    try {
        console.debug("Reading file:", filename);
        let workbook = XLSX.readFile(filename);
        let sheetName = workbook.SheetNames[0];
        let sheet = workbook.Sheets[sheetName];
        let data = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1) as any[][];
        console.debug("Finished reading file:", filename);
        return { data };
    } catch (error) {
        console.error("Error reading file:", filename, error);
        return { data: [], err: ECODES.FILE_READ_ERROR };
    }
}

export { ReadXLSXFile };