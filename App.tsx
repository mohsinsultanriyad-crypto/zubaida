
import React, { useState, useEffect, useRef } from 'react';
import { User, Shift, Leave, SitePost, AdvanceRequest, Announcement } from './types';
import { MOCK_WORKERS, MOCK_ADMIN } from './constants';
import WorkerApp from './components/WorkerApp';
import AdminApp from './components/AdminApp';
import Login from './components/Login';
import { Language } from './translations';
import { db } from './db';
import { Loader2, Cloud } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [posts, setPosts] = useState<SitePost[]>([]);
  const [workers, setWorkers] = useState<User[]>(MOCK_WORKERS);
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  // 1. Initial Data Fetch from MongoDB + Session Restoration
  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch all data from Cloud (MongoDB)
        const [dbShifts, dbLeaves, dbPosts, dbWorkers, dbAdvances, dbAnnounce] = await Promise.all([
          db.getAll<Shift>('shifts'),
          db.getAll<Leave>('leaves'),
          db.getAll<SitePost>('posts'),
          db.getAll<User>('workers'),
          db.getAll<AdvanceRequest>('advanceRequests'),
          db.getAll<Announcement>('announcements'),
        ]);

        if (dbShifts.length) setShifts(dbShifts);
        if (dbLeaves.length) setLeaves(dbLeaves);
        if (dbPosts.length) setPosts(dbPosts);
        if (dbWorkers.length) setWorkers(dbWorkers);
        if (dbAdvances.length) setAdvanceRequests(dbAdvances);
        if (dbAnnounce.length) setAnnouncements(dbAnnounce);

        // Language Persistence
        const savedLang = localStorage.getItem('fw_lang');
        if (savedLang) setLanguage(savedLang as Language);

        // SESSION PERSISTENCE: Check if a user was previously logged in
        const sessionUserId = localStorage.getItem('fw_session_id');
        const sessionRole = localStorage.getItem('fw_session_role');

        if (sessionUserId && sessionRole) {
          if (sessionRole === 'admin' && sessionUserId === MOCK_ADMIN.email) {
            setCurrentUser(MOCK_ADMIN);
          } else {
            // Check in the freshly fetched MongoDB workers
            const allWorkers = dbWorkers.length > 0 ? dbWorkers : MOCK_WORKERS;
            const foundUser = allWorkers.find(w => w.id === sessionUserId || w.workerId === sessionUserId);
            if (foundUser) {
              setCurrentUser(foundUser);
            }
          }
        }
      } catch (e) {
        console.error("Cloud fetch failed", e);
      } finally {
        setIsLoaded(true);
      }
    };
    initData();
  }, []);

  // 2. State-to-MongoDB Sync Wrappers
  const updateShifts: React.Dispatch<React.SetStateAction<Shift[]>> = (val) => {
    setShifts(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('shifts', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updateLeaves: React.Dispatch<React.SetStateAction<Leave[]>> = (val) => {
    setLeaves(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('leaves', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updateWorkers: React.Dispatch<React.SetStateAction<User[]>> = (val) => {
    setWorkers(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('workers', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updatePosts: React.Dispatch<React.SetStateAction<SitePost[]>> = (val) => {
    setPosts(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('posts', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updateAdvanceRequests: React.Dispatch<React.SetStateAction<AdvanceRequest[]>> = (val) => {
    setAdvanceRequests(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('advanceRequests', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const updateAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>> = (val) => {
    setAnnouncements(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setIsSyncing(true);
      db.saveBatch('announcements', next).finally(() => setIsSyncing(false));
      return next;
    });
  };

  const handleLogin = (user: User) => {
    // Save minimal session info to localStorage for refresh persistence
    localStorage.setItem('fw_session_id', user.role === 'admin' ? (user.email || '') : (user.workerId || user.id));
    localStorage.setItem('fw_session_role', user.role);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    // Clear session info
    localStorage.removeItem('fw_session_id');
    localStorage.removeItem('fw_session_role');
    setCurrentUser(null);
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('fw_lang', lang);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Synchronizing Cloud Data...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} workers={workers} />;
  }

  return (
    <div 
      className={`min-h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden flex flex-col`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Cloud Sync Status Overlay */}
      <div className="fixed top-4 right-4 z-[200] pointer-events-none">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all duration-500 shadow-sm ${isSyncing ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
          <Cloud size={10} className={isSyncing ? 'animate-bounce' : ''} />
          {isSyncing ? 'Syncing...' : 'MongoDB Live'}
        </div>
      </div>

      {currentUser.role === 'admin' ? (
        <AdminApp 
          user={currentUser} 
          shifts={shifts} 
          setShifts={updateShifts} 
          leaves={leaves} 
          setLeaves={updateLeaves}
          workers={workers}
          setWorkers={updateWorkers}
          posts={posts}
          setPosts={updatePosts}
          advanceRequests={advanceRequests}
          setAdvanceRequests={updateAdvanceRequests}
          announcements={announcements}
          setAnnouncements={updateAnnouncements}
          onLogout={handleLogout}
          language={language}
          setLanguage={handleSetLanguage}
        />
      ) : (
        <WorkerApp 
          user={currentUser} 
          shifts={shifts} 
          setShifts={updateShifts} 
          leaves={leaves} 
          setLeaves={updateLeaves}
          posts={posts}
          setPosts={updatePosts}
          advanceRequests={advanceRequests}
          setAdvanceRequests={updateAdvanceRequests}
          announcements={announcements}
          workers={workers}
          onLogout={handleLogout}
          language={language}
          setLanguage={handleSetLanguage}
        />
      )}
    </div>
  );
};

export default App;
