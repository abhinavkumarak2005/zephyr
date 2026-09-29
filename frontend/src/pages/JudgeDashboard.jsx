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
  
  // Grading Modal State
  const [isGrading, setIsGrading] = useState(null); // team object
  const [saveLoading, setSaveLoading] = useState(false);
  const [gradeData, setGradeData] = useState({
    ps_fit: 5, ai_depth: 5, tech_impl: 5, innovation: 5, impact: 5, business: 5, presentation: 5, absent: false
  });
  
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
      
      const { data, error } = await supabase
        .from('judge_assignments')
        .select(`
          team_id,
          teams:team_id (
            id, team_name, presentation_link,
            problem_statements (domain, title, id),
            evaluations (*)
          )
        `)
        .eq('judge_id', judgeId);

      if (error) throw error;
      
      const processedTeams = data.map(assignment => {
        const team = assignment.teams;
        // Filter evaluations for Round 2
        const r2Eval = (team.evaluations || []).find(e => e.round_number === 2);
        return {
          ...team,
          evalData: r2Eval || null
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

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!isGrading) return;
    setSaveLoading(true);

    try {
      const judgeId = localStorage.getItem('judgeId');
      const total = gradeData.absent ? 0 : (
        gradeData.ps_fit + gradeData.ai_depth + gradeData.tech_impl +
        gradeData.innovation + gradeData.impact + gradeData.business + gradeData.presentation
      );

      let grade = '-';
      if (!gradeData.absent) {
        if (total >= 60) grade = 'S';
        else if (total >= 50) grade = 'A';
        else if (total >= 40) grade = 'B';
        else if (total >= 30) grade = 'C';
        else grade = 'D';
      }

      const payload = {
        team_id: isGrading.id,
        round_number: 2,
        grade: gradeData.absent ? null : grade,
        total_score: total,
        is_absent: gradeData.absent,
        ps_fit: gradeData.ps_fit,
        ai_depth: gradeData.ai_depth,
        tech_impl: gradeData.tech_impl,
        innovation: gradeData.innovation,
        impact: gradeData.impact,
        business: gradeData.business,
        presentation: gradeData.presentation,
        judge_id: judgeId,
        updated_at: new Date().toISOString()
      };

      if (isGrading.evalData) {
        // Update
        const { error } = await supabase.from('evaluations').update(payload).eq('id', isGrading.evalData.id);
        if (error) throw error;
      } else {
        // Insert
        payload.evaluated_at = new Date().toISOString();
        const { error } = await supabase.from('evaluations').insert([payload]);
        if (error) throw error;
      }

      await fetchAssignedTeams();
      setIsGrading(null);
    } catch (err) {
      console.error("Error saving evaluation:", err);
      alert(err.message || "Failed to save evaluation");
    } finally {
      setSaveLoading(false);
    }
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
          <button className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all bg-blue-600 text-white shadow-sm`}>
            <div className="flex items-center gap-3"><span className="font-medium text-sm">Assigned Teams</span></div>
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
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        
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

            <div className="flex md:hidden w-full overflow-x-auto pb-2 -mx-4 px-4 gap-2 snap-x" style={{ scrollbarWidth: 'none' }}>
              <button className={`shrink-0 snap-start px-4 py-1.5 rounded-full text-sm font-semibold transition-colors bg-blue-600 text-white shadow-sm`}>
                Assigned Teams
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-2">Round 2 Evaluations</h1>
              <p className="text-[#86868b]">Review presentations and evaluate your assigned teams.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/50 overflow-hidden">
              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#d2d2d7]/50 bg-[#f5f5f7]/50">
                      <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Team</th>
                      <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Topic</th>
                      <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Presentation</th>
                      <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider">Score</th>
                      <th className="py-3 px-4 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d2d2d7]/50">
                    {teams.map((team) => (
                      <tr key={team.id} className="hover:bg-[#f5f5f7]/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-sm text-[#1d1d1f] flex items-center gap-2">
                            {team.team_name}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm max-w-[300px] truncate">
                          <span className="font-semibold">PS-{team.problem_statements?.id}:</span> {team.problem_statements?.title}
                          <div className="text-xs text-[#86868b] mt-0.5">{team.problem_statements?.domain}</div>
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
                        <td className="py-4 px-4 text-sm font-medium">
                          {team.evalData ? (
                            team.evalData.is_absent ? (
                              <span className="text-red-500 bg-red-50 px-2 py-1 rounded text-xs font-semibold">Absent</span>
                            ) : (
                              <span className="text-blue-600 font-bold">{team.evalData.total_score} / 70</span>
                            )
                          ) : (
                            <span className="text-slate-400">Not Graded</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button size="sm" onClick={() => {
                            setIsGrading(team);
                            setGradeData({
                              ps_fit: team.evalData?.ps_fit || 5,
                              ai_depth: team.evalData?.ai_depth || 5,
                              tech_impl: team.evalData?.tech_impl || 5,
                              innovation: team.evalData?.innovation || 5,
                              impact: team.evalData?.impact || 5,
                              business: team.evalData?.business || 5,
                              presentation: team.evalData?.presentation || 5,
                              absent: team.evalData?.is_absent || false
                            });
                          }} className="bg-slate-800 hover:bg-slate-900 text-white rounded-full shadow-sm text-xs px-4">
                            {team.evalData ? 'Edit Grade' : 'Grade Team'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {teams.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-12 text-[#86868b]">No teams assigned to you yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Grading Modal */}
      {isGrading && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-xl text-slate-900">Evaluate Team</h3>
                <p className="text-sm text-slate-500 font-medium">{isGrading.team_name}</p>
              </div>
              <button type="button" onClick={() => setIsGrading(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-1 transition-colors"><XCircle className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleSaveEvaluation} className="block">
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 transition-colors hover:bg-slate-100 cursor-pointer" onClick={() => setGradeData({...gradeData, absent: !gradeData.absent})}>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Mark Absent</h4>
                    <p className="text-xs text-slate-500">Team did not attend the live presentation.</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={gradeData.absent} onChange={e => setGradeData({...gradeData, absent: e.target.checked})} onClick={e => e.stopPropagation()} />
                </div>

                {!gradeData.absent && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
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
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-slate-700">{category.label}</label>
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shadow-sm">{gradeData[category.key]} <span className="text-blue-400 font-normal text-xs">/ 10</span></span>
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
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1 mt-1">
                            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex justify-between items-center">
                      <span className="font-bold text-slate-700">Total Score Calculation</span>
                      <span className="text-2xl font-black text-blue-700">
                        {gradeData.ps_fit + gradeData.ai_depth + gradeData.tech_impl + gradeData.innovation + gradeData.impact + gradeData.business + gradeData.presentation} 
                        <span className="text-sm text-blue-400 font-bold"> / 70</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                <Button type="button" variant="outline" onClick={() => setIsGrading(null)} className="rounded-full px-6">Cancel</Button>
                <Button type="submit" disabled={saveLoading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-sm">
                  {saveLoading ? 'Saving...' : 'Save Evaluation'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
