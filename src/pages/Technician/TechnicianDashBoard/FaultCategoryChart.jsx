import React from 'react';
import { Card } from 'react-bootstrap';

const FaultCategoryChart = ({ data }) => {
  const calculatePieSlice = (index) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    const startAngle = data
      .slice(0, index)
      .reduce((sum, entry) => sum + (entry.value / total) * 360, 0);
    const angle = (data[index].value / total) * 360;

    const centerX = 200;
    const centerY = 200;
    const radius = 180;

    const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);

    const endX = centerX + radius * Math.cos(((startAngle + angle) * Math.PI) / 180);
    const endY = centerY + radius * Math.sin(((startAngle + angle) * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `
      M ${centerX} ${centerY}
      L ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      Z
    `;
  };

  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Header className="bg-white border-0 pt-4 pb-0">
        <h5 className="mb-1">Fault Category Composition</h5>
        <p className="text-muted small">In-Progress Ticket Distribution</p>
      </Card.Header>
      <Card.Body className="d-flex align-items-center justify-content-center">
        <div style={{ width: "300px", height: "300px" }}>
          <svg viewBox="0 0 400 400">
            {data.map((entry, index) => (
              <path
                key={`slice-${index}`}
                d={calculatePieSlice(index)}
                fill={entry.color}
              />
            ))}
          </svg>
        </div>
        <div className="ms-4">
          {data.map((entry, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <span
                className="me-2 d-inline-block rounded-circle"
                style={{
                  width: "15px",
                  height: "15px",
                  backgroundColor: entry.color
                }}
              />
              <span className="text-muted">
                {entry.name} - {entry.value}%
              </span>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default FaultCategoryChart;