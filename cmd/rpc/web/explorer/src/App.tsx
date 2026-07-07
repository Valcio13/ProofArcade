import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useNetworkChangeHandler, useBlockSubscription } from './hooks/useApi'
const HomePage = lazy(() => import('./pages/Home'))
const ExplorerHomePage = lazy(() => import('./pages/ExplorerHome'))
const AuthPage = lazy(() => import('./pages/Auth'))
const ProfilePage = lazy(() => import('./pages/Profile'))
const PublicProfilePage = lazy(() => import('./pages/PublicProfile'))
const GameHistoryPage = lazy(() => import('./pages/GameHistory'))
const CheckInPage = lazy(() => import('./pages/CheckIn'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const ShopPage = lazy(() => import('./pages/Shop'))
const SearchPage = lazy(() => import('./pages/Search'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))
const BlocksPage = lazy(() => import('./components/block/BlocksPage'))
const BlockDetailPage = lazy(() => import('./components/block/BlockDetailPage'))
const TransactionsPage = lazy(() => import('./components/transaction/TransactionsPage'))
const TransactionDetailPage = lazy(() => import('./components/transaction/TransactionDetailPage'))
const ValidatorsPage = lazy(() => import('./components/validator/ValidatorsPage'))
const ValidatorDetailPage = lazy(() => import('./components/validator/ValidatorDetailPage'))
const AccountsPage = lazy(() => import('./components/account/AccountsPage'))
const AccountDetailPage = lazy(() => import('./components/account/AccountDetailPage'))
const NetworkAnalyticsPage = lazy(() => import('./components/analytics/NetworkAnalyticsPage'))
const TokenSwapsPage = lazy(() => import('./components/token-swaps/TokenSwapsPage'))
const DexBatchesPage = lazy(() => import('./components/dex/DexBatchesPage'))
const StakingPage = lazy(() => import('./components/staking/StakingPage'))
const GovernancePage = lazy(() => import('./components/staking/GovernancePage'))
const SupplyPage = lazy(() => import('./components/staking/SupplyPage'))
const Play2048Page = lazy(() => import('./pages/Play2048'))
const PlaytestPage = lazy(() => import('./pages/Playtest'))
const LeaderboardPage = lazy(() => import('./pages/Leaderboard'))
const AdminPage = lazy(() => import('./pages/Admin'))
const AdminEconomyPage = lazy(() => import('./pages/AdminEconomy'))
const AdminCompetitionsPage = lazy(() => import('./pages/AdminCompetitions'))
const AdminPlayersPage = lazy(() => import('./pages/AdminPlayers'))
const AdminShopPage = lazy(() => import('./pages/AdminShop'))

function RouteFallback() {
  return (
    <div className="mx-auto max-w-[980px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[1.6rem] border border-white/10 bg-black/20 px-5 py-6 text-sm text-slate-400">
        Loading page...
      </div>
    </div>
  )
}


function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route index element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/explorer" element={<ExplorerHomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/player/:address" element={<PublicProfilePage />} />
          <Route path="/game-history/:address" element={<GameHistoryPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/daily-login" element={<CheckInPage />} /> {/* Legacy redirect */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/blocks" element={<BlocksPage />} />
          <Route path="/block/:blockHeight" element={<BlockDetailPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transaction/:transactionHash" element={<TransactionDetailPage />} />
          <Route path="/validators" element={<ValidatorsPage />} />
          <Route path="/delegators" element={<ValidatorsPage />} />
          <Route path="/validator/:validatorAddress" element={<ValidatorDetailPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/account/:address" element={<AccountDetailPage />} />
          <Route path="/analytics" element={<NetworkAnalyticsPage />} />
          <Route path="/token-swaps" element={<TokenSwapsPage />} />
          <Route path="/dex" element={<DexBatchesPage />} />
          <Route path="/staking" element={<StakingPage />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/supply" element={<SupplyPage />} />
          <Route path="/play" element={<Play2048Page />} />
          <Route path="/playtest" element={<PlaytestPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/economy" element={<AdminEconomyPage />} />
          <Route path="/admin/competitions" element={<AdminCompetitionsPage />} />
          <Route path="/admin/players" element={<AdminPlayersPage />} />
          <Route path="/admin/shop" element={<AdminShopPage />} />
          <Route path="/orders" element={<ExplorerHomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

function App() {
  // Handle network changes and invalidate queries
  useNetworkChangeHandler();
  // Detect new blocks globally and refresh dashboard queries on chain growth
  // DISABLED: Causes re-renders that close modals on auth page
  // Individual queries already have their own refetchInterval
  // useBlockSubscription();

  function AppShell() {
    const location = useLocation()
    const isPlayRoute = location.pathname === '/play' || location.pathname === '/playtest'

    return (
      <div className={`min-h-screen flex flex-col ${isPlayRoute ? 'bg-[#090c12]' : 'bg-background'}`}>
        {!isPlayRoute ? <Navbar /> : null}
        <main className={`flex-1 ${isPlayRoute ? 'pb-0' : ''}`}>
          <AnimatedRoutes />
        </main>
        {!isPlayRoute ? <Footer /> : null}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#1f2937',
              },
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #4ade80',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1f2937',
              },
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #ef4444',
              },
            },
          }}
        />
      </div>
    )
  }

  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
