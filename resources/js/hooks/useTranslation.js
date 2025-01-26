import { useSelector } from 'react-redux';
import { translations } from '@translations';

export function useTranslation() {
    const language = useSelector((state) => state.language.current);

    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    return { t, language };
}