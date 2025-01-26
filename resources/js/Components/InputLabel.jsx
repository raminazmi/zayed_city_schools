import { useSelector } from "react-redux";

export default function InputLabel({ value, className = '', children, ...props }) {
        const isDark = useSelector((state) => state.theme.darkMode === "dark");
    return (
        <label {...props} className={`block font-medium text-sm ${isDark ? 'text-TextLight' : 'text-TextDark'}` + className}>
            {value ? value : children}
        </label>
    );
}
