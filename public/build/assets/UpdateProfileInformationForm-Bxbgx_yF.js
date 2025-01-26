import{X as v,u as g,G as N,j as e,x as y}from"./app-DrYGkpmb.js";import{I as n}from"./InputError-BPSlOYm1.js";import{I as l}from"./InputLabel-CuvhyPjO.js";import{P as _}from"./PrimaryButton-CHSvh-7U.js";import{T as o}from"./TextInput-Cw1t5nMf.js";import{t as b}from"./index-CfQLVbGg.js";import{q as I}from"./transition-pEnpc1Cw.js";function D({mustVerifyEmail:c,status:q,className:u="",profileUpdateUrl:d}){const t=v().props.auth.user,x=g(s=>s.language.current),a=b[x],{data:r,setData:i,patch:p,errors:m,processing:f,recentlySuccessful:h}=N({name:t.name,email:t.email}),j=s=>{s.preventDefault(),p(d)};return e.jsxs("section",{className:u,children:[e.jsxs("header",{children:[e.jsx("h2",{className:"text-lg font-medium",children:a.profile_information}),e.jsx("p",{className:"mt-1 text-sm",children:a.update_profile_description})]}),e.jsxs("form",{onSubmit:j,className:"mt-6 space-y-6",children:[e.jsxs("div",{children:[e.jsx(l,{htmlFor:"name",value:a.name}),e.jsx(o,{id:"name",className:"mt-1 block w-full",value:r.name,onChange:s=>i("name",s.target.value),required:!0,isFocused:!0,autoComplete:"name"}),e.jsx(n,{className:"mt-2",message:m.name})]}),e.jsxs("div",{children:[e.jsx(l,{htmlFor:"email",value:a.email}),e.jsx(o,{id:"email",type:"email",className:"mt-1 block w-full",value:r.email,onChange:s=>i("email",s.target.value),required:!0,autoComplete:"username"}),e.jsx(n,{className:"mt-2",message:m.email})]}),c&&t.email_verified_at===null&&e.jsx("div",{children:e.jsxs("p",{className:"text-sm mt-2",children:[a.email_unverified,e.jsx(y,{href:route("admin.verification.send"),className:"font-medium text-indigo-600 hover:text-indigo-500",children:a.resend_verification})]})}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(_,{disabled:f,children:a.save}),e.jsx(I,{show:h,enter:"transition ease-in-out",enterFrom:"opacity-0",leave:"transition ease-in-out",leaveTo:"opacity-0",children:e.jsx("p",{className:"text-sm text-gray-600",children:a.saved})})]})]})]})}export{D as default};
