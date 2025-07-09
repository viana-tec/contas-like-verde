import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create profile if user signs up
        if (event === 'SIGNED_IN' && session?.user && !session.user.user_metadata.profile_created) {
          setTimeout(() => {
            createProfile(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up automatic session refresh
    const refreshInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        
        // Refresh if expires in less than 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000) {
          console.log('🔄 Refreshing session...');
          await supabase.auth.refreshSession();
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const createProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        console.log('Profile already exists for user:', user.id);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            full_name: user.user_metadata.full_name || '',
            email: user.email || '',
            role: 'user',
          },
        ]);

      if (error) {
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
};