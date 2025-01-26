import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const StatCard = ({ title, value, type }) => {
  const colorClasses = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[type]}`}>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}%</p>
    </div>
  );
};

export default function AttendanceStats({ data }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title={t('present_rate')}
        value={data.presentRate}
        type="present"
      />
      <StatCard
        title={t('absent_rate')}
        value={data.absentRate}
        type="absent"
      />
      <StatCard
        title={t('late_rate')}
        value={data.lateRate}
        type="late"
      />
    </div>
  );
}