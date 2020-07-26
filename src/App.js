import React, { useState, useEffect } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@material-ui/core";
import { sortData, prettyPrintStat } from "./util";
import InfoBox from "./infoBox";
import Map from "./map";
import Table from "./table";
import LineGraph from "./lineGraph";
import "leaflet/dist/leaflet.css";
import "./App.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState([9.0682478, -75.1756061]);
  const [mapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((res) => res.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((res) => res.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);

        const dataToMap =
          countryCode === "worldwide"
            ? [-7.8560654, -2.7858101]
            : [data.countryInfo.lat, data.countryInfo.long];
        setMapCenter(dataToMap);
      });
  };

  const translateType = (type) => {
    if (type === "cases") return "casos";
    if (type === "recovered") return "recuperados";
    return "mortos";
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Mundial</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.value} value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__status">
          <InfoBox
            isRed
            active={casesType === "cases"}
            title="Casos"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
            onClick={(e) => setCasesType("cases")}
          />
          <InfoBox
            active={casesType === "recovered"}
            title="Recuperados"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.recovered)}
            onClick={(e) => setCasesType("recovered")}
          />
          <InfoBox
            isRed
            active={casesType === "deaths"}
            title="Mortos"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.deaths)}
            onClick={(e) => setCasesType("deaths")}
          />
        </div>

        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Casos por país</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">
            Novos {translateType(casesType)} no mundo!
          </h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
