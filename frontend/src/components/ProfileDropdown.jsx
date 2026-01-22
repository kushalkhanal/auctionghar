
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, WalletIcon, DocumentTextIcon, PowerIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ProfileDropdown = ({ user, onLogout }) => {

  if (!user || typeof user.wallet === 'undefined') {
    return null; 
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center items-center rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary-dark hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
          <WalletIcon className="mr-2 h-5 w-5" aria-hidden="true" />
          ${user.wallet.toLocaleString()}
          <ChevronDownIcon
            className="ml-2 -mr-1 h-5 w-5 text-primary-dark/80"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          
          <div className="px-1 py-1">
            <div className="flex items-center space-x-2 px-3 py-2">
                <UserCircleIcon className="h-6 w-6 text-gray-500" />
                <div>
                    <p className="text-sm">Signed in as</p>
                    <p className="truncate text-sm font-medium text-gray-900">{user.firstName}</p>
                </div>
            </div>
          </div>
          
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <Link to="/profile" className={`${active ? 'bg-primary text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                  <UserCircleIcon className="mr-2 h-5 w-5" /> My Profile
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link to="/profile/bids" className={`${active ? 'bg-primary text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                  <DocumentTextIcon className="mr-2 h-5 w-5" /> Bid History
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link to="/profile/wallet" className={`${active ? 'bg-primary text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                  <WalletIcon className="mr-2 h-5 w-5" /> Wallet
                </Link>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button onClick={onLogout} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                  <PowerIcon className="mr-2 h-5 w-5" /> Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
export default ProfileDropdown;