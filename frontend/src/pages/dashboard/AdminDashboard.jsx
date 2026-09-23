import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Bell, Box, CheckCircle2, Search, XCircle } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [pendingPayments, setPendingPayments] = useState([])
  const [activeTeams, setActiveTeams] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, evaluated: 0 })

  useEffect(() => {
    async function checkAdminAndFetchData() {
      // For now, we allow any logged in user with access to view this if they know the URL,
      // but in production, we should check a role or the `admin_users` table.
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/auth')
        return
      }
      setIsAdmin(true)

      // Fetch pending payments
      const { data: pendingData } = await supabase
        .from('teams')
        .select(`*, problem_statements(domain), team_members(count)`)
        .eq('payment_status', 'pending_verification')
      
      if (pendingData) setPendingPayments(pendingData)

      // Fetch evaluated teams (paid / active in rounds)
      const { data: activeData } = await supabase
        .from('teams')
        .select(`*, problem_statements(domain), evaluations(*)`)
        .eq('payment_status', 'paid')
      
      if (activeData) setActiveTeams(activeData)

      // Basic stats
      const { count: totalCount } = await supabase.from('teams').select('*', { count: 'exact', head: true })
      setStats({
        total: totalCount || 0,
        pending: pendingData ? pendingData.length : 0,
        evaluated: activeData ? activeData.filter(t => t.evaluations && t.evaluations.length > 0).length : 0
      })

      setLoading(false)
    }

    checkAdminAndFetchData()
  }, [navigate])

  const handleVerifyPayment = async (teamId) => {
    const { error } = await supabase
      .from('teams')
      .update({ payment_status: 'paid' })
      .eq('id', teamId)
    
    if (!error) {
      // Move from pending to active array optimistically
      const verifiedTeam = pendingPayments.find(t => t.id === teamId)
      if (verifiedTeam) {
        setPendingPayments(prev => prev.filter(t => t.id !== teamId))
        setActiveTeams(prev => [...prev, { ...verifiedTeam, payment_status: 'paid' }])
        setStats(prev => ({ ...prev, pending: prev.pending - 1 }))
      }
    }
  }

  const handleRejectPayment = async (teamId) => {
    const { error } = await supabase
      .from('teams')
      .update({ payment_status: 'rejected' })
      .eq('id', teamId)
    
    if (!error) {
      setPendingPayments(prev => prev.filter(t => t.id !== teamId))
      setStats(prev => ({ ...prev, pending: prev.pending - 1 }))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading admin panel...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 text-slate-900 font-sans">
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Box className="h-6 w-6 text-indigo-600" />
          <span className="text-lg tracking-tight">Zephyr <span className="text-slate-400 font-normal">| Admin Control</span></span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <Bell className="h-4 w-4 text-slate-600" />
          </Button>
          <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium text-sm">
            AD
          </div>
          <Button variant="ghost" size="icon" className="text-slate-500" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
            <p className="text-slate-500 mt-2">Manage hackathon registrations and grading.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Export Data</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Publish Results</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending UTRs</CardTitle>
              <CreditCard className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fully Evaluated</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.evaluated}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="payments">Payment Verification Queue</TabsTrigger>
            <TabsTrigger value="grading">Grading & Evaluation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Queue</CardTitle>
                <CardDescription>Verify 12-digit UTR numbers submitted by teams to unlock their registration.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>UTR Number</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.team_name}</TableCell>
                        <TableCell>{team.problem_statements?.domain || 'TBD'}</TableCell>
                        <TableCell>{team.team_members?.[0]?.count || 0}</TableCell>
                        <TableCell className="font-mono">{team.payment_utr_number}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleRejectPayment(team.id)}><XCircle className="h-4 w-4 mr-1"/> Reject</Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleVerifyPayment(team.id)}><CheckCircle2 className="h-4 w-4 mr-1"/> Verify</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pendingPayments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">No pending payments to verify.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grading">
            <Card>
              <CardHeader>
                <CardTitle>Grading Flow</CardTitle>
                <CardDescription>Assign grades (S, A, B, C, D) and marks to verified teams.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Track</TableHead>
                      <TableHead>Presentation</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Mark</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeTeams.map((team) => {
                      const grade = team.evaluations?.[0]?.grade || '-'
                      const mark = team.evaluations?.[0]?.total_score || ''
                      return (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.team_name}</TableCell>
                        <TableCell>{team.problem_statements?.domain || 'TBD'}</TableCell>
                        <TableCell>
                          {team.presentation_link ? <a href={team.presentation_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View PPT</a> : <span className="text-slate-400">Not submitted</span>}
                        </TableCell>
                        <TableCell>
                          <select className="border-slate-200 rounded-md text-sm p-1" defaultValue={grade}>
                            <option>-</option>
                            <option>S</option>
                            <option>A</option>
                            <option>B</option>
                            <option>C</option>
                            <option>D</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <input type="number" className="w-16 border border-slate-200 rounded-md p-1 text-sm" defaultValue={mark} placeholder="0-100" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="secondary">Save</Button>
                        </TableCell>
                      </TableRow>
                    )})}
                    {activeTeams.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">No active teams to grade yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
      </main>
    </div>
  )
}
