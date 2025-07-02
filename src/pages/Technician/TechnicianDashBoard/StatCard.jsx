import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({ title, count, newCount, color, Icon }) => {
  return (
    <Card className={`h-90 border-0 shadow-sm bg-${color} text-white`}>
      <Card.Body className="d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="text-uppercase opacity-75 mb-2">{title}</h6>
            <h3 className="mb-0">{count}</h3>
          </div>
          <br/>

        </div>
        <div className="mt-3">
          <Icon size={24} className="opacity-75" />
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;