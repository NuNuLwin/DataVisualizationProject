import React from "react";
import { SunburstChart } from "../components/Sunburst/SunburstChart";

function Index() {
  return (
    <div>
      <h2>
        <center>
          Top Research Topics Across Life/Physical/Social/Health Science
        </center>
      </h2>
      <SunburstChart width={1000} height={700} />
    </div>
  );
}

export default Index;
