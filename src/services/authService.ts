import { supabase } from '../lib/supabase';
import type { User } from '../lib/supabase';

export const authService = {
  async signUp(userData: Omit<User, 'id' | 'created_at'>, password: string) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              phone: userData.phone,
              location: userData.location,
              hospital_name: userData.hospital_name,
              address: userData.address,
              lat: userData.lat,
              lng: userData.lng,
            }
          ])
          .select()
          .single();

        if (profileError) throw profileError;

        // If hospital, create hospital record
        if (userData.role === 'hospital' && userData.hospital_name) {
          const { error: hospitalError } = await supabase
            .from('hospitals')
            .insert([
              {
                name: userData.hospital_name,
                address: userData.address || '',
                phone: userData.phone || '',
                image: 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=800',
                rating: 0,
                lat: userData.lat || 0,
                lng: userData.lng || 0,
                user_id: authData.user.id,
              }
            ]);

          if (hospitalError) throw hospitalError;
        }

        return { user: profileData, error: null };
      }

      return { user: null, error: 'Failed to create user' };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        return { user: profileData, error: null };
      }

      return { user: null, error: 'Failed to sign in' };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) throw profileError;
        return { user: profileData, error: null };
      }

      return { user: null, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }
};