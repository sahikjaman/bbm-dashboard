import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Droplet, TrendingUp, Activity, RefreshCw, ChevronDown, AlertCircle } from 'lucide-react';

const BBMDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Konfigurasi Google Sheets API
  const SPREADSHEET_ID = '1Ga4xC4baBAlax2VqWzIH6Bo2y26P9qlFIGybIkluJY0';
  const API_KEY = 'AIzaSyD6XhnTcm_7I318ksOYjv26sbKVwy9dUYw';
  const RANGE = 'REPORT!A:D'; // Sheet REPORT, kolom A sampai D

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
      
      // Skip header row dan parse data
      const parsedData = rows.slice(1).map((row, index) => ({
        id: index + 1,
        timestamp: row[0] || '',
        date: row[0] ? row[0].split(' ')[0] : '',
        time: row[0] ? row[0].split(' ')[1] : '',
        unit: row[1] || '',
        volume: parseFloat(row[2]) || 0,
        epc: row[3] || ''
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

  // Colors untuk pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Droplet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sistem Monitoring BBM</h1>
                <p className="text-gray-600">Dashboard Real-time</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Update Terakhir</p>
                <p className="text-sm font-semibold text-gray-900">
                  {lastUpdate ? lastUpdate.toLocaleTimeString('id-ID') : '-'}
                </p>
              </div>
              <button
                onClick={fetchData}
                disabled={isRefreshing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Periode Waktu
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Hari Ini</option>
                <option value="yesterday">Kemarin</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">30 Hari Terakhir</option>
                <option value="all">Semua Data</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Activity className="w-4 h-4 inline mr-2" />
                Unit Kendaraan
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Droplet className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Volume</p>
            <p className="text-3xl font-bold">{totalVolume.toFixed(2)}</p>
            <p className="text-blue-100 text-sm mt-1">Liter</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-green-100 text-sm mb-1">Total Transaksi</p>
            <p className="text-3xl font-bold">{totalTransactions}</p>
            <p className="text-green-100 text-sm mt-1">Pengisian</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-purple-100 text-sm mb-1">Unit Aktif</p>
            <p className="text-3xl font-bold">{uniqueUnits.length}</p>
            <p className="text-purple-100 text-sm mt-1">Kendaraan</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 opacity-80" />
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-orange-100 text-sm mb-1">Rata-rata</p>
            <p className="text-3xl font-bold">{avgVolume.toFixed(2)}</p>
            <p className="text-orange-100 text-sm mt-1">Liter/Transaksi</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart - Volume per Unit */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Volume BBM per Unit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataUnits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Distribusi Volume */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Distribusi Volume per Unit</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartDataUnits}
                  dataKey="volume"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.volume}L`}
                >
                  {chartDataUnits.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Trend Volume */}
        {chartDataDays.length > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Trend Volume Harian</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataDays}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volume" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Riwayat Transaksi</h3>
            <p className="text-sm text-gray-600 mt-1">
              Menampilkan {filteredData.length} dari {data.length} transaksi
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal & Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume (Liter)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EPC
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data untuk periode yang dipilih
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{item.date}</div>
                          <div className="text-gray-500">{item.time}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {item.volume.toFixed(2)} L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {item.epc}
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
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            © 2025 Sistem Monitoring BBM - Dashboard Real-time
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BBMDashboard;