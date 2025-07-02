import React, { useState, useEffect } from 'react';
import './KPIHelpdesk.css';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import { IoMdArrowDropdown } from "react-icons/io";
import { FaCaretUp } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";

function KPIHelpdesk() {
  const [openDate, setOpenDate] = useState(false);
  const data1 = [
    { task: 'task 1', status: 'In Progress', percentage: '45%' },
    { task: 'task 2', status: 'Completed', percentage: '30%' },
    { task: 'task 2', status: 'Completed', percentage: '30%' },
    { task: 'task 2', status: 'Completed', percentage: '30%' },
    { task: 'task 2', status: 'Completed', percentage: '30%' },
    { task: 'task 2', status: 'Completed', percentage: '30%' },
    { task: 'task 2', status: 'Completed', percentage: '30%' },
    { task: 'task 2', status: 'Completed', percentage: '30%' },
    { task: 'task 2', status: 'Completed', percentage: '30%' },
  ];

  const data2 = [
    { period: 'BF', month1: 5200, month2: 5350, month3: 5500 },
    { period: 'Reported', month1: 1500, month2: 1300, month3: 900 },
    { period: 'Cleared', month1: 1350, month2: 1150, month3: 600 },
    { period: 'CF', month1: 5350, month2: 5500, month3: 5800 },
  ];
  const categories = [
    { name: 'IT Repair Center Tier 3', percentage: 4 },
    { name: 'E-Mail Lost', percentage: 4 },
    { name: 'MS Office Issue', percentage: 4 },
    { name: 'Printer Driver Installation', percentage: 3 },
    { name: 'Other Software Install (pls specify)', percentage: 3 },
    { name: 'Printer Sharing', percentage: 2 },
    { name: 'VDI Profile Not Loading', percentage: 2 },
    { name: 'MS Office Installation', percentage: 2 },
    { name: 'Computer Login Password - Reset', percentage: 1 },
    { name: 'Scanner Issue', percentage: 1 },
    { name: 'Software', percentage: 1 },
    { name: 'Static IP Request LAN', percentage: 1 },
    { name: 'Operating System Issue', percentage: 1 },
    { name: 'Email', percentage: 1 },
    { name: 'Printer Not Working', percentage: 1 },
  ];
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  const formatMonthYear = (date) => {
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${year}-${month}`;
  };
  const currentMonth = new Date(currentDate);
  const previousMonth = new Date(currentDate);
  previousMonth.setMonth(currentDate.getMonth() - 1);
  const monthBeforePrevious = new Date(currentDate);
  monthBeforePrevious.setMonth(currentDate.getMonth() - 2);

  const monthBeforePreviousHeader = formatMonthYear(monthBeforePrevious);
  const previousMonthHeader = formatMonthYear(previousMonth);
  const currentMonthHeader = formatMonthYear(currentMonth);

  const [date, setDate] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });

  const handleChange = (ranges) => {
    setDate(ranges.selection);
  };

  const handleClick = () => {
    setOpenDate(!openDate);
  };

  return (
    <div className="kpi-main-content">
      <div className="kpi-direction-bar">
        Dashboard {'>'} KPI Helpdesk
      </div>
      <div className="kpi-time-date-container">
        <div onClick={handleClick} className="kpi-calender"> 
          <SlCalender className="kpi-calender-icon" />
          <span className="kpi-date-range-text">
            Select Date Range
          </span>
          {openDate ? (<FaCaretUp className="kpi-down-up-icon"/>) 
          : (<IoMdArrowDropdown className="kpi-down-up-icon" />)}
        </div>
        {openDate && (
          <>
            <div className="kpi-blur-overlay" onClick={() => setOpenDate(false)} />
            <DateRangePicker
              className="kpi-date-range"
              ranges={[date]}
              onChange={handleChange}
            />
          </>
        )}
      </div>
      <div className="kpi-content2">
        <div className="kpi-left-container">
          <div className="kpi-table-content">
            <h2>Incident Status</h2>
            <div className="kpi-table-content-size">
            <div className="kpi-table-content-size">
              <table className="kpi-incident-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Percentage from Table (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {data1.map((row, index) => (
                    <tr key={index}>
                      <td>{row.task}</td>
                      <td>{row.status}</td>
                      <td>{row.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
          <div className="kpi-table-content">
            <h2>BF CF Report</h2>
            <div className="kpi-table-content-size">
            <table className="kpi-incident-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>{monthBeforePreviousHeader}</th>
                  <th>{previousMonthHeader}</th>
                  <th>{currentMonthHeader}</th>
                </tr>
              </thead>
              <tbody>
                {data2.map((row, index) => (
                  <tr key={index} className={row.period === 'BF' || row.period === 'CF' ? 'kpi-highlight' : ''}>
                    <td>{row.period}</td>
                    <td>{row.month1}</td>
                    <td>{row.month2}</td>
                    <td>{row.month3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
        <div className="kpi-right-container">
          <div className="kpi-distribution-table-container">
            <h2>Distribution By Categories</h2>
                <div className="kpi-distribution-table-container-tableOnly">
                <table className="kpi-distribution-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Percentage From Total</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category, index) => (
                      <tr key={index}>
                        <td>{category.name}</td>
                        <td>{category.percentage}</td>
                        <td>
                          <div className="kpi-bar-container">
                            <div
                              className="kpi-bar"
                              style={{ width: `${category.percentage * 10}%` }} 
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPIHelpdesk;