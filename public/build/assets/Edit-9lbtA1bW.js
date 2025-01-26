import{G as v,u as o,j as e,S as N}from"./app-DrYGkpmb.js";import{A as y}from"./AuthenticatedLayout-DH1WOUyn.js";import{B as _}from"./Breadcrumb-D-yvS0r1.js";import{P as k}from"./PrimaryButton-CHSvh-7U.js";import{I as n}from"./InputLabel-CuvhyPjO.js";import{T as d}from"./TextInput-Cw1t5nMf.js";import{I as c}from"./InputError-BPSlOYm1.js";import{t as w}from"./index-CfQLVbGg.js";import"./ApplicationLogo-D0gAqrgm.js";import"./transition-pEnpc1Cw.js";function P({auth:x,classRoom:r,teachers:u}){const{data:l,setData:i,put:h,errors:t,processing:p}=v({name:r.name||"",section:r.section||"",teacher_id:r.teacher_id||""}),j=s=>{s.preventDefault(),h(`/admin/dashboard/classes/${r.id}`,{preserveScroll:!0,onError:f=>{console.log(f)}})},m=o(s=>s.theme.darkMode==="dark"),g=o(s=>s.language.current),a=w[g],b=[{label:a.classroom_management,href:"/admin/dashboard/classes"},{label:a.edit_class}];return e.jsxs(y,{user:x.user,children:[e.jsx(N,{title:a.edit_class}),e.jsx("div",{className:"flex",style:{height:"calc(100vh - 66px)"},children:e.jsx("main",{className:"flex-1 overflow-y-auto",children:e.jsxs("div",{className:"py-6",children:[e.jsxs("div",{className:"mx-auto px-4 sm:px-6 md:px-14",children:[e.jsx(_,{items:b}),e.jsx("h1",{className:"text-2xl sm:text-3xl  mt-3 font-bold text-primaryColor",children:a.edit_class})]}),e.jsx("div",{className:"mx-auto px-4 sm:px-6 md:px-16 mt-6",children:e.jsxs("form",{onSubmit:j,className:"space-y-6",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex justify-between gap-6",children:[e.jsxs("div",{className:"w-full",children:[e.jsx(n,{value:a.class_name}),e.jsx(d,{id:"name",type:"text",name:"name",className:`mt-1 block w-full ${m?"bg-DarkBG1":"bg-TextLight"}`,value:l.name,onChange:s=>i("name",s.target.value)}),t.name&&e.jsx(c,{message:t.name,className:"mt-2"})]}),e.jsxs("div",{className:"w-full",children:[e.jsx(n,{value:a.section}),e.jsx(d,{id:"section",type:"text",name:"section",className:`mt-1 block w-full ${m?"bg-DarkBG1":"bg-TextLight"}`,value:l.section,onChange:s=>i("section",s.target.value)}),t.section&&e.jsx(c,{message:t.section,className:"mt-2"})]})]}),e.jsxs("div",{children:[e.jsx(n,{value:a.select_teacher}),e.jsxs("select",{id:"teacher_id",name:"teacher_id",className:`w-[100%] focus:border-primaryColor focus:ring-primaryColor rounded-md shadow-sm border-none h-[45px] mt-3 ${m?"bg-DarkBG1 text-TextLight":"bg-LightBG1 text-TextDark border-gray-400 border-[0.1px]"} `,value:l.teacher_id,onChange:s=>i("teacher_id",s.target.value),children:[e.jsx("option",{value:"",disabled:!0,children:a.select_teacher}),u.map(s=>e.jsx("option",{value:s.id,children:s.name},s.id))]}),t.teacher_id&&e.jsx(c,{message:t.teacher_id,className:"mt-2"})]})]}),e.jsx("div",{className:"flex justify-end",children:e.jsx(k,{type:"submit",disabled:p,children:a.save})})]})})]})})})]})}export{P as default};
