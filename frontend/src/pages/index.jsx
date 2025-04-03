import React from "react";
import { TopicTrend } from "./TopicTrend";
import { ArticleTrend } from "./ArticleTrend";
import {InstitutionCollaboration} from "./InstitutionCollaboration";
import {CoAuthorship} from "./CoAuthorship";

/* css */
import "./index.css";

function Index() {
  return (
    <div className="content-wrapper">
      <TopicTrend />
      <ArticleTrend />
      <InstitutionCollaboration/>
      <CoAuthorship/>
    </div>
  );
}

export default Index;
