(()=>{var e={};e.id=754,e.ids=[754],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},7737:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>n.a,__next_app__:()=>h,originalPathname:()=>m,pages:()=>c,routeModule:()=>p,tree:()=>d}),a(8548),a(8719),a(996);var s=a(170),i=a(5002),r=a(3876),n=a.n(r),o=a(6299),l={};for(let e in o)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);a.d(t,l);let d=["",{children:["families",{children:["[id]",{children:["assessment",{children:["[assessid]",{children:["frai",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,8548)),"C:\\Efrait\\frontend\\app\\families\\[id]\\assessment\\[assessid]\\frai\\page.tsx"]}]},{}]},{}]},{}]},{}]},{}]},{layout:[()=>Promise.resolve().then(a.bind(a,8719)),"C:\\Efrait\\frontend\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,996,23)),"next/dist/client/components/not-found-error"]}],c=["C:\\Efrait\\frontend\\app\\families\\[id]\\assessment\\[assessid]\\frai\\page.tsx"],m="/families/[id]/assessment/[assessid]/frai/page",h={require:a,loadChunk:()=>Promise.resolve()},p=new s.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/families/[id]/assessment/[assessid]/frai/page",pathname:"/families/[id]/assessment/[assessid]/frai",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},8892:(e,t,a)=>{Promise.resolve().then(a.bind(a,1622)),Promise.resolve().then(a.bind(a,6721)),Promise.resolve().then(a.bind(a,6344))},1622:(e,t,a)=>{"use strict";a.d(t,{default:()=>c});var s=a(7247),i=a(8964),r=a(8053),n=a(3999),o=a(3102),l=a(2881);let d=`
@media print {
  /* Hide UI elements not needed for printing */
  header, nav, button, .no-print {
    display: none !important;
  }
  
  /* Hide sidebar completely */
  aside, .sidebar, [data-sidebar="sidebar"], nav[aria-label="Sidebar"] {
    display: none !important;
  }
  
  /* Hide any sidebar container */
  .flex > *:first-child:not(main) {
    display: none !important;
  }
  
  /* Make the main content take full width */
  body {
    background-color: white !important;
    margin: 0 !important;
    padding: 20px !important;
  }
  
  /* Format for printing */
  .max-w-7xl {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* Make sure the report is centered */
  .mx-auto {
    width: 100% !important;
  }
  
  /* Table formatting */
  table {
    page-break-inside: avoid;
    border-collapse: collapse;
    width: 100%;
  }
  
  th, td {
    border: 1px solid #ccc !important;
  }
  
  /* Preserve highlighting colors in print */
  .bg-yellow-200 {
    background-color: #fef9c3 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .bg-[#1e56b0], .bg-blue-600 {
    background-color: #1e56b0 !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .bg-[#1f2937], .bg-gray-600 {
    background-color: #1f2937 !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .bg-green-500 {
    background-color: #22c55e !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  
  /* Title formatting */
  .title {
    text-align: center;
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: bold;
  }
  
  /* Header boxes */
  .header-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .header-box {
    background-color: #f9fafb !important;
    padding: 16px;
    border-radius: 8px;
    width: 48%;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  
  /* Set landscape orientation */
  @page {
    size: landscape;
    margin: 1cm;
  }
}`;function c(){let e=(0,n.useRouter)(),t=(0,n.useParams)(),a=t?.id,c=t?.assessid,m=(0,o.v9)(e=>e.family.assessments.find(e=>e.id===c)),[h,p]=(0,i.useState)({"responsive-parenting":0,"family-health":0,engagement:0,"family-support":0,"socio-economic":0}),[u,x]=(0,i.useState)(0);if(!m)return s.jsx("div",{className:"p-6",children:"Assessment not found"});let f=m.mainParent.lastName,g=(e=>{let t=new Date(e);return`${t.getDate()}/${t.getMonth()+1}/${t.getFullYear()}`})(m.createdAt);return(0,s.jsxs)("div",{className:"p-6 max-w-7xl mx-auto",children:[s.jsx("style",{dangerouslySetInnerHTML:{__html:d}}),(0,s.jsxs)("div",{className:"flex items-center justify-between mb-6",children:[s.jsx("h1",{className:"text-2xl font-bold",children:"Family Resilience Assessment Instrument"}),s.jsx(r.z,{onClick:()=>e.push(`/families/${a}`),className:"bg-blue-600 hover:bg-blue-700",children:"Back to Family"})]}),(0,s.jsxs)("div",{className:"grid grid-cols-2 gap-4 mb-6",children:[(0,s.jsxs)("div",{className:"bg-gray-50 p-4 rounded-lg",children:[s.jsx("p",{className:"font-medium",children:"Date of Initial Assessment/Review:"}),s.jsx("p",{className:"text-lg",children:g})]}),(0,s.jsxs)("div",{className:"bg-gray-50 p-4 rounded-lg",children:[s.jsx("p",{className:"font-medium",children:"Name of Family Assessed:"}),s.jsx("p",{className:"text-lg",children:f})]})]}),s.jsx("div",{className:"bg-white rounded-lg shadow-md overflow-x-auto",children:(0,s.jsxs)("table",{className:"w-full border-separate border-spacing-0",children:[s.jsx("thead",{children:(0,s.jsxs)("tr",{children:[s.jsx("th",{className:"border p-2 bg-[#1e56b0] text-white text-center"}),s.jsx("th",{className:"border p-2 bg-[#1e56b0] text-white text-center",children:"Responsive Parenting"}),s.jsx("th",{className:"border p-2 bg-[#1e56b0] text-white text-center",children:"Family Health"}),s.jsx("th",{className:"border p-2 bg-[#1e56b0] text-white text-center",children:"Engagement"}),s.jsx("th",{className:"border p-2 bg-[#1e56b0] text-white text-center",children:"Family Support"}),s.jsx("th",{className:"border p-2 bg-[#1e56b0] text-white text-center",children:"Socio/Economic Factors"})]})}),s.jsx("tbody",{children:[["Parental childhood experience has an entirely positive impact on the child's needs","Parental chronic health problems have no impact on the child's needs or parents have no chronic health problems","Parents always recognise the negative impact of dysfunctional behaviour in others on their family","History of being entirely able to withstand adversity","Always able to meet regular and unexpected financial demands"],["Parental childhood experience has a mainly positive impact on the child's needs","Parental chronic health problems seldom have impact on the child's needs","Parents usually recognise the negative impact of dysfunctional behaviour in others on their family","History of being mainly able to withstand adversity","Always able to meet regular financial demands but not always able to meet large unexpected financial demands"],["Parental childhood experience has led to a conflicting impact on the child's needs.","Parental chronic health problems sometimes have impact on the child's needs","Parents sometimes recognise the negative impact of others' dysfunctional behaviour on their family","Current evidence does not allow a judgement to be made about withstanding adversity.","Able to meet prioritised financial demands but forced to neglect deprioritised financial demands"],["Parental childhood experience has a mainly negative impact on the child's needs","Parental chronic health problems often impact on the child's needs","Parents usually do not recognise the negative impact of others' dysfunctional behaviour on their family","History of being mainly unable to withstand adversity","Occasionally able to meet prioritised financial demands but sometimes forced to neglect them"],["Parental childhood experience has an entirely negative impact on the child's needs","Parental chronic health problems have a constant impact on the child's needs","Parents never recognise the negative impact of others' dysfunctional behaviour on their family","History of being entirely unable to withstand adversity","Not able to meet prioritised financial demands"]].map((e,t)=>(0,s.jsxs)("tr",{children:[s.jsx("td",{className:"border p-2 font-bold text-center bg-gray-50 w-16",children:5-t}),e.map((e,a)=>{let i=(0,l.e0)(t,a,h);return s.jsx("td",{className:`border p-2 text-sm ${i?"bg-yellow-200":""}`,children:e},a)})]},5-t))})]})}),s.jsx("div",{className:"mt-8 mb-4 bg-[#1e56b0] text-white p-4 rounded-lg",children:(0,s.jsxs)("h3",{className:"text-lg font-semibold",children:["Final Score: ",u," out of 25"]})}),s.jsx("div",{className:"grid grid-cols-1 md:grid-cols-5 gap-4 mb-8",children:Object.entries(h).map(([e,t])=>(0,s.jsxs)("div",{className:"bg-[#1f2937] p-4 rounded-lg flex items-center justify-between",children:[(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[s.jsx("div",{className:"w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold",children:t}),s.jsx("div",{children:s.jsx("h4",{className:"text-white text-sm",children:e.split("-").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ")})})]}),(0,s.jsxs)("span",{className:"text-white",children:[t,"/5"]})]},e))}),(0,s.jsxs)("div",{className:"flex justify-between mt-6",children:[s.jsx(r.z,{onClick:()=>window.print(),className:"bg-blue-600 hover:bg-blue-700",children:"Print Report"}),s.jsx(r.z,{onClick:()=>e.push(`/families/${a}`),className:"bg-gray-600 hover:bg-gray-700",children:"Back to Family"})]})]})}},6721:(e,t,a)=>{"use strict";a.d(t,{Header:()=>f});var s=a(7247),i=a(4597),r=a(3999),n=a(8053),o=a(8964),l=a(6416),d=a(5008);let c=l.fC,m=l.xz,h=o.forwardRef(({className:e,sideOffset:t=4,...a},i)=>s.jsx(l.Uv,{children:s.jsx(l.VY,{ref:i,sideOffset:t,className:(0,d.cn)("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",e),...a})}));h.displayName=l.VY.displayName;let p=o.forwardRef(({className:e,...t},a)=>s.jsx(l.ck,{ref:a,className:(0,d.cn)("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",e),...t}));p.displayName=l.ck.displayName;var u=a(2513),x=a(7734);function f(){let e=(0,r.useRouter)(),{user:t,logout:a}=(0,x.aC)();return s.jsx("header",{className:"bg-[#1e56b0] text-white",children:(0,s.jsxs)("div",{className:"container mx-auto px-4 h-16 flex justify-between items-center",children:[(0,s.jsxs)("div",{className:"flex items-center gap-4",children:[s.jsx("div",{className:"h-10 w-24 relative",children:s.jsx(i.default,{src:"/Frait-Logo.png",alt:"FRAIT Logo",fill:!0,className:"object-contain",priority:!0})}),s.jsx("h1",{className:"text-xl font-medium hidden md:block",children:"Health visitor control panel"})]}),s.jsx("div",{className:"flex items-center gap-4",children:(0,s.jsxs)(c,{children:[s.jsx(m,{asChild:!0,children:(0,s.jsxs)(n.z,{variant:"ghost",className:"text-white hover:text-white/90 hover:bg-white/10",children:[t?.username," ",s.jsx(u.Z,{className:"ml-2 h-4 w-4"})]})}),(0,s.jsxs)(h,{align:"end",children:[s.jsx(p,{children:"Profile"}),s.jsx(p,{children:"Settings"}),s.jsx(p,{onClick:()=>{e.push("/")},children:"Logout"})]})]})})]})})}},6344:(e,t,a)=>{"use strict";a.d(t,{Sidebar:()=>x});var s=a(7247),i=a(9906),r=a(3999),n=a(5008),o=a(1697),l=a(7989),d=a(8622),c=a(2661),m=a(7316),h=a(9400),p=a(7734);let u=[{name:"Dashboard",href:"/dashboard",icon:o.Z,roles:[p.i4.HEALTH_VISITOR,p.i4.ASSISTANT_HEALTH_VISITOR,p.i4.MANAGER,p.i4.ADMIN]},{name:"Families",href:"/families",icon:l.Z,roles:[p.i4.HEALTH_VISITOR,p.i4.ASSISTANT_HEALTH_VISITOR,p.i4.MANAGER,p.i4.ADMIN]},{name:"FRAIT Training",href:"/training",icon:d.Z,roles:[p.i4.HEALTH_VISITOR,p.i4.ASSISTANT_HEALTH_VISITOR,p.i4.MANAGER,p.i4.ADMIN]},{name:"User Management",href:"/user-management",icon:c.Z,roles:[p.i4.ADMIN,p.i4.MANAGER]},{name:"System Settings",href:"/settings",icon:m.Z,roles:[p.i4.ADMIN]}];function x(){let e=(0,r.usePathname)(),t=(0,r.useRouter)(),{user:a,logout:o}=(0,p.aC)(),l=u.filter(e=>a&&e.roles.includes(a.role));return s.jsx("div",{className:"w-64 bg-white border-r border-gray-200",children:(0,s.jsxs)("nav",{className:"p-4 space-y-8",children:[s.jsx("div",{className:"space-y-2",children:l.map(t=>(0,s.jsxs)(i.default,{href:t.href,className:(0,n.cn)("flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",e===t.href?"bg-blue-50 text-blue-600":"text-gray-700 hover:bg-gray-100"),children:[s.jsx(t.icon,{className:"h-5 w-5 shrink-0"}),t.name]},t.name))}),(0,s.jsxs)("div",{className:"space-y-2",children:[s.jsx("p",{className:"px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider",children:"User area"}),a&&s.jsx("div",{className:"px-3 py-2 text-sm text-gray-700",children:s.jsx("div",{className:"font-medium",children:a.username})}),(0,s.jsxs)("button",{onClick:()=>{o(),t.push("/")},className:"flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 w-full text-left",children:[s.jsx(h.Z,{className:"h-5 w-5 shrink-0"}),"Logout"]})]})]})})}},8053:(e,t,a)=>{"use strict";a.d(t,{z:()=>d});var s=a(7247),i=a(8964),r=a(9008),n=a(7972),o=a(5008);let l=(0,n.j)("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground shadow hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",outline:"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2",sm:"h-8 rounded-md px-3 text-xs",lg:"h-10 rounded-md px-8",icon:"h-9 w-9"}},defaultVariants:{variant:"default",size:"default"}}),d=i.forwardRef(({className:e,variant:t,size:a,asChild:i=!1,...n},d)=>{let c=i?r.g7:"button";return s.jsx(c,{className:(0,o.cn)(l({variant:t,size:a,className:e})),ref:d,...n})});d.displayName="Button"},2881:(e,t,a)=>{"use strict";function s(e){switch(e){case"no-concern":case"low":return 5;case"low-med":return 4;case"med":return 3;case"med-high":return 2;case"high":return 1;default:return 0}}a.d(t,{VD:()=>n,e0:()=>o,fJ:()=>r});let i={mainParent:{2:"family-health",4:"responsive-parenting"},externalInfluence:{4:"socio-economic",6:"family-support",9:"engagement"}};function r(e){let{mainParentAssessment:t,externalInfluenceAssessment:a}=e.assessment.currentAssessment,r={"responsive-parenting":0,"family-health":0,engagement:0,"family-support":0,"socio-economic":0};return t.forEach(e=>{if(e.level){let t=i.mainParent[e.id];t&&(r[t]=s(e.level))}}),a.forEach(e=>{if(e.level){let t=i.externalInfluence[e.id];t&&(r[t]=s(e.level))}}),r}function n(e){return Object.values(e).reduce((e,t)=>e+t,0)}function o(e,t,a){let s=a[["responsive-parenting","family-health","engagement","family-support","socio-economic"][t]];return s>0&&e===5-s}},8548:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>o});var s=a(2051),i=a(7130),r=a(1887);let n=(0,a(5347).createProxy)(String.raw`C:\Efrait\frontend\components\frai-report.tsx#default`);function o({params:e}){return(0,s.jsxs)("div",{className:"min-h-screen flex flex-col",children:[s.jsx(i.h,{}),(0,s.jsxs)("div",{className:"flex flex-1",children:[s.jsx(r.Y,{}),s.jsx("main",{className:"flex-1 bg-gray-50",children:s.jsx(n,{})})]})]})}},7130:(e,t,a)=>{"use strict";a.d(t,{h:()=>s});let s=(0,a(5347).createProxy)(String.raw`C:\Efrait\frontend\components\header.tsx#Header`)},1887:(e,t,a)=>{"use strict";a.d(t,{Y:()=>s});let s=(0,a(5347).createProxy)(String.raw`C:\Efrait\frontend\components\sidebar.tsx#Sidebar`)}};var t=require("../../../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),s=t.X(0,[963,906,846,226],()=>a(7737));module.exports=s})();