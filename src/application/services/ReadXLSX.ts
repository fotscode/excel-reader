import XLSX from 'xlsx';

function ReadXLSXFile(filename: string) {
    console.debug("Reading file:", filename);
    let workbook = XLSX.readFile(filename);
    let sheetName = workbook.SheetNames[0];
    let sheet = workbook.Sheets[sheetName];
    let data = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1) as any[];
    console.debug("Finished reading file:", filename);
    return data;
}

export { ReadXLSXFile };