import { useEffect, useState } from "react";
/* components */
import { LineChart } from "../components/WorksTrendLineChart/LineChart";
import { Loading } from "../components/Loading";
/* css */
import "./ArticleTrend.css";

const API_URL = "https://api.openalex.org/domains";
const FIELD_ID = "https://openalex.org/fields/";

export const ArticleTrend = () => {
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [dropdownMenus, setDropdownMenus] = useState([]);

  useEffect(async () => {
    setLoading(true);
    const response = await fetch(API_URL);
    if (response.ok) {
      let data = await response.json();
      let menus = [];
      menus = data.results.map((res) => {
        let domain = {
          id: res.id,
          name: res.display_name,
          levels: res.fields.map((field) => {
            return {
              id: field.id.replace(FIELD_ID, ""),
              name: field.display_name,
            };
          }),
        };
        return domain;
      });
      setDropdownMenus(menus);
      setLoading(false);
    }
  }, []);

  return (
    <div className="card article-trend-wrapper">
      <h2>
        <center>
          Top Works Trends Over 14 Years
          <br />
          <h3>{selectedField ? `Field: ${selectedField.name}` : ""}</h3>
        </center>
      </h2>
      {loading ? (
        <Loading marginLeft={0} />
      ) : (
        <div className="field-dropdown">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Fields
          </button>
          <ul className="dropdown-menu">
            {dropdownMenus.map((menu) =>
              menu.levels.map((level) => (
                <li>
                  <span
                    className="dropdown-item"
                    href="#"
                    onClick={() => {
                      setSelectedField(level);
                    }}
                  >
                    {level.name}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {selectedField && (
        <LineChart
          selectedField={selectedField}
          width={window.innerWidth - 300}
          height={window.innerHeight - 200}
        />
      )}
    </div>
  );
};
