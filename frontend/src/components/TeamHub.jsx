import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle2, Download, AlertCircle, Link as LinkIcon, UploadCloud, ShieldCheck, QrCode, Trophy, Bell, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function TeamHub({ teamData, teamMemberData, evaluations, onRefresh }) {
  const [pptLink, setPptLink] = useState(teamData.presentation_link || '');
  const [utr, setUtr] = useState(teamData.payment_utr_number || '');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [broadcastNotice, setBroadcastNotice] = useState('');

  React.useEffect(() => {
    async function fetchNotice() {
      const { data } = await supabase.from('global_settings').select('broadcast_notice').eq('id', 1).single();
      if (data && data.broadcast_notice) setBroadcastNotice(data.broadcast_notice);
    }
    fetchNotice();
  }, []);

  const isLeader = teamMemberData?.is_leader;
  const currentRound = teamData.current_round || 1;
  const paymentStatus = teamData.payment_status || 'pending';
  const evaluation = evaluations?.find(e => e.team_id === teamData.id && e.round_number === 2 && e.is_published);

  const handleUpdateLink = async (e) => {
    e.preventDefault();
    if (!isLeader) return;
    
    setUpdating(true);
    setMsg({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({ presentation_link: pptLink, updated_at: new Date().toISOString() })
        .eq('id', teamData.id);

      if (error) throw error;
      setMsg({ text: 'Presentation link updated successfully!', type: 'success' });
      onRefresh(); // Refresh parent data
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Failed to update link. Please try again.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateUtr = async (e) => {
    e.preventDefault();
    if (!isLeader) return;
    
    setUpdating(true);
    setMsg({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({ payment_utr_number: utr, payment_status: 'pending_verification', updated_at: new Date().toISOString() })
        .eq('id', teamData.id);

      if (error) throw error;
      setMsg({ text: 'UTR submitted! Awaiting manual verification.', type: 'success' });
      onRefresh();
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Failed to submit UTR. Please try again.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      {/* Square Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0" 
           style={{ backgroundImage: 'linear-gradient(to right, #cbd5e133 1px, transparent 1px), linear-gradient(to bottom, #cbd5e133 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative z-10">
        
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{teamData.team_name}</h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Round {currentRound}
              </span>
            </div>
            <p className="text-slate-700 text-sm flex items-center gap-1.5 font-medium mb-1">
              {teamData.problem_statements?.title || 'Topic Selected'}
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold mb-0.5">Team ID</span>
                <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">{teamData.team_id}</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold mb-0.5">Problem ID</span>
                <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">PS-{teamData.problem_statement_id || teamData.problem_statements?.id || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

      {/* Timeline Stepper */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-300 mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600" 
              initial={{ width: 0 }}
              animate={{ width: `${(currentRound - 1) * 50}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {[1, 2, 3].map((step) => {
            const isActive = currentRound === step;
            const isCompleted = currentRound > step;
            const labels = ["Idea Submission", "Live Presentation", "In-Person Finals"];
            
            return (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 shadow-sm
                  ${isCompleted ? 'bg-blue-600 text-white border-2 border-blue-600' : 
                    isActive ? 'bg-white text-blue-600 border-2 border-blue-600 ring-4 ring-blue-50' : 
                    'bg-slate-100 text-slate-500 border-2 border-slate-300'}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                <span className={`text-xs font-semibold ${isActive || isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                  Round {step}
                </span>
                <span className="text-[10px] text-slate-600 uppercase tracking-wider hidden sm:block">
                  {labels[step - 1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full">
        {broadcastNotice && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">Announcement</h3>
                <div className="mt-1 text-sm text-blue-700 whitespace-pre-wrap font-medium">
                  {broadcastNotice}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Action Hub */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white shadow-sm border border-slate-200 relative z-10">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Project Submission
              </CardTitle>
              <CardDescription>
                Submit your idea presentation based on the Zephyr template.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              {currentRound === 1 && teamData.is_eliminated && teamData.rejection_reason && (
                <div className="mb-6 p-5 rounded-xl border border-red-300 bg-red-50">
                  <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Application Rejected
                  </h4>
                  <p className="text-sm text-red-800 font-medium whitespace-pre-wrap">{teamData.rejection_reason}</p>
                </div>
              )}

              {currentRound === 1 && teamData.conditional_selection_reason && !teamData.is_eliminated && (
                <div className="mb-6 p-5 rounded-xl border border-blue-300 bg-blue-50">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Conditional Selection
                  </h4>
                  <p className="text-sm text-blue-800 font-medium whitespace-pre-wrap">{teamData.conditional_selection_reason}</p>
                  <p className="text-xs text-blue-600 mt-2 font-semibold uppercase">You must implement these changes to be considered for Round 2.</p>
                </div>
              )}

              {currentRound === 1 && !teamData.is_eliminated && (
                <>
                  <div className="mb-6 p-5 rounded-xl border border-amber-300 bg-amber-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {teamData.presentation_link ? 'Update Your Presentation' : 'Action Required: Submit Your Presentation'}
                    </h4>
                    <ul className="text-sm text-amber-800 space-y-2 list-disc pl-5">
                      <li>Download the official Zephyr PPT Template using the button below.</li>
                      <li>
                        Fill it out with your idea. <strong>You will need to include your IDs:</strong>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="bg-white/80 px-2 py-0.5 rounded text-amber-900 font-mono text-xs font-bold border border-amber-300">Team ID: {teamData.team_id}</span>
                          <span className="bg-white/80 px-2 py-0.5 rounded text-amber-900 font-mono text-xs font-bold border border-amber-300">Problem ID: PS-{teamData.problem_statement_id || teamData.problem_statements?.id}</span>
                        </div>
                      </li>
                      <li>Upload the finished presentation to Google Drive and ensure link sharing is set to "Anyone with the link can view".</li>
                      <li>Paste the viewable link below and click {teamData.presentation_link ? 'Update' : 'Save'}.</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button asChild variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50">
                      <a href="https://duoctfpncojorbsnehrc.supabase.co/storage/v1/object/public/Images/Zephyr%20PPT%20Template.pptx" download target="_blank" rel="noreferrer">
                        <Download className="w-4 h-4" />
                        Download Zephyr Template
                      </a>
                    </Button>
                  </div>

                  <form onSubmit={handleUpdateLink} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-900 flex justify-between">
                        Google Drive Presentation Link
                        {teamData.presentation_link && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Submitted
                          </span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <LinkIcon className="w-4 h-4" />
                          </div>
                          <Input 
                            value={pptLink}
                            onChange={(e) => setPptLink(e.target.value)}
                            placeholder="https://docs.google.com/presentation/d/..."
                            className="pl-10 border-slate-300"
                            disabled={!isLeader}
                          />
                        </div>
                        {isLeader && (
                          <Button type="submit" disabled={updating || !pptLink} className="bg-blue-700 hover:bg-blue-800 text-white">
                            {updating ? 'Saving...' : (teamData.presentation_link ? 'Update Link' : 'Save Link')}
                          </Button>
                        )}
                      </div>
                      {!isLeader && (
                        <p className="text-xs text-slate-600 mt-1">Only the Team Leader can update this link.</p>
                      )}
                    </div>

                    {msg.text && (
                      <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
                        {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {msg.text}
                      </div>
                    )}
                  </form>
                </>
              )}

              {currentRound === 2 && (
                <>
                  {(paymentStatus === 'pending' || paymentStatus === 'rejected') && (
                    <div className="space-y-6">
                      {paymentStatus === 'rejected' && (
                        <div className="mb-6 p-4 rounded-xl border border-red-300 bg-red-50 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="font-bold text-red-900 mb-1">Action Required: UTR Mismatch</h4>
                            <p className="text-sm text-red-800">
                              We were unable to verify your payment with the provided UTR (<strong>{teamData.payment_utr_number}</strong>). Please scan the QR code to complete the payment if you haven't, or enter the correct 12-digit UTR/Transaction Reference below.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Congratulations! You've qualified for Round 2.</h3>
                        <p className="text-slate-600 text-sm">
                          To participate in the live online presentations, a registration fee of ₹500 is required.
                        </p>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="shrink-0 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                          <img src="/payment-qr.png" alt="Payment QR Code" className="w-32 h-32 object-contain mb-3" />
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Scan to Pay</span>
                          <span className="text-lg font-bold text-slate-900 mt-1">₹500</span>
                        </div>
                        
                        <div className="flex-1 w-full">
                          <h4 className="font-semibold text-slate-900 mb-2">Payment Verification</h4>
                          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Please scan the QR code to make your payment. Once completed, enter the 12-digit UTR (Transaction Reference Number) below to confirm your slot.
                          </p>
                          
                          <form onSubmit={handleUpdateUtr} className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-900">UTR / Reference Number</label>
                              <Input 
                                required
                                value={utr}
                                onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                placeholder="e.g. 123456789012"
                                disabled={!isLeader}
                                pattern="\d{12}"
                                minLength={12}
                                maxLength={12}
                                title="Please enter exactly 12 digits"
                                type="text"
                                inputMode="numeric"
                              />
                            </div>
                            {isLeader && (
                              <Button type="submit" disabled={updating || !utr} className="w-full bg-blue-600 hover:bg-blue-700">
                                {updating ? 'Submitting...' : 'Submit Payment Details'}
                              </Button>
                            )}
                            
                            {msg.text && (
                              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {msg.text}
                              </div>
                            )}
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'pending_verification' && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-amber-200 border-t-amber-500 animate-spin"></div>
                        <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Under Verification</h3>
                      <p className="text-slate-500 max-w-sm mb-6">
                        We have received your UTR number (<strong>{teamData.payment_utr_number}</strong>). Please wait while it gets processed.
                      </p>
                      <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                        Verification Pending
                      </span>
                    </div>
                  )}

                  {paymentStatus === 'paid' && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Round 2 Completed</h3>
                      <p className="text-slate-500 max-w-sm mb-4">
                        Your payment was verified and you have completed the live presentation.
                      </p>
                      
                      {evaluation?.is_published && currentRound === 2 && (
                        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md w-full">
                          <h4 className="font-bold text-slate-900 mb-2">Evaluation Complete</h4>
                          <p className="text-sm text-slate-600">Your results have been published. If you have been selected, you will be moved to the next round shortly.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {currentRound === 3 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome to the Finals!</h3>
                  <p className="text-slate-600 max-w-md mb-6 leading-relaxed font-medium">
                    Congratulations! You have been shortlisted for the on-site competition. 
                    <br/><br/>
                    <strong className="text-slate-800">Venue:</strong> Puducherry Technological University
                    <br/>
                    Please be present at the venue on time. They will provide you with all further details.
                  </p>
                  
                  <div className="mt-4 p-6 bg-white border-2 border-slate-200 border-dashed rounded-xl flex flex-col items-center">
                    <p className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-4">Your Admit QR Code</p>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${teamData.team_id}`} 
                      alt="Admit QR" 
                      className="w-32 h-32"
                    />
                    <p className="mt-4 text-xs font-mono text-slate-400">{teamData.team_id}</p>
                    {teamData.check_in_status ? (
                      <span className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">CHECKED IN</span>
                    ) : (
                      <span className="mt-3 text-[10px] text-slate-500 text-center">Show this code at the registration desk<br/>for campus entry.</span>
                    )}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-slate-200 relative z-10">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle>Idea Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {teamData.idea_description || "No description provided during registration."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Team Members */}
        <div className="space-y-6">
          <Card className="bg-white shadow-sm border border-slate-200 relative z-10">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Team Roster
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 divide-y divide-slate-100">
              {teamData.team_members?.map((member, idx) => (
                <div key={member.id || idx} className="py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{member.name}</p>
                      {member.is_leader && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">Leader</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{member.college}</p>
                  </div>
                </div>
              ))}
              {!teamData.team_members?.length && (
                <div className="py-6 text-center text-slate-500 text-sm">
                  No members found.
                </div>
              )}
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-slate-200">
              <CardContent className="p-6">
                <h4 className="font-bold text-slate-900 mb-2">Need Help?</h4>
                <p className="text-sm text-slate-600 mb-4">If you have any questions or face technical issues, please reach out to our support team.</p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-700">Email:</span>
                    <a href="mailto:zephyr@ptuniv.edu.in" className="text-blue-600 hover:underline">zephyr@ptuniv.edu.in</a>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-slate-700">Phone:</span>
                    <a href="tel:+919385910261" className="text-blue-600 hover:underline">+91 93859 10261</a>
                    <a href="tel:+918300949377" className="text-blue-600 hover:underline">+91 83009 49377</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
