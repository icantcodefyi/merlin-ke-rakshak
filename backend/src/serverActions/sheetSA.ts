"use server";

import { serializeResponse } from "@/utils/utils";
import axios from "axios";
import Papa from 'papaparse'; // CSV parser library

function extractSheetId(url: string) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
}

const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const text = e.target.result;
            const emailsArray = parseCSV(text);
            console.log(emailsArray);
        };
        reader.readAsText(file);
    }
};

const parseCSV = (text: any) => {
    const lines = text.split("\n");
    const emailsArray: any[] = [];

    lines.forEach((line: any) => {
        const columns = line.split(/[,;\t\s]+/);
        columns.forEach((col: any) => {
            const email = col.trim();
            if (email.includes("@") && email.includes(".")) {
                emailsArray.push(email);
            }
        });
    });

    return [...new Set(emailsArray.filter((email) => email))];
};

const fetchSheetData = async (sheetId: string, accessToken: string) => {
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    const data = await response.json();
    return data.values; // Array of rows
};

export async function getSheetRawData(sheetLink: string) {
    try {
        const sheetId = extractSheetId(sheetLink);
        const dowloadUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

        const response = await axios.get(dowloadUrl)
            .then(response => {
                if (response.status === 200) {
                    const csvContent = response.data;

                    const parsedData = Papa.parse(csvContent, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            return results.data
                        },
                        error: (err) => {
                            console.log(err);
                        },
                    });
                    return parsedData.data;
                } else {
                    console.log(`Failed to fetch the spreadsheet. Status code: ${response.status}`);
                }
            })
            .catch(error => {
                console.error(`Error fetching the spreadsheet: ${error.message}`);
            });
        return serializeResponse(response);
    } catch (error: any) {
        console.log("[CODE_ERROR]", error);
        return null;
    }
}