import React from "react";
import './table.css'
import { prettyPrintStat } from "../../util/util";

const Table = ({ countries }) => {
  

  return (
    <div className="table">
      {countries.map(({ country, cases }, i) => (
        <tr key={i}>
          <td>{country}</td>
          <td>
            <strong>{prettyPrintStat(cases)}</strong>
          </td>
        </tr>
      ))}
    </div>
  );
};

export default Table;
