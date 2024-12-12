import { useState } from "react";
import axios from "axios";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { getSheetRawData } from "@/serverActions/sheetSA";

const SheetsList = () => {
  const [sheetLink, setSheetLink] = useState("");
async function fetchSheetData(){
    if(!sheetLink.length) return;
    const response = await getSheetRawData(sheetLink);
    console.log(response);
  }

  return (
    <div>
      <Input value={sheetLink} onChange={(e) => setSheetLink(String(e.target.value))} placeholder="Paste your sheet link here" className="w-full border" />
      <Button onClick={fetchSheetData}>Submit</Button>
    </div>
  );
};

export default SheetsList;
