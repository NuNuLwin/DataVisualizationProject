import { useState, useEffect } from "react";
import { json } from "d3";

const url =
  "https://gist.githubusercontent.com/NuNuLwin/453b8578c2ff0f6b6d1ebd801582bee4/raw/c3aa65e87a3e7c5854f915756c4581b60f6070ce/sunburst_data.json";

export const useData = (selectedDomain) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let domainData = null;
    json(url).then((d) => {
      d.children.forEach((domain) => {
        if (domain.name !== selectedDomain) {
          return;
        }
        // field
        domain.children.forEach((field) => {
          // sub field
          field.children.forEach((subfield) => {
            // topic
            subfield.children = subfield.children
              .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
              .slice(0, 5);

            subfield.value = 0;
            subfield.children.forEach((sc) => {
              subfield.value += parseFloat(sc.value);
            });
          });

          // sub field - get top 5
          field.children = field.children
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          // sub field - remove value attr
          field.children.forEach((fd) => {
            delete fd.value;
          });
        });
        domainData = domain;
      });
      setData(domainData);
    });
  }, [selectedDomain]);

  return data;
};
