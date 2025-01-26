import { useSelector } from "react-redux";
import { translations } from '../translations';
import Logo from '../../assets/logo.png';

export default function ApplicationLogo({width}) {
const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.current);
    const t = translations[language];
    return (
     <div className={`text-xl font-bold  mx-auto lg:mx-0 ${isDark ? 'text-TextLight' : 'text-TextDark'}`} >
              <img src={Logo} alt="Logo" style={{ width: `${width}`, height: 'auto' }} />
    </div>
    );
}
