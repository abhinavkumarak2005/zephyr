import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Bell, Box, CheckCircle2, Clock, XCircle } from 'lucide-react'

export default function ParticipantDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [teamData, setTeamData] = useState(null)
  const [newUTR, setNewUTR] = useState('')
  const [isSubmittingUTR, setIsSubmittingUTR] = useState(false)
  
  useEffect(() => {
    async function fetchDashboardData() {
      // 1. Get logged in user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/auth')
        return
      }

      // 2. Get team member record for this user
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (memberError || !memberData) {
        // User is logged in but hasn't completed registration wizard
        // Redirecting to wizard (which we'll build next)
        setLoading(false)
        return
      }

      // 3. Get the full team details
      const { data: teamInfo, error: teamError } = await supabase
        .from('teams')
        .select(`
          *,
          problem_statements(title, domain)
        `)
        .eq('id', memberData.team_id)
        .single()
        
      // 4. Get all team members for display
      const { data: allMembers } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', memberData.team_id)

      if (teamInfo) {
        setTeamData({
          teamDbId: teamInfo.id,
          name: teamInfo.team_name,
          teamId: teamInfo.team_id,
          track: teamInfo.problem_statements ? teamInfo.problem_statements.domain : "TBD",
          problemStatement: teamInfo.problem_statements ? teamInfo.problem_statements.title : "TBD",
          college: teamInfo.college,
          department: teamInfo.department,
          members: allMembers || [],
          utrStatus: teamInfo.payment_status === 'paid' ? 'verified' : teamInfo.payment_status === 'pending_verification' ? 'pending' : 'rejected',
          resultsStatus: teamInfo.is_eliminated ? 'not-qualified' : teamInfo.current_round > 0 ? 'qualified' : 'pending',
          presentationLink: teamInfo.presentation_link || "",
          projectLink: teamInfo.project_link || ""
        })
      }
      setLoading(false)
    }
    
    fetchDashboardData()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const handleResubmitUTR = async () => {
    if (newUTR.length < 6) {
      alert("Please enter a valid UTR number.");
      return;
    }
    setIsSubmittingUTR(true);
    const { error } = await supabase
      .from('teams')
      .update({ payment_utr_number: newUTR, payment_status: 'pending_verification' })
      .eq('id', teamData.teamDbId);

    if (error) {
      alert("Error resubmitting UTR. Please try again.");
    } else {
      alert("UTR Resubmitted successfully! Admin will verify soon.");
      window.location.reload();
    }
    setIsSubmittingUTR(false);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading dashboard...</div>
  }

  if (!teamData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Almost there!</h2>
        <p className="text-slate-500 mb-6">You've successfully logged in, but you haven't registered a team yet.</p>
        <Button onClick={() => navigate('/auth')}>Start Registration Wizard</Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 text-slate-900 font-sans">
      
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Box className="h-6 w-6 text-blue-600" />
          <span className="text-lg tracking-tight">Zephyr <span className="text-slate-400 font-normal">| Participant</span></span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <Bell className="h-4 w-4 text-slate-600" />
          </Button>
          <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-sm">
            {teamData.name.charAt(0)}
          </div>
          <Button variant="ghost" size="icon" className="text-slate-500" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {teamData.name}</h1>
          <p className="text-slate-500 mt-2">Manage your hackathon registration and submissions.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
                <CardDescription>Your current progress in the Zephyr Hackathon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="font-medium">Track Selection</p>
                    <p className="text-sm text-slate-500">{teamData.track}</p>
                  </div>
                  <Badge variant="success">Locked</Badge>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="font-medium">Problem Statement</p>
                    <p className="text-sm text-slate-500">{teamData.problemStatement}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="font-medium">Institution</p>
                    <p className="text-sm text-slate-500">{teamData.college} - {teamData.department}</p>
                  </div>
                </div>

                <div className="flex flex-col border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment (UTR Verification)</p>
                      <p className="text-sm text-slate-500">
                        {teamData.utrStatus === 'verified' ? 'Payment confirmed by admin.' : teamData.utrStatus === 'rejected' ? 'Invalid UTR submitted.' : 'Awaiting admin verification.'}
                      </p>
                    </div>
                    {teamData.utrStatus === 'verified' ? (
                      <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3"/> Verified</Badge>
                    ) : teamData.utrStatus === 'rejected' ? (
                      <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3"/> Invalid UTR</Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3"/> Pending</Badge>
                    )}
                  </div>
                  
                  {teamData.utrStatus === 'rejected' && (
                    <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 space-y-3">
                      <p className="text-sm text-red-800 font-medium">Your previous UTR was marked as invalid or mismatched by the admin. Please verify and resubmit the correct 12-digit UTR number from your payment app.</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                          type="text" 
                          value={newUTR}
                          onChange={(e) => setNewUTR(e.target.value)}
                          placeholder="Enter correct UTR Number" 
                          className="flex h-10 w-full max-w-sm rounded-md border border-red-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" 
                        />
                        <Button onClick={handleResubmitUTR} disabled={isSubmittingUTR} className="bg-red-600 hover:bg-red-700 text-white shrink-0">
                          {isSubmittingUTR ? 'Submitting...' : 'Resubmit UTR'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Evaluation Results</p>
                    <p className="text-sm text-slate-500">Phase 1 qualification status.</p>
                  </div>
                  {teamData.resultsStatus === 'qualified' ? (
                    <Badge variant="success" className="bg-emerald-500 text-white border-transparent">🎉 Qualified</Badge>
                  ) : teamData.resultsStatus === 'not-qualified' ? (
                    <Badge variant="destructive">Not Qualified</Badge>
                  ) : (
                    <Badge variant="secondary">Awaiting Results</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Submission</CardTitle>
                <CardDescription>Submit your Google Drive presentation link.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800">
                    <strong>Template:</strong> Please use the official Zephyr PPT Template for your submission.
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2" 
                      placeholder="https://docs.google.com/presentation/..."
                      defaultValue={teamData.presentationLink}
                      disabled={teamData.resultsStatus === 'qualified'}
                    />
                    <Button disabled={teamData.resultsStatus === 'qualified'}>Update Link</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {teamData.members.map((member) => (
                    <li key={member.id} className="flex flex-col border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                          {member.name ? member.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <span className="text-sm font-semibold block">{member.name} {member.is_leader && <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1">Leader</Badge>}</span>
                          <span className="text-xs text-slate-500">{member.email}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-500 pl-11">
                        {member.year} Year • {member.phone}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </main>
    </div>
  )
}
