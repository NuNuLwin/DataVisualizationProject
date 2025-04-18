export const getAuthorNames = (d) => {
  const authors = d.authorships.map(
    (obj) => obj?.author?.display_name || obj?.raw_author_name
  );
  return authors.length > 20
    ? authors.slice(0, 20).join(", ") + ", and more"
    : authors.length > 0
    ? authors.join(", ")
    : "";
};

export const getInstitutionNames = (d) => {
  const institutionSet = new Set();
  d.authorships.forEach((authorObj) => {
    authorObj.institutions.forEach((inst) => {
      institutionSet.add(inst.display_name);
    });
  });

  const institutions = Array.from(institutionSet);
  return institutions.length > 20
    ? institutions.slice(0, 20).join(", ") + " and more"
    : institutions.length > 0
    ? institutions.join(", ")
    : "";
};

export const getTooltip = (d, yValue, pubYearValue) => {
  return `
      <p>
        ${yValue(d)}<br><br>
        Publication Year: ${pubYearValue(d)}<br><br>
        Authors: ${getAuthorNames(d)}<br><br>
        Institutions: ${getInstitutionNames(d)}
      </p>
    `;
};

export const getCleanedDisplayName = (name) => {
  if (!name) return "Untitled";

  // Remove HTML tags
  const stripped = name.replace(/<\/?[^>]+(>|$)/g, "");

  // If it's all caps, convert to title case
  if (stripped === stripped.toUpperCase()) {
    return stripped
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return stripped;
};

export const getDynamicFontSize = (count) => {
  if (count <= 10) return 13;
  if (count <= 15) return 11;
  return 6;
};

export const labelEllipsis = (text, textWrapCount = 60) => {
  return text.length > textWrapCount ? `${text.substring(0, 30)}...` : text;
};
