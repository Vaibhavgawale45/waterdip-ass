import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import ReactApexChart from 'react-apexcharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import hotelBookings from "../../src/Data/hotel_bookings_1000.csv"

const Dashboard = () => {
    const [startDate, setStartDate] = useState(new Date('2015-07-01'));
    const [endDate, setEndDate] = useState(new Date('2015-07-31'));
    const [chartData, setChartData] = useState({
        visitorsPerDay: []
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
            const bookingDate = new Date(
                booking.arrival_date_year,
                new Date(Date.parse(booking.arrival_date_month + " 1, 2020")).getMonth(),
                booking.arrival_date_day_of_month
            );
            return bookingDate >= start && bookingDate <= end;
        });

        const visitorsPerDay = {};
        filteredData.forEach((booking) => {
            const dateKey = `${booking.arrival_date_year}-${booking.arrival_date_month}-${booking.arrival_date_day_of_month}`;
            visitorsPerDay[dateKey] = (visitorsPerDay[dateKey] || 0) + parseInt(booking.adults) + parseInt(booking.children) + parseInt(booking.babies);
        });

        // Prepare data for the chart
        const visitorsData = Object.entries(visitorsPerDay).map(([date, total]) => ({
            x: new Date(date).getTime(), // Convert date to timestamp for datetime axis
            y: total
        }));

        // Update state with new visitor data
        setChartData({
            visitorsPerDay: visitorsData
        });
    };

    // Fetch new data when date range changes
    useEffect(() => {
        fetchData(startDate, endDate, dataset);
    }, [startDate, endDate, dataset]);

    // ApexCharts options for Visitors per Day
    const options = {
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
                    return val; // Return total visitors directly
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
                    return val; // Return total visitors directly
                }
            }
        }
    };

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
                options={options}
                series={[{ name: 'Visitors', data: chartData.visitorsPerDay }]}
                type="area"
                height={350}
            />
        </div>
    );
};

export default Dashboard;
