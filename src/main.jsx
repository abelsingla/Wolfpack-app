import React from "react";
import { createRoot } from "react-dom/client";
import WolfpackCampaignApp from "../wolfpack_campaign_log_app.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WolfpackCampaignApp />
  </React.StrictMode>
);
