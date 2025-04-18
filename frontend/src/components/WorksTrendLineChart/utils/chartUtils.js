export const toolTipText = (d, labelValue, pubYearValue, authorValue, institutionValue) => {
    return `
        <p>
            ${labelValue(d)}<br><br>
            Publication Year: ${pubYearValue(d)}<br><br>
            Authors: ${authorValue(d)}<br><br>
            Institutions: ${institutionValue(d)}
        </p>
    `
};