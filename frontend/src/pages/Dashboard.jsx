import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Box, Loader2 } from 'lucide-react';
import TeamRegistrationForm from '../components/TeamRegistrationForm';
import TeamHub from '../components/TeamHub';

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [teamMemberData, setTeamMemberData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setSession(session);
        fetchDashboardData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async (userId) => {
    setLoading(true);
    try {
      // 1. Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData) setProfile(profileData);

      // 2. Check if user is in a team
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberData) {
        setTeamMemberData(memberData);
        // 3. Fetch team details
        const { data: tData, error: tError } = await supabase
          .from('teams')
          .select('*, problem_statements(title, description, domain), team_members(*)')
          .eq('id', memberData.team_id)
          .single();
        
        if (tData) setTeamData(tData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Callback to refresh data after team registration
  const handleRegistrationComplete = () => {
    if (session) {
      fetchDashboardData(session.user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 text-slate-900 font-sans relative">
      {/* Dotted Grid Background for the whole registration section */}
      {!teamData && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          zIndex: 0
        }} />
      )}
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6 shadow-sm">
        <div className="w-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 font-semibold">
            <img src="/logos/zephyr-logo-new.png" alt="Zephyr" className="h-8 object-contain" />
            <span className="text-lg text-slate-900 tracking-tight hidden sm:block">Participant Portal</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right mr-2">
              <span className="text-sm font-semibold">{profile?.name || session?.user?.email}</span>
              <span className="text-xs text-slate-500">{profile?.college}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {!teamData ? (
            <motion.div
              key="registration"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TeamRegistrationForm 
                user={session?.user} 
                profile={profile} 
                onComplete={handleRegistrationComplete} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TeamHub 
                teamData={teamData} 
                teamMemberData={teamMemberData}
                onRefresh={() => fetchDashboardData(session.user.id)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
