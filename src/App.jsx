import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import LogIn from './pages/LogIn/LogIn';
import AdminLayout from './pages/Admin/Layout/AdminLayout';
import AdminDashBoard from './pages/Admin/AdminDashBoard/AdminDashBoard';
import KPIHelpdesk from './pages/Admin/KPIHelpdesk/KPIHelpdesk';
import LoggingTimeLine from './pages/Admin/LoggingTimeLine/LoggingTimeLine';
import AdminUserList from './pages/Admin/AdminUserList/AdminUserList';
import AdminUserDashBoard from './pages/Admin/AdminUserDashBoard/AdminUserDashBoard';
import AdminAddIncident from './pages/Admin/AdminAddIncident/AdminAddIncident';
import TechnicianDashBoard from './pages/Technician/TechnicianDashBoardHome/TechnicianDashBoard.jsx';
import TechnicianLayout from './pages/Technician/TechnicianLayout/TechnicianLayout.jsx';
import AdminViewIncident from './pages/Admin/AdminViewIncident/AdminViewIncident.jsx';
import AdminCategory from './pages/Admin/AdminCategory/AdminCategory.jsx';
import AdminLocation from './pages/Admin/AdminLocation/AdminLocation.jsx';
import UserLayout from './pages/User/Layout/UserLayout';
import UserAddIncident from './pages/User/UserAddIncident/UserAddIncident';
import UserViewIncident from './pages/User/UserViewIncident/UserViewIncident.jsx';
import AdminMyTeamIncidentViewAll from './pages/Admin/AdminMyTeamIncidentViewAll/AdminMyTeamIncidentViewAll.jsx';
import AdminAllIncidents from './pages/Admin/AdminAllIncidents/AdminAllIncidents.jsx';
import TechnicianInsident from './pages/Technician/TechnicianIncident/TechnicianInsident.jsx';
import AdminMyAssignedIncidents from './pages/Admin/AdminMyAssignedIncidents/AdminMyAssignedIncidents.jsx';
import UserMyAssignedIncidents from './pages/User/UserMyAssignedIncidents/UserMyAssignedIncidents.jsx';
import UserMyTeamIncidentViewAll from './pages/User/UserMyTeamIncidentViewAll/UserMyTeamIncidentViewAll.jsx';
import TechnicianAddIncident from './pages/Technician/TechnicianAddIncident/TechnicianAddIncident.jsx';
import TechnicianAllTeam from './pages/Technician/TechnicianAllTeam/TechnicianAllTeam.jsx';
import TechnicianMyAssignedIncidents from './pages/Technician/TechnicianMyAssignedIncidents/TechnicianMyAssignedIncidents.jsx';
import AdminUpdateIncident from './pages/Admin/AdminUpdateIncident/AdminUpdateIncident.jsx';
import UserUpdateIncident from './pages/User/UserUpdateIncident/UserUpdateIncident.jsx';
import TechnicianReportedMyIncidents from './pages/Technician/TechnicianReportedMyIncidents/TechnicianReportedMyIncidents.jsx';
import TechnicianMyReportedUpdate from './pages/Technician/TechnicianMyReportedUpdate/TechnicianMyReportedUpdate.jsx';
import MicrosoftCallback from './pages/LogIn/MicrosoftCallback.jsx';
import PrivateRoute from './components/PrivateRoute/PrivateRoute.jsx';
import SuperAdminReportedMyIncidents from "./pages/SuperAdmin/SuperAdminReportedMyIncidents/SuperAdminReportedMyIncidents.jsx";
import SuperAdminLayout from './pages/SuperAdmin/Layout/SuperAdminLayout.jsx';
import ManageTeamAdmin from './pages/SuperAdmin/ManageTeamAdmin/ManageTeamAdmin.jsx';
import SuperAdminAddIncident from './pages/SuperAdmin/SuperAdminAddIncident/SuperAdminAddIncident.jsx';
import SocketTest from './components/SocketTest/SocketTest.jsx';

