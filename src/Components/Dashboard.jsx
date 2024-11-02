import React, { useState, useEffect } from "react";

import Papa from "papaparse";
import ReactApexChart from "react-apexcharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import hotelBookings from "../../src/Data/hotel_bookings_1000.csv";
import "./Dashboard.css";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(new Date("2015-07-01"));
  const [endDate, setEndDate] = useState(new Date("2015-07-31"));
  const [chartData, setChartData] = useState({
    visitorsPerDay: [],
    visitorsPerCountry: [],
    adultVisitors: [],
    childrenVisitors: [],
  });
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    const fetchBookingsData = async () => {
      Papa.parse(hotelBookings, {
        download: true,
        header: true,
        complete: (results) => {
          setDataset(results.data);
          fetchData(startDate, endDate, results.data);
        },
        error: (error) => {
          console.error("Error reading CSV:", error);
        },
      });
    };

    fetchBookingsData();
  }, []);

  const fetchData = (start, end, data) => {
    const filteredData = data.filter((booking) => {
      const bookingDateStr = `${booking.arrival_date_year}-${booking.arrival_date_month}-${booking.arrival_date_day_of_month}`;
      const bookingDate = new Date(bookingDateStr);
      return (
        !isNaN(bookingDate.getTime()) &&
        bookingDate >= start &&
        bookingDate <= end
      );
    });

    const visitorsPerDay = {};
    const visitorsPerCountry = {};

    filteredData.forEach((booking) => {
      const dateKey = `${booking.arrival_date_year}-${booking.arrival_date_month}-${booking.arrival_date_day_of_month}`;
      const totalVisitors =
        parseInt(booking.adults || 0) +
        parseInt(booking.children || 0) +
        parseInt(booking.babies || 0);

      visitorsPerDay[dateKey] = (visitorsPerDay[dateKey] || 0) + totalVisitors;

      const country = booking.country;
      visitorsPerCountry[country] =
        (visitorsPerCountry[country] || 0) + totalVisitors;
    });

    const visitorsData = Object.entries(visitorsPerDay).map(
      ([date, total]) => ({
        x: new Date(date).getTime(),
        y: total,
      })
    );

    const countryData = Object.entries(visitorsPerCountry).map(
      ([country, totalVisitors]) => ({
        country,
        totalVisitors,
      })
    );

    const adultData = filteredData.map(
      (booking) => parseInt(booking.adults) || 0
    );
    const childrenData = filteredData.map(
      (booking) => parseInt(booking.children) || 0
    );

    setChartData({
      visitorsPerDay: visitorsData,
      visitorsPerCountry: countryData,
      adultVisitors: adultData,
      childrenVisitors: childrenData,
    });
  };

  useEffect(() => {
    if (dataset.length > 0) {
      fetchData(startDate, endDate, dataset);
    }
  }, [startDate, endDate, dataset]);

  const areaChartOptions = {
    series: [{ name: "Visitors", data: chartData.visitorsPerDay }],
    chart: {
      type: "area",
      stacked: false,
      height: 300,
      zoom: { type: "x", enabled: true, autoScaleYaxis: true },
      toolbar: { autoSelected: "zoom" },
    },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    title: { text: "Visitors per Day", align: "left" },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    yaxis: {
      labels: { formatter: (val) => val },
      title: { text: "Number of Visitors" },
    },
    xaxis: { type: "datetime" },
    tooltip: { shared: false, y: { formatter: (val) => val } },
  };

  const columnChartOptions = {
    series: [
      {
        name: "Visitors",
        data: chartData.visitorsPerCountry.map((item) => item.totalVisitors),
      },
    ],
    chart: { type: "bar", height: 300 },
    xaxis: {
      categories: chartData.visitorsPerCountry.map((item) => item.country),
      title: { text: "Countries" },
    },
    yaxis: { title: { text: "Number of Visitors" } },
    title: { text: "Number of Visitors per Country", align: "center" },
  };

  const sparklineOptions = (data, title, subtitle) => ({
    series: [{ data }],
    chart: { type: "area", height: 160, sparkline: { enabled: true } },
    stroke: { curve: "smooth" },
    fill: { opacity: 0.3 },
    yaxis: { min: 0, labels: { show: false } },
    colors: ["#A9A9A9"],
    title: { text: title, offsetX: 0, style: { fontSize: "24px" } },
    subtitle: { text: subtitle, offsetX: 0, style: { fontSize: "14px" } },
  });

  return (
    <div className="wrapper">
      <h1>Dashboard</h1>
      <div className="date-picker-container">
        <label htmlFor="start-date" className="date-picker-label">
          Start Date
        </label>
        <DatePicker
          id="start-date"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className="date-picker"
        />

        <label htmlFor="end-date" className="date-picker-label">
          End Date
        </label>
        <DatePicker
          id="end-date"
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          className="date-picker"
        />
      </div>

      <div className="chart-flex-container">
        <div className="smaller-chart">
          <ReactApexChart
            options={areaChartOptions}
            series={[{ name: "Visitors", data: chartData.visitorsPerDay }]}
            type="area"
            height={300}
          />
        </div>
        <div className="smaller-chart">
          <ReactApexChart
            options={columnChartOptions}
            series={[
              {
                name: "Visitors",
                data: chartData.visitorsPerCountry.map(
                  (item) => item.totalVisitors
                ),
              },
            ]}
            type="bar"
            height={300}
          />
        </div>
      </div>

      {/* Sparkline Charts */}
      <div className="sparkline-charts">
        <div id="chart-spark1">
          <ReactApexChart
            options={sparklineOptions(
              chartData.adultVisitors,
              "Total Adults",
              chartData.adultVisitors.reduce((a, b) => a + b, 0)
            )}
            series={[{ data: chartData.adultVisitors }]}
            type="area"
            height={200}
          />
        </div>
        <div id="chart-spark2">
          <ReactApexChart
            options={sparklineOptions(
              chartData.childrenVisitors,
              "Total Children",
              chartData.childrenVisitors.reduce((a, b) => a + b, 0)
            )}
            series={[{ data: chartData.childrenVisitors }]}
            type="area"
            height={200}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
