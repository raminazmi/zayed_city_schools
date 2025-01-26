import { useState, createContext, useContext, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const isDark = useSelector((state) => state.theme.darkMode === "dark");
    const language = useSelector((state) => state.language.language);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen, isDark, language }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { toggleOpen, setOpen, open } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>
            {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>}
        </>
    );
};

const Content = ({ align = 'right', contentClasses = '', children }) => {
    const { open, setOpen, isDark } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    const finalContentClasses = `${contentClasses} ${isDark ? 'bg-DarkBG1 py-1' : 'bg-LightBG1 py-1'
        }`.trim();

    return (
        <>
            <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`absolute z-50 mt-2 rounded-xl shadow-sm shadow-LightBG2 ${alignmentClasses} `}
                    onClick={() => setOpen(false)}
                >
                    <div className={`rounded-xl ring-1 ring-black ring-opacity-5 ${finalContentClasses}`}>
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', center = false, top = false, bottom = false, children, ...props }) => {
    const { isDark } = useContext(DropDownContext);
    return (
        <Link
            {...props}
            className={`
                ${isDark ? 'text-TextLight' : 'text-TextDark'}
                block px-2 text-start text-sm leading-5 py-1
                ${top ? 'pt-2' : ''}
                ${bottom ? 'pb-2' : ''}
                ${center ? `flex justify-center pl-1 pr-1 py-2` : ''}
                transition duration-150 ease-in-out 
                ${className}
            `}
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
