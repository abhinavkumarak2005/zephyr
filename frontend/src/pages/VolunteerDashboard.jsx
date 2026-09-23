import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Search, QrCode, CheckCircle2, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function VolunteerDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const [volunteerName, setVolunteerName] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isVolunteerAuthenticated') !== 'true') {
      navigate('/volunteer-login');
      return;
    }
    setVolunteerName(localStorage.getItem('volunteerName') || 'Volunteer');
    fetchTeams();
  }, [navigate]);

  const fetchTeams = async () => {
    setLoading(true);
    // Fetch only R3 teams to keep it simple and light
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('current_round', 3)
      .eq('is_eliminated', false)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setTeams(data);
    }
    setLoading(false);
  };

  const handleCheckIn = async (e, scannedId = null) => {
    e?.preventDefault();
    const targetId = scannedId || qrCodeInput.trim();
    if (!targetId) return;
    
    const team = teams.find(t => t.team_id === targetId || t.id === targetId);
    if (team) {
      if (team.check_in_status) {
        alert('This team is already checked in!');
      } else {
        const { error } = await supabase.from('teams').update({ 
          check_in_status: true,
          check_in_time: new Date().toISOString(),
          checked_in_by: volunteerName
        }).eq('id', team.id);
        
        if (!error) {
          alert(`Successfully checked in ${team.team_name}!`);
          fetchTeams();
        } else {
          alert('Error checking in. Please try again.');
        }
      }
    } else {
      alert('Team not found in Round 3! Please verify the ID.');
    }
    setQrCodeInput('');
    setScanMode(false);
  };

  const checkedInCount = teams.filter(t => t.check_in_status).length;

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans selection:bg-purple-200 text-slate-900">
      
      {/* Navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 bg-[#f5f5f7]/80 backdrop-blur-2xl border-b border-[#d2d2d7]/50 px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <img src="/logos/zephyr-logo-new.png" alt="Zephyr" className="h-8 object-contain" />
          <span className="font-bold text-lg hidden sm:block">Volunteer Portal</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full">
            {volunteerName}
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('isVolunteerAuthenticated');
              localStorage.removeItem('volunteerName');
              navigate('/volunteer-login');
            }} 
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Round 3 Check-In</h1>
            <p className="text-slate-500">Scan QR codes or enter Team IDs to mark finalists as arrived.</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 text-center shrink-0">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Teams Arrived</div>
            <div className="text-3xl font-bold text-purple-600">{checkedInCount} <span className="text-xl text-slate-400 font-medium">/ {teams.length}</span></div>
          </div>
        </div>

        {/* Scanner Box */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
          
          <div className="max-w-xl mx-auto text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Scan Participant ID</h2>
            <p className="text-slate-500 mb-8 text-sm">Focus your barcode scanner here, or manually type the Team ID below.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button type="button" variant={!scanMode ? 'default' : 'outline'} onClick={() => setScanMode(false)} className={`min-h-[44px] ${!scanMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-slate-600'}`}>
                <QrCode className="w-4 h-4 mr-2" /> Manual / USB Scanner
              </Button>
              <Button type="button" variant={scanMode ? 'default' : 'outline'} onClick={() => setScanMode(true)} className={`min-h-[44px] ${scanMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-slate-600'}`}>
                <Camera className="w-4 h-4 mr-2" /> Use Phone Camera
              </Button>
            </div>

            {!scanMode ? (
              <form onSubmit={(e) => handleCheckIn(e)} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Input 
                  autoFocus
                  placeholder="e.g. MS-2026-0001"
                  value={qrCodeInput}
                  onChange={(e) => setQrCodeInput(e.target.value)}
                  className="max-w-md h-12 text-lg text-center font-mono shadow-inner border-slate-300"
                />
                <Button type="submit" disabled={!qrCodeInput.trim()} className="bg-purple-600 hover:bg-purple-700 text-white h-12 px-8 rounded-xl font-bold text-lg shadow-sm">
                  Verify
                </Button>
              </form>
            ) : (
              <div className="max-w-sm mx-auto rounded-2xl overflow-hidden border-4 border-purple-100 shadow-inner bg-black">
                <Scanner 
                  onScan={(result) => {
                    if (result && result.length > 0) {
                      handleCheckIn(null, result[0].rawValue);
                    }
                  }} 
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Checkins / List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">R3 Team List & Contact Info</h3>
            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              {teams.length} Total Teams
            </span>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {teams.map(team => (
                <div key={team.id} className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 ${team.check_in_status ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      {team.check_in_status ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{team.team_name}</h4>
                      <div className="text-sm font-mono text-slate-500 mb-1">{team.team_id}</div>
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Leader:</span> {team.leader_name} • <span className="font-semibold text-slate-700">Mobile:</span> {team.leader_mobile}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end md:ml-auto pl-14 md:pl-0">
                    {team.check_in_status ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                          Checked In
                        </span>
                        {team.checked_in_by && (
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold text-right">
                            By {team.checked_in_by}
                            <br/>
                            {team.check_in_time && new Date(team.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {teams.length === 0 && (
                <div className="p-12 text-center text-slate-500">No teams found in Round 3.</div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
