import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Droplet, TrendingUp, Activity, RefreshCw, ChevronDown, AlertCircle, Sun, Moon, Monitor, Menu, X } from 'lucide-react';

const BBMDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [theme, setTheme] = useState('system');
  const [actualTheme, setActualTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Konfigurasi Google Sheets API
  const SPREADSHEET_ID = '19CqWWOKZHidixF36wK0PCQpV6LfBYH1AVkbGIQ8PxU4';
  const API_KEY = 'AIzaSyD6XhnTcm_7I318ksOYjv26sbKVwy9dUYw';
  const RANGE = 'Log!A:D'; // Sheet Log, kolom A sampai D (WAKTU, UNIT, VOLUME, LOKASI)

  // Theme management
  useEffect(() => {
    // Load theme dari localStorage
    const savedTheme = localStorage.getItem('bbm-theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Listen untuk system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setActualTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (selectedTheme) => {
    let appliedTheme = selectedTheme;
    
    if (selectedTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      appliedTheme = systemPrefersDark ? 'dark' : 'light';
    }
    
    setActualTheme(appliedTheme);
    localStorage.setItem('bbm-theme', selectedTheme);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Theme colors
  const colors = actualTheme === 'dark' ? {
    bg: 'from-slate-950 via-slate-900 to-slate-950',
    headerBg: 'from-slate-900/95 via-slate-800/95 to-slate-900/95',
    headerBorder: 'border-cyan-500/20',
    cardBg: 'bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl',
    cardBorder: 'border-slate-700/30',
    text: 'text-slate-50',
    textSecondary: 'text-slate-400',
    textAccent: 'text-cyan-400',
    inputBg: 'bg-slate-800/60',
    inputBorder: 'border-slate-600/50',
    inputText: 'text-slate-50',
    tableBg: 'bg-slate-900/60',
    tableHover: 'hover:bg-slate-700/40',
    tableDivider: 'divide-slate-700/40',
    chartGrid: '#334155',
    chartAxis: '#94a3b8',
    chartTooltipBg: '#1e293b',
    chartTooltipBorder: '#334155',
  } : {
    bg: 'from-slate-50 via-blue-50/30 to-slate-50',
    headerBg: 'from-white/95 via-blue-50/80 to-white/95',
    headerBorder: 'border-blue-200/50',
    cardBg: 'bg-gradient-to-br from-white/90 via-blue-50/50 to-white/90 backdrop-blur-xl',
    cardBorder: 'border-slate-200/60',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textAccent: 'text-blue-600',
    inputBg: 'bg-white/80',
    inputBorder: 'border-slate-300/60',
    inputText: 'text-slate-900',
    tableBg: 'bg-slate-50/60',
    tableHover: 'hover:bg-blue-50/60',
    tableDivider: 'divide-slate-200/60',
    chartGrid: '#e2e8f0',
    chartAxis: '#64748b',
    chartTooltipBg: '#ffffff',
    chartTooltipBorder: '#e2e8f0',
  };

  // Fungsi untuk fetch data dari Google Sheets
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari Google Sheets');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      // Skip header row dan parse data (WAKTU, UNIT, VOLUME, LOKASI)
      const parsedData = rows.slice(1).map((row, index) => ({
        id: index + 1,
        timestamp: row[0] || '',
        date: row[0] ? row[0].split(' ')[0] : '',
        time: row[0] ? row[0].split(' ')[1] : '',
        unit: row[1] || '',
        volume: parseFloat(row[2]) || 0,
        lokasi: row[3] || ''
      })).filter(item => item.timestamp); // Filter data yang valid

      setData(parsedData.reverse()); // Terbaru di atas
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh setiap 30 detik
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter data berdasarkan tanggal
  const getFilteredData = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let filtered = data;

    // Filter by date
    if (selectedDate === 'today') {
      filtered = data.filter(item => item.date === todayStr);
    } else if (selectedDate === 'yesterday') {
      filtered = data.filter(item => item.date === yesterdayStr);
    } else if (selectedDate === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = data.filter(item => new Date(item.date) >= weekAgo);
    } else if (selectedDate === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = data.filter(item => new Date(item.date) >= monthAgo);
    }

    // Filter by unit
    if (selectedUnit !== 'all') {
      filtered = filtered.filter(item => item.unit === selectedUnit);
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  // Statistik
  const totalVolume = filteredData.reduce((sum, item) => sum + item.volume, 0);
  const totalTransactions = filteredData.length;
  const uniqueUnits = [...new Set(filteredData.map(item => item.unit))];
  const avgVolume = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

  // Data untuk chart - Volume per Unit
  const volumeByUnit = {};
  filteredData.forEach(item => {
    volumeByUnit[item.unit] = (volumeByUnit[item.unit] || 0) + item.volume;
  });
  const chartDataUnits = Object.keys(volumeByUnit).map(unit => ({
    name: unit,
    volume: Math.round(volumeByUnit[unit] * 100) / 100
  }));

  // Data untuk chart - Volume per Hari
  const volumeByDate = {};
  filteredData.forEach(item => {
    volumeByDate[item.date] = (volumeByDate[item.date] || 0) + item.volume;
  });
  const chartDataDays = Object.keys(volumeByDate).sort().map(date => ({
    date: date,
    volume: Math.round(volumeByDate[date] * 100) / 100
  }));

  // Colors untuk pie chart - Professional gradient palette
  const COLORS = [
    '#22d3ee', // cyan-400
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#6366f1', // indigo-500
    '#f97316', // orange-500
  ];

  if (loading && data.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
        <div className="text-center">
          <RefreshCw className={`w-12 h-12 animate-spin ${actualTheme === 'dark' ? 'text-cyan-500' : 'text-blue-600'} mx-auto mb-4`} />
          <p className={`${colors.textSecondary} text-lg`}>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg}`}>
      <Head>
        <title>BBM Dashboard - Sistem Monitoring Real-time</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Dashboard monitoring konsumsi BBM real-time" />
      </Head>

      {/* Header - Sticky */}
      <header className={`sticky top-0 z-50 bg-gradient-to-r ${colors.headerBg} shadow-2xl border-b ${colors.headerBorder} backdrop-blur-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl ${actualTheme === 'dark' ? 'shadow-cyan-500/40' : 'shadow-blue-500/30'} ring-2 ring-white/20`}>
                <Droplet className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl sm:text-3xl font-bold ${colors.text} bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent`}>Sistem Monitoring BBM</h1>
                <p className={actualTheme === 'dark' ? 'text-cyan-400/90' : 'text-blue-600/90'}>Dashboard Real-time</p>
              </div>
              <div className="block sm:hidden">
                <h1 className={`text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent`}>BBM Monitor</h1>
                <p className={`text-xs ${actualTheme === 'dark' ? 'text-cyan-400/90' : 'text-blue-600/90'}`}>Real-time</p>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Switcher */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeTheme('light')}
                  className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-cyan-500 text-white' : `${colors.text} ${actualTheme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}`}
                  title="Light Theme"
                >
                  <Sun className="w-5 h-5" />
                </button>
                <button
                  onClick={() => changeTheme('dark')}
                  className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-cyan-500 text-white' : `${colors.text} ${actualTheme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}`}
                  title="Dark Theme"
                >
                  <Moon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => changeTheme('system')}
                  className={`p-2 rounded-lg transition-all ${theme === 'system' ? 'bg-cyan-500 text-white' : `${colors.text} ${actualTheme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}`}
                  title="System Theme"
                >
                  <Monitor className="w-5 h-5" />
                </button>
              </div>

              <div className="text-right">
                <p className={`text-sm ${colors.textSecondary}`}>Update Terakhir</p>
                <p className={`text-sm font-semibold ${colors.text}`}>
                  {lastUpdate ? lastUpdate.toLocaleTimeString('id-ID') : '-'}
                </p>
              </div>
              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white p-2 rounded-xl disabled:opacity-50 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg ${colors.text} ${actualTheme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Theme Switcher & Info */}
          {isMobileMenuOpen && (
            <div className={`mt-4 pt-4 border-t ${colors.cardBorder} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${colors.text}`}>Theme</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => changeTheme('light')}
                    className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-cyan-500 text-white' : `${colors.text} ${actualTheme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}`}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => changeTheme('dark')}
                    className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-cyan-500 text-white' : `${colors.text} ${actualTheme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}`}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => changeTheme('system')}
                    className={`p-2 rounded-lg transition-all ${theme === 'system' ? 'bg-cyan-500 text-white' : `${colors.text} ${actualTheme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className={`text-xs ${colors.textSecondary}`}>Update Terakhir</p>
                <p className={`text-sm font-semibold ${colors.text}`}>
                  {lastUpdate ? lastUpdate.toLocaleTimeString('id-ID') : '-'}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className={`mb-6 ${actualTheme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'} border-l-4 ${actualTheme === 'dark' ? 'border-red-500' : 'border-red-600'} p-4 rounded-lg ${actualTheme === 'dark' ? 'backdrop-blur-sm' : ''}`}>
            <div className="flex items-center">
              <AlertCircle className={`w-5 h-5 ${actualTheme === 'dark' ? 'text-red-400' : 'text-red-600'} mr-3`} />
              <p className={actualTheme === 'dark' ? 'text-red-300' : 'text-red-700'}>{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`${colors.cardBg} rounded-xl shadow-2xl border ${colors.cardBorder} p-4 sm:p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${colors.textAccent} mb-2`}>
                <Calendar className="w-4 h-4 inline mr-2" />
                Periode Waktu
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all`}
              >
                <option value="today">Hari Ini</option>
                <option value="yesterday">Kemarin</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
                <option value="all">Semua Data</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${colors.textAccent} mb-2`}>
                <Activity className="w-4 h-4 inline mr-2" />
                Unit Kendaraan
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className={`w-full ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all`}
              >
                <option value="all">Semua Unit</option>
                {[...new Set(data.map(item => item.unit))].map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="group relative bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-2xl shadow-2xl shadow-cyan-500/20 p-4 sm:p-6 text-white border border-white/10 hover:scale-105 hover:shadow-cyan-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between mb-3 sm:mb-4">
              <Droplet className="w-8 h-8 sm:w-10 sm:h-10 opacity-90 drop-shadow-lg" />
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="relative">
              <p className="text-cyan-100 text-xs sm:text-sm mb-1">Total Volume</p>
              <p className="text-2xl sm:text-3xl font-bold drop-shadow-md">{totalVolume.toFixed(2)}</p>
              <p className="text-cyan-100 text-xs sm:text-sm mt-1">Liter</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-emerald-400 via-teal-500 to-teal-600 rounded-2xl shadow-2xl shadow-emerald-500/20 p-4 sm:p-6 text-white border border-white/10 hover:scale-105 hover:shadow-emerald-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between mb-3 sm:mb-4">
              <Activity className="w-8 h-8 sm:w-10 sm:h-10 opacity-90 drop-shadow-lg" />
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="relative">
              <p className="text-emerald-100 text-xs sm:text-sm mb-1">Total Transaksi</p>
              <p className="text-2xl sm:text-3xl font-bold drop-shadow-md">{totalTransactions}</p>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">Pengisian</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-violet-400 via-purple-500 to-purple-600 rounded-2xl shadow-2xl shadow-violet-500/20 p-4 sm:p-6 text-white border border-white/10 hover:scale-105 hover:shadow-violet-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between mb-3 sm:mb-4">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 opacity-90 drop-shadow-lg" />
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="relative">
              <p className="text-violet-100 text-xs sm:text-sm mb-1">Unit Aktif</p>
              <p className="text-2xl sm:text-3xl font-bold drop-shadow-md">{uniqueUnits.length}</p>
              <p className="text-violet-100 text-xs sm:text-sm mt-1">Kendaraan</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 rounded-2xl shadow-2xl shadow-amber-500/20 p-4 sm:p-6 text-white border border-white/10 hover:scale-105 hover:shadow-amber-500/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-between mb-3 sm:mb-4">
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 opacity-90 drop-shadow-lg" />
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="relative">
              <p className="text-amber-100 text-xs sm:text-sm mb-1">Rata-rata</p>
              <p className="text-2xl sm:text-3xl font-bold drop-shadow-md">{avgVolume.toFixed(2)}</p>
              <p className="text-amber-100 text-xs sm:text-sm mt-1">Liter/Transaksi</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Bar Chart - Volume per Unit */}
          <div className={`${colors.cardBg} rounded-2xl shadow-2xl border ${colors.cardBorder} p-4 sm:p-6 hover:shadow-3xl transition-shadow duration-300`}>
            <h3 className={`text-lg sm:text-xl font-bold ${colors.text} mb-4 flex items-center`}>
              <div className="w-1.5 h-5 sm:h-6 bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-500 rounded-full mr-2 sm:mr-3 shadow-lg"></div>
              <span className="text-sm sm:text-xl">Volume BBM per Unit</span>
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartDataUnits}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} opacity={0.3} />
                <XAxis dataKey="name" stroke={colors.chartAxis} style={{ fontSize: '12px' }} />
                <YAxis stroke={colors.chartAxis} style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: colors.chartTooltipBg, border: `1px solid ${colors.chartTooltipBorder}`, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: actualTheme === 'dark' ? '#f1f5f9' : '#1e293b', fontWeight: 'bold' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Bar dataKey="volume" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Distribusi Volume */}
          <div className={`${colors.cardBg} rounded-2xl shadow-2xl border ${colors.cardBorder} p-4 sm:p-6 hover:shadow-3xl transition-shadow duration-300`}>
            <h3 className={`text-lg sm:text-xl font-bold ${colors.text} mb-4 flex items-center`}>
              <div className="w-1.5 h-5 sm:h-6 bg-gradient-to-b from-emerald-400 via-teal-500 to-cyan-500 rounded-full mr-2 sm:mr-3 shadow-lg"></div>
              <span className="text-sm sm:text-xl">Distribusi Volume</span>
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartDataUnits}
                  dataKey="volume"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${entry.volume}L`}
                  labelStyle={{ fill: actualTheme === 'dark' ? '#f1f5f9' : '#1e293b', fontSize: '11px', fontWeight: 'bold' }}
                >
                  {chartDataUnits.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: colors.chartTooltipBg, border: `1px solid ${colors.chartTooltipBorder}`, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: actualTheme === 'dark' ? '#f1f5f9' : '#1e293b', fontWeight: 'bold' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Trend Volume */}
        {chartDataDays.length > 1 && (
          <div className={`${colors.cardBg} rounded-2xl shadow-2xl border ${colors.cardBorder} p-4 sm:p-6 mb-6 hover:shadow-3xl transition-shadow duration-300`}>
            <h3 className={`text-lg sm:text-xl font-bold ${colors.text} mb-4 flex items-center`}>
              <div className="w-1.5 h-5 sm:h-6 bg-gradient-to-b from-violet-400 via-purple-500 to-fuchsia-500 rounded-full mr-2 sm:mr-3 shadow-lg"></div>
              <span className="text-sm sm:text-xl">Trend Volume Harian</span>
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartDataDays}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} opacity={0.3} />
                <XAxis dataKey="date" stroke={colors.chartAxis} style={{ fontSize: '12px' }} />
                <YAxis stroke={colors.chartAxis} style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: colors.chartTooltipBg, border: `1px solid ${colors.chartTooltipBorder}`, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: actualTheme === 'dark' ? '#f1f5f9' : '#1e293b', fontWeight: 'bold' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Legend wrapperStyle={{ color: colors.text }} />
                <Line type="monotone" dataKey="volume" stroke="url(#colorLine)" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <defs>
                  <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#d946ef" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Table */}
        <div className={`${colors.cardBg} rounded-2xl shadow-2xl border ${colors.cardBorder} overflow-hidden hover:shadow-3xl transition-shadow duration-300`}>
          <div className={`px-4 sm:px-6 py-4 border-b ${colors.cardBorder} bg-gradient-to-r ${actualTheme === 'dark' ? 'from-slate-800/80 via-slate-700/60 to-slate-800/80' : 'from-slate-50/80 via-blue-50/60 to-slate-50/80'}`}>
            <h3 className={`text-lg sm:text-xl font-bold ${colors.text} flex items-center`}>
              <div className="w-1.5 h-5 sm:h-6 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 rounded-full mr-2 sm:mr-3 shadow-lg"></div>
              Riwayat Transaksi
            </h3>
            <p className={`text-xs sm:text-sm ${colors.textSecondary} mt-1`}>
              Menampilkan {filteredData.length} dari {data.length} transaksi
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={colors.tableBg}>
                <tr>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${colors.textAccent} uppercase tracking-wider`}>
                    Tanggal & Waktu
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${colors.textAccent} uppercase tracking-wider`}>
                    Unit
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${colors.textAccent} uppercase tracking-wider`}>
                    Volume
                  </th>
                  <th className={`hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium ${colors.textAccent} uppercase tracking-wider`}>
                    Lokasi
                  </th>
                </tr>
              </thead>
              <tbody className={colors.tableDivider}>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={`px-4 sm:px-6 py-8 text-center ${colors.textSecondary}`}>
                      Tidak ada data untuk periode yang dipilih
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className={colors.tableHover}>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${colors.text}`}>
                        <div>
                          <div className="font-medium">{item.date}</div>
                          <div className={colors.textSecondary}>{item.time}</div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 sm:px-3 py-1 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full ${actualTheme === 'dark' ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-gradient-to-r from-blue-100 via-cyan-100 to-indigo-100 text-blue-800 border border-blue-300'}`}>
                          {item.unit}
                        </span>
                      </td>
                      <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold ${actualTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {item.volume.toFixed(2)} L
                      </td>
                      <td className={`hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${colors.text}`}>
                        {item.lokasi}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`${actualTheme === 'dark' ? 'bg-slate-900/50' : 'bg-white'} border-t ${colors.cardBorder} mt-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className={`text-center text-sm ${colors.textSecondary}`}>
            © 2025 Sistem Monitoring BBM - Dashboard Real-time
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BBMDashboard;