import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { LogOut, Mail, Phone, GraduationCap, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "../components/ui/button";

export default function PanelDashboard() {
  const [loading, setLoading] = useState(true);
  const [panelName, setPanelName] = useState('');
  const [panelTeams, setPanelTeams] = useState([]);
  const [assignedJudges, setAssignedJudges] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [activeTab, setActiveTab] = useState('teams');
  
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem('isPanelAuthenticated');
    const name = localStorage.getItem('panelName');
    if (isAuth !== 'true') {
      navigate('/panel-login');
      return;
    }
    setPanelName(name || 'Panel');
    fetchAssignedTeams();
  }, [navigate]);

  const fetchAssignedTeams = async () => {
    try {
      setLoading(true);
      const pName = localStorage.getItem('panelName');

      if (pName) {
        const { data: r2TeamsData, error: r2Error } = await supabase
          .from('teams')
          .select(`
            id, team_id, team_name, presentation_link, idea_description, college, r2_panel, payment_status,
            team_members (*),
            problem_statements (domain, title, id, description)
          `);

        if (!r2Error && r2TeamsData) {
          const filtered = r2TeamsData.filter(t => t.r2_panel && t.r2_panel.trim().toLowerCase() === pName.trim().toLowerCase());
          setPanelTeams(filtered);
        }

        const { data: judgesData, error: judgesError } = await supabase
          .from('judges')
          .select('id, name, email, password, panel_name');
        
        if (!judgesError && judgesData) {
          const filteredJudges = judgesData.filter(j => j.panel_name && j.panel_name.trim().toLowerCase() === pName.trim().toLowerCase());
          setAssignedJudges(filteredJudges);
        }
      }
    } catch (err) {
      console.error("Error fetching panel data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleLogout = () => {
    localStorage.removeItem('isPanelAuthenticated');
    localStorage.removeItem('panelId');
    localStorage.removeItem('panelName');
    navigate('/panel-login');
  };

  const toggleExpand = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex font-sans">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 flex-col bg-[#f5f5f7]/80 backdrop-blur-2xl border-r border-[#d2d2d7]/50 md:flex fixed h-full z-20">
        <div className="flex flex-col items-center justify-center pt-8 pb-4 border-b border-[#d2d2d7]/50 mb-2">
          <div className="flex flex-col items-center gap-3">
            <img src="/favicon.jpg" alt="Logo" className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-white border border-slate-200" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Committee Console</span>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          <div className="text-xs font-semibold text-[#86868b] uppercase tracking-widest px-3 mb-2 mt-4">Menu</div>
          <button onClick={() => setActiveTab('teams')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'teams' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
            <div className="flex items-center gap-3"><span className="font-medium text-sm">Panel Roster</span></div>
          </button>
          <button onClick={() => setActiveTab('judges')} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'judges' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}>
            <div className="flex items-center gap-3"><span className="font-medium text-sm">Assigned Judges</span></div>
          </button>
        </div>

        <div className="p-4 mt-auto border-t border-[#d2d2d7]/50 flex flex-col gap-2">
          <div className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white text-[#1d1d1f] font-medium text-sm border border-[#d2d2d7]/50">
            <span className="truncate">{panelName}</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-medium text-sm border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Header (Mobile) */}
        <header className="sticky top-0 z-10 bg-[#f5f5f7]/80 backdrop-blur-2xl border-b border-[#d2d2d7]/50 md:hidden">
          <div className="flex flex-col gap-4 px-4 py-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/favicon.jpg" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                <span className="font-bold text-lg text-slate-900">Committee Console</span>
              </div>
              <button onClick={handleLogout} className="p-2 text-red-600 bg-red-50 rounded-lg border border-red-100"><LogOut className="w-4 h-4" /></button>
            </div>
            
            <div className="flex w-full overflow-x-auto pb-1 gap-2" style={{ scrollbarWidth: 'none' }}>
              <button onClick={() => setActiveTab('teams')} className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === 'teams' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#e8e8ed] text-[#86868b]'}`}>
                Panel Roster
              </button>
              <button onClick={() => setActiveTab('judges')} className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === 'judges' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#e8e8ed] text-[#86868b]'}`}>
                Assigned Judges
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'teams' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Panel Roster</h1>
              <p className="text-[#86868b]">Review details of all teams assigned to your panel ({panelName}).</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
              <div className="overflow-x-auto">
                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-[#d2d2d7]/50">
                  {panelTeams.map(team => (
                    <div key={`mobile-${team.id}`} className="p-4 bg-white space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-sm text-[#1d1d1f] mb-1">{team.team_name}</div>
                          <div className="text-sm text-[#86868b] mt-0.5 font-mono truncate">{team.team_id}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {team.payment_status === 'paid' ? (
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50">
                              Paid
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-200/50">
                              Not Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-[#1d1d1f]">
                        <span className="font-medium">Topic:</span> PS-{team.problem_statements?.id}
                      </div>
                      <Button size="sm" onClick={() => toggleExpand(`mobile-${team.id}`)} variant="outline" className="w-full text-xs">
                        {expandedTeams.has(`mobile-${team.id}`) ? 'Hide Details' : 'View Details'}
                      </Button>
                      
                      {expandedTeams.has(`mobile-${team.id}`) && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xs font-bold text-slate-500 uppercase">Team Members ({team.team_members?.length})</h4>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 bg-white" onClick={() => handleCopy(team.team_members.map(m=>m.email).join(', '))}>Emails</Button>
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 bg-white" onClick={() => handleCopy(team.team_members.map(m=>m.phone).filter(p=>p).join(', '))}>Phones</Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {team.team_members?.map(member => (
                                <div key={member.id} className="text-xs p-3 bg-white rounded-lg border border-slate-200">
                                  <div className="font-bold flex items-center justify-between mb-2">
                                    {member.name}
                                    {member.is_leader && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">Leader</span>}
                                  </div>
                                  <div className="space-y-1 text-slate-500">
                                    <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {member.email}</p>
                                    <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {member.phone || 'N/A'}</p>
                                    <p className="flex items-center gap-1.5"><GraduationCap className="w-3 h-3 text-slate-400" /> {member.college}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div className="mb-3">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Presentation Link</h4>
                              {team.presentation_link ? (
                                <a href={team.presentation_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs break-all font-medium flex items-center gap-1 w-fit">
                                  <LinkIcon className="w-3 h-3 shrink-0"/> {team.presentation_link}
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No presentation submitted yet.</span>
                              )}
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Idea Description</h4>
                              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {team.idea_description || <span className="text-slate-400 italic">No description provided.</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                        <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Team</th>
                        <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Topic</th>
                        <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Members</th>
                        <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d2d2d7]/50">
                      {panelTeams.map((team) => (
                        <React.Fragment key={`desktop-${team.id}`}>
                          <tr className="hover:bg-[#f5f5f7]/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-sm text-[#1d1d1f] flex items-center gap-2 mb-1">
                                {team.team_name}
                                {team.payment_status === 'paid' ? (
                                  <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50">
                                    Paid
                                  </span>
                                ) : (
                                  <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-200/50">
                                    Not Verified
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#86868b] font-mono">
                                {team.team_id}
                              </div>
                              <div className="text-xs text-[#86868b] mt-0.5">
                                {team.college}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm max-w-[200px] truncate">
                               PS-{team.problem_statements?.id}: {team.problem_statements?.title}
                            </td>
                            <td className="py-4 px-4 text-sm text-[#1d1d1f]">
                              {team.team_members?.length} Members
                              {team.team_members?.find(m => m.is_leader) && (
                                <div className="text-xs text-slate-500 mt-1">
                                  Lead: {team.team_members.find(m => m.is_leader).name}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Button size="sm" onClick={() => toggleExpand(`desktop-${team.id}`)} variant="outline" className="border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#e8e8ed] rounded-full shadow-sm text-xs px-4">
                                {expandedTeams.has(`desktop-${team.id}`) ? 'Hide Details' : 'View Details'}
                              </Button>
                            </td>
                          </tr>
                          {expandedTeams.has(`desktop-${team.id}`) && (
                            <tr className="bg-[#f5f5f7]/30 border-b border-[#d2d2d7]/50">
                              <td colSpan="4" className="px-8 py-6">
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
                      {panelTeams.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-12 text-[#86868b]">No teams assigned to your panel yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
          )}

          {activeTab === 'judges' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Assigned Judges</h1>
                  <p className="text-[#86868b]">View the judges assigned to your panel and their credentials.</p>
                </div>
                <Button 
                  onClick={() => window.open('/judge/login', '_blank')}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm"
                >
                  <LinkIcon className="w-4 h-4 mr-2" /> Open Judge Login
                </Button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                        <th className="py-3 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Judge Name</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Email / Username</th>
                        <th className="py-3 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d2d2d7]/50">
                      {assignedJudges.map(judge => (
                        <tr key={judge.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                          <td className="py-4 px-6 font-semibold text-[#1d1d1f]">{judge.name}</td>
                          <td className="py-4 px-6 text-sm text-[#1d1d1f] font-mono">{judge.email}</td>
                          <td className="py-4 px-6 text-sm text-[#1d1d1f] font-mono flex items-center gap-2">
                            {judge.password}
                            <Button size="sm" variant="ghost" className="h-6 px-2 opacity-50 hover:opacity-100" onClick={() => navigator.clipboard.writeText(judge.password)}>Copy</Button>
                          </td>
                        </tr>
                      ))}
                      {assignedJudges.length === 0 && (
                        <tr><td colSpan="3" className="text-center py-12 text-[#86868b]">No judges assigned to this panel yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
