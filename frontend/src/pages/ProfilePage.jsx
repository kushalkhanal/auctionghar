
import React, { Fragment, useState } from 'react';
import { useUserProfile } from '../hooks/useUserProfile'; // <-- We only need this one hook
import { Tab } from '@headlessui/react';
import { UserIcon, DocumentTextIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import MyBidsTab from '../components/profile/MyBidsTab';
import SellingItemsTab from '../components/profile/SellingItemsTab';
import SettingsTab from '../components/profile/SettingsTab';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const ProfilePage = () => {
  // This single hook call gets ALL data and the function to refresh it.
  const { profile, listedItems, bidHistory, loading, error, refresh } = useUserProfile();

  // This state controls which tab is currently selected, preventing it from resetting.
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle loading and error states first
  if (loading) return <div className="text-center py-20 text-lg font-semibold">Loading Profile...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-semibold">{error}</div>;
  if (!profile) return <div className="text-center py-20">Could not find profile data.</div>;

  // Define the tabs after we know the data is available
  const tabs = [
    { name: 'My Bids', icon: DocumentTextIcon, content: <MyBidsTab bidHistory={bidHistory} /> },
    { name: 'Items I\'m Selling', icon: UserIcon, content: <SellingItemsTab items={listedItems} /> },
    { name: 'Settings', icon: Cog6ToothIcon, content: <SettingsTab user={profile} onProfileUpdate={refresh} /> },
  ];

  return (
    <div className="bg-neutral-lightest min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        {/* --- Profile Header --- */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <img 
            src={`http://localhost:5050${profile.profileImage}`} 
            alt={profile.firstName} 
            className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-primary object-cover bg-gray-200" 
          />
          <div>
            <h1 className="text-3xl font-bold text-neutral-darkest">{profile.firstName} {profile.lastName}</h1>
            <p className="text-neutral-dark">{profile.email}</p>
            {profile.location && <p className="text-sm text-neutral-dark mt-1">From: {profile.location}</p>}
          </div>
          <div className="sm:ml-auto bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-sm text-primary-dark font-semibold">Wallet Balance</p>
            <p className="text-3xl font-bold text-primary">${profile.wallet.toLocaleString()}</p>
          </div>
        </div>

        {/* --- Tabs Section --- */}
        <div className="w-full max-w-4xl mx-auto pt-8 pb-10">
          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex space-x-1 rounded-xl bg-primary/10 p-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'w-full flex justify-center items-center space-x-2 rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors',
                      'ring-white/60 ring-offset-2 ring-offset-primary-dark focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-primary shadow'
                        : 'text-primary-dark/70 hover:bg-white/[0.12] hover:text-primary'
                    )
                  }
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-4">
              {tabs.map((tab, idx) => (
                <Tab.Panel key={idx} className='rounded-xl bg-white p-4 md:p-6 shadow-md ring-1 ring-black/5'>
                  {tab.content}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;