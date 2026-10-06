import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, AlertCircle, XCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export default function JudgeDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [judgeName, setJudgeName] = useState('');
  const [judgeInfo, setJudgeInfo] = useState(null);
  const [allProblemStatements, setAllProblemStatements] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [evalForm, setEvalForm] = useState({
    team_id: '',
    innovation: 3,
    tech_impl: 3,
    impact: 3,
    business: 3,
    presentation: 3,
    selected_status: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Expanded rows state
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem('isJudgeAuthenticated');
    const name = localStorage.getItem('judgeName');
    if (isAuth !== 'true') {
      navigate('/judge-login');
      return;
    }
    setJudgeName(name || 'Judge');
    fetchAssignedTeams();
  }, [navigate]);

  const fetchAssignedTeams = async () => {
    try {
      setLoading(true);
      const judgeId = localStorage.getItem('judgeId');
      
      const { data: judgeData } = await supabase.from('judges').select('*').eq('id', judgeId).single();
      setJudgeInfo(judgeData);

      const { data: psData } = await supabase.from('problem_statements').select('*').order('id', { ascending: true });
      if (psData) setAllProblemStatements(psData);

      const { data, error } = await supabase
        .from('judge_assignments')
        .select(`
          team_id,
          teams:team_id (
            id, team_id, team_name, presentation_link, idea_description,
            problem_statements (domain, title, id, description),
            evaluations (*)
          )
        `)
        .eq('judge_id', judgeId);

      if (error) throw error;
      
      const processedTeams = data.map(assignment => {
        const team = assignment.teams;
        // Filter evaluations for Round 1 for this judge
        const myEval = (team.evaluations || []).find(e => e.round_number === 1 && e.judge_id === judgeId);
        return {
          ...team,
          evalData: myEval || null
        };
      });

      setTeams(processedTeams);
    } catch (err) {
      console.error("Error fetching assigned teams:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isJudgeAuthenticated');
    localStorage.removeItem('judgeId');
    localStorage.removeItem('judgeName');
    navigate('/judge-login');
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

  const handleTeamSelect = (e) => {
    const selectedTeamId = e.target.value;
    const team = teams.find(t => t.id === selectedTeamId);
    
    if (team && team.evalData) {
      setEvalForm({
        team_id: selectedTeamId,
        innovation: team.evalData.innovation || 3,
        tech_impl: team.evalData.tech_impl || 3,
        impact: team.evalData.impact || 3,
        business: team.evalData.business || 3,
        presentation: team.evalData.presentation || 3,
        selected_status: team.evalData.selected_status || false
      });
    } else {
      setEvalForm({
        team_id: selectedTeamId,
        innovation: 3,
        tech_impl: 3,
        impact: 3,
        business: 3,
        presentation: 3,
        selected_status: false
      });
    }
  };

  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    if (!evalForm.team_id) return alert('Select a team to evaluate');
    
    setSubmitLoading(true);
    const judgeId = localStorage.getItem('judgeId');
    
    const payload = {
      team_id: evalForm.team_id,
      judge_id: judgeId,
      round_number: 1, // Store as round 1 evaluation
      innovation: evalForm.innovation,
      tech_impl: evalForm.tech_impl,
      impact: evalForm.impact,
      business: evalForm.business,
      presentation: evalForm.presentation,
      total_score: parseInt(evalForm.innovation) + parseInt(evalForm.tech_impl) + parseInt(evalForm.impact) + parseInt(evalForm.business) + parseInt(evalForm.presentation),
      selected_status: evalForm.selected_status
    };

    // Check if evaluation already exists for this judge, team, and round
    const { data: existing } = await supabase
      .from('evaluations')
      .select('id')
      .eq('team_id', evalForm.team_id)
      .eq('judge_id', judgeId)
      .eq('round_number', 1)
      .single();

    if (existing) {
      await supabase.from('evaluations').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('evaluations').insert([payload]);
    }
    
    setSubmitLoading(false);
    alert('Evaluation saved successfully!');
    // Reset form
    setEvalForm({ ...evalForm, team_id: '' });
    // Refresh to show evaluated status
    fetchAssignedTeams();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-blue-200">
      
      {/* Sidebar - Apple Style */}
      <aside className="hidden w-64 flex-col bg-[#f5f5f7]/80 backdrop-blur-2xl border-r border-[#d2d2d7]/50 md:flex fixed h-full z-20">
        <div className="flex flex-col items-center justify-center pt-8 pb-4 border-b border-[#d2d2d7]/50 mb-2">
          <div className="flex flex-col items-center gap-3">
            <img src="/favicon.jpg" alt="FIR Logo" className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-white border border-slate-200" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Judge Console</span>
          </div>
        </div>
        
        <div className="px-4 py-4 space-y-1">
          <p className="px-2 text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-2">Evaluations</p>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}
          >
            <div className="flex items-center gap-3"><span className="font-medium text-sm">Dashboard</span></div>
          </button>
          
          <button 
            onClick={() => setActiveTab('assigned')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'assigned' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}
          >
            <div className="flex items-center gap-3"><span className="font-medium text-sm">Assigned Teams</span></div>
          </button>
          
          {judgeInfo?.evaluation_enabled && (
            <button 
              onClick={() => setActiveTab('eval')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'eval' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}
            >
              <div className="flex items-center gap-3"><span className="font-medium text-sm">Evaluation</span></div>
            </button>
          )}
          
          <button 
            onClick={() => setActiveTab('problem_statements')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${activeTab === 'problem_statements' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#1d1d1f] hover:bg-[#e8e8ed]'}`}
          >
            <div className="flex items-center gap-3"><span className="font-medium text-sm">Problem Statements</span></div>
          </button>
        </div>

        <div className="flex-1" />
        
        <div className="p-4 mt-auto border-t border-[#d2d2d7]/50 flex flex-col gap-2">
          <div className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white text-[#1d1d1f] font-medium text-sm border border-[#d2d2d7]/50">
            <span className="truncate">{judgeName}</span>
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
        <header className="sticky top-0 z-10 bg-[#f5f5f7]/80 backdrop-blur-2xl border-b border-[#d2d2d7]/50">
          <div className="flex h-auto md:h-16 flex-col md:flex-row items-start md:items-center gap-4 px-4 md:px-6 py-4 md:py-0">
            
            <div className="flex md:hidden w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/favicon.jpg" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                <span className="font-bold text-lg text-slate-900">Judge Console</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleLogout} className="p-2 text-red-600 bg-red-50 rounded-lg border border-red-100"><LogOut className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex md:hidden w-[100vw] overflow-x-auto pb-2 -mx-4 px-4 gap-2 snap-x" style={{ scrollbarWidth: 'none' }}>
              <button onClick={() => setActiveTab('dashboard')} className={`shrink-0 snap-start px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#e8e8ed] text-[#86868b]'}`}>
                Dashboard
              </button>
              <button onClick={() => setActiveTab('assigned')} className={`shrink-0 snap-start px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === 'assigned' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#e8e8ed] text-[#86868b]'}`}>
                Assigned Teams
              </button>
              {judgeInfo?.evaluation_enabled && (
                <button onClick={() => setActiveTab('eval')} className={`shrink-0 snap-start px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === 'eval' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#e8e8ed] text-[#86868b]'}`}>
                  Evaluation
                </button>
              )}
              <button onClick={() => setActiveTab('problem_statements')} className={`shrink-0 snap-start px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${activeTab === 'problem_statements' ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#e8e8ed] text-[#86868b]'}`}>
                Problem Statements
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Dashboard Overview</h1>
                <p className="text-[#86868b]">Overview of your team assignments and evaluation progress.</p>
              </div>

              {(() => {
                const totalAssigned = teams.length;
                const myEvals = teams.map(t => {
                  const myEvs = t.evaluations?.filter(e => e.judge_id === judgeInfo?.id) || [];
                  const latestEv = myEvs.length > 0 ? myEvs[myEvs.length - 1] : null;
                  return { team: t, eval: latestEv };
                });
                
                const evaluatedTeams = myEvals.filter(me => me.eval);
                const selectedTeams = evaluatedTeams.filter(me => me.eval.selected_status === true);
                const notSelectedTeams = evaluatedTeams.filter(me => me.eval.selected_status === false);

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d2d2d7]/50 flex flex-col">
                        <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1">Total Assigned</span>
                        <span className="text-2xl font-bold text-[#1d1d1f]">{totalAssigned}</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d2d2d7]/50 flex flex-col">
                        <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1">Evaluated</span>
                        <span className="text-2xl font-bold text-blue-600">{evaluatedTeams.length}</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d2d2d7]/50 flex flex-col">
                        <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1">Selected</span>
                        <span className="text-2xl font-bold text-green-600">{selectedTeams.length}</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d2d2d7]/50 flex flex-col">
                        <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1">Not Selected</span>
                        <span className="text-2xl font-bold text-red-600">{notSelectedTeams.length}</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                      {/* Mobile View: Cards */}
                      <div className="block md:hidden divide-y divide-[#d2d2d7]/50">
                        {myEvals.length === 0 && (
                          <div className="p-8 text-center text-[#86868b]">No teams assigned.</div>
                        )}
                        {myEvals.map(({team, eval: ev}) => (
                          <div key={`mobile-dashboard-${team.id}`} className="p-4 flex justify-between items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-base text-[#1d1d1f] truncate">{team.team_name}</div>
                              <div className="text-sm text-[#86868b] mt-0.5 font-mono truncate">{team.team_id}</div>
                            </div>
                            <div className="flex-shrink-0">
                              {!ev && <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Pending</span>}
                              {ev && ev.selected_status === true && <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200">Selected</span>}
                              {ev && ev.selected_status === false && <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Not Selected</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop View: Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                              <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Team</th>
                              <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Verdict</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#d2d2d7]/50">
                            {myEvals.map(({team, eval: ev}) => (
                              <tr key={team.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="font-semibold text-sm text-[#1d1d1f]">{team.team_name}</div>
                                  <div className="text-xs text-[#86868b] font-mono mt-0.5">{team.team_id}</div>
                                </td>
                                <td className="py-4 px-4">
                                  {!ev && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Pending</span>}
                                  {ev && ev.selected_status === true && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Selected</span>}
                                  {ev && ev.selected_status === false && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Not Selected</span>}
                                </td>
                              </tr>
                            ))}
                            {myEvals.length === 0 && (
                              <tr>
                                <td colSpan="2" className="text-center py-8 text-[#86868b]">No teams assigned.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}

          {activeTab === 'assigned' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Assigned Teams</h1>
                <p className="text-[#86868b]">Review details and idea descriptions of your assigned teams.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
                
                {/* Mobile View: Cards */}
                <div className="block md:hidden divide-y divide-[#d2d2d7]/50">
                  {teams.length === 0 && (
                    <div className="p-8 text-center text-[#86868b]">No teams assigned to you yet.</div>
                  )}
                  {teams.map(team => (
                    <div key={`mobile-${team.id}`} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-base text-[#1d1d1f] flex items-center gap-2">
                            {team.team_name}
                          </div>
                          <div className="text-sm text-[#86868b] mt-0.5 font-mono">
                            {team.team_id}
                          </div>
                        </div>
                        {team.evalData && (
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50">
                            Evaluated
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        {team.presentation_link ? (
                          <a href={team.presentation_link} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-semibold group bg-blue-50 px-3 py-1.5 rounded-lg">
                            View PPT
                            <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-1.5 rounded text-xs font-semibold">No PPT</span>
                        )}
                        
                        <Button size="sm" onClick={() => toggleExpand(team.id)} variant="outline" className="border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#e8e8ed] rounded-lg shadow-sm text-xs px-4">
                          {expandedTeams.has(team.id) ? 'Hide Idea' : 'View Idea'}
                        </Button>
                      </div>

                      {expandedTeams.has(team.id) && (
                        <div className="mt-2 bg-[#f5f5f7]/50 p-4 rounded-xl border border-[#d2d2d7]/50">
                          <h4 className="text-sm font-semibold text-[#1d1d1f] mb-2">Idea Description</h4>
                          <p className="text-sm text-[#1d1d1f]/80 whitespace-pre-wrap leading-relaxed">
                            {team.idea_description || team.problem_statements?.description || 'No idea description provided.'}
                          </p>
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
                        <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Presentation</th>
                        <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d2d2d7]/50">
                      {teams.map((team) => (
                        <React.Fragment key={`desktop-${team.id}`}>
                          <tr className="hover:bg-[#f5f5f7]/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-sm text-[#1d1d1f] flex items-center gap-2">
                                {team.team_name}
                                {team.evalData && (
                                  <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50">
                                    Evaluated
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#86868b] mt-0.5 font-mono">
                                {team.team_id}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {team.presentation_link ? (
                                <a href={team.presentation_link} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-semibold group">
                                  View PPT
                                  <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </a>
                              ) : (
                                <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-semibold">Not submitted</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Button size="sm" onClick={() => toggleExpand(team.id)} variant="outline" className="border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#e8e8ed] rounded-full shadow-sm text-xs px-4">
                                {expandedTeams.has(team.id) ? 'Hide Idea' : 'View Idea'}
                              </Button>
                            </td>
                          </tr>
                          {expandedTeams.has(team.id) && (
                            <tr className="bg-[#f5f5f7]/30">
                              <td colSpan="3" className="px-4 py-6">
                                <div className="bg-white p-4 rounded-xl border border-[#d2d2d7]/50 shadow-sm">
                                  <h4 className="text-sm font-semibold text-[#1d1d1f] mb-2">Idea Description</h4>
                                  <p className="text-sm text-[#1d1d1f]/80 whitespace-pre-wrap leading-relaxed">
                                    {team.idea_description || team.problem_statements?.description || 'No idea description provided.'}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {teams.length === 0 && (
                        <tr><td colSpan="3" className="text-center py-12 text-[#86868b]">No teams assigned to you yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'problem_statements' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Problem Statements</h1>
                <p className="text-[#86868b]">Review the domains and focus areas for your assigned teams.</p>
              </div>

              <div className="grid gap-6">
                {allProblemStatements.map(ps => (
                  <div key={ps.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#d2d2d7]/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-sm font-bold text-slate-500">PS-{ps.id}</span>
                      <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full">
                        {ps.domain}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">{ps.title}</h3>
                    <p className="text-[#1d1d1f]/80 whitespace-pre-wrap leading-relaxed text-sm">
                      {ps.description}
                    </p>
                  </div>
                ))}
                {allProblemStatements.length === 0 && (
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#d2d2d7]/50 text-center text-[#86868b]">
                    Loading problem statements...
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'eval' && judgeInfo?.evaluation_enabled && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Evaluation Form</h1>
                <p className="text-[#86868b]">Score your assigned teams based on the 5 key criteria (1-5).</p>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-[#d2d2d7]/50 max-w-2xl">
                <form onSubmit={handleEvalSubmit} className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-[#86868b] uppercase tracking-widest mb-2 block">Select Team</label>
                    <select 
                      className="w-full border rounded-xl px-4 py-3 bg-[#f5f5f7] border-[#d2d2d7] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={evalForm.team_id}
                      onChange={handleTeamSelect}
                      required
                    >
                      <option value="">-- Choose a team to evaluate --</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.team_name} ({t.team_id}) {t.evalData ? '✅ Evaluated' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {evalForm.team_id && (
                    <div className="space-y-6 pt-4 border-t border-[#d2d2d7]/50">
                      {[
                        { key: 'impact', label: 'Problem Relevance & Clarity' },
                        { key: 'innovation', label: 'Innovation and Originality' },
                        { key: 'tech_impl', label: 'Solution approach and Technical Feasibility' },
                        { key: 'business', label: 'Impact and Scalability' },
                        { key: 'presentation', label: 'User Centricity and Usability' }
                      ].map(criteria => (
                        <div key={criteria.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-sm font-semibold text-[#1d1d1f]">{criteria.label}</label>
                          <div className="flex justify-between w-full sm:w-auto sm:justify-start gap-2 mt-2 sm:mt-0">
                            {[1,2,3,4,5].map(score => (
                              <button
                                type="button"
                                key={score}
                                onClick={() => setEvalForm({...evalForm, [criteria.key]: score})}
                                className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full font-bold transition-all flex items-center justify-center shrink-0 ${evalForm[criteria.key] === score ? 'bg-blue-600 text-white shadow-md' : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]'}`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="pt-4 border-t border-[#d2d2d7]/50">
                        <label className="text-sm font-semibold text-[#1d1d1f] mb-3 block">Final Verdict</label>
                        <div className="flex flex-col sm:flex-row gap-4 mt-2 sm:mt-0">
                          <label className="flex items-center gap-2 cursor-pointer bg-[#f5f5f7] p-3 rounded-xl sm:bg-transparent sm:p-0">
                            <input type="radio" name="selected_status" checked={evalForm.selected_status === true} onChange={() => setEvalForm({...evalForm, selected_status: true})} className="w-5 h-5 text-blue-600 focus:ring-blue-500" />
                            <span className="font-medium text-green-700">Selected</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer bg-[#f5f5f7] p-3 rounded-xl sm:bg-transparent sm:p-0">
                            <input type="radio" name="selected_status" checked={evalForm.selected_status === false} onChange={() => setEvalForm({...evalForm, selected_status: false})} className="w-5 h-5 text-red-600 focus:ring-red-500" />
                            <span className="font-medium text-red-700">Not Selected</span>
                          </label>
                        </div>
                      </div>

                      <Button type="submit" disabled={submitLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg shadow-sm">
                        {submitLoading ? 'Saving...' : 'Submit Evaluation'}
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
