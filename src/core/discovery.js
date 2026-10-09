export const DEMO_STEPS=[
 {id:'earth',title:'Explore the live Earth',body:'ShadowNex starts with a detailed satellite/aerial globe and selective Global Overview so the planet stays readable.',target:'#globe',action:'overview'},
 {id:'search',title:'Ask for what you want',body:'Search works like a world-query box: try “cameras in Oklahoma City”, “aircraft near Dallas”, or “find the ISS”.',target:'#simpleSearchInput',action:'search'},
 {id:'contact',title:'Tap something and understand it',body:'A selected subject opens a plain-English profile with source, freshness, certainty, imagery, route/mission context when public data supports it, and Explain This.',target:'#scopePanel',action:'contact'},
 {id:'brief',title:'Ask what matters here',body:'Prime Brief ranks loaded public-source activity, shows what is notable, and tells you when coverage is partial.',target:'#primeBriefBtn',action:'brief'},
 {id:'watch',title:'Save it and come back',body:'Watch Center stores views, geographic Watch Areas, favorites, recent activity, and time windows locally on this device.',target:'#navLayers',action:'watch'},
 {id:'advanced',title:'Go deeper only when you want to',body:'Advanced Controls reveal drawing, measurement, scenes, map lenses, raw layers, and diagnostics without crowding the everyday interface.',target:'#navMore',action:'advanced'}
];
export const QUICK_STEPS=[
 {id:'search',title:'Search the world',body:'Type a place or a plain-English request. ShadowNex can move the globe and activate the right subject layer for you.',example:'Try: cameras in Oklahoma City'},
 {id:'understand',title:'Tap → understand',body:'Tap a map subject for a readable profile. Use Explain This whenever you want to know what the data means, where it came from, and what not to assume.',example:'Certainty and importance are shown separately.'},
 {id:'return',title:'Brief, save, and return',body:'Prime Brief tells you what matters in the current view. Watch lets you save views, areas, favorites, and recent activity.',example:'HOME and Full Reset always give you a safe way back.'}
];
export function defaultDiscoveryState(){return {version:2,quickStartDone:false,hintsEnabled:true,advancedIntroduced:false,demoCompleted:false,milestones:{},tipSeen:{}};}
export function normalizeDiscoveryState(value){const d=defaultDiscoveryState(),v=value&&typeof value==='object'?value:{};return {...d,...v,milestones:{...d.milestones,...(v.milestones||{})},tipSeen:{...d.tipSeen,...(v.tipSeen||{})}};}
export function milestoneCount(state={}){return Object.values(state.milestones||{}).filter(Boolean).length;}
export function shouldTip(state={},id){return state.hintsEnabled!==false&&!state.tipSeen?.[id];}
export function markTip(state={},id){return {...normalizeDiscoveryState(state),tipSeen:{...state.tipSeen,[id]:true}};}
export function markMilestone(state={},id){return {...normalizeDiscoveryState(state),milestones:{...state.milestones,[id]:true}};}
export function discoveryProgress(state={}){const s=normalizeDiscoveryState(state),count=milestoneCount(s);return {count,total:5,readyForAdvanced:count>=3,quickStartDone:!!s.quickStartDone,demoCompleted:!!s.demoCompleted};}