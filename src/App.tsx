import './App.css';
import Login from './Pages/Login';
import Register from './Pages/Register';
import { BrowserRouter , Routes, Route } from 'react-router-dom';
import ResetPasswordConfirm from './Pages/ResetPasswordConfirm';
import EmailVerification from './Pages/EmailVerification';
import ProtectedRoute from './Component/ProtectedRoute';
import Layout from './layout';
import StatCards from './Component/StatCards';
import OrdersTable from './Component/OrdersTable';
import Layout_settings from './layout-setting';
import Settings from './Component/Settings';
import Layout_loan from './layout-loan/Layout_loan';
import Loan from './Component/Loan';
import Layout_settlements from './layout-settlements';
import Settlement from './Component/Settlement';
import Layout_charts from './layout-charts';
import Charts from './Component/Charts';
import Layout_goals from './layout-goals';
import SavingGoals from './Component/SavingGoals';
import Layout_calculator from './layout-calculator';
import Calculator from './Component/Calculator';
import FamilyVerification from './Pages/FamilyVerification';



// function RegisterAndLogout() {
//   localStorage.clear()
//   return <Register/>
// }

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <StatCards/>
              <OrdersTable/>
            </Layout>
          </ProtectedRoute>
        }/>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="settings" element={
        <ProtectedRoute>
          <Layout_settings>
            <Settings/>
          </Layout_settings>
          </ProtectedRoute>
          } />
        <Route path="loan" element={
          <ProtectedRoute>
            <Layout_loan>
              <Loan/>
            </Layout_loan>
          </ProtectedRoute>
        } />
        <Route path="settlement" element={
          <ProtectedRoute>
            <Layout_settlements>
              <Settlement/>
            </Layout_settlements>
          </ProtectedRoute>
        }/>
        <Route path='charts' element={
          <ProtectedRoute>
            <Layout_charts>
              <Charts/>
            </Layout_charts>
          </ProtectedRoute>
        }/>
        <Route path='goals' element={
          <ProtectedRoute>
            <Layout_goals>
              <SavingGoals/>
            </Layout_goals>
          </ProtectedRoute>
        }>
        </Route>
        <Route path='calculator' element={
          <ProtectedRoute>
            <Layout_calculator>
              <Calculator/>
            </Layout_calculator>
          </ProtectedRoute>
        }/>
        <Route path="api/v1/confirm-invite/:token/" element={<FamilyVerification />} />
        <Route path="dj-rest-auth/registration/account-confirm-email/:key/" element={<EmailVerification/>}></Route>
        <Route path="reset/password/confirm/:uid/:token" element={<ResetPasswordConfirm/>}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
