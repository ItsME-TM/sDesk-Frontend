import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Bell, Asterisk, Pause, Truck, Mail, Flame } from 'lucide-react';
import StatCard from '../TechnicianDashBoard/StatCard';
import FaultCategoryChart from '../TechnicianDashBoard/FaultCategoryChart';
import { sDesk_t2_incidents_dataset } from '../../../data/sDesk_t2_incidents_dataset';
import './TechnicianDashboard.css'; 


const TechnicianDashboard = () => {
  const [ticketStats, setTicketStats] = useState([
    {
      title: "Unattended",
      count: 0,
      newCount: 0,
      color: "warning",
      Icon: Bell
    },
    {
      title: "Open",
      count: 0,
      newCount: 0,
      color: "primary",
      Icon: Asterisk
    },
    {
      title: "Hold",
      count: 0,
      newCount: 0,
      color: "info",
      Icon: Pause
    },
    {
      title: "Ongoing",
      count: 0,
      newCount: 0,
      color: "secondary",
      Icon: Truck
    },
    {
      title: "Closed(T)",
      count: 0,
      newCount: 0,
      color: "success",
      Icon: Mail
    },
    {
      title: "Critical",
      count: 0,
      newCount: 0,
      color: "danger",
      Icon: Flame
    }
  ]);

  const faultCategoryData = [
    { name: "Laptops", value: 20, color: "#007bff" },
    { name: "Desktops", value: 20, color: "#28a745" },
    { name: "Printers", value: 12, color: "#dc3545" },
    { name: "Finishers", value: 8, color: "#ffc107" },
    { name: "Scanners", value: 8, color: "#17a2b8" },
    { name: "Software New Installation", value: 12, color: "#6f42c1" }
  ];

  useEffect(() => {
    const calculateStats = () => {
      // Initialize counters
      let unattendedCount = 0;
      let openCount = 0;
      let holdCount = 0;
      let ongoingCount = 0;
      let closedCount = 0;
      let criticalCount = 0;

      let newUnattendedCount = 0;
      let newOpenCount = 0;
      let newHoldCount = 0;
      let newOngoingCount = 0;
      let newClosedCount = 0;
      let newCriticalCount = 0;

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      sDesk_t2_incidents_dataset.forEach(incident => {
        const updateDate = new Date(incident.update_on);
        const isNew = updateDate >= yesterday;
        
        switch(incident.status) {
          case 'Open':
            openCount++;
            if (isNew) newOpenCount++;
            break;
          case 'Hold':
            holdCount++;
            if (isNew) newHoldCount++;
            break;
          case 'In Progress':
            ongoingCount++;
            if (isNew) newOngoingCount++;
            break;
          case 'Closed':
            closedCount++;
            if (isNew) newClosedCount++;
            break;
          default:
            unattendedCount++;
            if (isNew) newUnattendedCount++;
        }
        
        if (incident.priority === 'Critical') {
          criticalCount++;
          if (isNew) newCriticalCount++;
        }
      });

      setTicketStats([
        {
          title: "Unattended",
          count: unattendedCount,
          newCount: newUnattendedCount,
          color: "warning",
          Icon: Bell
        },
        {
          title: "Open",
          count: openCount,
          newCount: newOpenCount,
          color: "primary",
          Icon: Asterisk
        },
        {
          title: "Hold",
          count: holdCount,
          newCount: newHoldCount,
          color: "info",
          Icon: Pause
        },
        {
          title: "Ongoing",
          count: ongoingCount,
          newCount: newOngoingCount,
          color: "secondary",
          Icon: Truck
        },
        {
          title: "Closed(T)",
          count: closedCount,
          newCount: newClosedCount,
          color: "success",
          Icon: Mail
        },
        {
          title: "Critical",
          count: criticalCount,
          newCount: newCriticalCount,
          color: "danger",
          Icon: Flame
        }
      ]);
    };

    calculateStats();
  }, []); 

  return (
    <div className="dashboard-content p-4">
      <div className="bg-white border-bottom px-4 py-3 mb-4">
         <div className="techniciandashboard-tickets-creator">
            <span className="techniciandashboard-svr-desk">DashBoard</span>
         </div>
      </div>

      <Container fluid>
        <Row className="g-4 mb-4">
          {ticketStats.map((stat, index) => (
            <Col key={index} sm={6} md={4} lg={2}>
              <StatCard {...stat} />
            </Col>
          ))}
        </Row>

        <Row className="g-4">
          <Col lg={8}>
            <FaultCategoryChart data={faultCategoryData} />
          </Col>
          <Col lg={4}>
            {/* Additional widgets */}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TechnicianDashboard;