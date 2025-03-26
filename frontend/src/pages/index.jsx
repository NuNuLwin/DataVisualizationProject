import React from "react";
import { TopicTrend } from "./TopicTrend";
import { ArticleTrend } from "./ArticleTrend";
/* css */
import "./index.css";

function Index() {
  return (
    <div className="content-wrapper">
      <TopicTrend />
      <ArticleTrend />
    </div>
  );
}

export default Index;
