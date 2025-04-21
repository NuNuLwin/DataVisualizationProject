import React from "react";
import { TopicTrend } from "./TopicTrend";
import { PaperTrend } from "./PaperTrend";
import { InstitutionCollaboration } from "./InstitutionCollaboration";
import { CoAuthorship } from "./CoAuthorship";

/* css */
import "./index.css";

function Index() {
  return (
    <div className="content-wrapper">
      <TopicTrend />
      <PaperTrend />
      <InstitutionCollaboration />
    </div>
  );
}

export default Index;
