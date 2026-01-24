import React from 'react';

const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
        orange: 'bg-orange-100 text-orange-700'
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg p-4 text-center transition-transform hover:scale-105`}>
            {Icon && (
                <div className="flex justify-center mb-2">
                    <Icon className="h-6 w-6" />
                </div>
            )}
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm font-medium opacity-80">{label}</p>
        </div>
    );
};

export default StatCard;
