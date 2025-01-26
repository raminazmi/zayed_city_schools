import{u as g,r as l,j as e,S as $,A as f}from"./app-DrYGkpmb.js";import{A as B}from"./AuthenticatedLayout-DH1WOUyn.js";import{B as V}from"./Breadcrumb-D-yvS0r1.js";import{D as P}from"./DataTable-DNMqza36.js";import{t as I}from"./index-CfQLVbGg.js";import{P as u}from"./PrimaryButton-CHSvh-7U.js";import{M as m}from"./Modal-Ci7YKdA6.js";import{S as b}from"./SecondaryButton-DNJo25oV.js";import{I as h}from"./InputLabel-CuvhyPjO.js";import{T as x}from"./TextInput-Cw1t5nMf.js";import"./ApplicationLogo-D0gAqrgm.js";import"./transition-pEnpc1Cw.js";function W({auth:p,classes:v}){g(a=>a.theme.darkMode==="dark");const j=g(a=>a.language.current),t=I[j],[y,n]=l.useState(!1),[r,i]=l.useState(null),[s,o]=l.useState(""),[w,c]=l.useState(!1),[C,d]=l.useState(!1),_=[{label:t.attendance,href:"/teacher/dashboard/attendance"},{label:t.list}],N=[{key:"class_name",label:t.class_name,sortable:!0},{key:"students_count",label:t.numbers_of_students,sortable:!0},{key:"teacher_name",label:t.teacher_name,sortable:!0},{key:"section",label:t.section,sortable:!0}],S=v.map(a=>({id:a.id,class_name:a.class_name,students_count:a.students_count,teacher_name:a.teacher_name,section:a.section})),k=a=>{i(a),n(!0)},D=a=>{i(a),d(!0)},M=a=>{i(a),c(!0)},E=()=>{!r||!s||(f.visit(`/teacher/dashboard/attendance/${r.id}/attendance?date=${s}`),n(!1),o(""))},A=()=>{!r||!s||(f.visit(`/teacher/dashboard/attendance/${r.id}/view?date=${s}`),d(!1),o(""))},T=()=>{if(!r){toast.error(t.class_required,{position:"top-right",autoClose:3e3});return}const a=s||new Date().toISOString().split("T")[0];window.location.href=`/teacher/dashboard/attendance/${r.id}/export?date=${a}`,c(!1),o("")};return e.jsxs(B,{user:p.user,children:[e.jsx($,{title:t.attendance}),e.jsx("div",{className:"flex",style:{height:"calc(100vh - 66px)"},children:e.jsx("main",{className:"flex-1 overflow-y-auto",children:e.jsxs("div",{className:"py-6",children:[e.jsxs("div",{className:"mx-auto px-4 sm:px-6 md:px-14",children:[e.jsx(V,{items:_}),e.jsx("div",{className:"flex justify-between items-center",children:e.jsx("h1",{className:"text-2xl sm:text-3xl  mt-3 font-bold text-primaryColor",children:t.attendance})})]}),e.jsx("div",{className:"mx-auto px-4 sm:px-6 md:px-8 mt-6",children:e.jsx(P,{columns:N,data:S,searchable:!0,filterable:!1,selectable:!1,actions:!1,buttons:[{label:t.veiw,onClick:D,bgColor:"bg-blue-500",hoverColor:"hover:bg-green-600",ringColor:"ring-blue-500",show:a=>a},{label:t.mark_attendance,onClick:k,bgColor:"bg-primaryColor",hoverColor:"hover:bg-blue-600",ringColor:"bg-primaryColor",show:a=>a},{label:t.export,onClick:M,bgColor:"bg-green-500",hoverColor:"hover:bg-green-600",ringColor:"ring-green-500",show:a=>a}]})})]})})}),e.jsx(m,{show:w,onClose:()=>c(!1),children:e.jsxs("div",{className:"p-6",children:[e.jsx(h,{value:t.enter_attendance_date_to_export}),e.jsx(x,{type:"date",value:s||new Date().toISOString().split("T")[0],onChange:a=>o(a.target.value),className:"mt-2 p-2 border border-gray-300 rounded w-full"}),e.jsxs("div",{className:"mt-6 flex justify-end space-x-3",children:[e.jsx(b,{onClick:()=>c(!1),className:"mx-2 !bg-gray-600 rounded-md hover:!bg-gray-700 focus:!bg-gray-700 text-white focus:!ring-gray-500",children:t.cancel}),e.jsx(u,{onClick:T,className:"!bg-blue-600 rounded-md hover:!bg-blue-700 focus:!bg-blue-700 focus:!ring-blue-500",children:t.export_to_Excel})]})]})}),e.jsx(m,{show:y,onClose:()=>n(!1),children:e.jsxs("div",{className:"p-6",children:[e.jsx(h,{value:t.enter_attendance_date}),e.jsx(x,{type:"date",value:s,onChange:a=>o(a.target.value),className:"mt-2 p-2 border border-gray-300 rounded w-full"}),e.jsxs("div",{className:"mt-6 flex justify-end space-x-3",children:[e.jsx(b,{onClick:()=>n(!1),className:"mx-2 !bg-gray-600 rounded-md hover:!bg-gray-700 focus:!bg-gray-700 text-white focus:!ring-gray-500",children:t.cancel}),e.jsx(u,{onClick:E,className:"!bg-blue-600 rounded-md hover:!bg-blue-700 focus:!bg-blue-700 focus:!ring-blue-500",children:t.next})]})]})}),e.jsx(m,{show:C,onClose:()=>d(!1),children:e.jsxs("div",{className:"p-6",children:[e.jsx(h,{value:t.enter_attendance_date}),e.jsx(x,{type:"date",value:s,onChange:a=>o(a.target.value),className:"mt-2 p-2 border border-gray-300 rounded w-full"}),e.jsxs("div",{className:"mt-6 flex justify-end space-x-3",children:[e.jsx(b,{onClick:()=>d(!1),className:"mx-2 !bg-gray-600 rounded-md hover:!bg-gray-700 focus:!bg-gray-700 text-white focus:!ring-gray-500",children:t.cancel}),e.jsx(u,{onClick:A,className:"!bg-blue-600 rounded-md hover:!bg-blue-700 focus:!bg-blue-700 focus:!ring-blue-500",children:t.veiw})]})]})})]})}export{W as default};
