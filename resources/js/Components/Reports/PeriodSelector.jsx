import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSelector } from "react-redux";

export default function PeriodSelector({ period, onChange }) {
  const { t } = useTranslation();
  const isDark = useSelector((state) => state.theme.darkMode === "dark");

  return (
    <div className="mb-6">
      <select
              value={period}
              onChange={(e) => onChange(e.target.value)}
              className={`${isDark ? 'bg-DarkBG1 text-TextLight' : 'bg-LightBG1 text-TextDark'} rounded-sm border-none`}
      >
        <option value="daily">{t('daily')}</option>
        <option value="weekly">{t('weekly')}</option>
        <option value="monthly">{t('monthly')}</option>
        <option value="yearly">{t('yearly')}</option>
      </select>
    </div>
  );
}