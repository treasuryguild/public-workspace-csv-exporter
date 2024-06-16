// ../components/nav.tsx
import Link from 'next/link';
import { useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { Session } from "@supabase/supabase-js";

const Nav = () => {
  
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        if (session?.user?.id === process.env.NEXT_PUBLIC_TREASURY_ADMIN) {
          setIsAdmin(true)
        }
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        if (session?.user?.id === process.env.NEXT_PUBLIC_TREASURY_ADMIN) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      })
      
      return () => subscription.unsubscribe()
    }, [])

    async function signInWithDiscord() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: 'http://localhost:3000/',
        },
      })
    }
  
    async function signout() {
      const { error } = await supabase.auth.signOut()
    }
   //console.log(session, isAdmin)
  return (
    <nav className="routes">
          <Link href="/" className="navitems">
            Home
          </Link>
          <Link href="/githubexports" className="navitems">
            GitHub Exports
          </Link>
          <Link href="/deworkexports" className="navitems">
            Dework Exports
          </Link>
          {!session && (<button onClick={signInWithDiscord} className="navitems">
          Sign In with Discord
        </button>)}
          {session && (
          <button onClick={signout} className="navitems">
          Sign Out
          </button>)}
    </nav>
  );
};

export default Nav;