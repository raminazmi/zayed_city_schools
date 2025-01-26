import { useSelector } from "react-redux";

export default function Checkbox({ className = '', ...props }) {
      const isDark = useSelector((state) => state.theme.darkMode === "dark");
    return (
        <input
            {...props}
            type="checkbox"
            className={
                `rounded border-primaryColor shadow-sm focus:ring-primaryColor
                ${isDark ? 'text-TextLight' : 'text-primaryColor'} ` +
                className
            }
        />
    );
}
