// "use server"

// async function fetchSheetData(sheetUrl: string) {
//     // Extract the Sheet ID
//     const sheetId = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
//     if (!sheetId) {
//       throw new Error("Invalid Google Sheets URL");
//     }
  
//     // Construct the CSV export URL
//     const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  
//     // Fetch the CSV data
//     const response = await fetch(csvUrl);
//     if (!response.ok) {
//       throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
//     }
//     const csvData = await response.text();
  
//     // Parse CSV data
//     return parseCsv(csvData);
//   }
  
//   // Simple CSV Parser
//   function parseCsv(csv: string) {
//     return csv.split("\n").map(row => row.split(","));
//   }
  
//   // Example Usage
//   (async () => {
//     const url = "https://docs.google.com/spreadsheets/d/1zED0-HEq5BaHTRlII2q4XUNAMU0V45cCOEy7gRtMMY8/edit?gid=0";
//     try {
//       const data = await fetchSheetData(url);
//       console.log(data); // Array of arrays
//     } catch (error) {
//       console.error(error.message);
//     }
//   })();
  