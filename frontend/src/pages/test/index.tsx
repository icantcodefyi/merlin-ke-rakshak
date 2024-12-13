import axios from 'axios';
import { createFileRoute } from "@tanstack/react-router";

function Client() {
  async function handleNotifications() {
    const response = await axios.post('http://localhost:3000/api/notificationHandler', {
      config: {
        email: "shahbaz@foyer.work",
        shareableUrl: "https://www.google.com"
      }
    },
      {
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    console.log(response.data);
  }
  return (
    <div>
      <button className='bg-blue-500' onClick={handleNotifications}>Send Notifications</button>
    </div>
  )
}

export const Route = createFileRoute("/test/")({
  component: Client,
});
