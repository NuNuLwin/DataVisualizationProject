import { useEffect, useState } from "react";
/* components */
import { LineChart } from "../components/WorksTrendLineChart/LineChart";
import { Loading } from "../components/Loading";
/* css */
import "./PaperTrend.css";

const API_URL = "https://api.openalex.org/domains";
const FIELD_ID = "https://openalex.org/fields/";

export const PaperTrend = () => {
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [dropdownMenus, setDropdownMenus] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        const menus = data.results.map((res) => {
          return {
            id: res.id,
            name: res.display_name,
            levels: res.fields.map((field) => ({
              id: field.id.replace(FIELD_ID, ""),
              name: field.display_name,
            })),
          };
        });
        setDropdownMenus(menus);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="card article-trend-wrapper">
      <h2>
        <center>
          Top 10 Trending Papers Over the Past 14 Years
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
                <li key={`${menu.id}-${level.id}`}>
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
