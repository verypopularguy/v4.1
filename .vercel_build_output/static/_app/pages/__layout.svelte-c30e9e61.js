var v=Object.defineProperty;var b=Object.getOwnPropertySymbols;var A=Object.prototype.hasOwnProperty,E=Object.prototype.propertyIsEnumerable;var y=(i,e,t)=>e in i?v(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t,k=(i,e)=>{for(var t in e||(e={}))A.call(e,t)&&y(i,t,e[t]);if(b)for(var t of b(e))E.call(e,t)&&y(i,t,e[t]);return i};import{S as $,i as C,s as S,l as g,f as F,u as f,w as j,x as _,d as p,D,A as H,r as M,E as O,F as R,G as q,H as x,I as z,J as B,e as G,t as I,c as J,a as K,g as L,K as h,L as P,M as d,N as Q,O as T,P as N,Q as V}from"../chunks/vendor-60dbf49e.js";import{i as W}from"../chunks/database-63c5af1e.js";import{h as w,u as m}from"../chunks/store-cb2cb867.js";function X(i){let e;const t=i[2].default,s=q(t,i,i[1],null);return{c(){s&&s.c()},l(a){s&&s.l(a)},m(a,l){s&&s.m(a,l),e=!0},p(a,l){s&&s.p&&(!e||l&2)&&x(s,t,a,a[1],e?B(t,a[1],l,null):z(a[1]),null)},i(a){e||(_(s,a),e=!0)},o(a){f(s,a),e=!1},d(a){s&&s.d(a)}}}function Y(i){let e,t;return{c(){e=G("h3"),t=I("Fetching your info..."),this.h()},l(s){e=J(s,"H3",{style:!0});var a=K(e);t=L(a,"Fetching your info..."),a.forEach(p),this.h()},h(){h(e,"margin-left","10px"),h(e,"font-family","Roboto, sans-serif"),h(e,"opacity","80%")},m(s,a){F(s,e,a),P(e,t)},p:d,i:d,o:d,d(s){s&&p(e)}}}function Z(i){let e,t,s,a;const l=[Y,X],o=[];function r(n,c){return n[0]?1:0}return e=r(i),t=o[e]=l[e](i),{c(){t.c(),s=g()},l(n){t.l(n),s=g()},m(n,c){o[e].m(n,c),F(n,s,c),a=!0},p(n,[c]){let u=e;e=r(n),e===u?o[e].p(n,c):(M(),f(o[u],1,1,()=>{o[u]=null}),j(),t=o[e],t?t.p(n,c):(t=o[e]=l[e](n),t.c()),_(t,1),t.m(s.parentNode,s))},i(n){a||(_(t),a=!0)},o(n){f(t),a=!1},d(n){o[e].d(n),n&&p(s)}}}function U(i,e,t){let s;D(i,w,o=>t(0,s=o));let{$$slots:a={},$$scope:l}=e;return H(async()=>{W(),O(R(),async o=>{if(w.set(!0),o){m.set({phoneNumber:o.phoneNumber,uid:o.uid,pencilColors:[]});const r=Q(T(),"users/"+o.uid);let n=await N(r);n.exists()||(await V(r,{name:o.displayName,uid:o.uid,phoneNumber:o.phoneNumber,pencilColors:["white","#F69637","#A9F8BD","#6EE2EA"]}),n=await N(r)),m.set(k({id:n.id},n.data()))}else m.set({})})}),i.$$set=o=>{"$$scope"in o&&t(1,l=o.$$scope)},[s,l,a]}class oe extends ${constructor(e){super();C(this,e,U,Z,S,{})}}export{oe as default};
