import { format as d3Format } from "d3";

export const formatTooltip = (d) => {
  const format = d3Format(",d");
  let titleStr = "";
  const ancestors = d.ancestors();
  const len = ancestors.length;

  if (len > 1) titleStr += `Field: ${ancestors[len - 2].data.name}`;
  if (len > 2) titleStr += `\nSub Field: ${ancestors[len - 3].data.name}`;
  if (len > 3) titleStr += `\nTopic: ${ancestors[len - 4].data.name}`;
  titleStr += `\n\nWorks: ${format(d.value)}`;

  return titleStr;
};
