import{j as s,x as u}from"./app-DrYGkpmb.js";function f({className:i="",disabled:o,children:r,link:e,onClick:t,...a}){return s.jsx("button",{...a,className:`
                inline-flex items-center px-4 py-2 bg-primaryColor border border-transparent rounded-md font-semibold !text-[12px] sm:text-xs  text-white uppercase tracking-widest hover:bg-SecondaryColor focus:bg-SecondaryColor active:bg-SecondaryColor focus:outline-none focus:ring-2 focus:ring-SecondaryColor focus:ring-offset-2 transition ease-in-out duration-150
                ${o?"opacity-25 cursor-not-allowed":""}
                `+i,onClick:n=>{if(o){n.preventDefault();return}t&&t(n)},disabled:o,children:e?s.jsx(u,{href:e,children:r}):r})}export{f as P};
