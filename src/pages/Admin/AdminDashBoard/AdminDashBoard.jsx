import { useRef, useEffect } from 'react';
import './AdminDashBoard.css';
import { FaBell, FaSnowflake, FaTag, FaTruck, FaEnvelope, FaFire } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { IoMdClose } from 'react-icons/io';
import { CiMinimize1 } from 'react-icons/ci';
import { sDesk_t2_incidents_dataset } from '../../../data/sDesk_t2_incidents_dataset';
import { sDesk_t2_category_dataset } from '../../../data/sDesk_t2_category_dataset';

ChartJS.register(ArcElement, Tooltip, Legend);

function AdminDashBoard() {
    const userParentCategory = 'PAC001';
    const pieRef = useRef();

    const getGrandchildCategories = (parentCategory) => {
        const parent = sDesk_t2_category_dataset.find(
            (cat) => cat.parent_category_number === parentCategory
        );
        if (!parent) return [];
        const grandchildCategories = [];
        parent.subcategories.forEach((subcat) => {
            subcat.items.forEach((item) => {
                grandchildCategories.push(item.grandchild_category_number);
            });
        });
        return grandchildCategories;
    };

    const getCategoryName = (categoryNumber) => {
        for (const parent of sDesk_t2_category_dataset) {
            for (const subcategory of parent.subcategories) {
                const item = subcategory.items.find(
                (item) => item.grandchild_category_number === categoryNumber
            );
                if (item) return item.grandchild_category_name;
            }
        }
        return 'Unknown Category';
    };

    const grandchildCategories = getGrandchildCategories(userParentCategory);
    const filterIncidents = sDesk_t2_incidents_dataset.filter((incident) =>
        grandchildCategories.includes(incident.category)
    );

    const cardData = [
        { title: 'Open', color: '#f5a623', icon: <FaBell /> },
        { title: 'Hold', color: '#00c4b4', icon: <FaSnowflake /> },
        { title: 'In Progress', color: '#4a90e2', icon: <FaTag /> },
        { title: 'Closed', color: '#007bff', icon: <FaTruck /> },
        { title: 'Open (Today)', color: '#94C097', icon: <FaEnvelope /> },
        { title: 'Closed (Today)', color: '#D33E3E', icon: <FaFire /> },
    ];

    const cardCounts = {
        'Open': filterIncidents.filter((inc) => inc.status === 'Open').length,
        'Hold': filterIncidents.filter((inc) => inc.status === 'Hold').length,
        'In Progress': filterIncidents.filter((inc) => inc.status === 'In Progress').length,
        'Closed': filterIncidents.filter((inc) => inc.status === 'Closed').length,
        'Open (Today)': filterIncidents.filter((inc) => inc.status === 'Open' && inc.update_on === '2025-04-21').length,
        'Closed (Today)': filterIncidents.filter((inc) => inc.status === 'Closed' && inc.update_on === '2025-04-21').length,
    };

    const cardOptions = {
        plugins: {
        legend: {
                position: 'right',
            },
        },
    };
    const cardSubCounts = {
        'Open': sDesk_t2_incidents_dataset.filter((inc) => inc.status === 'Open').length,
        'Hold': sDesk_t2_incidents_dataset.filter((inc) => inc.status === 'Hold').length,
        'In Progress': sDesk_t2_incidents_dataset.filter((inc) => inc.status === 'In Progress').length,
        'Closed': sDesk_t2_incidents_dataset.filter((inc) => inc.status === 'Closed').length,
        'Open (Today)': sDesk_t2_incidents_dataset.filter((inc) => inc.status === 'Open' && inc.update_on === '2025-04-21').length,
        'Closed (Today)': sDesk_t2_incidents_dataset.filter((inc) => inc.status === 'Closed' && inc.update_on === '2025-04-21').length,
    };

    const pieCounts = {
        Medium: filterIncidents.filter((inc) => inc.priority === 'Medium').length,
        High: filterIncidents.filter((inc) => inc.priority === 'High').length,
        Critical: filterIncidents.filter((inc) => inc.priority === 'Critical').length,
    };

    const updatedPieData = {
        labels: ['Medium', 'High', 'Critical'],
        datasets: [
        {
            data: [pieCounts.Medium, pieCounts.High, pieCounts.Critical],
            backgroundColor: ['#4CAF50', '#FF9800', '#D33E3E'],
            hoverBackgroundColor: ['#388E3C', '#F57C00', '#B71C1C'],
        },
        ],
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
        },
    };

    useEffect(() => {
        function handleResize() {
            if (pieRef.current && pieRef.current.chartInstance) {
                pieRef.current.chartInstance.resize();
            } else if (pieRef.current && pieRef.current.resize) {
                pieRef.current.resize();
            }
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="AdminDashBoard-main-content">
            <div className="AdminDashBoard-direction-bar">Dashboard</div>
            <div className="AdminDashBoard-cards-container">
                {cardData.map((card, index) => (
                <div key={index} className="AdminDashBoard-white-box">
                    <div className="AdminDashBoard-colored-card" style={{ backgroundColor: card.color }}>
                        <div className="AdminDashBoard-card-icon">{card.icon}</div>
                    </div>
                    <div className="AdminDashBoard-card-content">
                        <h3>{card.title}</h3>
                        <div className="AdminDashBoard-card-value">{cardCounts[card.title]}</div>
                        <div className="AdminDashBoard-card-subvalue">{cardSubCounts[card.title]}</div>
                    </div>
                </div>
                ))}
            </div>
            <div className="AdminDashBoard-chart-container">
                <div className="AdminDashBoard-title-piechart">
                    <h3>My Team Incidents</h3>
                    <div className="AdminDashBoard-title-piechart-icon">
                        <CiMinimize1 />
                        <IoMdClose />
                    </div>
                </div>
                <div className="AdminDashBoard-pie-chart">
                    <Pie ref={pieRef} data={updatedPieData} options={pieOptions} />
                </div>
            </div>
        </div>
        );
    }

export default AdminDashBoard;