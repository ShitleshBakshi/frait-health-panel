exports.id=226,exports.ids=[226],exports.modules={9754:(e,s,a)=>{Promise.resolve().then(a.bind(a,1409)),Promise.resolve().then(a.bind(a,7648)),Promise.resolve().then(a.bind(a,5805))},6985:(e,s,a)=>{Promise.resolve().then(a.t.bind(a,3642,23)),Promise.resolve().then(a.t.bind(a,7586,23)),Promise.resolve().then(a.t.bind(a,7838,23)),Promise.resolve().then(a.t.bind(a,8057,23)),Promise.resolve().then(a.t.bind(a,7741,23)),Promise.resolve().then(a.t.bind(a,3118,23))},1409:(e,s,a)=>{"use strict";a.d(s,{default:()=>l});var t=a(7247),r=(a(8964),a(6183),a(8069)),n=(a(3681),a(6052)),i=(a(3102),a(204),a(7734));a(3999),new r.Lx(n.XM);let l=({children:e})=>t.jsx(t.Fragment,{children:e})},7648:(e,s,a)=>{"use strict";a.d(s,{default:()=>x});var t=a(7247),r=a(3102),n=a(9483),i=a(9266),l=a(247),o=a(6070),d=a(3134),m=a(204),u=a(2967),c=a(7131),p=a(5688),f=a(4035);let y={key:"root",storage:d.Z,whitelist:["user","family","familyDetails"]},h=(0,i.UY)({user:m.ZP,family:u.ZP,registration:c.ZP,assessment:p.ZP,familyDetails:f.ZP}),g=(0,o.OJ)(y,h),A=(0,l.xC)({reducer:g,middleware:e=>e({serializableCheck:{ignoredActions:[o._P,o.I2,o.E7,o.ex,o.e,o.Nz]}})}),P=(0,o.p5)(A);var v=a(8749);function x({children:e}){return t.jsx(r.zt,{store:A,children:t.jsx(n.r,{loading:t.jsx("div",{className:"flex items-center justify-center h-screen w-screen",children:t.jsx(v.Z,{className:"h-8 w-8 animate-spin text-blue-600"})}),persistor:P,children:e})})}},5805:(e,s,a)=>{"use strict";a.d(s,{Toaster:()=>g});var t=a(7247),r=a(8964),n=a(4710),i=a(7972),l=a(7013),o=a(5008);let d=n.zt,m=r.forwardRef(({className:e,...s},a)=>t.jsx(n.l_,{ref:a,className:(0,o.cn)("fixed top-0 left-1/2 z-[100] flex max-h-screen w-full -translate-x-1/2 flex-col-reverse p-4 sm:flex-col md:max-w-[420px]",e),...s}));m.displayName=n.l_.displayName;let u=(0,i.j)("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",{variants:{variant:{default:"border bg-background text-foreground",destructive:"destructive group border-destructive bg-destructive text-destructive-foreground"}},defaultVariants:{variant:"default"}}),c=r.forwardRef(({className:e,variant:s,...a},r)=>t.jsx(n.fC,{ref:r,className:(0,o.cn)(u({variant:s}),e),...a}));c.displayName=n.fC.displayName,r.forwardRef(({className:e,...s},a)=>t.jsx(n.aU,{ref:a,className:(0,o.cn)("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",e),...s})).displayName=n.aU.displayName;let p=r.forwardRef(({className:e,...s},a)=>t.jsx(n.x8,{ref:a,className:(0,o.cn)("absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",e),"toast-close":"",...s,children:t.jsx(l.Z,{className:"h-4 w-4"})}));p.displayName=n.x8.displayName;let f=r.forwardRef(({className:e,...s},a)=>t.jsx(n.Dx,{ref:a,className:(0,o.cn)("text-sm font-semibold",e),...s}));f.displayName=n.Dx.displayName;let y=r.forwardRef(({className:e,...s},a)=>t.jsx(n.dk,{ref:a,className:(0,o.cn)("text-sm opacity-90",e),...s}));y.displayName=n.dk.displayName;var h=a(9985);function g(){let{toasts:e}=(0,h.p)();return(0,t.jsxs)(d,{children:[e.map(({id:e,title:s,description:a,action:r,...n})=>(0,t.jsxs)(c,{...n,children:[(0,t.jsxs)("div",{className:"grid gap-1",children:[s&&t.jsx(f,{children:s}),a&&t.jsx(y,{children:a})]}),r,t.jsx(p,{})]},e)),t.jsx(m,{})]})}},9985:(e,s,a)=>{"use strict";a.d(s,{p:()=>r});var t=a(8964);function r(){let[e,s]=(0,t.useState)([]);return{toast:(0,t.useCallback)(({title:e,description:a,action:t,duration:r=5e3})=>{let n=Math.random().toString(36).substr(2,9),i={id:n,title:e,description:a,action:t,duration:r};s(e=>[...e,i]),r&&setTimeout(()=>{s(e=>e.filter(e=>e.id!==n))},r)},[]),toasts:e,dismissToast:e=>s(s=>s.filter(s=>s.id!==e))}}},8920:(e,s,a)=>{"use strict";async function t(e,s={},a={}){try{let t=await fetch("https://pthb-efrait-test.cymru.nhs.uk/graphql",{method:"POST",headers:{"Content-Type":"application/json",...a},body:JSON.stringify({query:e,variables:s}),credentials:"include"}),r=await t.json();if(r.errors)throw Error(r.errors[0]?.message||"An error occurred during the GraphQL request");return r.data}catch(e){throw e}}a.d(s,{Fq:()=>i,US:()=>t,bA:()=>r,td:()=>l,xD:()=>n});let r=`
  mutation CreateFamilyDetails($family_details_input: FamilyDetailsInput!) {
    createFamilyDetails(familyDetailsInput: $family_details_input){
            id
            mainParentFirstName
            mainParentLastName
            mainParentDob
            mainParentGender
            mainParentRelationToChild
            mainParentEducationLevel
            mainParentParentalResponsibility
            mainParentInformationProvider
            supportingParents{
                id
                firstName
                lastName
                dob
                gender
                relationToChild
                educationLevel
                parentalResponsibility
                informationProvider
            }
            children{
                id
                firstName
                lastName
                gender
                dob
                supportParent
                supportParentFirstName
                supportParentLastName
            }
    }
  }
`,n=`
  query GetFamilyDetails($family_id: Int!) {
    getFamilyDetails(familyId: $family_id) {
      id
      main_parent_first_name
      main_parent_last_name
      main_parent_dob
      main_parent_gender
      main_parent_relation_to_child
      main_parent_education_level
      main_parent_parental_responsibility
      main_parent_information_provider
      supportingParents {
        id
        firstName
        lastName
        dob
        gender
        relationToChild
        educationLevel
        parentalResponsibility
        informationProvider
      }
      children {
        id
        firstName
        lastName
        gender
        dob
        supportParent
        supportParentFirstName
        supportParentLastName
      }
    }
  }
`,i=`
  mutation CreateFratAssessment($fratAssessmentInput: FratAssessmentInput!) {
    createFratAssessment(fratAssessmentInput: $fratAssessmentInput){
        id
        assessment1
        assessment2
        assessment3
        assessment4
        assessment5
        assessment6
        assessment7
        assessment8
        assessment9
        assessment10
        assessment11
        assessment12
        assessment13
        assessment14
        assessment15
        assessment16
        assessment17
        assessment18
        assessment19
        assessment20
        assessment21
        assessment22
        assessment23
        assessment24
        assessment25
        assessment26
        assessment27
        assessment28
        assessment29
        assessment30
        assessment31
        assessment32
        assessment33
        assessment34
        assessment35
        assessment36
    }
  }
`,l=`
  mutation CreateFraiAssessment($fraiInput: FraiAssessmentInput!) {
    createInitialFraiAssessment(fraiInput: $fraiInput){
        id
        responsiveParenting
        familyHealth
        familyEngagement
        familySupport
        socioEconomic
        overallScore
    }
  }
`},7734:(e,s,a)=>{"use strict";a.d(s,{Ho:()=>p,aC:()=>c,i4:()=>t});var t,r=a(7247),n=a(8964),i=a(3102),l=a(204),o=a(6183),d=a(6052),m=a(3999);!function(e){e.ADMIN="POW_EFRAIT_Admins",e.MANAGER="POW_EFRAIT_Managers",e.HEALTH_VISITOR="POW_EFRAIT_HealthVisitors",e.ASSISTANT_HEALTH_VISITOR="POW_EFRAIT_AssistantHealthVisitors"}(t||(t={}));let u=(0,n.createContext)(void 0),c=()=>{let e=(0,n.useContext)(u);if(void 0===e)throw Error("useAuth must be used within an AuthProvider");return e},p=({children:e})=>{let s=(0,i.I0)(),a=(0,m.useRouter)(),t=(0,i.v9)(e=>e.user),[c,p]=(0,n.useState)(!0),[f,y]=(0,n.useState)(null),[h,g]=(0,n.useState)(!1),A=t.id?{id:t.id,username:t.username,role:t.role,healthBoard:t.healthBoard}:null,{instance:P,accounts:v}=(0,o.Fp)();(0,n.useEffect)(()=>{(async()=>{try{if(p(!0),g(!1),v.length>0)try{let e=await P.acquireTokenSilent({...d.Qb,account:v[0]});if(e){let t=await x(e.accessToken);if(t.success){let e=t.user,r=(e=>{switch(e){case"Admin":return"POW_EFRAIT_Admins";case"Manager":return"POW_EFRAIT_Managers";case"Health Visitor":return"POW_EFRAIT_HealthVisitors";case"Assistant Health Visitor":return"POW_EFRAIT_AssistantHealthVisitors";default:return console.error(`Unauthorized: Unknown role from backend: ${e}`),null}})(e.role);if(!r){g(!0),s((0,l.pn)()),a.push("/unauthorised");return}s((0,l.av)({id:e.id,username:e.name,role:r,healthBoard:"Powys Health Board"})),y(null)}else throw Error("Failed to validate token with backend");return}}catch(e){console.error("Error acquiring token:",e),P.loginRedirect(d.Qb)}else P.loginRedirect(d.Qb)}catch(e){console.error("Authentication error:",e),y("Failed to authenticate. Please try again later.")}finally{p(!1)}})()},[s,P,v,a]);let x=async e=>{try{let s=await fetch("/api/auth/msal/validate",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"}});if(!s.ok)throw Error(`Error validating token: ${s.statusText}`);return await s.json()}catch(e){throw console.error("Token validation error:",e),e}},b=async()=>{s((0,l.pn)()),P.logoutRedirect()};return r.jsx(u.Provider,{value:{user:A,logout:b,isLoading:c,error:f,isUnauthorized:h,assignFamily:(e,a)=>{s((0,l.Kx)({familyId:e,assistantId:a}))},isAssignedFamily:e=>!!A&&("POW_EFRAIT_AssistantHealthVisitors"!==A.role||!!t.assignedFamilies[A.id]?.includes(e)),getAssignedFamilies:()=>{if(!A)return[];if("POW_EFRAIT_AssistantHealthVisitors"===A.role)return t.assignedFamilies[A.id]||[];if("POW_EFRAIT_HealthVisitors"===A.role||"POW_EFRAIT_Managers"===A.role){let e=[];return Object.values(t.assignedFamilies).forEach(s=>{e.push(...s)}),[...new Set(e)]}return[]},getPendingAssessments:()=>t.pendingAssessments,approveAssessment:e=>{s((0,l.E2)(e))},rejectAssessment:e=>{s((0,l.E2)(e))},addPendingAssessment:(e,a)=>{A&&s((0,l.XM)({assessmentId:e,familyId:a,assistantId:A.id}))}},children:e})}},6052:(e,s,a)=>{"use strict";a.d(s,{Qb:()=>n,XM:()=>r});var t=a(4536);console.log("MSAL ENV:","a5056d37-4bcd-4f21-9227-83d482c159ef","bb5628b8-e328-4082-a856-433c9edc8fae","https://pthb-efrait-test.cymru.nhs.uk");let r={auth:{clientId:"a5056d37-4bcd-4f21-9227-83d482c159ef",authority:"https://login.microsoftonline.com/bb5628b8-e328-4082-a856-433c9edc8fae",redirectUri:"https://pthb-efrait-test.cymru.nhs.uk",postLogoutRedirectUri:"https://pthb-efrait-test.cymru.nhs.uk",navigateToLoginRequestUrl:!0},cache:{cacheLocation:"localStorage",storeAuthStateInCookie:!0},system:{loggerOptions:{loggerCallback:(e,s,a)=>{if(!a)switch(e){case t.i.Error:console.error(s);break;case t.i.Info:console.info(s);break;case t.i.Verbose:console.debug(s);break;case t.i.Warning:console.warn(s);break;default:console.log(s)}},logLevel:t.i.Info}}},n={scopes:["openid","profile","email","User.Read","GroupMember.Read.All"],forceRefresh:!1}},5688:(e,s,a)=>{"use strict";a.d(s,{CM:()=>d,K4:()=>p,T5:()=>c,ZP:()=>y,dG:()=>m,qU:()=>u,sT:()=>f,x3:()=>o});var t=a(247);let r={currentAssessment:{mainParentAssessment:[],supportingParentAssessment:[],childAssessment:[],externalInfluenceAssessment:[],familyId:null,assessmentId:null},loading:!1,error:null},n=(0,t.oM)({name:"assessment",initialState:r,reducers:{startNewAssessment:(e,s)=>{e.currentAssessment={...r.currentAssessment,familyId:s.payload.familyId},e.loading=!1,e.error=null},loadAssessment:(e,s)=>{e.currentAssessment={mainParentAssessment:s.payload.mainParentAssessment,supportingParentAssessment:s.payload.supportingParentAssessment||[],childAssessment:s.payload.childAssessment||[],externalInfluenceAssessment:s.payload.externalInfluenceAssessment,familyId:s.payload.familyId,assessmentId:s.payload.assessmentId.toString()},e.loading=!1,e.error=null},updateMainParentAssessment:(e,s)=>{e.currentAssessment.mainParentAssessment=s.payload},updateSupportingParentAssessment:(e,s)=>{e.currentAssessment.supportingParentAssessment=s.payload},updateChildAssessment:(e,s)=>{e.currentAssessment.childAssessment=s.payload},updateExternalInfluenceAssessment:(e,s)=>{e.currentAssessment.externalInfluenceAssessment=s.payload},resetAssessment:e=>{e.currentAssessment=r.currentAssessment,e.loading=!1,e.error=null},setLoading:(e,s)=>{e.loading=s.payload},setError:(e,s)=>{e.error=s.payload}}}),{startNewAssessment:i,loadAssessment:l,updateMainParentAssessment:o,updateSupportingParentAssessment:d,updateChildAssessment:m,updateExternalInfluenceAssessment:u,resetAssessment:c,setLoading:p,setError:f}=n.actions,y=n.reducer},4035:(e,s,a)=>{"use strict";a.d(s,{QV:()=>b,ZP:()=>w,eJ:()=>v,sT:()=>x});var t=a(247);let r={familyId:null,mainParent:null,supportingParents:[],children:[],isSaving:!1,error:null,lastSaved:null},n=(0,t.oM)({name:"familyDetails",initialState:r,reducers:{setFamilyId:(e,s)=>{e.familyId=s.payload},setMainParent:(e,s)=>{e.mainParent=s.payload},updateMainParent:(e,s)=>{e.mainParent&&(e.mainParent={...e.mainParent,...s.payload})},removeMainParent:e=>{e.mainParent=null},addSupportingParent:(e,s)=>{e.supportingParents.push(s.payload)},updateSupportingParent:(e,s)=>{let{id:a,data:t}=s.payload;a>=0&&a<e.supportingParents.length&&(e.supportingParents[a]={...e.supportingParents[a],...t})},removeSupportingParent:(e,s)=>{e.supportingParents=e.supportingParents.filter((e,a)=>a!==s.payload)},resetSupportingParents:e=>{e.supportingParents=[]},setSupportingParents:(e,s)=>{e.supportingParents=s.payload},addChild:(e,s)=>{e.children.push(s.payload)},updateChild:(e,s)=>{let{id:a,data:t}=s.payload;a>=0&&a<e.children.length&&(e.children[a]={...e.children[a],...t})},removeChild:(e,s)=>{e.children=e.children.filter((e,a)=>a!==s.payload)},resetChildren:e=>{e.children=[]},setChildren:(e,s)=>{e.children=s.payload},setSaving:(e,s)=>{e.isSaving=s.payload},setError:(e,s)=>{e.error=s.payload},setLastSaved:(e,s)=>{e.lastSaved=s.payload},setFamilyDetails:(e,s)=>{let{id:a,mainParent:t,supportingParent:r,child:n}=s.payload;e.familyId=a,e.mainParent=t,e.supportingParents=[r],e.children=[n]},resetFamilyDetails:()=>r}}),{setFamilyId:i,setMainParent:l,updateMainParent:o,removeMainParent:d,addSupportingParent:m,updateSupportingParent:u,removeSupportingParent:c,resetSupportingParents:p,setSupportingParents:f,addChild:y,updateChild:h,removeChild:g,resetChildren:A,setChildren:P,setSaving:v,setError:x,setLastSaved:b,setFamilyDetails:I,resetFamilyDetails:F}=n.actions,w=n.reducer},2967:(e,s,a)=>{"use strict";a.d(s,{$p:()=>m,Jp:()=>y,Yy:()=>h,ZP:()=>_,tX:()=>d});var t=a(247),r=a(6070),n=a(3134),i=a(8920);let l=`
    query GetInitialFamilies($limit: Int!, $offset: Int!) {
        getInitialFamilyModels(limit: $limit, offset: $offset) {
            id
            familyName
            childDob
            nhsNumber
        }
    }
`,o=`
    mutation CreateInitialFamily($input: InitialFamilyInput!) {
        createInitialFamily(input: $input) {
            id
            familyName
            childDob
            nhsNumber
        }
    }
`,d=(0,t.hg)("family/fetchFamilies",async(e,{rejectWithValue:s})=>{try{return(await (0,i.US)(l,{limit:100,offset:0})).getInitialFamilyModels.map(e=>({id:e.id,name:e.familyName||"Unknown Family",nhsNumber:e.nhsNumber,childDob:e.childDob,updatedAt:new Date().toISOString().replace("T"," ").substring(0,19)}))}catch(e){return s(e instanceof Error?e.message:"Failed to fetch families")}}),m=(0,t.hg)("family/addFamily",async(e,{getState:s,rejectWithValue:a})=>{try{let a=s().family.nextFamilyId,t={id:a,familyName:e.name,nhsNumber:e.nhsNumber||"Not Provided",childDob:e.childDob||"Not Provided"};if(!(await (0,i.US)(o,{input:t})).createInitialFamily)throw Error("Failed to create family");return{id:a,name:e.name,nhsNumber:e.nhsNumber,childDob:e.childDob,updatedAt:e.updatedAt}}catch(e){return a(e instanceof Error?e.message:"Failed to add family")}}),u=(0,t.hg)("family/addFamiliesBulk",async(e,{rejectWithValue:s,dispatch:a})=>{try{let t=[],r=[];for(let s of e)try{let e=await a(m(s)).unwrap();t.push(e)}catch(e){r.push(`Failed to add family "${s.name}": ${e}`)}if(r.length>0)return s(`${r.length} families failed to add. ${t.length} were successful.`);return t}catch(e){return s("Failed to add families. Network error.")}}),c=(0,t.oM)({name:"family",initialState:{families:[],assessments:[],currentFamilyId:null,nextFamilyId:1,loading:!1,error:null,familyAssignments:{}},reducers:{setCurrentFamily:(e,s)=>{e.currentFamilyId=s.payload},addFamilyAssessment:(e,s)=>{e.assessments.some(e=>e.familyId===s.payload.familyId&&e.id===s.payload.id)||e.assessments.unshift(s.payload)},updateFamilyAssessment:(e,s)=>{let a=e.assessments.findIndex(e=>e.familyId===s.payload.familyId&&e.id===s.payload.id);-1!==a&&(e.assessments[a]=s.payload)},setFamilyAssessments:(e,s)=>{e.assessments=s.payload},removeFamilyAssessment:(e,s)=>{e.assessments=e.assessments.filter(e=>e.id!==s.payload)},clearFamilyAssessments:e=>{e.assessments=[]},setLoading:(e,s)=>{e.loading=s.payload},setError:(e,s)=>{e.error=s.payload},assignFamily:(e,s)=>{let{familyId:a,assistantId:t}=s.payload;e.familyAssignments[t]||(e.familyAssignments[t]=[]),e.familyAssignments[t].includes(a)||e.familyAssignments[t].push(a)},unassignFamily:(e,s)=>{let{familyId:a,assistantId:t}=s.payload;e.familyAssignments[t]&&(e.familyAssignments[t]=e.familyAssignments[t].filter(e=>e!==a))},getAssignedFamilies:(e,s)=>e},extraReducers:e=>{e.addCase(d.pending,e=>{e.loading=!0,e.error=null}).addCase(d.fulfilled,(e,s)=>{if(e.families=s.payload,s.payload.length>0){let a=Math.max(...s.payload.map(e=>e.id),0);e.nextFamilyId=a+1}e.loading=!1}).addCase(d.rejected,(e,s)=>{e.loading=!1,e.error=s.payload}).addCase(m.pending,e=>{e.loading=!0,e.error=null}).addCase(m.fulfilled,(e,s)=>{e.families.unshift(s.payload),e.nextFamilyId+=1,e.loading=!1}).addCase(m.rejected,(e,s)=>{e.loading=!1,e.error=s.payload}).addCase(u.pending,e=>{e.loading=!0,e.error=null}).addCase(u.fulfilled,(e,s)=>{Array.isArray(s.payload)&&(e.families=[...s.payload,...e.families]),e.loading=!1}).addCase(u.rejected,(e,s)=>{e.loading=!1,e.error=s.payload})}}),p={key:"family",storage:n.Z,whitelist:["families","assessments","familyAssignments"]},f=(0,r.OJ)(p,c.reducer),{setCurrentFamily:y,addFamilyAssessment:h,updateFamilyAssessment:g,setFamilyAssessments:A,removeFamilyAssessment:P,clearFamilyAssessments:v,setLoading:x,setError:b,assignFamily:I,unassignFamily:F,getAssignedFamilies:w}=c.actions,_=f},7131:(e,s,a)=>{"use strict";a.d(s,{FY:()=>d,Fy:()=>m,ZP:()=>c,a$:()=>n,b6:()=>l,ou:()=>u,vV:()=>o});var t=a(247);let r={username:"",email:"",password:"",confirmPassword:"",loading:!1,error:null},n=(0,t.hg)("registration/registerUser",async(e,{getState:s,rejectWithValue:a})=>{let{username:t,email:r,password:n,confirmPassword:i}=s().registration;return n!==i?a("Passwords do not match"):(await new Promise(e=>setTimeout(e,1e3)),{username:t,email:r})}),i=(0,t.oM)({name:"registration",initialState:r,reducers:{setUsername:(e,s)=>{e.username=s.payload},setEmail:(e,s)=>{e.email=s.payload},setPassword:(e,s)=>{e.password=s.payload},setConfirmPassword:(e,s)=>{e.confirmPassword=s.payload},clearForm:e=>r},extraReducers:e=>{e.addCase(n.pending,e=>{e.loading=!0,e.error=null}).addCase(n.fulfilled,e=>{e.loading=!1,e.error=null}).addCase(n.rejected,(e,s)=>{e.loading=!1,e.error=s.payload})}}),{setUsername:l,setEmail:o,setPassword:d,setConfirmPassword:m,clearForm:u}=i.actions,c=i.reducer},204:(e,s,a)=>{"use strict";a.d(s,{E2:()=>m,Kx:()=>o,XM:()=>d,ZP:()=>u,av:()=>i,pn:()=>l});var t=a(247);let r={id:"",username:"",role:"POW_EFRAIT_AssistantHealthVisitors",healthBoard:"",assignedFamilies:{},pendingAssessments:[]},n=(0,t.oM)({name:"user",initialState:r,reducers:{setUser:(e,s)=>{e.id=s.payload.id,e.username=s.payload.username,e.role=s.payload.role,e.healthBoard=s.payload.healthBoard},clearUser:e=>{let s={...e.assignedFamilies};Object.assign(e,r),e.assignedFamilies=s},assignFamilyToAssistant:(e,s)=>{let{familyId:a,assistantId:t}=s.payload;e.assignedFamilies[t]||(e.assignedFamilies[t]=[]),e.assignedFamilies[t].includes(a)||e.assignedFamilies[t].push(a)},addPendingAssessment:(e,s)=>{e.pendingAssessments.push({id:s.payload.assessmentId,familyId:s.payload.familyId,assistantId:s.payload.assistantId})},removeAssessment:(e,s)=>{e.pendingAssessments=e.pendingAssessments.filter(e=>e.id!==s.payload)}}}),{setUser:i,clearUser:l,assignFamilyToAssistant:o,addPendingAssessment:d,removeAssessment:m}=n.actions,u=n.reducer},5008:(e,s,a)=>{"use strict";a.d(s,{cn:()=>n});var t=a(1929),r=a(5770);function n(...e){return(0,r.m6)((0,t.W)(e))}a(7734)},8719:(e,s,a)=>{"use strict";a.r(s),a.d(s,{default:()=>u,metadata:()=>m});var t=a(2051),r=a(3750),n=a.n(r);a(7272);var i=a(5347);let l=(0,i.createProxy)(String.raw`C:\Efrait\frontend\components\ui\toaster.tsx#Toaster`),o=(0,i.createProxy)(String.raw`C:\Efrait\frontend\components\redux-provider.tsx#default`);(0,i.createProxy)(String.raw`C:\Efrait\frontend\components\auth-wrapper.tsx#AuthWrapper`);let d=(0,i.createProxy)(String.raw`C:\Efrait\frontend\components\auth-wrapper.tsx#default`),m={title:"FRAIT - Health Visitor Control Panel",description:"Health visitor control panel for FRAIT system"};function u({children:e}){return t.jsx("html",{lang:"en",children:t.jsx("body",{className:n().className,children:t.jsx(o,{children:(0,t.jsxs)(d,{children:[e,t.jsx(l,{})]})})})})}},7272:()=>{}};