import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import ReactApexChart from 'react-apexcharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import hotelBookings from "../../src/Data/hotel_bookings_1000.csv";

const Dashboard = () => {
    const [startDate, setStartDate] = useState(new Date('2015-07-01'));
    const [endDate, setEndDate] = useState(new Date('2015-07-31'));
    const [chartData, setChartData] = useState({
        visitorsPerDay: [],
        visitorsPerCountry: [],
        adultVisitors: [],
        childrenVisitors: []
    });
    const [dataset, setDataset] = useState([]);

    // Load CSV data
    useEffect(() => {
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
    }, []); // Load data once on component mount

    const fetchData = (start, end, data) => {
        const filteredData = data.filter((booking) => {
            // Attempt to construct the booking date
            const bookingDateStr = `${booking.arrival_date_year}-${booking.arrival_date_month}-${booking.arrival_date_day_of_month}`;
            const bookingDate = new Date(bookingDateStr);


            // Check if the booking date is valid
            if (isNaN(bookingDate.getTime())) {
                return false;
            }

            return bookingDate >= start && bookingDate <= end;
        });

        const visitorsPerDay = {};
        filteredData.forEach((booking) => {
            const dateKey = `${booking.arrival_date_year}-${booking.arrival_date_month}-${booking.arrival_date_day_of_month}`;
            visitorsPerDay[dateKey] = (visitorsPerDay[dateKey] || 0) + 
                (parseInt(booking.adults || 0) + parseInt(booking.children || 0) + parseInt(booking.babies || 0));
        });

        // Prepare data for the visitors per day chart
        const visitorsData = Object.entries(visitorsPerDay).map(([date, total]) => ({
            x: new Date(date).getTime(),
            y: total
        }));

        // Prepare data for the visitors per country chart
        const visitorsPerCountry = {};
        filteredData.forEach((booking) => {
            const country = booking.country;
            const totalVisitors = parseInt(booking.adults || 0) + parseInt(booking.children || 0) + parseInt(booking.babies || 0);
            visitorsPerCountry[country] = (visitorsPerCountry[country] || 0) + totalVisitors;
        });

        const countryData = Object.entries(visitorsPerCountry).map(([country, totalVisitors]) => ({
            country,
            totalVisitors
        }));

        // Prepare adult and children visitor data
        const adultData = filteredData.map(booking => parseInt(booking.adults) || 0);
        const childrenData = filteredData.map(booking => parseInt(booking.children) || 0);

        // Update state with new visitor data
        setChartData({
            visitorsPerDay: visitorsData,
            visitorsPerCountry: countryData,
            adultVisitors: adultData,
            childrenVisitors: childrenData
        });
    };

    // Fetch new data when date range changes
    useEffect(() => {
        fetchData(startDate, endDate, dataset);
    }, [startDate, endDate, dataset]);

    // ApexCharts options for Visitors per Day
    const areaChartOptions = {
        series: [{
            name: 'Visitors',
            data: chartData.visitorsPerDay
        }],
        chart: {
            type: 'area',
            stacked: false,
            height: 350,
            zoom: {
                type: 'x',
                enabled: true,
                autoScaleYaxis: true
            },
            toolbar: {
                autoSelected: 'zoom'
            }
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 0,
        },
        title: {
            text: 'Visitors per Day',
            align: 'left'
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0,
                stops: [0, 90, 100]
            },
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return val; 
                },
            },
            title: {
                text: 'Number of Visitors'
            },
        },
        xaxis: {
            type: 'datetime',
        },
        tooltip: {
            shared: false,
            y: {
                formatter: function (val) {
                    return val; 
                }
            }
        }
    };

    // ApexCharts options for Visitors per Country
    const columnChartOptions = {
        series: [{
            name: 'Visitors',
            data: chartData.visitorsPerCountry.map(item => item.totalVisitors)
        }],
        chart: {
            type: 'bar',
            height: 350,
        },
        xaxis: {
            categories: chartData.visitorsPerCountry.map(item => item.country),
            title: {
                text: 'Countries'
            },
        },
        yaxis: {
            title: {
                text: 'Number of Visitors'
            },
        },
        title: {
            text: 'Number of Visitors per Country',
            align: 'center'
        },
    };

    // Sparkline chart options
    const sparklineOptions = (data, title, subtitle, color) => ({
        series: [{ data }],
        chart: {
            type: 'area',
            height: 160,
            sparkline: { enabled: true },
        },
        stroke: { curve: 'smooth' },
        fill: { opacity: 0.3 },
        yaxis: { min: 0 },
        colors: [color],
        title: {
            text: title,
            offsetX: 0,
            style: { fontSize: '24px' },
        },
        subtitle: {
            text: subtitle,
            offsetX: 0,
            style: { fontSize: '14px' },
        },
    });

    var options = (data, title, subtitle, color) =>( {
        series: [{
        data
      }],
        chart: {
        type: 'area',
        height: 160,
        sparkline: {
          enabled: true
        },
      },
      stroke: {
        curve: 'straight'
      },
      fill: {
        opacity: 0.3,
      },
      yaxis: {
        min: 0
      },
      colors: [color],
      title: {
        text: title,
        offsetX: 0,
        style: {
          fontSize: '24px',
        }
      },
      subtitle: {
        text: subtitle,
        offsetX: 0,
        style: {
          fontSize: '14px',
        }
      }
      });

    return (
        <div>
            <h1>Dashboard</h1>
            <div>
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>

            {/* Visitors per Day Chart */}
            <ReactApexChart
                options={areaChartOptions}
                series={[{ name: 'Visitors', data: chartData.visitorsPerDay }]}
                type="area"
                height={350}
            />

            {/* Visitors per Country Chart */}
            <ReactApexChart
                options={columnChartOptions}
                series={[{ name: 'Visitors', data: chartData.visitorsPerCountry.map(item => item.totalVisitors) }]}
                type="bar"
                height={350}
            />

            {/* Sparkline Charts */}
            <h2>Sparkline Charts</h2>
            <div id="chart-spark1">
                <ReactApexChart
                    options={options(chartData.adultVisitors, 'Total Adult Visitors', 'Adults', '#DCE6EC')}
                    series={[{ data: chartData.adultVisitors }]}
                    type="area"
                    height={160}
                />
            </div>
            <div id="chart-spark2">
                <ReactApexChart
                    options={sparklineOptions(chartData.childrenVisitors, 'Total Children Visitors', 'Children', '#DCE6EC')}
                    series={[{ data: chartData.childrenVisitors }]}
                    type="area"
                    height={160}
                />
            </div>
            <div>
                <h4>Sparkline Chart Description:</h4>
                <p>The Sparkline chart includes total number and line chart for aggregate visitors.</p>
            </div>
        </div>
    );
};

export default Dashboard;
