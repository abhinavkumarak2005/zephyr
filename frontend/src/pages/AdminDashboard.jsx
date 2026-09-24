import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Search, Box, Users, ShieldCheck, Trophy, CreditCard, Activity, FileText, UploadCloud, ChevronDown, ChevronUp, Copy, Check, XCircle, Send, Link as LinkIcon, LogOut, Mail, Phone, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getUtrMismatchEmailTemplate } from '../utils/emailTemplates';

export default function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [metrics, setMetrics] = useState({ profileCount: 0 });
  const [globalSettings, setGlobalSettings] = useState({ broadcast_notice: '', registration_status: 'auto' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('master');
  const [round2SubTab, setRound2SubTab] = useState('payment'); // 'payment', 'eval', 'publish'
  const [rosterSubTab, setRosterSubTab] = useState('all'); // 'all', 'r2', 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPS, setFilterPS] = useState('ALL');
  
  // Grading Modal State
  const [isGrading, setIsGrading] = useState(null); // team object
  const [gradeData, setGradeData] = useState({
    ps_fit: 5, ai_depth: 5, tech_impl: 5, innovation: 5, 
    impact: 5, business: 5, presentation: 5, absent: false
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Roster Expanded Row State
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Selected teams for Publish
  const [selectedToPublish, setSelectedToPublish] = useState([]);

  // Notice State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [noticeLoading, setNoticeLoading] = useState(false);

  // R1 Logic State
  const [rejectR1Team, setRejectR1Team] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [conditionalTeam, setConditionalTeam] = useState(null);
  const [conditionalReason, setConditionalReason] = useState('');

  // R3 Check-in
  const [qrCodeInput, setQrCodeInput] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isAdminAuthenticated') !== 'true') {
      navigate('/admin-login');
      return;
    }
    fetchTeams();
  }, [navigate]);

  const fetchTeams = async () => {
    setLoading(true);
    const { data: teamData, error: teamErr } = await supabase
      .from('teams')
      .select('*, problem_statements(title), team_members(*)')
      .order('created_at', { ascending: false });
      
    const { data: evalData, error: evalErr } = await supabase
      .from('evaluations')
      .select('*');

    const { data: volData } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: true });

    const { data: psData } = await supabase.from('problem_statements').select('*').order('id', { ascending: true });
    const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: settingsData } = await supabase.from('global_settings').select('*').eq('id', 1).single();

    if (!teamErr) setTeams(teamData || []);
    if (!evalErr) setEvaluations(evalData || []);
    if (volData) setVolunteers(volData);
    if (psData) setProblemStatements(psData);
    if (settingsData) setGlobalSettings(settingsData);
    setMetrics({ profileCount: profileCount || 0 });
    
    setLoading(false);
  };

  const handlePromoteToRound2 = async (teamId) => {
    await supabase.from('teams').update({ current_round: 2 }).eq('id', teamId);
    fetchTeams();
  };

  const handleRejectIdea = async (e) => {
    e.preventDefault();
    if (!rejectR1Team) return;
    await supabase.from('teams').update({ is_eliminated: true, rejection_reason: rejectionReason }).eq('id', rejectR1Team.id);
    setRejectR1Team(null);
    setRejectionReason('');
    fetchTeams();
  };

  const handleConditionalSelection = async (e) => {
    e.preventDefault();
    if (!conditionalTeam) return;
    await supabase.from('teams').update({ conditional_selection_reason: conditionalReason }).eq('id', conditionalTeam.id);
    setConditionalTeam(null);
    setConditionalReason('');
    fetchTeams();
  };

  const handleVerifyPayment = async (teamId) => {
    await supabase.from('teams').update({ payment_status: 'paid' }).eq('id', teamId);
    fetchTeams();
  };

  const handleRejectPayment = async (team) => {
    if (window.confirm(`Are you sure you want to mark UTR as mismatched and send an email to ${team.team_name}?`)) {
      await supabase.from('teams').update({ payment_status: 'rejected' }).eq('id', team.id);
      fetchTeams();

      const leader = team.team_members?.find(m => m.is_leader);
      if (leader?.email) {
        try {
          const htmlContent = getUtrMismatchEmailTemplate(leader.name || 'Team Leader', team.team_name, 'https://zephyrptu.site/dashboard');
          
          await supabase.functions.invoke('send-email', {
            body: {
              to: leader.email,
              subject: 'Action Required: Zephyr Hackathon UTR Mismatch',
              htmlContent: htmlContent
            }
          });
          
          alert(`Reminder email successfully sent to ${leader.email} to update their UTR`);
        } catch (error) {
          console.error("Failed to send email", error);
          alert('Status updated, but failed to send email. Check console.');
        }
      }
    }
  };

  const calculateTotalScore = (data) => {
    return Number(data.ps_fit) + Number(data.ai_depth) + Number(data.tech_impl) + Number(data.innovation) + 
           Number(data.impact) + Number(data.business) + Number(data.presentation);
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    const existingEval = evaluations.find(ev => ev.team_id === isGrading.id && ev.round_number === 2);
    
    const payload = {
      team_id: isGrading.id,
      round_number: 2,
      is_absent: gradeData.absent,
      ps_fit: gradeData.absent ? null : gradeData.ps_fit,
      ai_depth: gradeData.absent ? null : gradeData.ai_depth,
      tech_impl: gradeData.absent ? null : gradeData.tech_impl,
      innovation: gradeData.absent ? null : gradeData.innovation,
      impact: gradeData.absent ? null : gradeData.impact,
      business: gradeData.absent ? null : gradeData.business,
      presentation: gradeData.absent ? null : gradeData.presentation,
      total_score: gradeData.absent ? null : calculateTotalScore(gradeData)
    };

    if (existingEval) {
      await supabase.from('evaluations').update(payload).eq('id', existingEval.id);
    } else {
      await supabase.from('evaluations').insert([payload]);
    }
    
    await fetchTeams();
    setIsGrading(null);
    setSaveLoading(false);
  };

  const handlePublishResults = async () => {
    if (selectedToPublish.length === 0) return;
    
    // 1. Mark evaluations as published
    const evalIdsToPublish = evaluations
      .filter(ev => selectedToPublish.includes(ev.team_id) && ev.round_number === 2)
      .map(ev => ev.id);
      
    if (evalIdsToPublish.length > 0) {
      await supabase.from('evaluations').update({ is_published: true }).in('id', evalIdsToPublish);
    }
    
    // 2. Promote selected to Round 3
    await supabase.from('teams').update({ current_round: 3 }).in('id', selectedToPublish);
    
    setSelectedToPublish([]);
    fetchTeams();
  };

  const handleDisqualifyFromRound2 = async () => {
    if (selectedToPublish.length === 0) return;
    
    // 1. Mark evaluations as published
    const evalIdsToPublish = evaluations
      .filter(ev => selectedToPublish.includes(ev.team_id) && ev.round_number === 2)
      .map(ev => ev.id);
      
    if (evalIdsToPublish.length > 0) {
      await supabase.from('evaluations').update({ is_published: true }).in('id', evalIdsToPublish);
    }
    
    // 2. Disqualify selected teams
    await supabase.from('teams').update({ is_eliminated: true }).in('id', selectedToPublish);
    
    setSelectedToPublish([]);
    fetchTeams();
  };

  // Copy to Clipboard Helpers
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllLeadersEmails = () => {
    const emails = teams.flatMap(t => t.team_members?.filter(m => m.is_leader).map(m => m.email) || []);
    handleCopy(emails.join(', '));
    alert('Copied all Leader emails to clipboard!');
  };

  const copyAllMembersEmails = () => {
    const emails = teams.flatMap(t => t.team_members?.map(m => m.email) || []);
    handleCopy(emails.join(', '));
    alert('Copied all Member emails to clipboard!');
  };

  const copyAllMembersPhones = () => {
    const phones = teams.flatMap(t => t.team_members?.map(m => m.phone).filter(p => p) || []);
    handleCopy(phones.join(', '));
    alert('Copied all Member phones to clipboard!');
  };

  const filteredTeams = teams.filter(t => 
    (filterPS === 'ALL' || t.problem_statement_id?.toString() === filterPS) &&
    (
      t.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.team_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.payment_utr_number?.includes(searchQuery)
    )
  );

  const r1Teams = filteredTeams.filter(t => (t.current_round || 1) === 1 && !t.is_eliminated);
  const r2TeamsAll = filteredTeams.filter(t => t.current_round === 2 && !t.is_eliminated);
  const r2TeamsEvaluations = r2TeamsAll.filter(t => t.payment_status === 'paid');
  const r3Teams = filteredTeams.filter(t => t.current_round === 3 && !t.is_eliminated);

  // Evaluated Teams for Publish Tab
  const evaluatedR2Teams = r2TeamsEvaluations
    .filter(t => evaluations.some(ev => ev.team_id === t.id && ev.round_number === 2))
    .sort((a, b) => {
      const evalA = evaluations.find(ev => ev.team_id === a.id && ev.round_number === 2);
      const evalB = evaluations.find(ev => ev.team_id === b.id && ev.round_number === 2);
      const scoreA = evalA?.total_score || 0;
      const scoreB = evalB?.total_score || 0;
      return scoreB - scoreA;
    });

  // Team Roster Data
  const getRosterTeams = () => {
    if (rosterSubTab === 'r1') return filteredTeams.filter(t => (t.current_round || 1) === 1 && !t.is_eliminated);
    if (rosterSubTab === 'r2') return filteredTeams.filter(t => t.current_round === 2 && !t.is_eliminated);
    if (rosterSubTab === 'r2_disqualified') return filteredTeams.filter(t => t.current_round === 2 && t.is_eliminated);
    if (rosterSubTab === 'r3') return filteredTeams.filter(t => t.current_round === 3 && !t.is_eliminated);
    if (rosterSubTab === 'utr_mismatch') return filteredTeams.filter(t => t.payment_status === 'rejected');
    if (rosterSubTab === 'all_disqualified') return filteredTeams.filter(t => t.is_eliminated);
    return filteredTeams;
  };

  const handleBroadcastNotice = async (e, clear = false) => {
    e?.preventDefault();
    const newText = clear ? null : noticeText;
    if (!clear && !noticeText.trim()) return;

    setNoticeLoading(true);
    await supabase.from('global_settings').upsert({ id: 1, broadcast_notice: newText, registration_status: globalSettings?.registration_status || 'auto' });
    
    setIsNoticeModalOpen(false);
    setNoticeText('');
    setNoticeLoading(false);
    fetchTeams();
    alert(clear ? 'Notice removed!' : 'Notice broadcasted globally to all teams!');
  };

  const handleUpdateRegistrationStatus = async (status) => {
    await supabase.from('global_settings').update({ registration_status: status }).eq('id', 1);
    fetchTeams();
    alert(`Registration status updated to: ${status.toUpperCase()}`);
  };

  const handleCheckIn = async (e) => {
    e?.preventDefault();
    if (!qrCodeInput.trim()) return;
    const team = teams.find(t => t.team_id === qrCodeInput.trim() || t.id === qrCodeInput.trim());
    if (team) {
      if (team.check_in_status) {
        alert('This team is already checked in!');
      } else {
        await supabase.from('teams').update({ check_in_status: true }).eq('id', team.id);
        alert(`Successfully checked in ${team.team_name}!`);
        fetchTeams();
      }
    } else {
      alert('Team not found! Please verify the ID.');
    }
    setQrCodeInput('');
  };

  const [newVolEmail, setNewVolEmail] = useState('');
  const [newVolPassword, setNewVolPassword] = useState('');
  const [newVolName, setNewVolName] = useState('');

  const handleAddVolunteer = async (e) => {
    e.preventDefault();
    if (!newVolEmail || !newVolPassword || !newVolName) return;
    
    const { error } = await supabase.from('volunteers').insert([{
      email: newVolEmail,
      password: newVolPassword,
      name: newVolName
    }]);

    if (error) {
      alert(error.message);
    } else {
      setNewVolEmail('');
      setNewVolPassword('');
      setNewVolName('');
      fetchTeams();
    }
  };

  const handleDeleteVolunteer = async (id) => {
    if (window.confirm('Are you sure you want to delete this volunteer?')) {
      await supabase.from('volunteers').delete().eq('id', id);
      fetchTeams();
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-blue-200">
      
      {/* Sidebar - Apple Style */}
      <aside className="hidden w-64 flex-col bg-[#f5f5f7]/80 backdrop-blur-2xl border-r border-[#d2d2d7]/50 md:flex fixed h-full z-20">
        <div className="flex flex-col items-center justify-center pt-8 pb-4 border-b border-[#d2d2d7]/50 mb-2">
          <div className="flex flex-col items-center gap-3">
            <img src="/favicon.jpg" alt="FIR Logo" className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-white border border-slate-200" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Admin Console</span>
          </div>
        </div>
        
        <div className="px-4 py-4 space-y-1">
          <p className="px-2 text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-2">Overview</p>
          <button onClick={() => setActiveTab('master')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'master' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
            <div className="flex items-center gap-3"><Activity className="w-4 h-4" /><span className="font-medium text-sm">Master Dashboard</span></div>
          </button>

          <p className="px-2 text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-2 mt-6">Hackathon Rounds</p>
          
          <button onClick={() => setActiveTab('round1')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'round1' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
            <div className="flex items-center gap-3"><UploadCloud className="w-4 h-4" /><span className="font-medium text-sm">Round 1 (Ideas)</span></div>
            {r1Teams.length > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'round1' ? 'bg-white/20' : 'bg-[#e8e8ed] text-[#86868b]'}`}>{r1Teams.length}</span>}
          </button>

          <button onClick={() => setActiveTab('round2')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'round2' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
            <div className="flex items-center gap-3"><Activity className="w-4 h-4" /><span className="font-medium text-sm">Round 2 (Live)</span></div>
          </button>

          <button onClick={() => setActiveTab('round3')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'round3' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
            <div className="flex items-center gap-3"><Trophy className="w-4 h-4" /><span className="font-medium text-sm">Round 3 (Finals)</span></div>
          </button>

          <p className="px-2 text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-2 mt-6">Management</p>
          
          <button onClick={() => setActiveTab('roster')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'roster' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
            <div className="flex items-center gap-3"><Users className="w-4 h-4" /><span className="font-medium text-sm">Team Roster & Export</span></div>
          </button>

          <button onClick={() => setActiveTab('volunteers')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'volunteers' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
            <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4" /><span className="font-medium text-sm">Volunteers</span></div>
          </button>
          
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
            <div className="flex items-center gap-3"><Activity className="w-4 h-4" /><span className="font-medium text-sm">Settings</span></div>
          </button>
        </div>

        <div className="flex-1" />
        
        <div className="p-4 mt-auto border-t border-[#d2d2d7]/50 flex flex-col gap-2">
          <button 
            onClick={() => { setNoticeText(globalSettings?.broadcast_notice || ''); setIsNoticeModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-medium text-sm border border-blue-200"
          >
            <Send className="w-4 h-4" /> Global Notice
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('isAdminAuthenticated');
              navigate('/admin-login');
            }} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-medium text-sm border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#f5f5f7]/80 backdrop-blur-2xl border-b border-[#d2d2d7]/50">
          <div className="flex h-auto md:h-16 flex-col md:flex-row items-start md:items-center gap-4 px-4 md:px-6 py-4 md:py-0">
            
            {/* Mobile Title & Action Buttons */}
            <div className="flex md:hidden w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/favicon.jpg" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                <span className="font-bold text-lg text-slate-900">Admin Console</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setNoticeText(globalSettings?.broadcast_notice || ''); setIsNoticeModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg border border-blue-100"><Send className="w-4 h-4" /></button>
                <button onClick={() => { localStorage.removeItem('isAdminAuthenticated'); navigate('/admin-login'); }} className="p-2 text-red-600 bg-red-50 rounded-lg border border-red-100"><LogOut className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Mobile Nav Tabs */}
            <div className="flex md:hidden w-full overflow-x-auto pb-2 -mx-4 px-4 gap-2 snap-x" style={{ scrollbarWidth: 'none' }}>
              {[
                { id: 'master', label: 'Overview' },
                { id: 'round1', label: 'Round 1' },
                { id: 'round2', label: 'Round 2' },
                { id: 'round3', label: 'Round 3' },
                { id: 'roster', label: 'Team Roster' },
                { id: 'volunteers', label: 'Volunteers' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)} 
                  className={`shrink-0 snap-start px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full md:max-w-2xl mt-1 md:mt-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input 
                  type="text" 
                  placeholder="Search by Team Name, ID, or UTR..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#d2d2d7] rounded-full py-2 md:py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
              
              {activeTab !== 'master' && (
                <select
                  value={filterPS}
                  onChange={(e) => setFilterPS(e.target.value)}
                  className="bg-white border border-[#d2d2d7] rounded-full px-4 py-2 md:py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm sm:min-w-[200px]"
                >
                  <option value="ALL">All Problem Statements</option>
                  {problemStatements.map(ps => (
                    <option key={ps.id} value={ps.id.toString()}>PS-{ps.id}: {ps.domain || ps.title.split(':')[0]}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Area */}
        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full relative">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* MASTER DASHBOARD VIEW */}
              {activeTab === 'master' && (
                <motion.div key="master" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Master Analytics Overview</h1>
                    <p className="text-[#86868b]">High-level metrics and statistics for the hackathon.</p>
                  </div>

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d2d2d7]/50">
                      <p className="text-[#86868b] text-sm font-semibold mb-2 flex items-center gap-2"><Users className="w-4 h-4"/> Grand Total Teams</p>
                      <p className="text-3xl font-bold text-[#1d1d1f]">{teams.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d2d2d7]/50">
                      <p className="text-[#86868b] text-sm font-semibold mb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> Drop-offs</p>
                      <p className="text-3xl font-bold text-amber-600">{Math.max(0, metrics.profileCount - teams.length)}</p>
                      <p className="text-xs text-[#86868b] mt-1">Stuck Name Entry</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d2d2d7]/50">
                      <p className="text-[#86868b] text-sm font-semibold mb-2 flex items-center gap-2"><Trophy className="w-4 h-4"/> R2 Qualified</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {teams.filter(t => t.current_round >= 2 && !t.is_eliminated).length} 
                        <span className="text-lg text-[#86868b] font-normal"> / {teams.length}</span>
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d2d2d7]/50">
                      <p className="text-[#86868b] text-sm font-semibold mb-2 flex items-center gap-2"><Trophy className="w-4 h-4"/> R3 Finalists</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {teams.filter(t => t.current_round === 3 && !t.is_eliminated).length} 
                        <span className="text-lg text-[#86868b] font-normal"> / {teams.length}</span>
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d2d2d7]/50">
                      <p className="text-[#86868b] text-sm font-semibold mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Total Revenue</p>
                      <p className="text-3xl font-bold text-blue-600">₹ {(teams.filter(t => t.payment_status === 'paid').length * 1000).toLocaleString()}</p>
                      <p className="text-xs text-[#86868b] mt-1">Confirmed Payments</p>
                    </div>
                  </div>

                  {/* Problem Statement Breakdown */}
                  <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                      <h3 className="font-semibold text-[#1d1d1f]">Problem Statement Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#d2d2d7]/50">
                          <th className="py-3 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider">PS ID</th>
                          <th className="py-3 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Title</th>
                          <th className="py-3 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Teams Registered</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d2d2d7]/50">
                        {problemStatements.map(ps => {
                          const count = teams.filter(t => t.problem_statement_id === ps.id).length;
                          return (
                            <tr key={ps.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                              <td className="py-3 px-6 font-mono text-sm font-semibold text-[#1d1d1f]">PS-{ps.id}</td>
                              <td className="py-3 px-6 text-sm text-[#1d1d1f]">{ps.domain || ps.title.split(':')[0]}</td>
                              <td className="py-3 px-6 text-right font-semibold text-blue-600">{count}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ROUND 1 VIEW */}
              {activeTab === 'round1' && (
                <motion.div key="r1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Round 1: Idea Submissions</h1>
                    <p className="text-[#86868b]">Review PPT presentations and qualify teams to Round 2.</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                    <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Team</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Topic</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Submission</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d2d2d7]/50">
                        {r1Teams.map(team => (
                          <tr key={team.id} className="hover:bg-[#f5f5f7]/50 transition-colors group">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-sm text-[#1d1d1f]">{team.team_name}</div>
                              <div className="text-xs text-[#86868b] font-mono mt-0.5">{team.team_id} • {team.team_members?.length || 0} Members</div>
                            </td>
                            <td className="py-4 px-4 max-w-[200px] truncate text-sm">
                              PS-{team.problem_statement_id}: {team.problem_statements?.title}
                            </td>
                            <td className="py-4 px-4">
                              {team.presentation_link ? (
                                <a href={team.presentation_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline bg-blue-50 px-2.5 py-1 rounded-full">
                                  <FileText className="w-3.5 h-3.5" /> View PPT
                                </a>
                              ) : (
                                <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-full">Awaiting Link</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right space-x-2">
                              <Button size="sm" onClick={() => handlePromoteToRound2(team.id)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm text-xs px-4">
                                Promote
                              </Button>
                              <Button size="sm" onClick={() => setConditionalTeam(team)} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full shadow-sm text-xs px-4">
                                Conditional
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setRejectR1Team(team)} className="border-red-200 text-red-600 hover:bg-red-50 rounded-full shadow-sm text-xs px-4">
                                Reject
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {r1Teams.length === 0 && (
                          <tr><td colSpan="4" className="text-center py-12 text-[#86868b]">No teams in Round 1 currently.</td></tr>
                        )}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ROUND 2 VIEW */}
              {activeTab === 'round2' && (
                <motion.div key="r2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Round 2: Live Presentations</h1>
                      <p className="text-[#86868b]">Verify payments, evaluate live pitches, and publish results.</p>
                    </div>
                    
                    <div className="flex bg-[#e8e8ed] p-1 rounded-full w-fit">
                      <button onClick={() => setRound2SubTab('payment')} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${round2SubTab === 'payment' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>
                        Payment Verifications ({r2TeamsAll.filter(t=>t.payment_status==='pending_verification').length})
                      </button>
                      <button onClick={() => setRound2SubTab('eval')} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${round2SubTab === 'eval' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>
                        Evaluations ({r2TeamsEvaluations.length})
                      </button>
                      <button onClick={() => setRound2SubTab('publish')} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${round2SubTab === 'publish' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>
                        Publish Results
                      </button>
                      <button onClick={() => setRound2SubTab('disqualified')} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${round2SubTab === 'disqualified' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>
                        Disqualified
                      </button>
                    </div>
                  </div>
                  
                  {round2SubTab === 'payment' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                      <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                            <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Team</th>
                            <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Contact</th>
                            <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">UTR Number</th>
                            <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Status / Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d2d2d7]/50">
                          {r2TeamsAll.map(team => (
                            <tr key={team.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-semibold text-sm text-[#1d1d1f]">{team.team_name}</div>
                                <div className="text-xs text-[#86868b] font-mono mt-0.5">{team.team_id}</div>
                              </td>
                              <td className="py-4 px-4 text-sm text-[#1d1d1f]">
                                {team.college}
                              </td>
                              <td className="py-4 px-4">
                                {team.payment_utr_number ? (
                                  <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-900 font-mono text-sm font-bold">
                                    <CreditCard className="w-4 h-4 text-amber-600" />
                                    {team.payment_utr_number}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-sm">Not Submitted</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                {team.payment_status === 'pending_verification' && (
                                  <div className="flex gap-2 justify-end">
                                    <Button size="sm" onClick={() => handleVerifyPayment(team.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-sm text-xs px-4">
                                      <ShieldCheck className="w-4 h-4 mr-1.5" /> Verify
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleRejectPayment(team)} className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 rounded-full shadow-sm text-xs px-4">
                                      Mismatch
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setRejectR1Team(team)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-full shadow-sm text-xs px-4">
                                      Disqualify
                                    </Button>
                                  </div>
                                )}
                                {team.payment_status === 'rejected' && (
                                  <div className="flex gap-2 justify-end">
                                    <Button size="sm" onClick={() => handleVerifyPayment(team.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-sm text-xs px-4">
                                      Rectified
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleRejectPayment(team)} className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 rounded-full shadow-sm text-xs px-4" title="Resend Mismatch Email">
                                      Mismatch
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setRejectR1Team(team)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-full shadow-sm text-xs px-4">
                                      Disqualify
                                    </Button>
                                  </div>
                                )}
                                {team.payment_status === 'paid' && (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-bold"><CheckCircle2 className="w-4 h-4"/> Verified</span>
                                )}
                                {team.payment_status === 'pending' && (
                                  <div className="flex items-center justify-end gap-3">
                                    <span className="text-slate-400 text-sm font-medium">Waiting on Team</span>
                                    <Button size="sm" variant="outline" onClick={() => setRejectR1Team(team)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-full shadow-sm text-xs px-4">
                                      Disqualify
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                          {r2TeamsAll.length === 0 && (
                            <tr><td colSpan="4" className="text-center py-12 text-[#86868b]">No teams in Round 2.</td></tr>
                          )}
                        </tbody>
                      </table>
                      </div>
                    </motion.div>
                  )}

                  {round2SubTab === 'eval' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                      <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                            <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Team</th>
                            <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Topic</th>
                            <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Score</th>
                            <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d2d2d7]/50">
                          {r2TeamsEvaluations.map(team => {
                            const evalData = evaluations.find(ev => ev.team_id === team.id && ev.round_number === 2);
                            return (
                              <tr key={team.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="font-semibold text-sm text-[#1d1d1f] flex items-center gap-2">
                                    {team.team_name}
                                  </div>
                                  <div className="text-xs text-[#86868b] font-mono mt-0.5">{team.team_id}</div>
                                </td>
                                <td className="py-4 px-4 text-sm max-w-[300px] truncate">
                                  PS-{team.problem_statement_id}: {team.problem_statements?.title}
                                </td>
                                <td className="py-4 px-4 text-sm font-medium">
                                  {evalData ? (
                                    evalData.is_absent ? <span className="text-red-500">Absent</span> : 
                                    <span className="text-blue-600 font-bold">{evalData.total_score} / 70</span>
                                  ) : <span className="text-slate-400">Not Graded</span>}
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <Button size="sm" onClick={() => {
                                    setIsGrading(team);
                                    setGradeData({
                                      ps_fit: evalData?.ps_fit || 5,
                                      ai_depth: evalData?.ai_depth || 5,
                                      tech_impl: evalData?.tech_impl || 5,
                                      innovation: evalData?.innovation || 5,
                                      impact: evalData?.impact || 5,
                                      business: evalData?.business || 5,
                                      presentation: evalData?.presentation || 5,
                                      absent: evalData?.is_absent || false
                                    });
                                  }} className="bg-slate-800 hover:bg-slate-900 text-white rounded-full shadow-sm text-xs px-4">
                                    {evalData ? 'Edit Grade' : 'Grade Team'}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                          {r2TeamsEvaluations.length === 0 && (
                            <tr><td colSpan="4" className="text-center py-12 text-[#86868b]">No teams are ready for evaluation yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                      </div>
                    </motion.div>
                  )}

                  {round2SubTab === 'publish' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-bold text-lg">Publish Round 2 Results</h3>
                          <p className="text-sm text-slate-500">Select passing teams below and click Promote. Or click Disqualify to eliminate them.</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleDisqualifyFromRound2} 
                            disabled={selectedToPublish.length === 0}
                            variant="outline"
                            className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 rounded-full px-6"
                          >
                            Disqualify Selected ({selectedToPublish.length})
                          </Button>
                          <Button 
                            onClick={handlePublishResults} 
                            disabled={selectedToPublish.length === 0}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
                          >
                            Promote Selected ({selectedToPublish.length})
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {evaluatedR2Teams.map(team => {
                          const evalData = evaluations.find(ev => ev.team_id === team.id && ev.round_number === 2);
                          const isSelected = selectedToPublish.includes(team.id);
                          return (
                            <div key={team.id} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-300'}`} onClick={() => {
                              setSelectedToPublish(prev => isSelected ? prev.filter(id => id !== team.id) : [...prev, team.id]);
                            }}>
                              <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'}`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-sm">{team.team_name} <span className="font-normal text-slate-500 text-xs ml-2">{team.team_id}</span></h4>
                              </div>
                              <div className="text-right">
                                {evalData.is_absent ? (
                                  <span className="text-red-600 font-bold text-sm">ABSENT</span>
                                ) : (
                                  <span className="font-bold text-lg text-blue-600">{evalData.total_score} <span className="text-sm font-normal text-slate-500">/ 70</span></span>
                                )}
                              </div>
                              {evalData.is_published && (
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full uppercase">Published</span>
                              )}
                            </div>
                          )
                        })}
                        {evaluatedR2Teams.length === 0 && (
                          <div className="text-center py-12 text-[#86868b]">No evaluated teams to publish yet. Please grade teams first.</div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {round2SubTab === 'disqualified' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden p-6">
                      <div className="mb-6">
                        <h3 className="font-bold text-lg">Disqualified Teams (Round 2)</h3>
                        <p className="text-sm text-slate-500">These teams were eliminated after Round 2 evaluations.</p>
                      </div>
                      
                      <div className="space-y-2">
                        {filteredTeams.filter(t => t.current_round === 2 && t.is_eliminated).map(team => {
                          const evalData = evaluations.find(ev => ev.team_id === team.id && ev.round_number === 2);
                          return (
                            <div key={team.id} className="flex items-center gap-4 p-4 border border-red-200 bg-red-50 rounded-xl">
                              <div className="flex-1">
                                <h4 className="font-bold text-sm text-red-900">{team.team_name} <span className="font-normal text-red-700/60 text-xs ml-2">{team.team_id}</span></h4>
                              </div>
                              <div className="text-right">
                                {evalData && evalData.is_absent ? (
                                  <span className="text-red-600 font-bold text-sm">ABSENT</span>
                                ) : evalData ? (
                                  <span className="font-bold text-lg text-red-800">{evalData.total_score} <span className="text-sm font-normal text-red-700/60">/ 70</span></span>
                                ) : (
                                  <span className="text-red-500 text-sm">Not Graded</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {filteredTeams.filter(t => t.current_round === 2 && t.is_eliminated).length === 0 && (
                          <div className="text-center py-12 text-[#86868b]">No teams have been disqualified in Round 2 yet.</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ROUND 3 VIEW */}
              {activeTab === 'round3' && (
                <motion.div key="r3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
                    <div>
                      <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2 flex items-center gap-2">
                        <Trophy className="w-8 h-8 text-purple-600" /> Round 3: In-Person Finals
                      </h1>
                      <p className="text-[#86868b]">The final teams competing for the grand prize and their on-campus check-in status.</p>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 text-center shrink-0">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Attendance</div>
                      <div className="text-3xl font-bold text-purple-600">{r3Teams.filter(t => t.check_in_status).length} <span className="text-xl text-slate-400 font-medium">/ {r3Teams.length}</span></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                    <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Team</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Contact</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Topic</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Check-in Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d2d2d7]/50">
                        {r3Teams.map(team => (
                          <tr key={team.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-sm text-[#1d1d1f]">{team.team_name}</div>
                              <div className="text-xs text-[#86868b] font-mono mt-0.5">{team.team_id}</div>
                            </td>
                            <td className="py-4 px-4 text-sm">
                              <div className="font-medium text-slate-900">{team.leader_name}</div>
                              <div className="text-slate-500 text-xs">{team.leader_mobile}</div>
                            </td>
                            <td className="py-4 px-4 text-sm text-[#1d1d1f] max-w-[200px] truncate" title={team.problem_statements?.title}>
                              {team.problem_statements?.title}
                            </td>
                            <td className="py-4 px-4 text-right">
                              {team.check_in_status ? (
                                <div className="flex flex-col items-end">
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full mb-1">
                                    Checked In
                                  </span>
                                  {team.checked_in_by && (
                                    <div className="text-[10px] text-slate-500 font-medium">
                                      By <span className="font-semibold text-slate-700">{team.checked_in_by}</span>
                                      <br/>
                                      {team.check_in_time && new Date(team.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {r3Teams.length === 0 && (
                          <tr><td colSpan="4" className="text-center py-12 text-[#86868b]">No teams are in Round 3 yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TEAM ROSTER VIEW */}
              {activeTab === 'roster' && (
                <motion.div key="roster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Team Roster & Export</h1>
                      <p className="text-[#86868b]">View complete team details and export contact information.</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={copyAllLeadersEmails} variant="outline" size="sm" className="gap-2 bg-white"><Copy className="w-4 h-4"/> Copy Leader Emails</Button>
                      <Button onClick={copyAllMembersEmails} variant="outline" size="sm" className="gap-2 bg-white"><Copy className="w-4 h-4"/> Copy All Emails</Button>
                      <Button onClick={copyAllMembersPhones} variant="outline" size="sm" className="gap-2 bg-white"><Copy className="w-4 h-4"/> Copy All Phones</Button>
                    </div>
                  </div>

                  <div className="flex bg-[#e8e8ed] p-1 rounded-full w-full max-w-full overflow-x-auto no-scrollbar mb-6">
                    <button onClick={() => setRosterSubTab('all')} className={`px-4 py-1.5 whitespace-nowrap text-sm font-medium rounded-full transition-all shrink-0 ${rosterSubTab === 'all' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>All Teams</button>
                    <button onClick={() => setRosterSubTab('r1')} className={`px-4 py-1.5 whitespace-nowrap text-sm font-medium rounded-full transition-all shrink-0 ${rosterSubTab === 'r1' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>Round 1</button>
                    <button onClick={() => setRosterSubTab('r2')} className={`px-4 py-1.5 whitespace-nowrap text-sm font-medium rounded-full transition-all shrink-0 ${rosterSubTab === 'r2' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>Round 2</button>
                    <button onClick={() => setRosterSubTab('r2_disqualified')} className={`px-4 py-1.5 whitespace-nowrap text-sm font-medium rounded-full transition-all shrink-0 ${rosterSubTab === 'r2_disqualified' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>R2 Disqualified</button>
                    <button onClick={() => setRosterSubTab('utr_mismatch')} className={`px-4 py-1.5 whitespace-nowrap text-sm font-medium rounded-full transition-all shrink-0 ${rosterSubTab === 'utr_mismatch' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>UTR Mismatch</button>
                    <button onClick={() => setRosterSubTab('r3')} className={`px-4 py-1.5 whitespace-nowrap text-sm font-medium rounded-full transition-all shrink-0 ${rosterSubTab === 'r3' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>R3 Finalists</button>
                    <button onClick={() => setRosterSubTab('all_disqualified')} className={`px-4 py-1.5 whitespace-nowrap text-sm font-medium rounded-full transition-all shrink-0 ${rosterSubTab === 'all_disqualified' ? 'bg-white shadow-sm text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>All Disqualified</button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                    <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Team ID</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Team Name</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Round</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Payment</th>
                          <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#d2d2d7]/50">
                        {getRosterTeams().map(team => (
                          <React.Fragment key={team.id}>
                            <tr className="hover:bg-[#f5f5f7]/50 transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === team.id ? null : team.id)}>
                              <td className="py-4 px-4 font-mono text-sm text-[#86868b]">{team.team_id}</td>
                              <td className="py-4 px-4 font-bold text-sm text-[#1d1d1f]">{team.team_name}</td>
                              <td className="py-4 px-4 text-sm"><span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">R{team.current_round}</span></td>
                              <td className="py-4 px-4 text-sm">
                                {team.payment_status === 'paid' ? <span className="text-emerald-600 font-bold">Verified</span> : <span className="text-slate-400">Unverified</span>}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                  {expandedRow === team.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                </Button>
                              </td>
                            </tr>
                            {expandedRow === team.id && (
                              <tr className="bg-[#f5f5f7]/30 border-b border-[#d2d2d7]/50">
                                <td colSpan="5" className="px-8 py-6">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-slate-900">Team Members ({team.team_members?.length})</h4>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" className="h-7 text-xs bg-white" onClick={() => handleCopy(team.team_members.map(m=>m.email).join(', '))}>Copy Emails</Button>
                                      <Button size="sm" variant="outline" className="h-7 text-xs bg-white" onClick={() => handleCopy(team.team_members.map(m=>m.phone).filter(p=>p).join(', '))}>Copy Phones</Button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {team.team_members?.map(member => (
                                      <div key={member.id} className="bg-white p-3 rounded-xl border border-slate-200">
                                        <div className="font-bold text-sm flex items-center justify-between">
                                          {member.name}
                                          {member.is_leader && <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded uppercase">Leader</span>}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-2 space-y-1">
                                          <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {member.email}</p>
                                          <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {member.phone || 'N/A'}</p>
                                          <p className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {member.college}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                                    <h4 className="font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Project Details</h4>
                                    
                                    <div className="mb-4">
                                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Presentation Link</span>
                                      {team.presentation_link ? (
                                        <a href={team.presentation_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-all font-medium flex items-center gap-1 w-fit">
                                          <LinkIcon className="w-4 h-4 shrink-0"/> {team.presentation_link}
                                        </a>
                                      ) : (
                                        <span className="text-sm text-slate-400 italic">No presentation submitted yet.</span>
                                      )}
                                    </div>

                                    <div>
                                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Idea Description</span>
                                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {team.idea_description || <span className="text-slate-400 italic">No description provided.</span>}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </motion.div>
              )}
              {/* VOLUNTEERS TAB */}
              {activeTab === 'volunteers' && (
                <motion.div key="volunteers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Volunteer Management</h1>
                    <p className="text-[#86868b]">Manage volunteer accounts for QR check-ins.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d2d2d7]/50">
                        <h3 className="font-bold text-[#1d1d1f] mb-4">Add Volunteer</h3>
                        <form onSubmit={handleAddVolunteer} className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold text-[#86868b] uppercase tracking-widest mb-1 block">Name</label>
                            <Input placeholder="Volunteer Name" value={newVolName} onChange={e => setNewVolName(e.target.value)} required className="w-full" />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-[#86868b] uppercase tracking-widest mb-1 block">Email</label>
                            <Input type="email" placeholder="Email Address" value={newVolEmail} onChange={e => setNewVolEmail(e.target.value)} required className="w-full" />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-[#86868b] uppercase tracking-widest mb-1 block">Password</label>
                            <Input placeholder="Password" value={newVolPassword} onChange={e => setNewVolPassword(e.target.value)} required className="w-full" />
                          </div>
                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Create Account</Button>
                        </form>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                              <th className="py-3 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Name</th>
                              <th className="py-3 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Email & Password</th>
                              <th className="py-3 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#d2d2d7]/50">
                            {volunteers.map(vol => (
                              <tr key={vol.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                                <td className="py-4 px-6 font-semibold text-[#1d1d1f]">{vol.name}</td>
                                <td className="py-4 px-6 text-sm text-[#1d1d1f]">
                                  <div>{vol.email}</div>
                                  <div className="text-slate-500 font-mono text-xs mt-1">pwd: {vol.password}</div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <Button size="sm" variant="outline" onClick={() => handleDeleteVolunteer(vol.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            ))}
                            {volunteers.length === 0 && (
                              <tr><td colSpan="3" className="text-center py-12 text-[#86868b]">No volunteers created yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Global Settings</h1>
                    <p className="text-[#86868b]">Manage application-wide configurations and controls.</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-2xl">
                    <h3 className="font-bold text-[#1d1d1f] mb-2 text-lg">Registration Control</h3>
                    <p className="text-slate-500 mb-6 text-sm">
                      Control whether new users can register their teams. By default (Auto), registration will close automatically at EOD on Oct 4th, 2026.
                    </p>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleUpdateRegistrationStatus('auto')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border ${globalSettings.registration_status === 'auto' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className={`font-semibold ${globalSettings.registration_status === 'auto' ? 'text-blue-700' : 'text-slate-800'}`}>Auto (Default)</span>
                          <span className="text-sm text-slate-500">Closes automatically on Oct 4th, 2026 EOD</span>
                        </div>
                        {globalSettings.registration_status === 'auto' && <CheckCircle2 className="text-blue-600 w-5 h-5" />}
                      </button>

                      <button 
                        onClick={() => handleUpdateRegistrationStatus('open')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border ${globalSettings.registration_status === 'open' ? 'bg-green-50 border-green-200 ring-1 ring-green-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className={`font-semibold ${globalSettings.registration_status === 'open' ? 'text-green-700' : 'text-slate-800'}`}>Force Open</span>
                          <span className="text-sm text-slate-500">Allow registrations regardless of the current date</span>
                        </div>
                        {globalSettings.registration_status === 'open' && <CheckCircle2 className="text-green-600 w-5 h-5" />}
                      </button>

                      <button 
                        onClick={() => handleUpdateRegistrationStatus('closed')}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border ${globalSettings.registration_status === 'closed' ? 'bg-red-50 border-red-200 ring-1 ring-red-600' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className={`font-semibold ${globalSettings.registration_status === 'closed' ? 'text-red-700' : 'text-slate-800'}`}>Force Closed</span>
                          <span className="text-sm text-slate-500">Immediately stop accepting new registrations</span>
                        </div>
                        {globalSettings.registration_status === 'closed' && <CheckCircle2 className="text-red-600 w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Grading Modal */}
      {isGrading && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-xl text-slate-900">Evaluate Team</h3>
              <button type="button" onClick={() => setIsGrading(null)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleSaveEvaluation} className="block">
              <div className="p-6">
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                  <div>
                    <h4 className="font-bold text-sm">Mark Absent</h4>
                    <p className="text-xs text-slate-500">Team did not attend the live presentation.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={gradeData.absent} onChange={e => setGradeData({...gradeData, absent: e.target.checked})} />
                </div>

                {!gradeData.absent && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {[
                        { key: 'ps_fit', label: 'Problem-Solution Fit' },
                        { key: 'ai_depth', label: 'AI Integration Depth' },
                        { key: 'tech_impl', label: 'Technical Implementation' },
                        { key: 'innovation', label: 'Innovation & Creativity' },
                        { key: 'impact', label: 'Impact & Scalability' },
                        { key: 'business', label: 'Business Viability' },
                        { key: 'presentation', label: 'Presentation & Pitch' }
                      ].map((category) => (
                        <div key={category.key} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700">{category.label}</label>
                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{gradeData[category.key]} / 10</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            step="1"
                            value={gradeData[category.key]}
                            onChange={e => setGradeData({...gradeData, [category.key]: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
                            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mt-8">
                      <p className="text-sm text-blue-800 text-center font-bold">
                        Total Score: <span className="text-3xl">{calculateTotalScore(gradeData)}</span> / 70
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 border-t border-slate-100 bg-white">
                <Button type="submit" disabled={saveLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-lg">
                  {saveLoading ? 'Saving...' : 'Save Evaluation'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Broadcast Notice Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-xl text-slate-900">Global Broadcast Notice</h3>
              <button type="button" onClick={() => setIsNoticeModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleBroadcastNotice} className="block">
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">
                  This message will be displayed at the top of the participant dashboard for all teams across all rounds.
                </p>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-32"
                  placeholder="Enter notice message here... (e.g. Please bring your laptops for the final presentation.)"
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  required
                />
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                {globalSettings?.broadcast_notice ? (
                  <Button type="button" onClick={(e) => handleBroadcastNotice(e, true)} variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl">Clear Notice</Button>
                ) : <div />}
                <div className="flex gap-3">
                  <Button type="button" onClick={() => setIsNoticeModalOpen(false)} variant="outline" className="rounded-xl">Cancel</Button>
                  <Button type="submit" disabled={noticeLoading || !noticeText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
                    {noticeLoading ? 'Saving...' : 'Broadcast Notice'}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Reject Team Modal */}
      {rejectR1Team && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden">
            <div className="p-6 border-b border-red-100 flex justify-between items-center bg-red-50">
              <h3 className="font-bold text-xl text-red-900">Reject Application</h3>
              <button type="button" onClick={() => {setRejectR1Team(null); setRejectionReason('');}} className="text-red-400 hover:text-red-600"><XCircle className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleRejectIdea} className="block">
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">
                  You are about to disqualify <strong>{rejectR1Team.team_name}</strong>. Please provide a reason for the rejection (e.g. UTR mismatch, copied idea). This will be shown to the participant.
                </p>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none h-32"
                  placeholder="Enter rejection reason here..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button type="button" onClick={() => {setRejectR1Team(null); setRejectionReason('');}} variant="outline" className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={!rejectionReason.trim()} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6">
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Conditional Selection Modal */}
      {conditionalTeam && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative overflow-hidden">
            <div className="p-6 border-b border-blue-100 flex justify-between items-center bg-blue-50">
              <h3 className="font-bold text-xl text-blue-900">Conditional Selection</h3>
              <button type="button" onClick={() => {setConditionalTeam(null); setConditionalReason('');}} className="text-blue-400 hover:text-blue-600"><XCircle className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleConditionalSelection} className="block">
              <div className="p-6">
                <p className="text-sm text-slate-600 mb-4">
                  Set conditions for <strong>{conditionalTeam.team_name}</strong> before they are officially selected for the next round.
                </p>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-32"
                  placeholder="e.g. Please update your presentation to include a financial model..."
                  value={conditionalReason}
                  onChange={(e) => setConditionalReason(e.target.value)}
                  required
                />
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button type="button" onClick={() => {setConditionalTeam(null); setConditionalReason('');}} variant="outline" className="rounded-xl">Cancel</Button>
                <Button type="submit" disabled={!conditionalReason.trim()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
                  Save Condition
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
