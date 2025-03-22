import { useState, useEffect } from "react";
import { json } from "d3";

const url =
  "https://gist.githubusercontent.com/NuNuLwin/453b8578c2ff0f6b6d1ebd801582bee4/raw/399ecbf5f9a15ff649ccebeb9d751224b4790c59/sunburst_data.json";

export const useData = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    json(url).then((d) => {
      d.children.map((domain) => {
        // field
        domain.children.map((field) => {
          // sub field
          field.children.map((subfield) => {
            // topic
            subfield.children = subfield.children
              .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
              .slice(0, 5);

            subfield.value = 0;
            subfield.children.map((sc) => {
              subfield.value += parseFloat(sc.value);
            });
          });

          // sub field - get top 5
          field.children = field.children
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          // sub field - remove value attr
          field.children.map((fd) => {
            delete fd.value;
          });
        });
      });
      setData(d);
    });
  }, []);

  return data;
};
