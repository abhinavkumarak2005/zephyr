import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { Users, Plus, Trash2, BookOpen, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function TeamRegistrationForm({ user, profile, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topics, setTopics] = useState([]);
  
  const [teamName, setTeamName] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  
  // Leader is always member 0
  const [members, setMembers] = useState([
    { name: profile?.name || '', email: user?.email || '', phone: '', college: profile?.college || '', department: '', year: '', is_leader: true }
  ]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    const { data, error } = await supabase.from('problem_statements').select('*').eq('is_active', true);
    if (data) setTopics(data);
  };

  const addMember = () => {
    if (members.length < 4) {
      setMembers([...members, { name: '', email: '', phone: '', college: '', department: '', year: '', is_leader: false }]);
    }
  };

  const removeMember = (index) => {
    if (members.length > 1 && index !== 0) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (members.length < 2) {
      setError('A team must have at least 2 members.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Team
      const { data: team, error: teamError } = await supabase.from('teams').insert([{
        team_name: teamName,
        problem_statement_id: selectedTopic,
        college: members[0].college,
        idea_description: ideaDesc,
        current_round: 1,
      }]).select().single();

      if (teamError) throw teamError;

      // 2. Add Members
      const membersToInsert = members.map(m => ({
        team_id: team.id,
        user_id: m.is_leader ? user.id : null,
        name: m.name,
        email: m.email,
        phone: m.phone,
        college: m.college,
        department: m.department,
        year: m.year,
        is_leader: m.is_leader
      }));

      const { error: membersError } = await supabase.from('team_members').insert(membersToInsert);

      if (membersError) throw membersError;

      onComplete();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-slate-200 relative overflow-hidden bg-white/80 backdrop-blur-xl">
      <div className="relative z-10">
        <CardHeader className="border-b border-slate-100 bg-white/50 backdrop-blur-sm pb-8">
          <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Team Registration
          </CardTitle>
          <CardDescription className="text-slate-500">
            Form your team to participate in the Zephyr Hackathon. Teams must have 2 to 4 members.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 bg-white/90 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-3 border border-red-100 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Project Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Project Details</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Team Name *</label>
                <Input required value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Enter team name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Topic / Problem Statement *</label>
                <select 
                  required
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="" disabled>Select a sector</option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.domain}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedTopic && topics.find(t => t.id == selectedTopic) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-sm text-slate-700 relative overflow-hidden bg-white/60 backdrop-blur-xl"
              >
                <div className="relative z-10">
                  <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    {topics.find(t => t.id == selectedTopic).title}
                  </h4>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-700 pl-10 font-medium tracking-tight">
                    {topics.find(t => t.id == selectedTopic).description}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Brief Idea Description *</label>
              <textarea 
                required
                value={ideaDesc}
                onChange={e => setIdeaDesc(e.target.value)}
                placeholder="Briefly describe your idea or solution approach..."
                className="w-full h-24 px-3 py-2 bg-white/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-y shadow-sm"
              />
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
              <span className="text-sm text-slate-500">{members.length} / 4 Members</span>
            </div>

            <div className="space-y-6">
              {members.map((member, index) => (
                <div key={index} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 relative group transition-colors hover:border-blue-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      {index === 0 ? 'Team Leader' : 'Team Member'}
                    </h4>
                    {index !== 0 && (
                      <button 
                        type="button" 
                        onClick={() => removeMember(index)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">Name *</label>
                      <Input required value={member.name} onChange={e => updateMember(index, 'name', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">Email *</label>
                      <Input type="email" required value={member.email} onChange={e => updateMember(index, 'email', e.target.value)} disabled={index === 0} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">Phone *</label>
                      <Input type="tel" required value={member.phone} onChange={e => updateMember(index, 'phone', e.target.value)} />
                      <p className="text-[10px] text-amber-600 font-medium mt-1">Please provide your active WhatsApp number.</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">College/University *</label>
                      <Input required value={member.college} onChange={e => updateMember(index, 'college', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">Department *</label>
                      <Input required value={member.department} onChange={e => updateMember(index, 'department', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">Year *</label>
                      <select 
                        required
                        value={member.year} 
                        onChange={e => updateMember(index, 'year', e.target.value)}
                        className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {members.length < 4 && (
              <Button type="button" variant="outline" onClick={addMember} className="w-full border-dashed py-8 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50">
                <Plus className="w-5 h-5 mr-2" />
                Add Team Member
              </Button>
            )}
          </div>

          <div className="pt-6 border-t flex justify-end">
            <Button type="submit" disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl text-base shadow-lg shadow-blue-500/20">
              {loading ? 'Submitting...' : 'Complete Registration'}
              {!loading && <CheckCircle2 className="w-5 h-5 ml-2" />}
            </Button>
          </div>

        </form>
      </CardContent>
      </div>
    </Card>
  );
}