function App(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/socket-test" element={<SocketTest />} />
                <Route path="/" element={<Navigate to="/LogIn" replace />} />
                <Route path="/LogIn" element={<LogIn />} />
                <Route path="/auth/callback" element={<MicrosoftCallback />} />
                
                {/* Admin routes with layout */}
                <Route element={<PrivateRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashBoard />} />
                        <Route path="AdminDashBoard" element={<AdminDashBoard />} />
                        <Route path="kpi-helpdesk" element={<KPIHelpdesk />} />
                        <Route path="LoggingTimeLine" element={<LoggingTimeLine />} />
                        <Route path="AdminUserList" element={<AdminUserList />} />
                        <Route path="AdminUserDashBoard" element={<AdminUserDashBoard />} />
                        <Route path="AdminAddIncident" element={<AdminAddIncident />} />
                        <Route path="AdminViewIncident" element={<AdminViewIncident />} />
                        <Route path="AdminCategory" element={<AdminCategory />} />
                        <Route path="AdminLocation" element={<AdminLocation />} />
                        <Route path="AdminMyTeamIncidentViewAll" element={<AdminMyTeamIncidentViewAll />} />
                        <Route path="AdminAllIncidents" element={<AdminAllIncidents />} />
                        <Route path="AdminMyAssignedIncidents" element={<AdminMyAssignedIncidents />} />
                        <Route path="/admin/AdminUpdateIncident" element={<AdminUpdateIncident />} />
                    </Route>
                </Route>


                 <Route element={<PrivateRoute />}>
                    <Route path="/superAdmin" element={<SuperAdminLayout />}>
                    <Route index element={<AdminDashBoard />} />
                    <Route path="AdminDashBoard" element={<AdminDashBoard />} />
                    <Route path="kpi-helpdesk" element={<KPIHelpdesk />} />
                    <Route path="LoggingTimeLine" element={<LoggingTimeLine />} />
                    <Route path="AdminUserList" element={<AdminUserList />} />
                    <Route path="manageteamadmin" element={<ManageTeamAdmin />} />
                    <Route path="AdminCategory" element={<AdminCategory />} />
                    <Route path="AdminLocation" element={<AdminLocation />} />
                    <Route path="AdminAllIncidents" element={<AdminAllIncidents />} />
                    <Route path="SuperAdminAddIncident"  element={<SuperAdminAddIncident />}/>
                    <Route path="AdminMyTeamIncidentViewAll"element={<AdminMyTeamIncidentViewAll />}/>
                    <Route  path="AdminMyAssignedIncidents" element={<AdminMyAssignedIncidents />}/>
                    <Route  path="SuperAdminMyReportedIncidents"  element={<SuperAdminReportedMyIncidents />}/>
                    <Route path="SuperAdminAddIncident" element={<SuperAdminAddIncident />}/>
                  </Route>
                </Route>
                 


                {/* Technician routes with layout, protected */}
                <Route element={<PrivateRoute />}>
                  <Route path="/technician" element={<TechnicianLayout />}>
                    <Route index element={<TechnicianDashBoard />} />
                    <Route path="TechnicianIncident" element={<TechnicianInsident />} /> 
                    <Route path="TechnicianAllTeam" element={<TechnicianAllTeam />} /> 
                    <Route path="TechnicianDashBoard" element={<TechnicianDashBoard/>} />                    <Route path="TechnicianAddIncident" element={<TechnicianAddIncident/>} /> 
                    <Route path="TechnicianMyAssignedInsidents" element={<TechnicianMyAssignedIncidents/>} /> 
                    <Route path="TechnicianReportedMyIncidents" element={<TechnicianReportedMyIncidents/>}/>
                    <Route path="TechnicianMyReportedUpdate" element={<TechnicianMyReportedUpdate/>}/>
                  </Route>
                </Route>
                {/* User routes with layout, protected */}
                <Route element={<PrivateRoute />}>
                  <Route path="/user" element={<UserLayout />}>
                    <Route index element={<UserViewIncident />} />
                    <Route path="UserViewIncident" element={<UserViewIncident />} />
                    <Route path="UserAddIncident" element={<UserAddIncident />} />
                    <Route path="UserMyAssignedIncidents" element={<UserMyAssignedIncidents />} />
                    <Route path="UserMyTeamIncidentViewAll" element={<UserMyTeamIncidentViewAll />} />
                    <Route path="/user/UserUpdateIncident" element={<UserUpdateIncident />} />
                  </Route>
                </Route>
                
            </Routes>
        </BrowserRouter>
    )
}

export default App;