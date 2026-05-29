var e={};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const t=function(e){const t=[];let n=0;for(let r=0;r<e.length;r++){let s=e.charCodeAt(r);s<128?t[n++]=s:s<2048?(t[n++]=s>>6|192,t[n++]=63&s|128):55296==(64512&s)&&r+1<e.length&&56320==(64512&e.charCodeAt(r+1))?(s=65536+((1023&s)<<10)+(1023&e.charCodeAt(++r)),t[n++]=s>>18|240,t[n++]=s>>12&63|128,t[n++]=s>>6&63|128,t[n++]=63&s|128):(t[n++]=s>>12|224,t[n++]=s>>6&63|128,t[n++]=63&s|128)}return t},n={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<e.length;s+=3){const t=e[s],i=s+1<e.length,o=i?e[s+1]:0,a=s+2<e.length,c=a?e[s+2]:0,u=t>>2,h=(3&t)<<4|o>>4;let l=(15&o)<<2|c>>6,d=63&c;a||(d=64,i||(l=64)),r.push(n[u],n[h],n[l],n[d])}return r.join("")},encodeString(e,n){return this.HAS_NATIVE_SUPPORT&&!n?btoa(e):this.encodeByteArray(t(e),n)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):function(e){const t=[];let n=0,r=0;for(;n<e.length;){const s=e[n++];if(s<128)t[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=e[n++];t[r++]=String.fromCharCode((31&s)<<6|63&i)}else if(s>239&&s<365){const i=((7&s)<<18|(63&e[n++])<<12|(63&e[n++])<<6|63&e[n++])-65536;t[r++]=String.fromCharCode(55296+(i>>10)),t[r++]=String.fromCharCode(56320+(1023&i))}else{const i=e[n++],o=e[n++];t[r++]=String.fromCharCode((15&s)<<12|(63&i)<<6|63&o)}}return t.join("")}(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();const n=t?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let i=0;i<e.length;){const t=n[e.charAt(i++)],o=i<e.length?n[e.charAt(i)]:0;++i;const a=i<e.length?n[e.charAt(i)]:64;++i;const c=i<e.length?n[e.charAt(i)]:64;if(++i,null==t||null==o||null==a||null==c)throw new r;const u=t<<2|o>>4;if(s.push(u),64!==a){const e=o<<4&240|a>>2;if(s.push(e),64!==c){const e=a<<6&192|c;s.push(e)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};class r extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const s=function(e){return function(e){const r=t(e);return n.encodeByteArray(r,!0)}(e).replace(/\./g,"")};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function i(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("Unable to locate global object.")}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const o=()=>{if("undefined"==typeof document)return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(r){return}const t=e&&function(e){try{return n.decodeString(e,!0)}catch(r){console.error("base64Decode failed: ",r)}return null}(e[1]);return t&&JSON.parse(t)},a=()=>{try{return i().__FIREBASE_DEFAULTS__||(()=>{if("undefined"==typeof process)return;const t=e.__FIREBASE_DEFAULTS__;return t?JSON.parse(t):void 0})()||o()}catch(t){return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`)}},c=e=>{const t=(e=>a()?.emulatorHosts?.[e])(e);if(!t)return;const n=t.lastIndexOf(":");if(n<=0||n+1===t.length)throw new Error(`Invalid host ${t} with no separate hostname and port!`);const r=parseInt(t.substring(n+1),10);return"["===t[0]?[t.substring(1,n-1),r]:[t.substring(0,n),r]},u=()=>a()?.config;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class h{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),"function"==typeof e&&(this.promise.catch(()=>{}),1===e.length?e(t):e(t,n))}}}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function l(e){try{return(e.startsWith("http://")||e.startsWith("https://")?new URL(e).hostname:e).endsWith(".cloudworkstations.dev")}catch{return!1}}async function d(e){return(await fetch(e,{credentials:"include"})).ok}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f={};let m=!1;function g(e,t){if("undefined"==typeof window||"undefined"==typeof document||!l(window.location.host)||f[e]===t||f[e]||m)return;function n(e){return`__firebase__banner__${e}`}f[e]=t;const r="__firebase__banner",s=function(){const e={prod:[],emulator:[]};for(const t of Object.keys(f))f[t]?e.emulator.push(t):e.prod.push(t);return e}().prod.length>0;function i(){const e=document.createElement("span");return e.style.cursor="pointer",e.style.marginLeft="16px",e.style.fontSize="24px",e.innerHTML=" &times;",e.onclick=()=>{m=!0,function(){const e=document.getElementById(r);e&&e.remove()}()},e}function o(){const e=function(e){let t=document.getElementById(e),n=!1;return t||(t=document.createElement("div"),t.setAttribute("id",e),n=!0),{created:n,element:t}}(r),t=n("text"),o=document.getElementById(t)||document.createElement("span"),a=n("learnmore"),c=document.getElementById(a)||document.createElement("a"),u=n("preprendIcon"),h=document.getElementById(u)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(e.created){const t=e.element;!function(e){e.style.display="flex",e.style.background="#7faaf0",e.style.position="fixed",e.style.bottom="5px",e.style.left="5px",e.style.padding=".5em",e.style.borderRadius="5px",e.style.alignItems="center"}(t),function(e,t){e.setAttribute("id",t),e.innerText="Learn more",e.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",e.setAttribute("target","__blank"),e.style.paddingLeft="5px",e.style.textDecoration="underline"}(c,a);const n=i();!function(e,t){e.setAttribute("width","24"),e.setAttribute("id",t),e.setAttribute("height","24"),e.setAttribute("viewBox","0 0 24 24"),e.setAttribute("fill","none"),e.style.marginLeft="-6px"}(h,u),t.append(h,o,c,n),document.body.appendChild(t)}s?(o.innerText="Preview backend disconnected.",h.innerHTML='<g clip-path="url(#clip0_6013_33858)">\n<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>\n</g>\n<defs>\n<clipPath id="clip0_6013_33858">\n<rect width="24" height="24" fill="white"/>\n</clipPath>\n</defs>'):(h.innerHTML='<g clip-path="url(#clip0_6083_34804)">\n<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>\n</g>\n<defs>\n<clipPath id="clip0_6083_34804">\n<rect width="24" height="24" fill="white"/>\n</clipPath>\n</defs>',o.innerText="Preview backend running in this workspace."),o.setAttribute("id",t)}"loading"===document.readyState?window.addEventListener("DOMContentLoaded",o):o()}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function p(){return"undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:""}function y(){const e=a()?.forceEnvironment;if("node"===e)return!0;if("browser"===e)return!1;try{return"[object process]"===Object.prototype.toString.call(global.process)}catch(t){return!1}}function w(){return!y()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function v(){return!y()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function b(){try{return"object"==typeof indexedDB}catch(e){return!1}}class I extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name="FirebaseError",Object.setPrototypeOf(this,I.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,_.prototype.create)}}class _{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?function(e,t){return e.replace(E,(e,n)=>{const r=t[n];return null!=r?String(r):`<${n}?>`})}(s,n):"Error",o=`${this.serviceName}: ${i} (${r}).`;return new I(r,o,n)}}const E=/\{\$([^}]+)}/g;function T(e,t){if(e===t)return!0;const n=Object.keys(e),r=Object.keys(t);for(const s of n){if(!r.includes(s))return!1;const n=e[s],i=t[s];if(S(n)&&S(i)){if(!T(n,i))return!1}else if(n!==i)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function S(e){return null!==e&&"object"==typeof e}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function C(e){return e&&e._delegate?e._delegate:e}class A{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x="[DEFAULT]";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const e=new h;if(this.instancesDeferred.set(t,e),this.isInitialized(t)||this.shouldAutoInitialize())try{const n=this.getOrInitializeService({instanceIdentifier:t});n&&e.resolve(n)}catch(n){}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e?.identifier),n=e?.optional??!1;if(!this.isInitialized(t)&&!this.shouldAutoInitialize()){if(n)return null;throw Error(`Service ${this.name} is not available`)}try{return this.getOrInitializeService({instanceIdentifier:t})}catch(r){if(n)return null;throw r}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,this.shouldAutoInitialize()){if(function(e){return"EAGER"===e.instantiationMode}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e))try{this.getOrInitializeService({instanceIdentifier:x})}catch(t){}for(const[e,n]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(e);try{const e=this.getOrInitializeService({instanceIdentifier:r});n.resolve(e)}catch(t){}}}}clearInstance(e=x){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...e.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return null!=this.component}isInitialized(e=x){return this.instances.has(e)}getOptions(e=x){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[s,i]of this.instancesDeferred.entries()){n===this.normalizeInstanceIdentifier(s)&&i.resolve(r)}return r}onInit(e,t){const n=this.normalizeInstanceIdentifier(t),r=this.onInitCallbacks.get(n)??new Set;r.add(e),this.onInitCallbacks.set(n,r);const s=this.instances.get(n);return s&&e(s,n),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const r of n)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:(r=e,r===x?void 0:r),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}var r;return n||null}normalizeInstanceIdentifier(e=x){return this.component?this.component.multipleInstances?e:x:e}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}class N{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new D(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var k;!function(e){e[e.DEBUG=0]="DEBUG",e[e.VERBOSE=1]="VERBOSE",e[e.INFO=2]="INFO",e[e.WARN=3]="WARN",e[e.ERROR=4]="ERROR",e[e.SILENT=5]="SILENT"}(k||(k={}));const R={debug:k.DEBUG,verbose:k.VERBOSE,info:k.INFO,warn:k.WARN,error:k.ERROR,silent:k.SILENT},M=k.INFO,O={[k.DEBUG]:"log",[k.VERBOSE]:"log",[k.INFO]:"info",[k.WARN]:"warn",[k.ERROR]:"error"},P=(e,t,...n)=>{if(t<e.logLevel)return;const r=(new Date).toISOString(),s=O[t];if(!s)throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`);console[s](`[${r}]  ${e.name}:`,...n)};class L{constructor(e){this.name=e,this._logLevel=M,this._logHandler=P,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in k))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel="string"==typeof e?R[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if("function"!=typeof e)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,k.DEBUG,...e),this._logHandler(this,k.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,k.VERBOSE,...e),this._logHandler(this,k.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,k.INFO,...e),this._logHandler(this,k.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,k.WARN,...e),this._logHandler(this,k.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,k.ERROR,...e),this._logHandler(this,k.ERROR,...e)}}let F,V;const B=new WeakMap,U=new WeakMap,q=new WeakMap,j=new WeakMap,z=new WeakMap;let $={get(e,t,n){if(e instanceof IDBTransaction){if("done"===t)return U.get(e);if("objectStoreNames"===t)return e.objectStoreNames||q.get(e);if("store"===t)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Q(e[t])},set:(e,t,n)=>(e[t]=n,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function G(e){return e!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(V||(V=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(e)?function(...t){return e.apply(H(this),t),Q(B.get(this))}:function(...t){return Q(e.apply(H(this),t))}:function(t,...n){const r=e.call(H(this),t,...n);return q.set(r,t.sort?t.sort():[t]),Q(r)}}function K(e){return"function"==typeof e?G(e):(e instanceof IDBTransaction&&function(e){if(U.has(e))return;const t=new Promise((t,n)=>{const r=()=>{e.removeEventListener("complete",s),e.removeEventListener("error",i),e.removeEventListener("abort",i)},s=()=>{t(),r()},i=()=>{n(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",s),e.addEventListener("error",i),e.addEventListener("abort",i)});U.set(e,t)}(e),t=e,(F||(F=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some(e=>t instanceof e)?new Proxy(e,$):e);var t}function Q(e){if(e instanceof IDBRequest)return function(e){const t=new Promise((t,n)=>{const r=()=>{e.removeEventListener("success",s),e.removeEventListener("error",i)},s=()=>{t(Q(e.result)),r()},i=()=>{n(e.error),r()};e.addEventListener("success",s),e.addEventListener("error",i)});return t.then(t=>{t instanceof IDBCursor&&B.set(t,e)}).catch(()=>{}),z.set(t,e),t}(e);if(j.has(e))return j.get(e);const t=K(e);return t!==e&&(j.set(e,t),z.set(t,e)),t}const H=e=>z.get(e);const W=["get","getKey","getAll","getAllKeys","count"],J=["put","add","delete","clear"],X=new Map;function Y(e,t){if(!(e instanceof IDBDatabase)||t in e||"string"!=typeof t)return;if(X.get(t))return X.get(t);const n=t.replace(/FromIndex$/,""),r=t!==n,s=J.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!s&&!W.includes(n))return;const i=async function(e,...t){const i=this.transaction(e,s?"readwrite":"readonly");let o=i.store;return r&&(o=o.index(t.shift())),(await Promise.all([o[n](...t),s&&i.done]))[0]};return X.set(t,i),i}$=(e=>({...e,get:(t,n,r)=>Y(t,n)||e.get(t,n,r),has:(t,n)=>!!Y(t,n)||e.has(t,n)}))($);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Z{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(function(e){const t=e.getComponent();return"VERSION"===t?.type}(e)){const t=e.getImmediate();return`${t.library}/${t.version}`}return null}).filter(e=>e).join(" ")}}const ee="@firebase/app",te="0.14.4",ne=new L("@firebase/app"),re="@firebase/app-compat",se="@firebase/analytics-compat",ie="@firebase/analytics",oe="@firebase/app-check-compat",ae="@firebase/app-check",ce="@firebase/auth",ue="@firebase/auth-compat",he="@firebase/database",le="@firebase/data-connect",de="@firebase/database-compat",fe="@firebase/functions",me="@firebase/functions-compat",ge="@firebase/installations",pe="@firebase/installations-compat",ye="@firebase/messaging",we="@firebase/messaging-compat",ve="@firebase/performance",be="@firebase/performance-compat",Ie="@firebase/remote-config",_e="@firebase/remote-config-compat",Ee="@firebase/storage",Te="@firebase/storage-compat",Se="@firebase/firestore",Ce="@firebase/ai",Ae="@firebase/firestore-compat",xe="firebase",De="[DEFAULT]",Ne={[ee]:"fire-core",[re]:"fire-core-compat",[ie]:"fire-analytics",[se]:"fire-analytics-compat",[ae]:"fire-app-check",[oe]:"fire-app-check-compat",[ce]:"fire-auth",[ue]:"fire-auth-compat",[he]:"fire-rtdb",[le]:"fire-data-connect",[de]:"fire-rtdb-compat",[fe]:"fire-fn",[me]:"fire-fn-compat",[ge]:"fire-iid",[pe]:"fire-iid-compat",[ye]:"fire-fcm",[we]:"fire-fcm-compat",[ve]:"fire-perf",[be]:"fire-perf-compat",[Ie]:"fire-rc",[_e]:"fire-rc-compat",[Ee]:"fire-gcs",[Te]:"fire-gcs-compat",[Se]:"fire-fst",[Ae]:"fire-fst-compat",[Ce]:"fire-vertex","fire-js":"fire-js",[xe]:"fire-js-all"},ke=new Map,Re=new Map,Me=new Map;function Oe(e,t){try{e.container.addComponent(t)}catch(n){ne.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function Pe(e){const t=e.name;if(Me.has(t))return ne.debug(`There were multiple attempts to register component ${t}.`),!1;Me.set(t,e);for(const n of ke.values())Oe(n,e);for(const n of Re.values())Oe(n,e);return!0}function Le(e,t){const n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Fe=new _("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."});
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Ve{constructor(e,t,n){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new A("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Fe.create("app-deleted",{appName:this._name})}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Be(e,t={}){let n=e;if("object"!=typeof t){t={name:t}}const r={name:De,automaticDataCollectionEnabled:!0,...t},s=r.name;if("string"!=typeof s||!s)throw Fe.create("bad-app-name",{appName:String(s)});if(n||(n=u()),!n)throw Fe.create("no-options");const i=ke.get(s);if(i){if(T(n,i.options)&&T(r,i.config))return i;throw Fe.create("duplicate-app",{appName:s})}const o=new N(s);for(const c of Me.values())o.addComponent(c);const a=new Ve(n,r,o);return ke.set(s,a),a}function Ue(e,t,n){let r=Ne[e]??e;n&&(r+=`-${n}`);const s=r.match(/\s|\//),i=t.match(/\s|\//);if(s||i){const e=[`Unable to register library "${r}" with version "${t}":`];return s&&e.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&e.push("and"),i&&e.push(`version name "${t}" contains illegal characters (whitespace or "/")`),void ne.warn(e.join(" "))}Pe(new A(`${r}-version`,()=>({library:r,version:t}),"VERSION"))}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qe="firebase-heartbeat-store";let je=null;function ze(){return je||(je=function(e,t,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(e,t),a=Q(o);return r&&o.addEventListener("upgradeneeded",e=>{r(Q(o.result),e.oldVersion,e.newVersion,Q(o.transaction),e)}),n&&o.addEventListener("blocked",e=>n(e.oldVersion,e.newVersion,e)),a.then(e=>{i&&e.addEventListener("close",()=>i()),s&&e.addEventListener("versionchange",e=>s(e.oldVersion,e.newVersion,e))}).catch(()=>{}),a}("firebase-heartbeat-database",1,{upgrade:(e,t)=>{if(0===t)try{e.createObjectStore(qe)}catch(n){console.warn(n)}}}).catch(e=>{throw Fe.create("idb-open",{originalErrorMessage:e.message})})),je}async function $e(e,t){try{const n=(await ze()).transaction(qe,"readwrite"),r=n.objectStore(qe);await r.put(t,Ge(e)),await n.done}catch(n){if(n instanceof I)ne.warn(n.message);else{const e=Fe.create("idb-set",{originalErrorMessage:n?.message});ne.warn(e.message)}}}function Ge(e){return`${e.name}!${e.options.appId}`}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ke{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new He(t),this._heartbeatsCachePromise=this._storage.read().then(e=>(this._heartbeatsCache=e,e))}async triggerHeartbeat(){try{const e=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),t=Qe();if(null==this._heartbeatsCache?.heartbeats&&(this._heartbeatsCache=await this._heartbeatsCachePromise,null==this._heartbeatsCache?.heartbeats))return;if(this._heartbeatsCache.lastSentHeartbeatDate===t||this._heartbeatsCache.heartbeats.some(e=>e.date===t))return;if(this._heartbeatsCache.heartbeats.push({date:t,agent:e}),this._heartbeatsCache.heartbeats.length>30){const e=function(e){if(0===e.length)return-1;let t=0,n=e[0].date;for(let r=1;r<e.length;r++)e[r].date<n&&(n=e[r].date,t=r);return t}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(e,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){ne.warn(e)}}async getHeartbeatsHeader(){try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,null==this._heartbeatsCache?.heartbeats||0===this._heartbeatsCache.heartbeats.length)return"";const e=Qe(),{heartbeatsToSend:t,unsentEntries:n}=function(e,t=1024){const n=[];let r=e.slice();for(const s of e){const e=n.find(e=>e.agent===s.agent);if(e){if(e.dates.push(s.date),We(n)>t){e.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),We(n)>t){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}(this._heartbeatsCache.heartbeats),r=s(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,n.length>0?(this._heartbeatsCache.heartbeats=n,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return ne.warn(e),""}}}function Qe(){return(new Date).toISOString().substring(0,10)}class He{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!b()&&new Promise((e,t)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),e(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{t(s.error?.message||"")}}catch(n){t(n)}}).then(()=>!0).catch(()=>!1)}async read(){if(await this._canUseIndexedDBPromise){const e=await async function(e){try{const t=(await ze()).transaction(qe),n=await t.objectStore(qe).get(Ge(e));return await t.done,n}catch(t){if(t instanceof I)ne.warn(t.message);else{const e=Fe.create("idb-get",{originalErrorMessage:t?.message});ne.warn(e.message)}}}(this.app);return e?.heartbeats?e:{heartbeats:[]}}return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const t=await this.read();return $e(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:e.heartbeats})}}async add(e){if(await this._canUseIndexedDBPromise){const t=await this.read();return $e(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??t.lastSentHeartbeatDate,heartbeats:[...t.heartbeats,...e.heartbeats]})}}}function We(e){return s(JSON.stringify({version:2,heartbeats:e})).length}var Je;Je="",Pe(new A("platform-logger",e=>new Z(e),"PRIVATE")),Pe(new A("heartbeat",e=>new Ke(e),"PRIVATE")),Ue(ee,te,Je),Ue(ee,te,"esm2020"),Ue("fire-js","");var Xe,Ye,Ze="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e;
/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}function n(e,t,n){n||(n=0);const r=Array(16);if("string"==typeof t)for(var s=0;s<16;++s)r[s]=t.charCodeAt(n++)|t.charCodeAt(n++)<<8|t.charCodeAt(n++)<<16|t.charCodeAt(n++)<<24;else for(s=0;s<16;++s)r[s]=t[n++]|t[n++]<<8|t[n++]<<16|t[n++]<<24;t=e.g[0],n=e.g[1],s=e.g[2];let i,o=e.g[3];i=t+(o^n&(s^o))+r[0]+3614090360&4294967295,i=o+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[1]+3905402710&4294967295,o=t+(i<<12&4294967295|i>>>20),i=s+(n^o&(t^n))+r[2]+606105819&4294967295,i=n+(t^(s=o+(i<<17&4294967295|i>>>15))&(o^t))+r[3]+3250441966&4294967295,i=t+(o^(n=s+(i<<22&4294967295|i>>>10))&(s^o))+r[4]+4118548399&4294967295,i=o+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[5]+1200080426&4294967295,o=t+(i<<12&4294967295|i>>>20),i=s+(n^o&(t^n))+r[6]+2821735955&4294967295,i=n+(t^(s=o+(i<<17&4294967295|i>>>15))&(o^t))+r[7]+4249261313&4294967295,i=t+(o^(n=s+(i<<22&4294967295|i>>>10))&(s^o))+r[8]+1770035416&4294967295,i=o+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[9]+2336552879&4294967295,o=t+(i<<12&4294967295|i>>>20),i=s+(n^o&(t^n))+r[10]+4294925233&4294967295,i=n+(t^(s=o+(i<<17&4294967295|i>>>15))&(o^t))+r[11]+2304563134&4294967295,i=t+(o^(n=s+(i<<22&4294967295|i>>>10))&(s^o))+r[12]+1804603682&4294967295,i=o+(s^(t=n+(i<<7&4294967295|i>>>25))&(n^s))+r[13]+4254626195&4294967295,o=t+(i<<12&4294967295|i>>>20),i=s+(n^o&(t^n))+r[14]+2792965006&4294967295,i=n+(t^(s=o+(i<<17&4294967295|i>>>15))&(o^t))+r[15]+1236535329&4294967295,i=t+(s^o&((n=s+(i<<22&4294967295|i>>>10))^s))+r[1]+4129170786&4294967295,i=o+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[6]+3225465664&4294967295,o=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(o^t))+r[11]+643717713&4294967295,i=n+(o^t&((s=o+(i<<14&4294967295|i>>>18))^o))+r[0]+3921069994&4294967295,i=t+(s^o&((n=s+(i<<20&4294967295|i>>>12))^s))+r[5]+3593408605&4294967295,i=o+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[10]+38016083&4294967295,o=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(o^t))+r[15]+3634488961&4294967295,i=n+(o^t&((s=o+(i<<14&4294967295|i>>>18))^o))+r[4]+3889429448&4294967295,i=t+(s^o&((n=s+(i<<20&4294967295|i>>>12))^s))+r[9]+568446438&4294967295,i=o+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[14]+3275163606&4294967295,o=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(o^t))+r[3]+4107603335&4294967295,i=n+(o^t&((s=o+(i<<14&4294967295|i>>>18))^o))+r[8]+1163531501&4294967295,i=t+(s^o&((n=s+(i<<20&4294967295|i>>>12))^s))+r[13]+2850285829&4294967295,i=o+(n^s&((t=n+(i<<5&4294967295|i>>>27))^n))+r[2]+4243563512&4294967295,o=t+(i<<9&4294967295|i>>>23),i=s+(t^n&(o^t))+r[7]+1735328473&4294967295,i=n+(o^t&((s=o+(i<<14&4294967295|i>>>18))^o))+r[12]+2368359562&4294967295,i=t+((n=s+(i<<20&4294967295|i>>>12))^s^o)+r[5]+4294588738&4294967295,i=o+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[8]+2272392833&4294967295,o=t+(i<<11&4294967295|i>>>21),i=s+(o^t^n)+r[11]+1839030562&4294967295,i=n+((s=o+(i<<16&4294967295|i>>>16))^o^t)+r[14]+4259657740&4294967295,i=t+((n=s+(i<<23&4294967295|i>>>9))^s^o)+r[1]+2763975236&4294967295,i=o+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[4]+1272893353&4294967295,o=t+(i<<11&4294967295|i>>>21),i=s+(o^t^n)+r[7]+4139469664&4294967295,i=n+((s=o+(i<<16&4294967295|i>>>16))^o^t)+r[10]+3200236656&4294967295,i=t+((n=s+(i<<23&4294967295|i>>>9))^s^o)+r[13]+681279174&4294967295,i=o+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[0]+3936430074&4294967295,o=t+(i<<11&4294967295|i>>>21),i=s+(o^t^n)+r[3]+3572445317&4294967295,i=n+((s=o+(i<<16&4294967295|i>>>16))^o^t)+r[6]+76029189&4294967295,i=t+((n=s+(i<<23&4294967295|i>>>9))^s^o)+r[9]+3654602809&4294967295,i=o+((t=n+(i<<4&4294967295|i>>>28))^n^s)+r[12]+3873151461&4294967295,o=t+(i<<11&4294967295|i>>>21),i=s+(o^t^n)+r[15]+530742520&4294967295,i=n+((s=o+(i<<16&4294967295|i>>>16))^o^t)+r[2]+3299628645&4294967295,i=t+(s^((n=s+(i<<23&4294967295|i>>>9))|~o))+r[0]+4096336452&4294967295,i=o+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[7]+1126891415&4294967295,o=t+(i<<10&4294967295|i>>>22),i=s+(t^(o|~n))+r[14]+2878612391&4294967295,i=n+(o^((s=o+(i<<15&4294967295|i>>>17))|~t))+r[5]+4237533241&4294967295,i=t+(s^((n=s+(i<<21&4294967295|i>>>11))|~o))+r[12]+1700485571&4294967295,i=o+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[3]+2399980690&4294967295,o=t+(i<<10&4294967295|i>>>22),i=s+(t^(o|~n))+r[10]+4293915773&4294967295,i=n+(o^((s=o+(i<<15&4294967295|i>>>17))|~t))+r[1]+2240044497&4294967295,i=t+(s^((n=s+(i<<21&4294967295|i>>>11))|~o))+r[8]+1873313359&4294967295,i=o+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[15]+4264355552&4294967295,o=t+(i<<10&4294967295|i>>>22),i=s+(t^(o|~n))+r[6]+2734768916&4294967295,i=n+(o^((s=o+(i<<15&4294967295|i>>>17))|~t))+r[13]+1309151649&4294967295,i=t+(s^((n=s+(i<<21&4294967295|i>>>11))|~o))+r[4]+4149444226&4294967295,i=o+(n^((t=n+(i<<6&4294967295|i>>>26))|~s))+r[11]+3174756917&4294967295,o=t+(i<<10&4294967295|i>>>22),i=s+(t^(o|~n))+r[2]+718787259&4294967295,i=n+(o^((s=o+(i<<15&4294967295|i>>>17))|~t))+r[9]+3951481745&4294967295,e.g[0]=e.g[0]+t&4294967295,e.g[1]=e.g[1]+(s+(i<<21&4294967295|i>>>11))&4294967295,e.g[2]=e.g[2]+s&4294967295,e.g[3]=e.g[3]+o&4294967295}function r(e,t){this.h=t;const n=[];let r=!0;for(let s=e.length-1;s>=0;s--){const i=0|e[s];r&&i==t||(n[s]=i,r=!1)}this.g=n}!function(e,t){function n(){}n.prototype=t.prototype,e.F=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.D=function(e,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return t.prototype[n].apply(e,s)}}(t,function(){this.blockSize=-1}),t.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0},t.prototype.v=function(e,t){void 0===t&&(t=e.length);const r=t-this.blockSize,s=this.C;let i=this.h,o=0;for(;o<t;){if(0==i)for(;o<=r;)n(this,e,o),o+=this.blockSize;if("string"==typeof e){for(;o<t;)if(s[i++]=e.charCodeAt(o++),i==this.blockSize){n(this,s),i=0;break}}else for(;o<t;)if(s[i++]=e[o++],i==this.blockSize){n(this,s),i=0;break}}this.h=i,this.o+=t},t.prototype.A=function(){var e=Array((this.h<56?this.blockSize:2*this.blockSize)-this.h);e[0]=128;for(var t=1;t<e.length-8;++t)e[t]=0;t=8*this.o;for(var n=e.length-8;n<e.length;++n)e[n]=255&t,t/=256;for(this.v(e),e=Array(16),t=0,n=0;n<4;++n)for(let r=0;r<32;r+=8)e[t++]=this.g[n]>>>r&255;return e};var s={};function i(e){return-128<=e&&e<128?function(e,t){var n=s;return Object.prototype.hasOwnProperty.call(n,e)?n[e]:n[e]=t(e)}(e,function(e){return new r([0|e],e<0?-1:0)}):new r([0|e],e<0?-1:0)}function o(e){if(isNaN(e)||!isFinite(e))return a;if(e<0)return d(o(-e));const t=[];let n=1;for(let r=0;e>=n;r++)t[r]=e/n|0,n*=4294967296;return new r(t,0)}var a=i(0),c=i(1),u=i(16777216);function h(e){if(0!=e.h)return!1;for(let t=0;t<e.g.length;t++)if(0!=e.g[t])return!1;return!0}function l(e){return-1==e.h}function d(e){const t=e.g.length,n=[];for(let r=0;r<t;r++)n[r]=~e.g[r];return new r(n,~e.h).add(c)}function f(e,t){return e.add(d(t))}function m(e,t){for(;(65535&e[t])!=e[t];)e[t+1]+=e[t]>>>16,e[t]&=65535,t++}function g(e,t){this.g=e,this.h=t}function p(e,t){if(h(t))throw Error("division by zero");if(h(e))return new g(a,a);if(l(e))return t=p(d(e),t),new g(d(t.g),d(t.h));if(l(t))return t=p(e,d(t)),new g(d(t.g),t.h);if(e.g.length>30){if(l(e)||l(t))throw Error("slowDivide_ only works with positive integers.");for(var n=c,r=t;r.l(e)<=0;)n=y(n),r=y(r);var s=w(n,1),i=w(r,1);for(r=w(r,2),n=w(n,2);!h(r);){var u=i.add(r);u.l(e)<=0&&(s=s.add(n),i=u),r=w(r,1),n=w(n,1)}return t=f(e,s.j(t)),new g(s,t)}for(s=a;e.l(t)>=0;){for(n=Math.max(1,Math.floor(e.m()/t.m())),r=(r=Math.ceil(Math.log(n)/Math.LN2))<=48?1:Math.pow(2,r-48),u=(i=o(n)).j(t);l(u)||u.l(e)>0;)u=(i=o(n-=r)).j(t);h(i)&&(i=c),s=s.add(i),e=f(e,u)}return new g(s,e)}function y(e){const t=e.g.length+1,n=[];for(let r=0;r<t;r++)n[r]=e.i(r)<<1|e.i(r-1)>>>31;return new r(n,e.h)}function w(e,t){const n=t>>5;t%=32;const s=e.g.length-n,i=[];for(let r=0;r<s;r++)i[r]=t>0?e.i(r+n)>>>t|e.i(r+n+1)<<32-t:e.i(r+n);return new r(i,e.h)}(e=r.prototype).m=function(){if(l(this))return-d(this).m();let e=0,t=1;for(let n=0;n<this.g.length;n++){const r=this.i(n);e+=(r>=0?r:4294967296+r)*t,t*=4294967296}return e},e.toString=function(e){if((e=e||10)<2||36<e)throw Error("radix out of range: "+e);if(h(this))return"0";if(l(this))return"-"+d(this).toString(e);const t=o(Math.pow(e,6));var n=this;let r="";for(;;){const s=p(n,t).g;let i=(((n=f(n,s.j(t))).g.length>0?n.g[0]:n.h)>>>0).toString(e);if(h(n=s))return i+r;for(;i.length<6;)i="0"+i;r=i+r}},e.i=function(e){return e<0?0:e<this.g.length?this.g[e]:this.h},e.l=function(e){return l(e=f(this,e))?-1:h(e)?0:1},e.abs=function(){return l(this)?d(this):this},e.add=function(e){const t=Math.max(this.g.length,e.g.length),n=[];let s=0;for(let r=0;r<=t;r++){let t=s+(65535&this.i(r))+(65535&e.i(r)),i=(t>>>16)+(this.i(r)>>>16)+(e.i(r)>>>16);s=i>>>16,t&=65535,i&=65535,n[r]=i<<16|t}return new r(n,-2147483648&n[n.length-1]?-1:0)},e.j=function(e){if(h(this)||h(e))return a;if(l(this))return l(e)?d(this).j(d(e)):d(d(this).j(e));if(l(e))return d(this.j(d(e)));if(this.l(u)<0&&e.l(u)<0)return o(this.m()*e.m());const t=this.g.length+e.g.length,n=[];for(var s=0;s<2*t;s++)n[s]=0;for(s=0;s<this.g.length;s++)for(let t=0;t<e.g.length;t++){const r=this.i(s)>>>16,i=65535&this.i(s),o=e.i(t)>>>16,a=65535&e.i(t);n[2*s+2*t]+=i*a,m(n,2*s+2*t),n[2*s+2*t+1]+=r*a,m(n,2*s+2*t+1),n[2*s+2*t+1]+=i*o,m(n,2*s+2*t+1),n[2*s+2*t+2]+=r*o,m(n,2*s+2*t+2)}for(e=0;e<t;e++)n[e]=n[2*e+1]<<16|n[2*e];for(e=t;e<2*t;e++)n[e]=0;return new r(n,0)},e.B=function(e){return p(this,e).h},e.and=function(e){const t=Math.max(this.g.length,e.g.length),n=[];for(let r=0;r<t;r++)n[r]=this.i(r)&e.i(r);return new r(n,this.h&e.h)},e.or=function(e){const t=Math.max(this.g.length,e.g.length),n=[];for(let r=0;r<t;r++)n[r]=this.i(r)|e.i(r);return new r(n,this.h|e.h)},e.xor=function(e){const t=Math.max(this.g.length,e.g.length),n=[];for(let r=0;r<t;r++)n[r]=this.i(r)^e.i(r);return new r(n,this.h^e.h)},t.prototype.digest=t.prototype.A,t.prototype.reset=t.prototype.u,t.prototype.update=t.prototype.v,Ye=t,r.prototype.add=r.prototype.add,r.prototype.multiply=r.prototype.j,r.prototype.modulo=r.prototype.B,r.prototype.compare=r.prototype.l,r.prototype.toNumber=r.prototype.m,r.prototype.toString=r.prototype.toString,r.prototype.getBits=r.prototype.i,r.fromNumber=o,r.fromString=function e(t,n){if(0==t.length)throw Error("number format error: empty string");if((n=n||10)<2||36<n)throw Error("radix out of range: "+n);if("-"==t.charAt(0))return d(e(t.substring(1),n));if(t.indexOf("-")>=0)throw Error('number format error: interior "-" character');const r=o(Math.pow(n,8));let s=a;for(let a=0;a<t.length;a+=8){var i=Math.min(8,t.length-a);const e=parseInt(t.substring(a,a+i),n);i<8?(i=o(Math.pow(n,i)),s=s.j(i).add(o(e))):(s=s.j(r),s=s.add(o(e)))}return s},Xe=r}).apply(void 0!==Ze?Ze:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});var et,tt,nt,rt,st,it,ot,at,ct="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/(function(){var e,t=Object.defineProperty;var n=function(e){e=["object"==typeof globalThis&&globalThis,e,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof ct&&ct];for(var t=0;t<e.length;++t){var n=e[t];if(n&&n.Math==Math)return n}throw Error("Cannot find global object")}(this);function r(e,r){if(r)e:{var s=n;e=e.split(".");for(var i=0;i<e.length-1;i++){var o=e[i];if(!(o in s))break e;s=s[o]}(r=r(i=s[e=e[e.length-1]]))!=i&&null!=r&&t(s,e,{configurable:!0,writable:!0,value:r})}}r("Symbol.dispose",function(e){return e||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(e){return e||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(e){return e||function(e){var t,n=[];for(t in e)Object.prototype.hasOwnProperty.call(e,t)&&n.push([t,e[t]]);return n}});
/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var s=s||{},i=this||self;function o(e){var t=typeof e;return"object"==t&&null!=e||"function"==t}function a(e,t,n){return e.call.apply(e.bind,arguments)}function c(e,t,n){return(c=a).apply(null,arguments)}function u(e,t){var n=Array.prototype.slice.call(arguments,1);return function(){var t=n.slice();return t.push.apply(t,arguments),e.apply(this,t)}}function h(e,t){function n(){}n.prototype=t.prototype,e.Z=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.Ob=function(e,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return t.prototype[n].apply(e,s)}}var l="undefined"!=typeof AsyncContext&&"function"==typeof AsyncContext.Snapshot?e=>e&&AsyncContext.Snapshot.wrap(e):e=>e;function d(e){const t=e.length;if(t>0){const n=Array(t);for(let r=0;r<t;r++)n[r]=e[r];return n}return[]}function f(e,t){for(let r=1;r<arguments.length;r++){const t=arguments[r];var n=typeof t;if("array"==(n="object"!=n?n:t?Array.isArray(t)?"array":n:"null")||"object"==n&&"number"==typeof t.length){n=e.length||0;const r=t.length||0;e.length=n+r;for(let s=0;s<r;s++)e[n+s]=t[s]}else e.push(t)}}function m(e){i.setTimeout(()=>{throw e},0)}function g(){var e=b;let t=null;return e.g&&(t=e.g,e.g=e.g.next,e.g||(e.h=null),t.next=null),t}var p=new class{constructor(e,t){this.i=e,this.j=t,this.h=0,this.g=null}get(){let e;return this.h>0?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}(()=>new y,e=>e.reset());class y{constructor(){this.next=this.g=this.h=null}set(e,t){this.h=e,this.g=t,this.next=null}reset(){this.next=this.g=this.h=null}}let w,v=!1,b=new class{constructor(){this.h=this.g=null}add(e,t){const n=p.get();n.set(e,t),this.h?this.h.next=n:this.g=n,this.h=n}},I=()=>{const e=Promise.resolve(void 0);w=()=>{e.then(_)}};function _(){for(var e;e=g();){try{e.h.call(e.g)}catch(n){m(n)}var t=p;t.j(e),t.h<100&&(t.h++,e.next=t.g,t.g=e)}v=!1}function E(){this.u=this.u,this.C=this.C}function T(e,t){this.type=e,this.g=this.target=t,this.defaultPrevented=!1}E.prototype.u=!1,E.prototype.dispose=function(){this.u||(this.u=!0,this.N())},E.prototype[Symbol.dispose]=function(){this.dispose()},E.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()},T.prototype.h=function(){this.defaultPrevented=!0};var S=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var e=!1,t=Object.defineProperty({},"passive",{get:function(){e=!0}});try{const e=()=>{};i.addEventListener("test",e,t),i.removeEventListener("test",e,t)}catch(n){}return e}();function C(e){return/^[\s\xa0]*$/.test(e)}function A(e,t){T.call(this,e?e.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,e&&this.init(e,t)}h(A,T),A.prototype.init=function(e,t){const n=this.type=e.type,r=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:null;this.target=e.target||e.srcElement,this.g=t,(t=e.relatedTarget)||("mouseover"==n?t=e.fromElement:"mouseout"==n&&(t=e.toElement)),this.relatedTarget=t,r?(this.clientX=void 0!==r.clientX?r.clientX:r.pageX,this.clientY=void 0!==r.clientY?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0):(this.clientX=void 0!==e.clientX?e.clientX:e.pageX,this.clientY=void 0!==e.clientY?e.clientY:e.pageY,this.screenX=e.screenX||0,this.screenY=e.screenY||0),this.button=e.button,this.key=e.key||"",this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.pointerId=e.pointerId||0,this.pointerType=e.pointerType,this.state=e.state,this.i=e,e.defaultPrevented&&A.Z.h.call(this)},A.prototype.h=function(){A.Z.h.call(this);const e=this.i;e.preventDefault?e.preventDefault():e.returnValue=!1};var x="closure_listenable_"+(1e6*Math.random()|0),D=0;function N(e,t,n,r,s){this.listener=e,this.proxy=null,this.src=t,this.type=n,this.capture=!!r,this.ha=s,this.key=++D,this.da=this.fa=!1}function k(e){e.da=!0,e.listener=null,e.proxy=null,e.src=null,e.ha=null}function R(e,t,n){for(const r in e)t.call(n,e[r],r,e)}function M(e){const t={};for(const n in e)t[n]=e[n];return t}const O="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function P(e,t){let n,r;for(let s=1;s<arguments.length;s++){for(n in r=arguments[s],r)e[n]=r[n];for(let t=0;t<O.length;t++)n=O[t],Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}}function L(e){this.src=e,this.g={},this.h=0}function F(e,t){const n=t.type;if(n in e.g){var r,s=e.g[n],i=Array.prototype.indexOf.call(s,t,void 0);(r=i>=0)&&Array.prototype.splice.call(s,i,1),r&&(k(t),0==e.g[n].length&&(delete e.g[n],e.h--))}}function V(e,t,n,r){for(let s=0;s<e.length;++s){const i=e[s];if(!i.da&&i.listener==t&&i.capture==!!n&&i.ha==r)return s}return-1}L.prototype.add=function(e,t,n,r,s){const i=e.toString();(e=this.g[i])||(e=this.g[i]=[],this.h++);const o=V(e,t,r,s);return o>-1?(t=e[o],n||(t.fa=!1)):((t=new N(t,this.src,i,!!r,s)).fa=n,e.push(t)),t};var B="closure_lm_"+(1e6*Math.random()|0),U={};function q(e,t,n,r,s){if(Array.isArray(t)){for(let i=0;i<t.length;i++)q(e,t[i],n,r,s);return null}return n=H(n),e&&e[x]?e.J(t,n,!!o(r)&&!!r.capture,s):function(e,t,n,r,s,i){if(!t)throw Error("Invalid event type");const a=o(s)?!!s.capture:!!s;let c=K(e);if(c||(e[B]=c=new L(e)),n=c.add(t,n,r,a,i),n.proxy)return n;if(r=function(){function e(n){return t.call(e.src,e.listener,n)}const t=G;return e}(),n.proxy=r,r.src=e,r.listener=n,e.addEventListener)S||(s=a),void 0===s&&(s=!1),e.addEventListener(t.toString(),r,s);else if(e.attachEvent)e.attachEvent($(t.toString()),r);else{if(!e.addListener||!e.removeListener)throw Error("addEventListener and attachEvent are unavailable.");e.addListener(r)}return n}(e,t,n,!1,r,s)}function j(e,t,n,r,s){if(Array.isArray(t))for(var i=0;i<t.length;i++)j(e,t[i],n,r,s);else r=o(r)?!!r.capture:!!r,n=H(n),e&&e[x]?(e=e.i,(i=String(t).toString())in e.g&&((n=V(t=e.g[i],n,r,s))>-1&&(k(t[n]),Array.prototype.splice.call(t,n,1),0==t.length&&(delete e.g[i],e.h--)))):e&&(e=K(e))&&(t=e.g[t.toString()],e=-1,t&&(e=V(t,n,r,s)),(n=e>-1?t[e]:null)&&z(n))}function z(e){if("number"!=typeof e&&e&&!e.da){var t=e.src;if(t&&t[x])F(t.i,e);else{var n=e.type,r=e.proxy;t.removeEventListener?t.removeEventListener(n,r,e.capture):t.detachEvent?t.detachEvent($(n),r):t.addListener&&t.removeListener&&t.removeListener(r),(n=K(t))?(F(n,e),0==n.h&&(n.src=null,t[B]=null)):k(e)}}}function $(e){return e in U?U[e]:U[e]="on"+e}function G(e,t){if(e.da)e=!0;else{t=new A(t,this);const n=e.listener,r=e.ha||e.src;e.fa&&z(e),e=n.call(r,t)}return e}function K(e){return(e=e[B])instanceof L?e:null}var Q="__closure_events_fn_"+(1e9*Math.random()>>>0);function H(e){return"function"==typeof e?e:(e[Q]||(e[Q]=function(t){return e.handleEvent(t)}),e[Q])}function W(){E.call(this),this.i=new L(this),this.M=this,this.G=null}function J(e,t){var n,r=e.G;if(r)for(n=[];r;r=r.G)n.push(r);if(e=e.M,r=t.type||t,"string"==typeof t)t=new T(t,e);else if(t instanceof T)t.target=t.target||e;else{var s=t;P(t=new T(r,e),s)}let i,o;if(s=!0,n)for(o=n.length-1;o>=0;o--)i=t.g=n[o],s=X(i,r,!0,t)&&s;if(i=t.g=e,s=X(i,r,!0,t)&&s,s=X(i,r,!1,t)&&s,n)for(o=0;o<n.length;o++)i=t.g=n[o],s=X(i,r,!1,t)&&s}function X(e,t,n,r){if(!(t=e.i.g[String(t)]))return!0;t=t.concat();let s=!0;for(let i=0;i<t.length;++i){const o=t[i];if(o&&!o.da&&o.capture==n){const t=o.listener,n=o.ha||o.src;o.fa&&F(e.i,o),s=!1!==t.call(n,r)&&s}}return s&&!r.defaultPrevented}function Y(e){e.g=function(e,t){if("function"!=typeof e){if(!e||"function"!=typeof e.handleEvent)throw Error("Invalid listener argument");e=c(e.handleEvent,e)}return Number(t)>2147483647?-1:i.setTimeout(e,t||0)}(()=>{e.g=null,e.i&&(e.i=!1,Y(e))},e.l);const t=e.h;e.h=null,e.m.apply(null,t)}h(W,E),W.prototype[x]=!0,W.prototype.removeEventListener=function(e,t,n,r){j(this,e,t,n,r)},W.prototype.N=function(){if(W.Z.N.call(this),this.i){var e=this.i;for(const t in e.g){const n=e.g[t];for(let e=0;e<n.length;e++)k(n[e]);delete e.g[t],e.h--}}this.G=null},W.prototype.J=function(e,t,n,r){return this.i.add(String(e),t,!1,n,r)},W.prototype.K=function(e,t,n,r){return this.i.add(String(e),t,!0,n,r)};class Z extends E{constructor(e,t){super(),this.m=e,this.l=t,this.h=null,this.i=!1,this.g=null}j(e){this.h=arguments,this.g?this.i=!0:Y(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ee(e){E.call(this),this.h=e,this.g={}}h(ee,E);var te=[];function ne(e){R(e.g,function(e,t){this.g.hasOwnProperty(t)&&z(e)},e),e.g={}}ee.prototype.N=function(){ee.Z.N.call(this),ne(this)},ee.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var re=i.JSON.stringify,se=i.JSON.parse,ie=class{stringify(e){return i.JSON.stringify(e,void 0)}parse(e){return i.JSON.parse(e,void 0)}};function oe(){}function ae(){}var ce={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function ue(){T.call(this,"d")}function he(){T.call(this,"c")}h(ue,T),h(he,T);var le={},de=null;function fe(){return de=de||new W}function me(e){T.call(this,le.Ia,e)}function ge(e){const t=fe();J(t,new me(t))}function pe(e,t){T.call(this,le.STAT_EVENT,e),this.stat=t}function ye(e){const t=fe();J(t,new pe(t,e))}function we(e,t){T.call(this,le.Ja,e),this.size=t}function ve(e,t){if("function"!=typeof e)throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){e()},t)}function be(){this.g=!0}function Ie(e,t,n,r){e.info(function(){return"XMLHTTP TEXT ("+t+"): "+function(e,t){if(!e.g)return t;if(!t)return null;try{const i=JSON.parse(t);if(i)for(e=0;e<i.length;e++)if(Array.isArray(i[e])){var n=i[e];if(!(n.length<2)){var r=n[1];if(Array.isArray(r)&&!(r.length<1)){var s=r[0];if("noop"!=s&&"stop"!=s&&"close"!=s)for(let e=1;e<r.length;e++)r[e]=""}}}return re(i)}catch(i){return t}}(e,n)+(r?" "+r:"")})}le.Ia="serverreachability",h(me,T),le.STAT_EVENT="statevent",h(pe,T),le.Ja="timingevent",h(we,T),be.prototype.ua=function(){this.g=!1},be.prototype.info=function(){};var _e,Ee={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Te={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"};function Se(){}function Ce(e){return encodeURIComponent(String(e))}function Ae(e){var t=1;e=e.split(":");const n=[];for(;t>0&&e.length;)n.push(e.shift()),t--;return e.length&&n.push(e.join(":")),n}function xe(e,t,n,r){this.j=e,this.i=t,this.l=n,this.S=r||1,this.V=new ee(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new De}function De(){this.i=null,this.g="",this.h=!1}h(Se,oe),Se.prototype.g=function(){return new XMLHttpRequest},_e=new Se;var Ne={},ke={};function Re(e,t,n){e.M=1,e.A=ft(Ye(t)),e.u=n,e.R=!0,Me(e,null)}function Me(e,t){e.F=Date.now(),Le(e),e.B=Ye(e.A);var n=e.B,r=e.S;Array.isArray(r)||(r=[String(r)]),At(n.i,"t",r),e.C=0,n=e.j.L,e.h=new De,e.g=gn(e.j,n?t:null,!e.u),e.P>0&&(e.O=new Z(c(e.Y,e,e.g),e.P)),t=e.V,n=e.g,r=e.ba;var s="readystatechange";Array.isArray(s)||(s&&(te[0]=s.toString()),s=te);for(let i=0;i<s.length;i++){const e=q(n,s[i],r||t.handleEvent,!1,t.h||t);if(!e)break;t.g[e.key]=e}t=e.J?M(e.J):{},e.u?(e.v||(e.v="POST"),t["Content-Type"]="application/x-www-form-urlencoded",e.g.ea(e.B,e.v,e.u,t)):(e.v="GET",e.g.ea(e.B,e.v,null,t)),ge(),function(e,t,n,r,s,i){e.info(function(){if(e.g)if(i){var o="",a=i.split("&");for(let e=0;e<a.length;e++){var c=a[e].split("=");if(c.length>1){const e=c[0];c=c[1];const t=e.split("_");o=t.length>=2&&"type"==t[1]?o+(e+"=")+c+"&":o+(e+"=redacted&")}}}else o=null;else o=i;return"XMLHTTP REQ ("+r+") [attempt "+s+"]: "+t+"\n"+n+"\n"+o})}(e.i,e.v,e.B,e.l,e.S,e.u)}function Oe(e){return!!e.g&&("GET"==e.v&&2!=e.M&&e.j.Aa)}function Pe(e,t){var n=e.C,r=t.indexOf("\n",n);return-1==r?ke:(n=Number(t.substring(n,r)),isNaN(n)?Ne:(r+=1)+n>t.length?ke:(t=t.slice(r,r+n),e.C=r+n,t))}function Le(e){e.T=Date.now()+e.H,Fe(e,e.H)}function Fe(e,t){if(null!=e.D)throw Error("WatchDog timer not null");e.D=ve(c(e.aa,e),t)}function Ve(e){e.D&&(i.clearTimeout(e.D),e.D=null)}function Be(e){0==e.j.I||e.K||hn(e.j,e)}function Ue(e){Ve(e);var t=e.O;t&&"function"==typeof t.dispose&&t.dispose(),e.O=null,ne(e.V),e.g&&(t=e.g,e.g=null,t.abort(),t.dispose())}function qe(e,t){try{var n=e.j;if(0!=n.I&&(n.g==e||Ke(n.h,e)))if(!e.L&&Ke(n.h,e)&&3==n.I){try{var r=n.Ba.g.parse(t)}catch(h){r=null}if(Array.isArray(r)&&3==r.length){var s=r;if(0==s[0]){e:if(!n.v){if(n.g){if(!(n.g.F+3e3<e.F))break e;un(n),Yt(n)}on(n),ye(18)}}else n.xa=s[1],0<n.xa-n.K&&s[2]<37500&&n.F&&0==n.A&&!n.C&&(n.C=ve(c(n.Va,n),6e3));Ge(n.h)<=1&&n.ta&&(n.ta=void 0)}else dn(n,11)}else if((e.L||n.g==e)&&un(n),!C(t))for(s=n.Ba.g.parse(t),t=0;t<s.length;t++){let c=s[t];const h=c[0];if(!(h<=n.K))if(n.K=h,c=c[1],2==n.I)if("c"==c[0]){n.M=c[1],n.ba=c[2];const t=c[3];null!=t&&(n.ka=t,n.j.info("VER="+n.ka));const s=c[4];null!=s&&(n.za=s,n.j.info("SVER="+n.za));const h=c[5];null!=h&&"number"==typeof h&&h>0&&(r=1.5*h,n.O=r,n.j.info("backChannelRequestTimeoutMs_="+r)),r=n;const l=e.g;if(l){const e=l.g?l.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(e){var i=r.h;i.g||-1==e.indexOf("spdy")&&-1==e.indexOf("quic")&&-1==e.indexOf("h2")||(i.j=i.l,i.g=new Set,i.h&&(Qe(i,i.h),i.h=null))}if(r.G){const e=l.g?l.g.getResponseHeader("X-HTTP-Session-Id"):null;e&&(r.wa=e,dt(r.J,r.G,e))}}n.I=3,n.l&&n.l.ra(),n.aa&&(n.T=Date.now()-e.F,n.j.info("Handshake RTT: "+n.T+"ms"));var o=e;if((r=n).na=mn(r,r.L?r.ba:null,r.W),o.L){He(r.h,o);var a=o,u=r.O;u&&(a.H=u),a.D&&(Ve(a),Le(a)),r.g=o}else sn(r);n.i.length>0&&en(n)}else"stop"!=c[0]&&"close"!=c[0]||dn(n,7);else 3==n.I&&("stop"==c[0]||"close"==c[0]?"stop"==c[0]?dn(n,7):Xt(n):"noop"!=c[0]&&n.l&&n.l.qa(c),n.A=0)}ge()}catch(h){}}xe.prototype.ba=function(e){e=e.target;const t=this.O;t&&3==Qt(e)?t.j():this.Y(e)},xe.prototype.Y=function(e){try{if(e==this.g)e:{const c=Qt(this.g),u=this.g.ya();this.g.ca();if(!(c<3)&&(3!=c||this.g&&(this.h.h||this.g.la()||Ht(this.g)))){this.K||4!=c||7==u||ge(),Ve(this);var t=this.g.ca();this.X=t;var n=function(e){if(!Oe(e))return e.g.la();const t=Ht(e.g);if(""===t)return"";let n="";const r=t.length,s=4==Qt(e.g);if(!e.h.i){if("undefined"==typeof TextDecoder)return Ue(e),Be(e),"";e.h.i=new i.TextDecoder}for(let i=0;i<r;i++)e.h.h=!0,n+=e.h.i.decode(t[i],{stream:!(s&&i==r-1)});return t.length=0,e.h.g+=n,e.C=0,e.h.g}(this);if(this.o=200==t,function(e,t,n,r,s,i,o){e.info(function(){return"XMLHTTP RESP ("+r+") [ attempt "+s+"]: "+t+"\n"+n+"\n"+i+" "+o})}(this.i,this.v,this.B,this.l,this.S,c,t),this.o){if(this.U&&!this.L){t:{if(this.g){var r,s=this.g;if((r=s.g?s.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!C(r)){var o=r;break t}}o=null}if(!(e=o)){this.o=!1,this.m=3,ye(12),Ue(this),Be(this);break e}Ie(this.i,this.l,e,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,qe(this,e)}if(this.R){let t;for(e=!0;!this.K&&this.C<n.length;){if(t=Pe(this,n),t==ke){4==c&&(this.m=4,ye(14),e=!1),Ie(this.i,this.l,null,"[Incomplete Response]");break}if(t==Ne){this.m=4,ye(15),Ie(this.i,this.l,n,"[Invalid Chunk]"),e=!1;break}Ie(this.i,this.l,t,null),qe(this,t)}if(Oe(this)&&0!=this.C&&(this.h.g=this.h.g.slice(this.C),this.C=0),4!=c||0!=n.length||this.h.h||(this.m=1,ye(16),e=!1),this.o=this.o&&e,e){if(n.length>0&&!this.W){this.W=!0;var a=this.j;a.g==this&&a.aa&&!a.P&&(a.j.info("Great, no buffering proxy detected. Bytes received: "+n.length),an(a),a.P=!0,ye(11))}}else Ie(this.i,this.l,n,"[Invalid Chunked Response]"),Ue(this),Be(this)}else Ie(this.i,this.l,n,null),qe(this,n);4==c&&Ue(this),this.o&&!this.K&&(4==c?hn(this.j,this):(this.o=!1,Le(this)))}else(function(e){const t={};e=(e.g&&Qt(e)>=2&&e.g.getAllResponseHeaders()||"").split("\r\n");for(let r=0;r<e.length;r++){if(C(e[r]))continue;var n=Ae(e[r]);const s=n[0];if("string"!=typeof(n=n[1]))continue;n=n.trim();const i=t[s]||[];t[s]=i,i.push(n)}!function(e,t){for(const n in e)t.call(void 0,e[n],n,e)}(t,function(e){return e.join(", ")})})(this.g),400==t&&n.indexOf("Unknown SID")>0?(this.m=3,ye(12)):(this.m=0,ye(13)),Ue(this),Be(this)}}}catch(zt){}},xe.prototype.cancel=function(){this.K=!0,Ue(this)},xe.prototype.aa=function(){this.D=null;const e=Date.now();e-this.T>=0?(function(e,t){e.info(function(){return"TIMEOUT: "+t})}(this.i,this.B),2!=this.M&&(ge(),ye(17)),Ue(this),this.m=2,Be(this)):Fe(this,this.T-e)};var je=class{constructor(e,t){this.g=e,this.map=t}};function ze(e){this.l=e||10,i.PerformanceNavigationTiming?e=(e=i.performance.getEntriesByType("navigation")).length>0&&("hq"==e[0].nextHopProtocol||"h2"==e[0].nextHopProtocol):e=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=e?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function $e(e){return!!e.h||!!e.g&&e.g.size>=e.j}function Ge(e){return e.h?1:e.g?e.g.size:0}function Ke(e,t){return e.h?e.h==t:!!e.g&&e.g.has(t)}function Qe(e,t){e.g?e.g.add(t):e.h=t}function He(e,t){e.h&&e.h==t?e.h=null:e.g&&e.g.has(t)&&e.g.delete(t)}function We(e){if(null!=e.h)return e.i.concat(e.h.G);if(null!=e.g&&0!==e.g.size){let t=e.i;for(const n of e.g.values())t=t.concat(n.G);return t}return d(e.i)}ze.prototype.cancel=function(){if(this.i=We(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const e of this.g.values())e.cancel();this.g.clear()}};var Je=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Xe(e){let t;this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1,e instanceof Xe?(this.l=e.l,Ze(this,e.j),this.o=e.o,this.g=e.g,ut(this,e.u),this.h=e.h,lt(this,xt(e.i)),this.m=e.m):e&&(t=String(e).match(Je))?(this.l=!1,Ze(this,t[1]||"",!0),this.o=mt(t[2]||""),this.g=mt(t[3]||"",!0),ut(this,t[4]),this.h=mt(t[5]||"",!0),lt(this,t[6]||"",!0),this.m=mt(t[7]||"")):(this.l=!1,this.i=new _t(null,this.l))}function Ye(e){return new Xe(e)}function Ze(e,t,n){e.j=n?mt(t,!0):t,e.j&&(e.j=e.j.replace(/:$/,""))}function ut(e,t){if(t){if(t=Number(t),isNaN(t)||t<0)throw Error("Bad port number "+t);e.u=t}else e.u=null}function lt(e,t,n){t instanceof _t?(e.i=t,function(e,t){t&&!e.j&&(Et(e),e.i=null,e.g.forEach(function(e,t){const n=t.toLowerCase();t!=n&&(Tt(this,t),At(this,n,e))},e)),e.j=t}(e.i,e.l)):(n||(t=gt(t,bt)),e.i=new _t(t,e.l))}function dt(e,t,n){e.i.set(t,n)}function ft(e){return dt(e,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),e}function mt(e,t){return e?t?decodeURI(e.replace(/%25/g,"%2525")):decodeURIComponent(e):""}function gt(e,t,n){return"string"==typeof e?(e=encodeURI(e).replace(t,pt),n&&(e=e.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),e):null}function pt(e){return"%"+((e=e.charCodeAt(0))>>4&15).toString(16)+(15&e).toString(16)}Xe.prototype.toString=function(){const e=[];var t=this.j;t&&e.push(gt(t,yt,!0),":");var n=this.g;return(n||"file"==t)&&(e.push("//"),(t=this.o)&&e.push(gt(t,yt,!0),"@"),e.push(Ce(n).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),null!=(n=this.u)&&e.push(":",String(n))),(n=this.h)&&(this.g&&"/"!=n.charAt(0)&&e.push("/"),e.push(gt(n,"/"==n.charAt(0)?vt:wt,!0))),(n=this.i.toString())&&e.push("?",n),(n=this.m)&&e.push("#",gt(n,It)),e.join("")},Xe.prototype.resolve=function(e){const t=Ye(this);let n=!!e.j;n?Ze(t,e.j):n=!!e.o,n?t.o=e.o:n=!!e.g,n?t.g=e.g:n=null!=e.u;var r=e.h;if(n)ut(t,e.u);else if(n=!!e.h){if("/"!=r.charAt(0))if(this.g&&!this.h)r="/"+r;else{var s=t.h.lastIndexOf("/");-1!=s&&(r=t.h.slice(0,s+1)+r)}if(".."==(s=r)||"."==s)r="";else if(-1!=s.indexOf("./")||-1!=s.indexOf("/.")){r=0==s.lastIndexOf("/",0),s=s.split("/");const e=[];for(let t=0;t<s.length;){const n=s[t++];"."==n?r&&t==s.length&&e.push(""):".."==n?((e.length>1||1==e.length&&""!=e[0])&&e.pop(),r&&t==s.length&&e.push("")):(e.push(n),r=!0)}r=e.join("/")}else r=s}return n?t.h=r:n=""!==e.i.toString(),n?lt(t,xt(e.i)):n=!!e.m,n&&(t.m=e.m),t};var yt=/[#\/\?@]/g,wt=/[#\?:]/g,vt=/[#\?]/g,bt=/[#\?@]/g,It=/#/g;function _t(e,t){this.h=this.g=null,this.i=e||null,this.j=!!t}function Et(e){e.g||(e.g=new Map,e.h=0,e.i&&function(e,t){if(e){e=e.split("&");for(let n=0;n<e.length;n++){const r=e[n].indexOf("=");let s,i=null;r>=0?(s=e[n].substring(0,r),i=e[n].substring(r+1)):s=e[n],t(s,i?decodeURIComponent(i.replace(/\+/g," ")):"")}}}(e.i,function(t,n){e.add(decodeURIComponent(t.replace(/\+/g," ")),n)}))}function Tt(e,t){Et(e),t=Dt(e,t),e.g.has(t)&&(e.i=null,e.h-=e.g.get(t).length,e.g.delete(t))}function St(e,t){return Et(e),t=Dt(e,t),e.g.has(t)}function Ct(e,t){Et(e);let n=[];if("string"==typeof t)St(e,t)&&(n=n.concat(e.g.get(Dt(e,t))));else for(e=Array.from(e.g.values()),t=0;t<e.length;t++)n=n.concat(e[t]);return n}function At(e,t,n){Tt(e,t),n.length>0&&(e.i=null,e.g.set(Dt(e,t),d(n)),e.h+=n.length)}function xt(e){const t=new _t;return t.i=e.i,e.g&&(t.g=new Map(e.g),t.h=e.h),t}function Dt(e,t){return t=String(t),e.j&&(t=t.toLowerCase()),t}function Nt(e,t,n,r,s){try{s&&(s.onload=null,s.onerror=null,s.onabort=null,s.ontimeout=null),r(n)}catch(i){}}function kt(){this.g=new ie}function Rt(e){this.i=e.Sb||null,this.h=e.ab||!1}function Mt(e,t){W.call(this),this.H=e,this.o=t,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}function Ot(e){e.j.read().then(e.Ma.bind(e)).catch(e.ga.bind(e))}function Pt(e){e.readyState=4,e.l=null,e.j=null,e.B=null,Lt(e)}function Lt(e){e.onreadystatechange&&e.onreadystatechange.call(e)}function Ft(e){let t="";return R(e,function(e,n){t+=n,t+=":",t+=e,t+="\r\n"}),t}function Vt(e,t,n){e:{for(r in n){var r=!1;break e}r=!0}r||(n=Ft(n),"string"==typeof e?null!=n&&Ce(n):dt(e,t,n))}function Bt(e){W.call(this),this.headers=new Map,this.L=e||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}(e=_t.prototype).add=function(e,t){Et(this),this.i=null,e=Dt(this,e);let n=this.g.get(e);return n||this.g.set(e,n=[]),n.push(t),this.h+=1,this},e.forEach=function(e,t){Et(this),this.g.forEach(function(n,r){n.forEach(function(n){e.call(t,n,r,this)},this)},this)},e.set=function(e,t){return Et(this),this.i=null,St(this,e=Dt(this,e))&&(this.h-=this.g.get(e).length),this.g.set(e,[t]),this.h+=1,this},e.get=function(e,t){return e&&(e=Ct(this,e)).length>0?String(e[0]):t},e.toString=function(){if(this.i)return this.i;if(!this.g)return"";const e=[],t=Array.from(this.g.keys());for(let r=0;r<t.length;r++){var n=t[r];const s=Ce(n);n=Ct(this,n);for(let t=0;t<n.length;t++){let r=s;""!==n[t]&&(r+="="+Ce(n[t])),e.push(r)}}return this.i=e.join("&")},h(Rt,oe),Rt.prototype.g=function(){return new Mt(this.i,this.h)},h(Mt,W),(e=Mt.prototype).open=function(e,t){if(0!=this.readyState)throw this.abort(),Error("Error reopening a connection");this.F=e,this.D=t,this.readyState=1,Lt(this)},e.send=function(e){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const t={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};e&&(t.body=e),(this.H||i).fetch(new Request(this.D,t)).then(this.Pa.bind(this),this.ga.bind(this))},e.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&4!=this.readyState&&(this.g=!1,Pt(this)),this.readyState=0},e.Pa=function(e){if(this.g&&(this.l=e,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=e.headers,this.readyState=2,Lt(this)),this.g&&(this.readyState=3,Lt(this),this.g)))if("arraybuffer"===this.responseType)e.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(void 0!==i.ReadableStream&&"body"in e){if(this.j=e.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Ot(this)}else e.text().then(this.Oa.bind(this),this.ga.bind(this))},e.Ma=function(e){if(this.g){if(this.o&&e.value)this.response.push(e.value);else if(!this.o){var t=e.value?e.value:new Uint8Array(0);(t=this.B.decode(t,{stream:!e.done}))&&(this.response=this.responseText+=t)}e.done?Pt(this):Lt(this),3==this.readyState&&Ot(this)}},e.Oa=function(e){this.g&&(this.response=this.responseText=e,Pt(this))},e.Na=function(e){this.g&&(this.response=e,Pt(this))},e.ga=function(){this.g&&Pt(this)},e.setRequestHeader=function(e,t){this.A.append(e,t)},e.getResponseHeader=function(e){return this.h&&this.h.get(e.toLowerCase())||""},e.getAllResponseHeaders=function(){if(!this.h)return"";const e=[],t=this.h.entries();for(var n=t.next();!n.done;)n=n.value,e.push(n[0]+": "+n[1]),n=t.next();return e.join("\r\n")},Object.defineProperty(Mt.prototype,"withCredentials",{get:function(){return"include"===this.m},set:function(e){this.m=e?"include":"same-origin"}}),h(Bt,W);var Ut=/^https?$/i,qt=["POST","PUT"];function jt(e,t){e.h=!1,e.g&&(e.j=!0,e.g.abort(),e.j=!1),e.l=t,e.o=5,$t(e),Kt(e)}function $t(e){e.A||(e.A=!0,J(e,"complete"),J(e,"error"))}function Gt(e){if(e.h&&void 0!==s)if(e.v&&4==Qt(e))setTimeout(e.Ca.bind(e),0);else if(J(e,"readystatechange"),4==Qt(e)){e.h=!1;try{const s=e.ca();e:switch(s){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var t=!0;break e;default:t=!1}var n;if(!(n=t)){var r;if(r=0===s){let t=String(e.D).match(Je)[1]||null;!t&&i.self&&i.self.location&&(t=i.self.location.protocol.slice(0,-1)),r=!Ut.test(t?t.toLowerCase():"")}n=r}if(n)J(e,"complete"),J(e,"success");else{e.o=6;try{var o=Qt(e)>2?e.g.statusText:""}catch(a){o=""}e.l=o+" ["+e.ca()+"]",$t(e)}}finally{Kt(e)}}}function Kt(e,t){if(e.g){e.m&&(clearTimeout(e.m),e.m=null);const r=e.g;e.g=null,t||J(e,"ready");try{r.onreadystatechange=null}catch(n){}}}function Qt(e){return e.g?e.g.readyState:0}function Ht(e){try{if(!e.g)return null;if("response"in e.g)return e.g.response;switch(e.F){case"":case"text":return e.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in e.g)return e.g.mozResponseArrayBuffer}return null}catch(t){return null}}function Wt(e,t,n){return n&&n.internalChannelParams&&n.internalChannelParams[e]||t}function Jt(e){this.za=0,this.i=[],this.j=new be,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Wt("failFast",!1,e),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Wt("baseRetryDelayMs",5e3,e),this.Za=Wt("retryDelaySeedMs",1e4,e),this.Ta=Wt("forwardChannelMaxRetries",2,e),this.va=Wt("forwardChannelRequestTimeoutMs",2e4,e),this.ma=e&&e.xmlHttpFactory||void 0,this.Ua=e&&e.Rb||void 0,this.Aa=e&&e.useFetchStreams||!1,this.O=void 0,this.L=e&&e.supportsCrossDomainXhr||!1,this.M="",this.h=new ze(e&&e.concurrentRequestLimit),this.Ba=new kt,this.S=e&&e.fastHandshake||!1,this.R=e&&e.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=e&&e.Pb||!1,e&&e.ua&&this.j.ua(),e&&e.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&e&&e.detectBufferingProxy||!1,this.ia=void 0,e&&e.longPollingTimeout&&e.longPollingTimeout>0&&(this.ia=e.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}function Xt(e){if(Zt(e),3==e.I){var t=e.V++,n=Ye(e.J);if(dt(n,"SID",e.M),dt(n,"RID",t),dt(n,"TYPE","terminate"),nn(e,n),(t=new xe(e,e.j,t)).M=2,t.A=ft(Ye(n)),n=!1,i.navigator&&i.navigator.sendBeacon)try{n=i.navigator.sendBeacon(t.A.toString(),"")}catch(r){}!n&&i.Image&&((new Image).src=t.A,n=!0),n||(t.g=gn(t.j,null),t.g.ea(t.A)),t.F=Date.now(),Le(t)}fn(e)}function Yt(e){e.g&&(an(e),e.g.cancel(),e.g=null)}function Zt(e){Yt(e),e.v&&(i.clearTimeout(e.v),e.v=null),un(e),e.h.cancel(),e.m&&("number"==typeof e.m&&i.clearTimeout(e.m),e.m=null)}function en(e){if(!$e(e.h)&&!e.m){e.m=!0;var t=e.Ea;w||I(),v||(w(),v=!0),b.add(t,e),e.D=0}}function tn(e,t){var n;n=t?t.l:e.V++;const r=Ye(e.J);dt(r,"SID",e.M),dt(r,"RID",n),dt(r,"AID",e.K),nn(e,r),e.u&&e.o&&Vt(r,e.u,e.o),n=new xe(e,e.j,n,e.D+1),null===e.u&&(n.J=e.o),t&&(e.i=t.G.concat(e.i)),t=rn(e,n,1e3),n.H=Math.round(.5*e.va)+Math.round(.5*e.va*Math.random()),Qe(e.h,n),Re(n,r,t)}function nn(e,t){e.H&&R(e.H,function(e,n){dt(t,n,e)}),e.l&&R({},function(e,n){dt(t,n,e)})}function rn(e,t,n){n=Math.min(e.i.length,n);const r=e.l?c(e.l.Ka,e.l,e):null;e:{var s=e.i;let t=-1;for(;;){const e=["count="+n];-1==t?n>0?(t=s[0].g,e.push("ofs="+t)):t=0:e.push("ofs="+t);let c=!0;for(let u=0;u<n;u++){var i=s[u].g;const n=s[u].map;if((i-=t)<0)t=Math.max(0,s[u].g-100),c=!1;else try{i="req"+i+"_"||"";try{var a=n instanceof Map?n:Object.entries(n);for(const[t,n]of a){let r=n;o(n)&&(r=re(n)),e.push(i+t+"="+encodeURIComponent(r))}}catch(ht){throw e.push(i+"type="+encodeURIComponent("_badmap")),ht}}catch(ht){r&&r(n)}}if(c){a=e.join("&");break e}}a=void 0}return e=e.i.splice(0,n),t.G=e,a}function sn(e){if(!e.g&&!e.v){e.Y=1;var t=e.Da;w||I(),v||(w(),v=!0),b.add(t,e),e.A=0}}function on(e){return!(e.g||e.v||e.A>=3)&&(e.Y++,e.v=ve(c(e.Da,e),ln(e,e.A)),e.A++,!0)}function an(e){null!=e.B&&(i.clearTimeout(e.B),e.B=null)}function cn(e){e.g=new xe(e,e.j,"rpc",e.Y),null===e.u&&(e.g.J=e.o),e.g.P=0;var t=Ye(e.na);dt(t,"RID","rpc"),dt(t,"SID",e.M),dt(t,"AID",e.K),dt(t,"CI",e.F?"0":"1"),!e.F&&e.ia&&dt(t,"TO",e.ia),dt(t,"TYPE","xmlhttp"),nn(e,t),e.u&&e.o&&Vt(t,e.u,e.o),e.O&&(e.g.H=e.O);var n=e.g;e=e.ba,n.M=1,n.A=ft(Ye(t)),n.u=null,n.R=!0,Me(n,e)}function un(e){null!=e.C&&(i.clearTimeout(e.C),e.C=null)}function hn(e,t){var n=null;if(e.g==t){un(e),an(e),e.g=null;var r=2}else{if(!Ke(e.h,t))return;n=t.G,He(e.h,t),r=1}if(0!=e.I)if(t.o)if(1==r){n=t.u?t.u.length:0,t=Date.now()-t.F;var s=e.D;J(r=fe(),new we(r,n)),en(e)}else sn(e);else if(3==(s=t.m)||0==s&&t.X>0||!(1==r&&function(e,t){return!(Ge(e.h)>=e.h.j-(e.m?1:0)||(e.m?(e.i=t.G.concat(e.i),0):1==e.I||2==e.I||e.D>=(e.Sa?0:e.Ta)||(e.m=ve(c(e.Ea,e,t),ln(e,e.D)),e.D++,0)))}(e,t)||2==r&&on(e)))switch(n&&n.length>0&&(t=e.h,t.i=t.i.concat(n)),s){case 1:dn(e,5);break;case 4:dn(e,10);break;case 3:dn(e,6);break;default:dn(e,2)}}function ln(e,t){let n=e.Qa+Math.floor(Math.random()*e.Za);return e.isActive()||(n*=2),n*t}function dn(e,t){if(e.j.info("Error code "+t),2==t){var n=c(e.bb,e),r=e.Ua;const t=!r;r=new Xe(r||"//www.google.com/images/cleardot.gif"),i.location&&"http"==i.location.protocol||Ze(r,"https"),ft(r),t?function(e,t){const n=new be;if(i.Image){const r=new Image;r.onload=u(Nt,n,"TestLoadImage: loaded",!0,t,r),r.onerror=u(Nt,n,"TestLoadImage: error",!1,t,r),r.onabort=u(Nt,n,"TestLoadImage: abort",!1,t,r),r.ontimeout=u(Nt,n,"TestLoadImage: timeout",!1,t,r),i.setTimeout(function(){r.ontimeout&&r.ontimeout()},1e4),r.src=e}else t(!1)}(r.toString(),n):function(e,t){new be;const n=new AbortController,r=setTimeout(()=>{n.abort(),Nt(0,0,!1,t)},1e4);fetch(e,{signal:n.signal}).then(e=>{clearTimeout(r),e.ok?Nt(0,0,!0,t):Nt(0,0,!1,t)}).catch(()=>{clearTimeout(r),Nt(0,0,!1,t)})}(r.toString(),n)}else ye(2);e.I=0,e.l&&e.l.pa(t),fn(e),Zt(e)}function fn(e){if(e.I=0,e.ja=[],e.l){const t=We(e.h);0==t.length&&0==e.i.length||(f(e.ja,t),f(e.ja,e.i),e.h.i.length=0,d(e.i),e.i.length=0),e.l.oa()}}function mn(e,t,n){var r=n instanceof Xe?Ye(n):new Xe(n);if(""!=r.g)t&&(r.g=t+"."+r.g),ut(r,r.u);else{var s=i.location;r=s.protocol,t=t?t+"."+s.hostname:s.hostname,s=+s.port;const e=new Xe(null);r&&Ze(e,r),t&&(e.g=t),s&&ut(e,s),n&&(e.h=n),r=e}return n=e.G,t=e.wa,n&&t&&dt(r,n,t),dt(r,"VER",e.ka),nn(e,r),r}function gn(e,t,n){if(t&&!e.L)throw Error("Can't create secondary domain capable XhrIo object.");return(t=e.Aa&&!e.ma?new Bt(new Rt({ab:n})):new Bt(e.ma)).Fa(e.L),t}function pn(){}function yn(){}function wn(e,t){W.call(this),this.g=new Jt(t),this.l=e,this.h=t&&t.messageUrlParams||null,e=t&&t.messageHeaders||null,t&&t.clientProtocolHeaderRequired&&(e?e["X-Client-Protocol"]="webchannel":e={"X-Client-Protocol":"webchannel"}),this.g.o=e,e=t&&t.initMessageHeaders||null,t&&t.messageContentType&&(e?e["X-WebChannel-Content-Type"]=t.messageContentType:e={"X-WebChannel-Content-Type":t.messageContentType}),t&&t.sa&&(e?e["X-WebChannel-Client-Profile"]=t.sa:e={"X-WebChannel-Client-Profile":t.sa}),this.g.U=e,(e=t&&t.Qb)&&!C(e)&&(this.g.u=e),this.A=t&&t.supportsCrossDomainXhr||!1,this.v=t&&t.sendRawJson||!1,(t=t&&t.httpSessionIdParam)&&!C(t)&&(this.g.G=t,null!==(e=this.h)&&t in e&&(t in(e=this.h)&&delete e[t])),this.j=new In(this)}function vn(e){ue.call(this),e.__headers__&&(this.headers=e.__headers__,this.statusCode=e.__status__,delete e.__headers__,delete e.__status__);var t=e.__sm__;if(t){e:{for(const n in t){e=n;break e}e=void 0}(this.i=e)&&(e=this.i,t=null!==t&&e in t?t[e]:void 0),this.data=t}else this.data=e}function bn(){he.call(this),this.status=1}function In(e){this.g=e}(e=Bt.prototype).Fa=function(e){this.H=e},e.ea=function(e,t,n,r){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+e);t=t?t.toUpperCase():"GET",this.D=e,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():_e.g(),this.g.onreadystatechange=l(c(this.Ca,this));try{this.B=!0,this.g.open(t,String(e),!0),this.B=!1}catch(o){return void jt(this,o)}if(e=n||"",n=new Map(this.headers),r)if(Object.getPrototypeOf(r)===Object.prototype)for(var s in r)n.set(s,r[s]);else{if("function"!=typeof r.keys||"function"!=typeof r.get)throw Error("Unknown input type for opt_headers: "+String(r));for(const e of r.keys())n.set(e,r.get(e))}r=Array.from(n.keys()).find(e=>"content-type"==e.toLowerCase()),s=i.FormData&&e instanceof i.FormData,!(Array.prototype.indexOf.call(qt,t,void 0)>=0)||r||s||n.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[i,a]of n)this.g.setRequestHeader(i,a);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(e),this.v=!1}catch(o){jt(this,o)}},e.abort=function(e){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=e||7,J(this,"complete"),J(this,"abort"),Kt(this))},e.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Kt(this,!0)),Bt.Z.N.call(this)},e.Ca=function(){this.u||(this.B||this.v||this.j?Gt(this):this.Xa())},e.Xa=function(){Gt(this)},e.isActive=function(){return!!this.g},e.ca=function(){try{return Qt(this)>2?this.g.status:-1}catch(e){return-1}},e.la=function(){try{return this.g?this.g.responseText:""}catch(e){return""}},e.La=function(e){if(this.g){var t=this.g.responseText;return e&&0==t.indexOf(e)&&(t=t.substring(e.length)),se(t)}},e.ya=function(){return this.o},e.Ha=function(){return"string"==typeof this.l?this.l:String(this.l)},(e=Jt.prototype).ka=8,e.I=1,e.connect=function(e,t,n,r){ye(0),this.W=e,this.H=t||{},n&&void 0!==r&&(this.H.OSID=n,this.H.OAID=r),this.F=this.X,this.J=mn(this,null,this.W),en(this)},e.Ea=function(e){if(this.m)if(this.m=null,1==this.I){if(!e){this.V=Math.floor(1e5*Math.random()),e=this.V++;const s=new xe(this,this.j,e);let i=this.o;if(this.U&&(i?(i=M(i),P(i,this.U)):i=this.U),null!==this.u||this.R||(s.J=i,i=null),this.S)e:{for(var t=0,n=0;n<this.i.length;n++){var r=this.i[n];if(void 0===(r="__data__"in r.map&&"string"==typeof(r=r.map.__data__)?r.length:void 0))break;if((t+=r)>4096){t=n;break e}if(4096===t||n===this.i.length-1){t=n+1;break e}}t=1e3}else t=1e3;t=rn(this,s,t),dt(n=Ye(this.J),"RID",e),dt(n,"CVER",22),this.G&&dt(n,"X-HTTP-Session-Id",this.G),nn(this,n),i&&(this.R?t="headers="+Ce(Ft(i))+"&"+t:this.u&&Vt(n,this.u,i)),Qe(this.h,s),this.Ra&&dt(n,"TYPE","init"),this.S?(dt(n,"$req",t),dt(n,"SID","null"),s.U=!0,Re(s,n,null)):Re(s,n,t),this.I=2}}else 3==this.I&&(e?tn(this,e):0==this.i.length||$e(this.h)||tn(this))},e.Da=function(){if(this.v=null,cn(this),this.aa&&!(this.P||null==this.g||this.T<=0)){var e=4*this.T;this.j.info("BP detection timer enabled: "+e),this.B=ve(c(this.Wa,this),e)}},e.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,ye(10),Yt(this),cn(this))},e.Va=function(){null!=this.C&&(this.C=null,Yt(this),on(this),ye(19))},e.bb=function(e){e?(this.j.info("Successfully pinged google.com"),ye(2)):(this.j.info("Failed to ping google.com"),ye(1))},e.isActive=function(){return!!this.l&&this.l.isActive(this)},(e=pn.prototype).ra=function(){},e.qa=function(){},e.pa=function(){},e.oa=function(){},e.isActive=function(){return!0},e.Ka=function(){},yn.prototype.g=function(e,t){return new wn(e,t)},h(wn,W),wn.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},wn.prototype.close=function(){Xt(this.g)},wn.prototype.o=function(e){var t=this.g;if("string"==typeof e){var n={};n.__data__=e,e=n}else this.v&&((n={}).__data__=re(e),e=n);t.i.push(new je(t.Ya++,e)),3==t.I&&en(t)},wn.prototype.N=function(){this.g.l=null,delete this.j,Xt(this.g),delete this.g,wn.Z.N.call(this)},h(vn,ue),h(bn,he),h(In,pn),In.prototype.ra=function(){J(this.g,"a")},In.prototype.qa=function(e){J(this.g,new vn(e))},In.prototype.pa=function(e){J(this.g,new bn)},In.prototype.oa=function(){J(this.g,"b")},yn.prototype.createWebChannel=yn.prototype.g,wn.prototype.send=wn.prototype.o,wn.prototype.open=wn.prototype.m,wn.prototype.close=wn.prototype.close,at=function(){return new yn},ot=function(){return fe()},it=le,st={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Ee.NO_ERROR=0,Ee.TIMEOUT=8,Ee.HTTP_ERROR=6,rt=Ee,Te.COMPLETE="complete",nt=Te,ae.EventType=ce,ce.OPEN="a",ce.CLOSE="b",ce.ERROR="c",ce.MESSAGE="d",W.prototype.listen=W.prototype.J,tt=ae,Bt.prototype.listenOnce=Bt.prototype.K,Bt.prototype.getLastError=Bt.prototype.Ha,Bt.prototype.getLastErrorCode=Bt.prototype.ya,Bt.prototype.getStatus=Bt.prototype.ca,Bt.prototype.getResponseJson=Bt.prototype.La,Bt.prototype.getResponseText=Bt.prototype.la,Bt.prototype.send=Bt.prototype.ea,Bt.prototype.setWithCredentials=Bt.prototype.Fa,et=Bt}).apply(void 0!==ct?ct:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});const ut="@firebase/firestore",ht="4.9.2";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e){this.uid=e}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}lt.UNAUTHENTICATED=new lt(null),lt.GOOGLE_CREDENTIALS=new lt("google-credentials-uid"),lt.FIRST_PARTY=new lt("first-party-uid"),lt.MOCK_USER=new lt("mock-user");
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let dt="12.3.0";
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ft=new L("@firebase/firestore");function mt(){return ft.logLevel}function gt(e,...t){if(ft.logLevel<=k.DEBUG){const n=t.map(wt);ft.debug(`Firestore (${dt}): ${e}`,...n)}}function pt(e,...t){if(ft.logLevel<=k.ERROR){const n=t.map(wt);ft.error(`Firestore (${dt}): ${e}`,...n)}}function yt(e,...t){if(ft.logLevel<=k.WARN){const n=t.map(wt);ft.warn(`Firestore (${dt}): ${e}`,...n)}}function wt(e){if("string"==typeof e)return e;try{
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
return function(e){return JSON.stringify(e)}(e)}catch(t){return e}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vt(e,t,n){let r="Unexpected state";"string"==typeof t?r=t:n=t,bt(e,r,n)}function bt(e,t,n){let r=`FIRESTORE (${dt}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;if(void 0!==n)try{r+=" CONTEXT: "+JSON.stringify(n)}catch(e){r+=" CONTEXT: "+n}throw pt(r),new Error(r)}function It(e,t,n,r){let s="Unexpected state";"string"==typeof n?s=n:r=n,e||bt(t,s,r)}function _t(e,t){return e}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Tt extends I{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class At{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(lt.UNAUTHENTICATED))}shutdown(){}}class xt{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class Dt{constructor(e){this.t=e,this.currentUser=lt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){It(void 0===this.o,42304);let n=this.i;const r=e=>this.i!==n?(n=this.i,t(e)):Promise.resolve();let s=new St;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new St,e.enqueueRetryable(()=>r(this.currentUser))};const i=()=>{const t=s;e.enqueueRetryable(async()=>{await t.promise,await r(this.currentUser)})},o=e=>{gt("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=e,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(e=>o(e)),setTimeout(()=>{if(!this.auth){const e=this.t.getImmediate({optional:!0});e?o(e):(gt("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new St)}},0),i()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(t=>this.i!==e?(gt("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):t?(It("string"==typeof t.accessToken,31837,{l:t}),new Ct(t.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return It(null===e||"string"==typeof e,2055,{h:e}),new lt(e)}}class Nt{constructor(e,t,n){this.P=e,this.T=t,this.I=n,this.type="FirstParty",this.user=lt.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class kt{constructor(e,t,n){this.P=e,this.T=t,this.I=n}getToken(){return Promise.resolve(new Nt(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(lt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Rt{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Mt{constructor(e,t){var n;this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,null!=(n=e)&&void 0!==n.settings&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){It(void 0===this.o,3512);const n=e=>{null!=e.error&&gt("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);const n=e.token!==this.m;return this.m=e.token,gt("FirebaseAppCheckTokenProvider",`Received ${n?"new":"existing"} token.`),n?t(e.token):Promise.resolve()};this.o=t=>{e.enqueueRetryable(()=>n(t))};const r=e=>{gt("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=e,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(e=>r(e)),setTimeout(()=>{if(!this.appCheck){const e=this.V.getImmediate({optional:!0});e?r(e):gt("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Rt(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(e=>e?(It("string"==typeof e.token,44558,{tokenResult:e}),this.m=e.token,new Rt(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Ot(e){const t="undefined"!=typeof self&&(self.crypto||self.msCrypto),n=new Uint8Array(e);if(t&&"function"==typeof t.getRandomValues)t.getRandomValues(n);else for(let r=0;r<e;r++)n[r]=Math.floor(256*Math.random());return n}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{static newId(){const e=62*Math.floor(256/62);let t="";for(;t.length<20;){const n=Ot(40);for(let r=0;r<n.length;++r)t.length<20&&n[r]<e&&(t+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(n[r]%62))}return t}}function Lt(e,t){return e<t?-1:e>t?1:0}function Ft(e,t){const n=Math.min(e.length,t.length);for(let r=0;r<n;r++){const n=e.charAt(r),s=t.charAt(r);if(n!==s)return Ut(n)===Ut(s)?Lt(n,s):Ut(n)?1:-1}return Lt(e.length,t.length)}const Vt=55296,Bt=57343;function Ut(e){const t=e.charCodeAt(0);return t>=Vt&&t<=Bt}function qt(e,t,n){return e.length===t.length&&e.every((e,r)=>n(e,t[r]))}function jt(e){return e+"\0"}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zt="__name__";class $t{constructor(e,t,n){void 0===t?t=0:t>e.length&&vt(637,{offset:t,range:e.length}),void 0===n?n=e.length-t:n>e.length-t&&vt(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return 0===$t.comparator(this,e)}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof $t?e.forEach(e=>{t.push(e)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=void 0===e?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return 0===this.length}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let r=0;r<n;r++){const n=$t.compareSegments(e.get(r),t.get(r));if(0!==n)return n}return Lt(e.length,t.length)}static compareSegments(e,t){const n=$t.isNumericId(e),r=$t.isNumericId(t);return n&&!r?-1:!n&&r?1:n&&r?$t.extractNumericId(e).compare($t.extractNumericId(t)):Ft(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Xe.fromString(e.substring(4,e.length-2))}}class Gt extends $t{construct(e,t,n){return new Gt(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new Tt(Et.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter(e=>e.length>0))}return new Gt(t)}static emptyPath(){return new Gt([])}}const Kt=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Qt extends $t{construct(e,t,n){return new Qt(e,t,n)}static isValidIdentifier(e){return Kt.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Qt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&this.get(0)===zt}static keyField(){return new Qt([zt])}static fromServerFormat(e){const t=[];let n="",r=0;const s=()=>{if(0===n.length)throw new Tt(Et.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let i=!1;for(;r<e.length;){const t=e[r];if("\\"===t){if(r+1===e.length)throw new Tt(Et.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const t=e[r+1];if("\\"!==t&&"."!==t&&"`"!==t)throw new Tt(Et.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=t,r+=2}else"`"===t?(i=!i,r++):"."!==t||i?(n+=t,r++):(s(),r++)}if(s(),i)throw new Tt(Et.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Qt(t)}static emptyPath(){return new Qt([])}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ht{constructor(e){this.path=e}static fromPath(e){return new Ht(Gt.fromString(e))}static fromName(e){return new Ht(Gt.fromString(e).popFirst(5))}static empty(){return new Ht(Gt.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return null!==e&&0===Gt.comparator(this.path,e.path)}toString(){return this.path.toString()}static comparator(e,t){return Gt.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new Ht(new Gt(e.slice()))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wt(e,t,n){if(!n)throw new Tt(Et.INVALID_ARGUMENT,`Function ${e}() cannot be called with an empty ${t}.`)}function Jt(e,t,n,r){if(!0===t&&!0===r)throw new Tt(Et.INVALID_ARGUMENT,`${e} and ${n} cannot be used together.`)}function Xt(e){if(!Ht.isDocumentKey(e))throw new Tt(Et.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`)}function Yt(e){if(Ht.isDocumentKey(e))throw new Tt(Et.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`)}function Zt(e){return"object"==typeof e&&null!==e&&(Object.getPrototypeOf(e)===Object.prototype||null===Object.getPrototypeOf(e))}function en(e){if(void 0===e)return"undefined";if(null===e)return"null";if("string"==typeof e)return e.length>20&&(e=`${e.substring(0,20)}...`),JSON.stringify(e);if("number"==typeof e||"boolean"==typeof e)return""+e;if("object"==typeof e){if(e instanceof Array)return"an array";{const t=function(e){return e.constructor?e.constructor.name:null}(e);return t?`a custom ${t} object`:"an object"}}return"function"==typeof e?"a function":vt(12329,{type:typeof e})}function tn(e,t){if("_delegate"in e&&(e=e._delegate),!(e instanceof t)){if(t.name===e.constructor.name)throw new Tt(Et.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=en(e);throw new Tt(Et.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${n}`)}}return e}function nn(e,t){if(t<=0)throw new Tt(Et.INVALID_ARGUMENT,`Function ${e}() requires a positive number, but it was: ${t}.`)}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rn(e,t){const n={typeString:e};return t&&(n.value=t),n}function sn(e,t){if(!Zt(e))throw new Tt(Et.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in t)if(t[r]){const s=t[r].typeString,i="value"in t[r]?{value:t[r].value}:void 0;if(!(r in e)){n=`JSON missing required field: '${r}'`;break}const o=e[r];if(s&&typeof o!==s){n=`JSON field '${r}' must be a ${s}.`;break}if(void 0!==i&&o!==i.value){n=`Expected '${r}' field to equal '${i.value}'`;break}}if(n)throw new Tt(Et.INVALID_ARGUMENT,n);return!0}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const on=-62135596800,an=1e6;class cn{static now(){return cn.fromMillis(Date.now())}static fromDate(e){return cn.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*an);return new cn(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new Tt(Et.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new Tt(Et.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<on)throw new Tt(Et.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new Tt(Et.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/an}_compareTo(e){return this.seconds===e.seconds?Lt(this.nanoseconds,e.nanoseconds):Lt(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:cn._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(sn(e,cn._jsonSchema))return new cn(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-on;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}cn._jsonSchemaVersion="firestore/timestamp/1.0",cn._jsonSchema={type:rn("string",cn._jsonSchemaVersion),seconds:rn("number"),nanoseconds:rn("number")};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class un{static fromTimestamp(e){return new un(e)}static min(){return new un(new cn(0,0))}static max(){return new un(new cn(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hn=-1;class ln{constructor(e,t,n,r){this.indexId=e,this.collectionGroup=t,this.fields=n,this.indexState=r}}function dn(e){return e.fields.find(e=>2===e.kind)}function fn(e){return e.fields.filter(e=>2!==e.kind)}function mn(e,t){let n=Lt(e.collectionGroup,t.collectionGroup);if(0!==n)return n;for(let r=0;r<Math.min(e.fields.length,t.fields.length);++r)if(n=pn(e.fields[r],t.fields[r]),0!==n)return n;return Lt(e.fields.length,t.fields.length)}ln.UNKNOWN_ID=-1;class gn{constructor(e,t){this.fieldPath=e,this.kind=t}}function pn(e,t){const n=Qt.comparator(e.fieldPath,t.fieldPath);return 0!==n?n:Lt(e.kind,t.kind)}class yn{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new yn(0,bn.min())}}function wn(e,t){const n=e.toTimestamp().seconds,r=e.toTimestamp().nanoseconds+1,s=un.fromTimestamp(1e9===r?new cn(n+1,0):new cn(n,r));return new bn(s,Ht.empty(),t)}function vn(e){return new bn(e.readTime,e.key,hn)}class bn{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new bn(un.min(),Ht.empty(),hn)}static max(){return new bn(un.max(),Ht.empty(),hn)}}function In(e,t){let n=e.readTime.compareTo(t.readTime);return 0!==n?n:(n=Ht.comparator(e.documentKey,t.documentKey),0!==n?n:Lt(e.largestBatchId,t.largestBatchId)
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */)}const _n="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class En{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Tn(e){if(e.code!==Et.FAILED_PRECONDITION||e.message!==_n)throw e;gt("LocalStore","Unexpectedly lost primary lease")}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sn{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&vt(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new Sn((n,r)=>{this.nextCallback=t=>{this.wrapSuccess(e,t).next(n,r)},this.catchCallback=e=>{this.wrapFailure(t,e).next(n,r)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof Sn?t:Sn.resolve(t)}catch(e){return Sn.reject(e)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):Sn.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):Sn.reject(t)}static resolve(e){return new Sn((t,n)=>{t(e)})}static reject(e){return new Sn((t,n)=>{n(e)})}static waitFor(e){return new Sn((t,n)=>{let r=0,s=0,i=!1;e.forEach(e=>{++r,e.next(()=>{++s,i&&s===r&&t()},e=>n(e))}),i=!0,s===r&&t()})}static or(e){let t=Sn.resolve(!1);for(const n of e)t=t.next(e=>e?Sn.resolve(e):n());return t}static forEach(e,t){const n=[];return e.forEach((e,r)=>{n.push(t.call(this,e,r))}),this.waitFor(n)}static mapArray(e,t){return new Sn((n,r)=>{const s=e.length,i=new Array(s);let o=0;for(let a=0;a<s;a++){const c=a;t(e[c]).next(e=>{i[c]=e,++o,o===s&&n(i)},e=>r(e))}})}static doWhile(e,t){return new Sn((n,r)=>{const s=()=>{!0===e()?t().next(()=>{s()},r):n()};s()})}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cn="SimpleDb";class An{static open(e,t,n,r){try{return new An(t,e.transaction(r,n))}catch(e){throw new kn(t,e)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.S=new St,this.transaction.oncomplete=()=>{this.S.resolve()},this.transaction.onabort=()=>{t.error?this.S.reject(new kn(e,t.error)):this.S.resolve()},this.transaction.onerror=t=>{const n=Ln(t.target.error);this.S.reject(new kn(e,n))}}get D(){return this.S.promise}abort(e){e&&this.S.reject(e),this.aborted||(gt(Cn,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}C(){const e=this.transaction;this.aborted||"function"!=typeof e.commit||e.commit()}store(e){const t=this.transaction.objectStore(e);return new Mn(t)}}class xn{static delete(e){return gt(Cn,"Removing database:",e),On(i().indexedDB.deleteDatabase(e)).toPromise()}static v(){if(!b())return!1;if(xn.F())return!0;const e=p(),t=xn.M(e),n=0<t&&t<10,r=Dn(e),s=0<r&&r<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||n||s)}static F(){return"undefined"!=typeof process&&"YES"===process.__PRIVATE_env?.__PRIVATE_USE_MOCK_PERSISTENCE}static O(e,t){return e.store(t)}static M(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(e,t,n){this.name=e,this.version=t,this.N=n,this.B=null,12.2===xn.M(p())&&pt("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async L(e){return this.db||(gt(Cn,"Opening database:",this.name),this.db=await new Promise((t,n)=>{const r=indexedDB.open(this.name,this.version);r.onsuccess=e=>{const n=e.target.result;t(n)},r.onblocked=()=>{n(new kn(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},r.onerror=t=>{const r=t.target.error;"VersionError"===r.name?n(new Tt(Et.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):"InvalidStateError"===r.name?n(new Tt(Et.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+r)):n(new kn(e,r))},r.onupgradeneeded=e=>{gt(Cn,'Database "'+this.name+'" requires upgrade from version:',e.oldVersion);const t=e.target.result;this.N.k(t,r.transaction,e.oldVersion,this.version).next(()=>{gt(Cn,"Database upgrade to version "+this.version+" complete")})}})),this.q&&(this.db.onversionchange=e=>this.q(e)),this.db}$(e){this.q=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,n,r){const s="readonly"===t;let i=0;for(;;){++i;try{this.db=await this.L(e);const t=An.open(this.db,e,s?"readonly":"readwrite",n),i=r(t).next(e=>(t.C(),e)).catch(e=>(t.abort(e),Sn.reject(e))).toPromise();return i.catch(()=>{}),await t.D,i}catch(e){const t=e,n="FirebaseError"!==t.name&&i<3;if(gt(Cn,"Transaction failed with error:",t.message,"Retrying:",n),this.close(),!n)return Promise.reject(t)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Dn(e){const t=e.match(/Android ([\d.]+)/i),n=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(n)}class Nn{constructor(e){this.U=e,this.K=!1,this.W=null}get isDone(){return this.K}get G(){return this.W}set cursor(e){this.U=e}done(){this.K=!0}j(e){this.W=e}delete(){return On(this.U.delete())}}class kn extends Tt{constructor(e,t){super(Et.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Rn(e){return"IndexedDbTransactionError"===e.name}class Mn{constructor(e){this.store=e}put(e,t){let n;return void 0!==t?(gt(Cn,"PUT",this.store.name,e,t),n=this.store.put(t,e)):(gt(Cn,"PUT",this.store.name,"<auto-key>",e),n=this.store.put(e)),On(n)}add(e){return gt(Cn,"ADD",this.store.name,e,e),On(this.store.add(e))}get(e){return On(this.store.get(e)).next(t=>(void 0===t&&(t=null),gt(Cn,"GET",this.store.name,e,t),t))}delete(e){return gt(Cn,"DELETE",this.store.name,e),On(this.store.delete(e))}count(){return gt(Cn,"COUNT",this.store.name),On(this.store.count())}J(e,t){const n=this.options(e,t),r=n.index?this.store.index(n.index):this.store;if("function"==typeof r.getAll){const e=r.getAll(n.range);return new Sn((t,n)=>{e.onerror=e=>{n(e.target.error)},e.onsuccess=e=>{t(e.target.result)}})}{const e=this.cursor(n),t=[];return this.H(e,(e,n)=>{t.push(n)}).next(()=>t)}}Y(e,t){const n=this.store.getAll(e,null===t?void 0:t);return new Sn((e,t)=>{n.onerror=e=>{t(e.target.error)},n.onsuccess=t=>{e(t.target.result)}})}Z(e,t){gt(Cn,"DELETE ALL",this.store.name);const n=this.options(e,t);n.X=!1;const r=this.cursor(n);return this.H(r,(e,t,n)=>n.delete())}ee(e,t){let n;t?n=e:(n={},t=e);const r=this.cursor(n);return this.H(r,t)}te(e){const t=this.cursor({});return new Sn((n,r)=>{t.onerror=e=>{const t=Ln(e.target.error);r(t)},t.onsuccess=t=>{const r=t.target.result;r?e(r.primaryKey,r.value).next(e=>{e?r.continue():n()}):n()}})}H(e,t){const n=[];return new Sn((r,s)=>{e.onerror=e=>{s(e.target.error)},e.onsuccess=e=>{const s=e.target.result;if(!s)return void r();const i=new Nn(s),o=t(s.primaryKey,s.value,i);if(o instanceof Sn){const e=o.catch(e=>(i.done(),Sn.reject(e)));n.push(e)}i.isDone?r():null===i.G?s.continue():s.continue(i.G)}}).next(()=>Sn.waitFor(n))}options(e,t){let n;return void 0!==e&&("string"==typeof e?n=e:t=e),{index:n,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const n=this.store.index(e.index);return e.X?n.openKeyCursor(e.range,t):n.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function On(e){return new Sn((t,n)=>{e.onsuccess=e=>{const n=e.target.result;t(n)},e.onerror=e=>{const t=Ln(e.target.error);n(t)}})}let Pn=!1;function Ln(e){const t=xn.M(p());if(t>=12.2&&t<13){const t="An internal error was encountered in the Indexed Database server";if(e.message.indexOf(t)>=0){const e=new Tt("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Pn||(Pn=!0,setTimeout(()=>{throw e},0)),e}}return e}const Fn="IndexBackfiller";class Vn{constructor(e,t){this.asyncQueue=e,this.ne=t,this.task=null}start(){this.re(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return null!==this.task}re(e){gt(Fn,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,async()=>{this.task=null;try{const e=await this.ne.ie();gt(Fn,`Documents written: ${e}`)}catch(e){Rn(e)?gt(Fn,"Ignoring IndexedDB error during index backfill: ",e):await Tn(e)}await this.re(6e4)})}}class Bn{constructor(e,t){this.localStore=e,this.persistence=t}async ie(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.se(t,e))}se(e,t){const n=new Set;let r=t,s=!0;return Sn.doWhile(()=>!0===s&&r>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(t=>{if(null!==t&&!n.has(t))return gt(Fn,`Processing collection: ${t}`),this.oe(e,t,r).next(e=>{r-=e,n.add(t)});s=!1})).next(()=>t-r)}oe(e,t,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(r=>this.localStore.localDocuments.getNextDocuments(e,t,r,n).next(n=>{const s=n.changes;return this.localStore.indexManager.updateIndexEntries(e,s).next(()=>this._e(r,n)).next(n=>(gt(Fn,`Updating offset: ${n}`),this.localStore.indexManager.updateCollectionGroup(e,t,n))).next(()=>s.size)}))}_e(e,t){let n=e;return t.changes.forEach((e,t)=>{const r=vn(t);In(r,n)>0&&(n=r)}),new bn(n.readTime,n.documentKey,Math.max(t.batchId,e.largestBatchId))}}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Un{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=e=>this.ae(e),this.ue=e=>t.writeSequenceNumber(e))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}Un.ce=-1;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const qn=-1;function jn(e){return null==e}function zn(e){return 0===e&&1/e==-1/0}function $n(e){return"number"==typeof e&&Number.isInteger(e)&&!zn(e)&&e<=Number.MAX_SAFE_INTEGER&&e>=Number.MIN_SAFE_INTEGER}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gn="";function Kn(e){let t="";for(let n=0;n<e.length;n++)t.length>0&&(t=Hn(t)),t=Qn(e.get(n),t);return Hn(t)}function Qn(e,t){let n=t;const r=e.length;for(let s=0;s<r;s++){const t=e.charAt(s);switch(t){case"\0":n+="";break;case Gn:n+="";break;default:n+=t}}return n}function Hn(e){return e+Gn+""}function Wn(e){const t=e.length;if(It(t>=2,64408,{path:e}),2===t)return It(e.charAt(0)===Gn&&""===e.charAt(1),56145,{path:e}),Gt.emptyPath();const n=t-2,r=[];let s="";for(let i=0;i<t;){const t=e.indexOf(Gn,i);switch((t<0||t>n)&&vt(50515,{path:e}),e.charAt(t+1)){case"":const n=e.substring(i,t);let o;0===s.length?o=n:(s+=n,o=s,s=""),r.push(o);break;case"":s+=e.substring(i,t),s+="\0";break;case"":s+=e.substring(i,t+1);break;default:vt(61167,{path:e})}i=t+2}return new Gt(r)}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jn="remoteDocuments",Xn="owner",Yn="owner",Zn="mutationQueues",er="mutations",tr="batchId",nr="userMutationsIndex",rr=["userId","batchId"];
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sr(e,t){return[e,Kn(t)]}function ir(e,t,n){return[e,Kn(t),n]}const or={},ar="documentMutations",cr="remoteDocumentsV14",ur=["prefixPath","collectionGroup","readTime","documentId"],hr="documentKeyIndex",lr=["prefixPath","collectionGroup","documentId"],dr="collectionGroupIndex",fr=["collectionGroup","readTime","prefixPath","documentId"],mr="remoteDocumentGlobal",gr="remoteDocumentGlobalKey",pr="targets",yr="queryTargetsIndex",wr=["canonicalId","targetId"],vr="targetDocuments",br=["targetId","path"],Ir="documentTargetsIndex",_r=["path","targetId"],Er="targetGlobalKey",Tr="targetGlobal",Sr="collectionParents",Cr=["collectionId","parent"],Ar="clientMetadata",xr="bundles",Dr="namedQueries",Nr="indexConfiguration",kr="collectionGroupIndex",Rr="indexState",Mr=["indexId","uid"],Or="sequenceNumberIndex",Pr=["uid","sequenceNumber"],Lr="indexEntries",Fr=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],Vr="documentKeyIndex",Br=["indexId","uid","orderedDocumentKey"],Ur="documentOverlays",qr=["userId","collectionPath","documentId"],jr="collectionPathOverlayIndex",zr=["userId","collectionPath","largestBatchId"],$r="collectionGroupOverlayIndex",Gr=["userId","collectionGroup","largestBatchId"],Kr="globals",Qr=[Zn,er,ar,Jn,pr,Xn,Tr,vr,Ar,mr,Sr,xr,Dr],Hr=[...Qr,Ur],Wr=[Zn,er,ar,cr,pr,Xn,Tr,vr,Ar,mr,Sr,xr,Dr,Ur],Jr=Wr,Xr=[...Jr,Nr,Rr,Lr],Yr=Xr,Zr=[...Xr,Kr],es=Zr;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ts extends En{constructor(e,t){super(),this.le=e,this.currentSequenceNumber=t}}function ns(e,t){const n=_t(e);return xn.O(n.le,t)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rs(e){let t=0;for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t++;return t}function ss(e,t){for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t(n,e[n])}function is(e,t){const n=[];for(const r in e)Object.prototype.hasOwnProperty.call(e,r)&&n.push(t(e[r],r,e));return n}function os(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class as{constructor(e,t){this.comparator=e,this.root=t||us.EMPTY}insert(e,t){return new as(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,us.BLACK,null,null))}remove(e){return new as(this.comparator,this.root.remove(e,this.comparator).copy(null,null,us.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(0===n)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(0===r)return t+n.left.size;r<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,n)=>(e(t,n),!1))}toString(){const e=[];return this.inorderTraversal((t,n)=>(e.push(`${t}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new cs(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new cs(this.root,e,this.comparator,!1)}getReverseIterator(){return new cs(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new cs(this.root,e,this.comparator,!0)}}class cs{constructor(e,t,n,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?n(e.key,t):1,t&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(0===s){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class us{constructor(e,t,n,r,s){this.key=e,this.value=t,this.color=null!=n?n:us.RED,this.left=null!=r?r:us.EMPTY,this.right=null!=s?s:us.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,r,s){return new us(null!=e?e:this.key,null!=t?t:this.value,null!=n?n:this.color,null!=r?r:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let r=this;const s=n(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,t,n),null):0===s?r.copy(null,t,null,null,null):r.copy(null,null,null,null,r.right.insert(e,t,n)),r.fixUp()}removeMin(){if(this.left.isEmpty())return us.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,r=this;if(t(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,t),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),0===t(e,r.key)){if(r.right.isEmpty())return us.EMPTY;n=r.right.min(),r=r.copy(n.key,n.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,t))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,us.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,us.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw vt(43730,{key:this.key,value:this.value});if(this.right.isRed())throw vt(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw vt(27949);return e+(this.isRed()?0:1)}}us.EMPTY=null,us.RED=!0,us.BLACK=!1,us.EMPTY=new class{constructor(){this.size=0}get key(){throw vt(57766)}get value(){throw vt(16141)}get color(){throw vt(16727)}get left(){throw vt(29726)}get right(){throw vt(36894)}copy(e,t,n,r,s){return this}insert(e,t,n){return new us(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class hs{constructor(e){this.comparator=e,this.data=new as(this.comparator)}has(e){return null!==this.data.get(e)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,n)=>(e(t),!1))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const r=n.getNext();if(this.comparator(r.key,e[1])>=0)return;t(r.key)}}forEachWhile(e,t){let n;for(n=void 0!==t?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new ls(this.data.getIterator())}getIteratorFrom(e){return new ls(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(e=>{t=t.add(e)}),t}isEqual(e){if(!(e instanceof hs))return!1;if(this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const e=t.getNext().key,r=n.getNext().key;if(0!==this.comparator(e,r))return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new hs(this.comparator);return t.data=e,t}}class ls{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function ds(e){return e.hasNext()?e.getNext():void 0}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fs{constructor(e){this.fields=e,e.sort(Qt.comparator)}static empty(){return new fs([])}unionWith(e){let t=new hs(Qt.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new fs(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return qt(this.fields,e.fields,(e,t)=>e.isEqual(t))}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ms extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class gs{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(e){try{return atob(e)}catch(e){throw"undefined"!=typeof DOMException&&e instanceof DOMException?new ms("Invalid base64 string: "+e):e}}(e);return new gs(t)}static fromUint8Array(e){const t=function(e){let t="";for(let n=0;n<e.length;++n)t+=String.fromCharCode(e[n]);return t}(e);return new gs(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return e=this.binaryString,btoa(e);var e}toUint8Array(){return function(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Lt(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}gs.EMPTY_BYTE_STRING=new gs("");const ps=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ys(e){if(It(!!e,39018),"string"==typeof e){let t=0;const n=ps.exec(e);if(It(!!n,46558,{timestamp:e}),n[1]){let e=n[1];e=(e+"000000000").substr(0,9),t=Number(e)}const r=new Date(e);return{seconds:Math.floor(r.getTime()/1e3),nanos:t}}return{seconds:ws(e.seconds),nanos:ws(e.nanos)}}function ws(e){return"number"==typeof e?e:"string"==typeof e?Number(e):0}function vs(e){return"string"==typeof e?gs.fromBase64String(e):gs.fromUint8Array(e)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bs="server_timestamp",Is="__type__",_s="__previous_value__",Es="__local_write_time__";function Ts(e){const t=(e?.mapValue?.fields||{})[Is]?.stringValue;return t===bs}function Ss(e){const t=e.mapValue.fields[_s];return Ts(t)?Ss(t):t}function Cs(e){const t=ys(e.mapValue.fields[Es].timestampValue);return new cn(t.seconds,t.nanos)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class As{constructor(e,t,n,r,s,i,o,a,c,u){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=o,this.longPollingOptions=a,this.useFetchStreams=c,this.isUsingEmulator=u}}const xs="(default)";class Ds{constructor(e,t){this.projectId=e,this.database=t||xs}static empty(){return new Ds("","")}get isDefaultDatabase(){return this.database===xs}isEqual(e){return e instanceof Ds&&e.projectId===this.projectId&&e.database===this.database}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ns="__type__",ks="__max__",Rs={mapValue:{fields:{__type__:{stringValue:ks}}}},Ms="__vector__",Os="value",Ps={nullValue:"NULL_VALUE"};function Ls(e){return"nullValue"in e?0:"booleanValue"in e?1:"integerValue"in e||"doubleValue"in e?2:"timestampValue"in e?3:"stringValue"in e?5:"bytesValue"in e?6:"referenceValue"in e?7:"geoPointValue"in e?8:"arrayValue"in e?9:"mapValue"in e?Ts(e)?4:Zs(e)?9007199254740991:Xs(e)?10:11:vt(28295,{value:e})}function Fs(e,t){if(e===t)return!0;const n=Ls(e);if(n!==Ls(t))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return e.booleanValue===t.booleanValue;case 4:return Cs(e).isEqual(Cs(t));case 3:return function(e,t){if("string"==typeof e.timestampValue&&"string"==typeof t.timestampValue&&e.timestampValue.length===t.timestampValue.length)return e.timestampValue===t.timestampValue;const n=ys(e.timestampValue),r=ys(t.timestampValue);return n.seconds===r.seconds&&n.nanos===r.nanos}(e,t);case 5:return e.stringValue===t.stringValue;case 6:return function(e,t){return vs(e.bytesValue).isEqual(vs(t.bytesValue))}(e,t);case 7:return e.referenceValue===t.referenceValue;case 8:return function(e,t){return ws(e.geoPointValue.latitude)===ws(t.geoPointValue.latitude)&&ws(e.geoPointValue.longitude)===ws(t.geoPointValue.longitude)}(e,t);case 2:return function(e,t){if("integerValue"in e&&"integerValue"in t)return ws(e.integerValue)===ws(t.integerValue);if("doubleValue"in e&&"doubleValue"in t){const n=ws(e.doubleValue),r=ws(t.doubleValue);return n===r?zn(n)===zn(r):isNaN(n)&&isNaN(r)}return!1}(e,t);case 9:return qt(e.arrayValue.values||[],t.arrayValue.values||[],Fs);case 10:case 11:return function(e,t){const n=e.mapValue.fields||{},r=t.mapValue.fields||{};if(rs(n)!==rs(r))return!1;for(const s in n)if(n.hasOwnProperty(s)&&(void 0===r[s]||!Fs(n[s],r[s])))return!1;return!0}(e,t);default:return vt(52216,{left:e})}}function Vs(e,t){return void 0!==(e.values||[]).find(e=>Fs(e,t))}function Bs(e,t){if(e===t)return 0;const n=Ls(e),r=Ls(t);if(n!==r)return Lt(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Lt(e.booleanValue,t.booleanValue);case 2:return function(e,t){const n=ws(e.integerValue||e.doubleValue),r=ws(t.integerValue||t.doubleValue);return n<r?-1:n>r?1:n===r?0:isNaN(n)?isNaN(r)?0:-1:1}(e,t);case 3:return Us(e.timestampValue,t.timestampValue);case 4:return Us(Cs(e),Cs(t));case 5:return Ft(e.stringValue,t.stringValue);case 6:return function(e,t){const n=vs(e),r=vs(t);return n.compareTo(r)}(e.bytesValue,t.bytesValue);case 7:return function(e,t){const n=e.split("/"),r=t.split("/");for(let s=0;s<n.length&&s<r.length;s++){const e=Lt(n[s],r[s]);if(0!==e)return e}return Lt(n.length,r.length)}(e.referenceValue,t.referenceValue);case 8:return function(e,t){const n=Lt(ws(e.latitude),ws(t.latitude));return 0!==n?n:Lt(ws(e.longitude),ws(t.longitude))}(e.geoPointValue,t.geoPointValue);case 9:return qs(e.arrayValue,t.arrayValue);case 10:return function(e,t){const n=e.fields||{},r=t.fields||{},s=n[Os]?.arrayValue,i=r[Os]?.arrayValue,o=Lt(s?.values?.length||0,i?.values?.length||0);return 0!==o?o:qs(s,i)}(e.mapValue,t.mapValue);case 11:return function(e,t){if(e===Rs.mapValue&&t===Rs.mapValue)return 0;if(e===Rs.mapValue)return 1;if(t===Rs.mapValue)return-1;const n=e.fields||{},r=Object.keys(n),s=t.fields||{},i=Object.keys(s);r.sort(),i.sort();for(let o=0;o<r.length&&o<i.length;++o){const e=Ft(r[o],i[o]);if(0!==e)return e;const t=Bs(n[r[o]],s[i[o]]);if(0!==t)return t}return Lt(r.length,i.length)}(e.mapValue,t.mapValue);default:throw vt(23264,{he:n})}}function Us(e,t){if("string"==typeof e&&"string"==typeof t&&e.length===t.length)return Lt(e,t);const n=ys(e),r=ys(t),s=Lt(n.seconds,r.seconds);return 0!==s?s:Lt(n.nanos,r.nanos)}function qs(e,t){const n=e.values||[],r=t.values||[];for(let s=0;s<n.length&&s<r.length;++s){const e=Bs(n[s],r[s]);if(e)return e}return Lt(n.length,r.length)}function js(e){return zs(e)}function zs(e){return"nullValue"in e?"null":"booleanValue"in e?""+e.booleanValue:"integerValue"in e?""+e.integerValue:"doubleValue"in e?""+e.doubleValue:"timestampValue"in e?function(e){const t=ys(e);return`time(${t.seconds},${t.nanos})`}(e.timestampValue):"stringValue"in e?e.stringValue:"bytesValue"in e?function(e){return vs(e).toBase64()}(e.bytesValue):"referenceValue"in e?function(e){return Ht.fromName(e).toString()}(e.referenceValue):"geoPointValue"in e?function(e){return`geo(${e.latitude},${e.longitude})`}(e.geoPointValue):"arrayValue"in e?function(e){let t="[",n=!0;for(const r of e.values||[])n?n=!1:t+=",",t+=zs(r);return t+"]"}(e.arrayValue):"mapValue"in e?function(e){const t=Object.keys(e.fields||{}).sort();let n="{",r=!0;for(const s of t)r?r=!1:n+=",",n+=`${s}:${zs(e.fields[s])}`;return n+"}"}(e.mapValue):vt(61005,{value:e})}function $s(e){switch(Ls(e)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=Ss(e);return t?16+$s(t):16;case 5:return 2*e.stringValue.length;case 6:return vs(e.bytesValue).approximateByteSize();case 7:return e.referenceValue.length;case 9:return function(e){return(e.values||[]).reduce((e,t)=>e+$s(t),0)}(e.arrayValue);case 10:case 11:return function(e){let t=0;return ss(e.fields,(e,n)=>{t+=e.length+$s(n)}),t}(e.mapValue);default:throw vt(13486,{value:e})}}function Gs(e,t){return{referenceValue:`projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}`}}function Ks(e){return!!e&&"integerValue"in e}function Qs(e){return!!e&&"arrayValue"in e}function Hs(e){return!!e&&"nullValue"in e}function Ws(e){return!!e&&"doubleValue"in e&&isNaN(Number(e.doubleValue))}function Js(e){return!!e&&"mapValue"in e}function Xs(e){const t=(e?.mapValue?.fields||{})[Ns]?.stringValue;return t===Ms}function Ys(e){if(e.geoPointValue)return{geoPointValue:{...e.geoPointValue}};if(e.timestampValue&&"object"==typeof e.timestampValue)return{timestampValue:{...e.timestampValue}};if(e.mapValue){const t={mapValue:{fields:{}}};return ss(e.mapValue.fields,(e,n)=>t.mapValue.fields[e]=Ys(n)),t}if(e.arrayValue){const t={arrayValue:{values:[]}};for(let n=0;n<(e.arrayValue.values||[]).length;++n)t.arrayValue.values[n]=Ys(e.arrayValue.values[n]);return t}return{...e}}function Zs(e){return(((e.mapValue||{}).fields||{}).__type__||{}).stringValue===ks}const ei={mapValue:{fields:{[Ns]:{stringValue:Ms},[Os]:{arrayValue:{}}}}};function ti(e){return"nullValue"in e?Ps:"booleanValue"in e?{booleanValue:!1}:"integerValue"in e||"doubleValue"in e?{doubleValue:NaN}:"timestampValue"in e?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in e?{stringValue:""}:"bytesValue"in e?{bytesValue:""}:"referenceValue"in e?Gs(Ds.empty(),Ht.empty()):"geoPointValue"in e?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in e?{arrayValue:{}}:"mapValue"in e?Xs(e)?ei:{mapValue:{}}:vt(35942,{value:e})}function ni(e){return"nullValue"in e?{booleanValue:!1}:"booleanValue"in e?{doubleValue:NaN}:"integerValue"in e||"doubleValue"in e?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in e?{stringValue:""}:"stringValue"in e?{bytesValue:""}:"bytesValue"in e?Gs(Ds.empty(),Ht.empty()):"referenceValue"in e?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in e?{arrayValue:{}}:"arrayValue"in e?ei:"mapValue"in e?Xs(e)?{mapValue:{}}:Rs:vt(61959,{value:e})}function ri(e,t){const n=Bs(e.value,t.value);return 0!==n?n:e.inclusive&&!t.inclusive?-1:!e.inclusive&&t.inclusive?1:0}function si(e,t){const n=Bs(e.value,t.value);return 0!==n?n:e.inclusive&&!t.inclusive?1:!e.inclusive&&t.inclusive?-1:0}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ii{constructor(e){this.value=e}static empty(){return new ii({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!Js(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ys(t)}setAll(e){let t=Qt.emptyPath(),n={},r=[];e.forEach((e,s)=>{if(!t.isImmediateParentOf(s)){const e=this.getFieldsMap(t);this.applyChanges(e,n,r),n={},r=[],t=s.popLast()}e?n[s.lastSegment()]=Ys(e):r.push(s.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,n,r)}delete(e){const t=this.field(e.popLast());Js(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Fs(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let r=t.mapValue.fields[e.get(n)];Js(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=r),t=r}return t.mapValue.fields}applyChanges(e,t,n){ss(t,(t,n)=>e[t]=n);for(const r of n)delete e[r]}clone(){return new ii(Ys(this.value))}}function oi(e){const t=[];return ss(e.fields,(e,n)=>{const r=new Qt([e]);if(Js(n)){const e=oi(n.mapValue).fields;if(0===e.length)t.push(r);else for(const n of e)t.push(r.child(n))}else t.push(r)}),new fs(t)
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class ai{constructor(e,t,n,r,s,i,o){this.key=e,this.documentType=t,this.version=n,this.readTime=r,this.createTime=s,this.data=i,this.documentState=o}static newInvalidDocument(e){return new ai(e,0,un.min(),un.min(),un.min(),ii.empty(),0)}static newFoundDocument(e,t,n,r){return new ai(e,1,t,un.min(),n,r,0)}static newNoDocument(e,t){return new ai(e,2,t,un.min(),un.min(),ii.empty(),0)}static newUnknownDocument(e,t){return new ai(e,3,t,un.min(),un.min(),ii.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(un.min())||2!==this.documentType&&0!==this.documentType||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ii.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ii.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=un.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(e){return e instanceof ai&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new ai(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ci{constructor(e,t){this.position=e,this.inclusive=t}}function ui(e,t,n){let r=0;for(let s=0;s<e.position.length;s++){const i=t[s],o=e.position[s];if(r=i.field.isKeyField()?Ht.comparator(Ht.fromName(o.referenceValue),n.key):Bs(o,n.data.field(i.field)),"desc"===i.dir&&(r*=-1),0!==r)break}return r}function hi(e,t){if(null===e)return null===t;if(null===t)return!1;if(e.inclusive!==t.inclusive||e.position.length!==t.position.length)return!1;for(let n=0;n<e.position.length;n++)if(!Fs(e.position[n],t.position[n]))return!1;return!0}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class li{constructor(e,t="asc"){this.field=e,this.dir=t}}function di(e,t){return e.dir===t.dir&&e.field.isEqual(t.field)}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{}class mi extends fi{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?"in"===t||"not-in"===t?this.createKeyFieldInFilter(e,t,n):new Ti(e,t,n):"array-contains"===t?new xi(e,n):"in"===t?new Di(e,n):"not-in"===t?new Ni(e,n):"array-contains-any"===t?new ki(e,n):new mi(e,t,n)}static createKeyFieldInFilter(e,t,n){return"in"===t?new Si(e,n):new Ci(e,n)}matches(e){const t=e.data.field(this.field);return"!="===this.op?null!==t&&void 0===t.nullValue&&this.matchesComparison(Bs(t,this.value)):null!==t&&Ls(this.value)===Ls(t)&&this.matchesComparison(Bs(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return 0===e;case"!=":return 0!==e;case">":return e>0;case">=":return e>=0;default:return vt(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class gi extends fi{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new gi(e,t)}matches(e){return pi(this)?void 0===this.filters.find(t=>!t.matches(e)):void 0!==this.filters.find(t=>t.matches(e))}getFlattenedFilters(){return null!==this.Pe||(this.Pe=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function pi(e){return"and"===e.op}function yi(e){return"or"===e.op}function wi(e){return vi(e)&&pi(e)}function vi(e){for(const t of e.filters)if(t instanceof gi)return!1;return!0}function bi(e){if(e instanceof mi)return e.field.canonicalString()+e.op.toString()+js(e.value);if(wi(e))return e.filters.map(e=>bi(e)).join(",");{const t=e.filters.map(e=>bi(e)).join(",");return`${e.op}(${t})`}}function Ii(e,t){return e instanceof mi?function(e,t){return t instanceof mi&&e.op===t.op&&e.field.isEqual(t.field)&&Fs(e.value,t.value)}(e,t):e instanceof gi?function(e,t){return t instanceof gi&&e.op===t.op&&e.filters.length===t.filters.length&&e.filters.reduce((e,n,r)=>e&&Ii(n,t.filters[r]),!0)}(e,t):void vt(19439)}function _i(e,t){const n=e.filters.concat(t);return gi.create(n,e.op)}function Ei(e){return e instanceof mi?function(e){return`${e.field.canonicalString()} ${e.op} ${js(e.value)}`}(e):e instanceof gi?function(e){return e.op.toString()+" {"+e.getFilters().map(Ei).join(" ,")+"}"}(e):"Filter"}class Ti extends mi{constructor(e,t,n){super(e,t,n),this.key=Ht.fromName(n.referenceValue)}matches(e){const t=Ht.comparator(e.key,this.key);return this.matchesComparison(t)}}class Si extends mi{constructor(e,t){super(e,"in",t),this.keys=Ai("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class Ci extends mi{constructor(e,t){super(e,"not-in",t),this.keys=Ai("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Ai(e,t){return(t.arrayValue?.values||[]).map(e=>Ht.fromName(e.referenceValue))}class xi extends mi{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Qs(t)&&Vs(t.arrayValue,this.value)}}class Di extends mi{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return null!==t&&Vs(this.value.arrayValue,t)}}class Ni extends mi{constructor(e,t){super(e,"not-in",t)}matches(e){if(Vs(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return null!==t&&void 0===t.nullValue&&!Vs(this.value.arrayValue,t)}}class ki extends mi{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Qs(t)||!t.arrayValue.values)&&t.arrayValue.values.some(e=>Vs(this.value.arrayValue,e))}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ri{constructor(e,t=null,n=[],r=[],s=null,i=null,o=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=r,this.limit=s,this.startAt=i,this.endAt=o,this.Te=null}}function Mi(e,t=null,n=[],r=[],s=null,i=null,o=null){return new Ri(e,t,n,r,s,i,o)}function Oi(e){const t=_t(e);if(null===t.Te){let e=t.path.canonicalString();null!==t.collectionGroup&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(e=>bi(e)).join(","),e+="|ob:",e+=t.orderBy.map(e=>function(e){return e.field.canonicalString()+e.dir}(e)).join(","),jn(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(e=>js(e)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(e=>js(e)).join(",")),t.Te=e}return t.Te}function Pi(e,t){if(e.limit!==t.limit)return!1;if(e.orderBy.length!==t.orderBy.length)return!1;for(let n=0;n<e.orderBy.length;n++)if(!di(e.orderBy[n],t.orderBy[n]))return!1;if(e.filters.length!==t.filters.length)return!1;for(let n=0;n<e.filters.length;n++)if(!Ii(e.filters[n],t.filters[n]))return!1;return e.collectionGroup===t.collectionGroup&&!!e.path.isEqual(t.path)&&!!hi(e.startAt,t.startAt)&&hi(e.endAt,t.endAt)}function Li(e){return Ht.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}function Fi(e,t){return e.filters.filter(e=>e instanceof mi&&e.field.isEqual(t))}function Vi(e,t,n){let r=Ps,s=!0;for(const i of Fi(e,t)){let e=Ps,t=!0;switch(i.op){case"<":case"<=":e=ti(i.value);break;case"==":case"in":case">=":e=i.value;break;case">":e=i.value,t=!1;break;case"!=":case"not-in":e=Ps}ri({value:r,inclusive:s},{value:e,inclusive:t})<0&&(r=e,s=t)}if(null!==n)for(let i=0;i<e.orderBy.length;++i)if(e.orderBy[i].field.isEqual(t)){const e=n.position[i];ri({value:r,inclusive:s},{value:e,inclusive:n.inclusive})<0&&(r=e,s=n.inclusive);break}return{value:r,inclusive:s}}function Bi(e,t,n){let r=Rs,s=!0;for(const i of Fi(e,t)){let e=Rs,t=!0;switch(i.op){case">=":case">":e=ni(i.value),t=!1;break;case"==":case"in":case"<=":e=i.value;break;case"<":e=i.value,t=!1;break;case"!=":case"not-in":e=Rs}si({value:r,inclusive:s},{value:e,inclusive:t})>0&&(r=e,s=t)}if(null!==n)for(let i=0;i<e.orderBy.length;++i)if(e.orderBy[i].field.isEqual(t)){const e=n.position[i];si({value:r,inclusive:s},{value:e,inclusive:n.inclusive})>0&&(r=e,s=n.inclusive);break}return{value:r,inclusive:s}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ui{constructor(e,t=null,n=[],r=[],s=null,i="F",o=null,a=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=r,this.limit=s,this.limitType=i,this.startAt=o,this.endAt=a,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function qi(e,t,n,r,s,i,o,a){return new Ui(e,t,n,r,s,i,o,a)}function ji(e){return new Ui(e)}function zi(e){return 0===e.filters.length&&null===e.limit&&null==e.startAt&&null==e.endAt&&(0===e.explicitOrderBy.length||1===e.explicitOrderBy.length&&e.explicitOrderBy[0].field.isKeyField())}function $i(e){return null!==e.collectionGroup}function Gi(e){const t=_t(e);if(null===t.Ie){t.Ie=[];const e=new Set;for(const s of t.explicitOrderBy)t.Ie.push(s),e.add(s.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc",r=function(e){let t=new hs(Qt.comparator);return e.filters.forEach(e=>{e.getFlattenedFilters().forEach(e=>{e.isInequality()&&(t=t.add(e.field))})}),t}(t);r.forEach(r=>{e.has(r.canonicalString())||r.isKeyField()||t.Ie.push(new li(r,n))}),e.has(Qt.keyField().canonicalString())||t.Ie.push(new li(Qt.keyField(),n))}return t.Ie}function Ki(e){const t=_t(e);return t.Ee||(t.Ee=Hi(t,Gi(e))),t.Ee}function Qi(e){const t=_t(e);return t.de||(t.de=Hi(t,e.explicitOrderBy)),t.de}function Hi(e,t){if("F"===e.limitType)return Mi(e.path,e.collectionGroup,t,e.filters,e.limit,e.startAt,e.endAt);{t=t.map(e=>{const t="desc"===e.dir?"asc":"desc";return new li(e.field,t)});const n=e.endAt?new ci(e.endAt.position,e.endAt.inclusive):null,r=e.startAt?new ci(e.startAt.position,e.startAt.inclusive):null;return Mi(e.path,e.collectionGroup,t,e.filters,e.limit,n,r)}}function Wi(e,t){const n=e.filters.concat([t]);return new Ui(e.path,e.collectionGroup,e.explicitOrderBy.slice(),n,e.limit,e.limitType,e.startAt,e.endAt)}function Ji(e,t,n){return new Ui(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),t,n,e.startAt,e.endAt)}function Xi(e,t){return Pi(Ki(e),Ki(t))&&e.limitType===t.limitType}function Yi(e){return`${Oi(Ki(e))}|lt:${e.limitType}`}function Zi(e){return`Query(target=${function(e){let t=e.path.canonicalString();return null!==e.collectionGroup&&(t+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(t+=`, filters: [${e.filters.map(e=>Ei(e)).join(", ")}]`),jn(e.limit)||(t+=", limit: "+e.limit),e.orderBy.length>0&&(t+=`, orderBy: [${e.orderBy.map(e=>function(e){return`${e.field.canonicalString()} (${e.dir})`}(e)).join(", ")}]`),e.startAt&&(t+=", startAt: ",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(e=>js(e)).join(",")),e.endAt&&(t+=", endAt: ",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(e=>js(e)).join(",")),`Target(${t})`}(Ki(e))}; limitType=${e.limitType})`}function eo(e,t){return t.isFoundDocument()&&function(e,t){const n=t.key.path;return null!==e.collectionGroup?t.key.hasCollectionId(e.collectionGroup)&&e.path.isPrefixOf(n):Ht.isDocumentKey(e.path)?e.path.isEqual(n):e.path.isImmediateParentOf(n)}(e,t)&&function(e,t){for(const n of Gi(e))if(!n.field.isKeyField()&&null===t.data.field(n.field))return!1;return!0}(e,t)&&function(e,t){for(const n of e.filters)if(!n.matches(t))return!1;return!0}(e,t)&&function(e,t){return!(e.startAt&&!function(e,t,n){const r=ui(e,t,n);return e.inclusive?r<=0:r<0}(e.startAt,Gi(e),t))&&!(e.endAt&&!function(e,t,n){const r=ui(e,t,n);return e.inclusive?r>=0:r>0}(e.endAt,Gi(e),t))}(e,t)}function to(e){return e.collectionGroup||(e.path.length%2==1?e.path.lastSegment():e.path.get(e.path.length-2))}function no(e){return(t,n)=>{let r=!1;for(const s of Gi(e)){const e=ro(s,t,n);if(0!==e)return e;r=r||s.field.isKeyField()}return 0}}function ro(e,t,n){const r=e.field.isKeyField()?Ht.comparator(t.key,n.key):function(e,t,n){const r=t.data.field(e),s=n.data.field(e);return null!==r&&null!==s?Bs(r,s):vt(42886)}(e.field,t,n);switch(e.dir){case"asc":return r;case"desc":return-1*r;default:return vt(19790,{direction:e.dir})}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0!==n)for(const[r,s]of n)if(this.equalsFn(r,e))return s}has(e){return void 0!==this.get(e)}set(e,t){const n=this.mapKeyFn(e),r=this.inner[n];if(void 0===r)return this.inner[n]=[[e,t]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,t]);r.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0===n)return!1;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],e))return 1===n.length?delete this.inner[t]:n.splice(r,1),this.innerSize--,!0;return!1}forEach(e){ss(this.inner,(t,n)=>{for(const[r,s]of n)e(r,s)})}isEmpty(){return os(this.inner)}size(){return this.innerSize}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const io=new as(Ht.comparator);function oo(){return io}const ao=new as(Ht.comparator);function co(...e){let t=ao;for(const n of e)t=t.insert(n.key,n);return t}function uo(e){let t=ao;return e.forEach((e,n)=>t=t.insert(e,n.overlayedDocument)),t}function ho(){return fo()}function lo(){return fo()}function fo(){return new so(e=>e.toString(),(e,t)=>e.isEqual(t))}const mo=new as(Ht.comparator),go=new hs(Ht.comparator);function po(...e){let t=go;for(const n of e)t=t.add(n);return t}const yo=new hs(Lt);function wo(){return yo}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vo(e,t){if(e.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:zn(t)?"-0":t}}function bo(e){return{integerValue:""+e}}function Io(e,t){return $n(t)?bo(t):vo(e,t)}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{constructor(){this._=void 0}}function Eo(e,t,n){return e instanceof Co?function(e,t){const n={fields:{[Is]:{stringValue:bs},[Es]:{timestampValue:{seconds:e.seconds,nanos:e.nanoseconds}}}};return t&&Ts(t)&&(t=Ss(t)),t&&(n.fields[_s]=t),{mapValue:n}}(n,t):e instanceof Ao?xo(e,t):e instanceof Do?No(e,t):function(e,t){const n=So(e,t),r=Ro(n)+Ro(e.Ae);return Ks(n)&&Ks(e.Ae)?bo(r):vo(e.serializer,r)}(e,t)}function To(e,t,n){return e instanceof Ao?xo(e,t):e instanceof Do?No(e,t):n}function So(e,t){return e instanceof ko?function(e){return Ks(e)||function(e){return!!e&&"doubleValue"in e}(e)}(t)?t:{integerValue:0}:null}class Co extends _o{}class Ao extends _o{constructor(e){super(),this.elements=e}}function xo(e,t){const n=Mo(t);for(const r of e.elements)n.some(e=>Fs(e,r))||n.push(r);return{arrayValue:{values:n}}}class Do extends _o{constructor(e){super(),this.elements=e}}function No(e,t){let n=Mo(t);for(const r of e.elements)n=n.filter(e=>!Fs(e,r));return{arrayValue:{values:n}}}class ko extends _o{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function Ro(e){return ws(e.integerValue||e.doubleValue)}function Mo(e){return Qs(e)&&e.arrayValue.values?e.arrayValue.values.slice():[]}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oo{constructor(e,t){this.field=e,this.transform=t}}class Po{constructor(e,t){this.version=e,this.transformResults=t}}class Lo{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Lo}static exists(e){return new Lo(void 0,e)}static updateTime(e){return new Lo(e)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Fo(e,t){return void 0!==e.updateTime?t.isFoundDocument()&&t.version.isEqual(e.updateTime):void 0===e.exists||e.exists===t.isFoundDocument()}class Vo{}function Bo(e,t){if(!e.hasLocalMutations||t&&0===t.fields.length)return null;if(null===t)return e.isNoDocument()?new Wo(e.key,Lo.none()):new $o(e.key,e.data,Lo.none());{const n=e.data,r=ii.empty();let s=new hs(Qt.comparator);for(let e of t.fields)if(!s.has(e)){let t=n.field(e);null===t&&e.length>1&&(e=e.popLast(),t=n.field(e)),null===t?r.delete(e):r.set(e,t),s=s.add(e)}return new Go(e.key,r,new fs(s.toArray()),Lo.none())}}function Uo(e,t,n){e instanceof $o?function(e,t,n){const r=e.value.clone(),s=Qo(e.fieldTransforms,t,n.transformResults);r.setAll(s),t.convertToFoundDocument(n.version,r).setHasCommittedMutations()}(e,t,n):e instanceof Go?function(e,t,n){if(!Fo(e.precondition,t))return void t.convertToUnknownDocument(n.version);const r=Qo(e.fieldTransforms,t,n.transformResults),s=t.data;s.setAll(Ko(e)),s.setAll(r),t.convertToFoundDocument(n.version,s).setHasCommittedMutations()}(e,t,n):function(e,t,n){t.convertToNoDocument(n.version).setHasCommittedMutations()}(0,t,n)}function qo(e,t,n,r){return e instanceof $o?function(e,t,n,r){if(!Fo(e.precondition,t))return n;const s=e.value.clone(),i=Ho(e.fieldTransforms,r,t);return s.setAll(i),t.convertToFoundDocument(t.version,s).setHasLocalMutations(),null}(e,t,n,r):e instanceof Go?function(e,t,n,r){if(!Fo(e.precondition,t))return n;const s=Ho(e.fieldTransforms,r,t),i=t.data;return i.setAll(Ko(e)),i.setAll(s),t.convertToFoundDocument(t.version,i).setHasLocalMutations(),null===n?null:n.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(e=>e.field))}(e,t,n,r):function(e,t,n){return Fo(e.precondition,t)?(t.convertToNoDocument(t.version).setHasLocalMutations(),null):n}(e,t,n)}function jo(e,t){let n=null;for(const r of e.fieldTransforms){const e=t.data.field(r.field),s=So(r.transform,e||null);null!=s&&(null===n&&(n=ii.empty()),n.set(r.field,s))}return n||null}function zo(e,t){return e.type===t.type&&!!e.key.isEqual(t.key)&&!!e.precondition.isEqual(t.precondition)&&!!function(e,t){return void 0===e&&void 0===t||!(!e||!t)&&qt(e,t,(e,t)=>function(e,t){return e.field.isEqual(t.field)&&function(e,t){return e instanceof Ao&&t instanceof Ao||e instanceof Do&&t instanceof Do?qt(e.elements,t.elements,Fs):e instanceof ko&&t instanceof ko?Fs(e.Ae,t.Ae):e instanceof Co&&t instanceof Co}(e.transform,t.transform)}(e,t))}(e.fieldTransforms,t.fieldTransforms)&&(0===e.type?e.value.isEqual(t.value):1!==e.type||e.data.isEqual(t.data)&&e.fieldMask.isEqual(t.fieldMask))}class $o extends Vo{constructor(e,t,n,r=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class Go extends Vo{constructor(e,t,n,r,s=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function Ko(e){const t=new Map;return e.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=e.data.field(n);t.set(n,r)}}),t}function Qo(e,t,n){const r=new Map;It(e.length===n.length,32656,{Re:n.length,Ve:e.length});for(let s=0;s<n.length;s++){const i=e[s],o=i.transform,a=t.data.field(i.field);r.set(i.field,To(o,a,n[s]))}return r}function Ho(e,t,n){const r=new Map;for(const s of e){const e=s.transform,i=n.data.field(s.field);r.set(s.field,Eo(e,i,t))}return r}class Wo extends Vo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Jo extends Vo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xo{constructor(e,t,n,r){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=r}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let r=0;r<this.mutations.length;r++){const t=this.mutations[r];t.key.isEqual(e.key)&&Uo(t,e,n[r])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=qo(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=qo(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=lo();return this.mutations.forEach(r=>{const s=e.get(r.key),i=s.overlayedDocument;let o=this.applyToLocalView(i,s.mutatedFields);o=t.has(r.key)?null:o;const a=Bo(i,o);null!==a&&n.set(r.key,a),i.isValidDocument()||i.convertToNoDocument(un.min())}),n}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),po())}isEqual(e){return this.batchId===e.batchId&&qt(this.mutations,e.mutations,(e,t)=>zo(e,t))&&qt(this.baseMutations,e.baseMutations,(e,t)=>zo(e,t))}}class Yo{constructor(e,t,n,r){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=r}static from(e,t,n){It(e.mutations.length===n.length,58842,{me:e.mutations.length,fe:n.length});let r=mo;const s=e.mutations;for(let i=0;i<s.length;i++)r=r.insert(s[i].key,n[i].version);return new Yo(e,t,n,r)}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zo{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return null!==e&&this.mutation===e.mutation}toString(){return`Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ea{constructor(e,t,n){this.alias=e,this.aggregateType=t,this.fieldPath=n}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ta{constructor(e,t){this.count=e,this.unchangedNames=t}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var na,ra;function sa(e){switch(e){case Et.OK:return vt(64938);case Et.CANCELLED:case Et.UNKNOWN:case Et.DEADLINE_EXCEEDED:case Et.RESOURCE_EXHAUSTED:case Et.INTERNAL:case Et.UNAVAILABLE:case Et.UNAUTHENTICATED:return!1;case Et.INVALID_ARGUMENT:case Et.NOT_FOUND:case Et.ALREADY_EXISTS:case Et.PERMISSION_DENIED:case Et.FAILED_PRECONDITION:case Et.ABORTED:case Et.OUT_OF_RANGE:case Et.UNIMPLEMENTED:case Et.DATA_LOSS:return!0;default:return vt(15467,{code:e})}}function ia(e){if(void 0===e)return pt("GRPC error has no .code"),Et.UNKNOWN;switch(e){case na.OK:return Et.OK;case na.CANCELLED:return Et.CANCELLED;case na.UNKNOWN:return Et.UNKNOWN;case na.DEADLINE_EXCEEDED:return Et.DEADLINE_EXCEEDED;case na.RESOURCE_EXHAUSTED:return Et.RESOURCE_EXHAUSTED;case na.INTERNAL:return Et.INTERNAL;case na.UNAVAILABLE:return Et.UNAVAILABLE;case na.UNAUTHENTICATED:return Et.UNAUTHENTICATED;case na.INVALID_ARGUMENT:return Et.INVALID_ARGUMENT;case na.NOT_FOUND:return Et.NOT_FOUND;case na.ALREADY_EXISTS:return Et.ALREADY_EXISTS;case na.PERMISSION_DENIED:return Et.PERMISSION_DENIED;case na.FAILED_PRECONDITION:return Et.FAILED_PRECONDITION;case na.ABORTED:return Et.ABORTED;case na.OUT_OF_RANGE:return Et.OUT_OF_RANGE;case na.UNIMPLEMENTED:return Et.UNIMPLEMENTED;case na.DATA_LOSS:return Et.DATA_LOSS;default:return vt(39323,{code:e})}}(ra=na||(na={}))[ra.OK=0]="OK",ra[ra.CANCELLED=1]="CANCELLED",ra[ra.UNKNOWN=2]="UNKNOWN",ra[ra.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ra[ra.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ra[ra.NOT_FOUND=5]="NOT_FOUND",ra[ra.ALREADY_EXISTS=6]="ALREADY_EXISTS",ra[ra.PERMISSION_DENIED=7]="PERMISSION_DENIED",ra[ra.UNAUTHENTICATED=16]="UNAUTHENTICATED",ra[ra.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ra[ra.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ra[ra.ABORTED=10]="ABORTED",ra[ra.OUT_OF_RANGE=11]="OUT_OF_RANGE",ra[ra.UNIMPLEMENTED=12]="UNIMPLEMENTED",ra[ra.INTERNAL=13]="INTERNAL",ra[ra.UNAVAILABLE=14]="UNAVAILABLE",ra[ra.DATA_LOSS=15]="DATA_LOSS";
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let oa=null;
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aa(){return new TextEncoder}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ca=new Xe([4294967295,4294967295],0);function ua(e){const t=aa().encode(e),n=new Ye;return n.update(t),new Uint8Array(n.digest())}function ha(e){const t=new DataView(e.buffer),n=t.getUint32(0,!0),r=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new Xe([n,r],0),new Xe([s,i],0)]}class la{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new da(`Invalid padding: ${t}`);if(n<0)throw new da(`Invalid hash count: ${n}`);if(e.length>0&&0===this.hashCount)throw new da(`Invalid hash count: ${n}`);if(0===e.length&&0!==t)throw new da(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=Xe.fromNumber(this.ge)}ye(e,t,n){let r=e.add(t.multiply(Xe.fromNumber(n)));return 1===r.compare(ca)&&(r=new Xe([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(0===this.ge)return!1;const t=ua(e),[n,r]=ha(t);for(let s=0;s<this.hashCount;s++){const e=this.ye(n,r,s);if(!this.we(e))return!1}return!0}static create(e,t,n){const r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new la(s,r,t);return n.forEach(e=>i.insert(e)),i}insert(e){if(0===this.ge)return;const t=ua(e),[n,r]=ha(t);for(let s=0;s<this.hashCount;s++){const e=this.ye(n,r,s);this.Se(e)}}Se(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class da extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fa{constructor(e,t,n,r,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const r=new Map;return r.set(e,ma.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new fa(un.min(),r,new as(Lt),oo(),po())}}class ma{constructor(e,t,n,r,s){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new ma(n,t,po(),po(),po())}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ga{constructor(e,t,n,r){this.be=e,this.removedTargetIds=t,this.key=n,this.De=r}}class pa{constructor(e,t){this.targetId=e,this.Ce=t}}class ya{constructor(e,t,n=gs.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=r}}class wa{constructor(){this.ve=0,this.Fe=Ia(),this.Me=gs.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return 0!==this.ve}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=po(),t=po(),n=po();return this.Fe.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:t=t.add(r);break;case 1:n=n.add(r);break;default:vt(38017,{changeType:s})}}),new ma(this.Me,this.xe,e,t,n)}qe(){this.Oe=!1,this.Fe=Ia()}Qe(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}$e(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}Ue(){this.ve+=1}Ke(){this.ve-=1,It(this.ve>=0,3241,{ve:this.ve})}We(){this.Oe=!0,this.xe=!0}}class va{constructor(e){this.Ge=e,this.ze=new Map,this.je=oo(),this.Je=ba(),this.He=ba(),this.Ye=new as(Lt)}Ze(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Xe(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,t=>{const n=this.nt(t);switch(e.state){case 0:this.rt(t)&&n.Le(e.resumeToken);break;case 1:n.Ke(),n.Ne||n.qe(),n.Le(e.resumeToken);break;case 2:n.Ke(),n.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(n.We(),n.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),n.Le(e.resumeToken));break;default:vt(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach((e,n)=>{this.rt(n)&&t(n)})}st(e){const t=e.targetId,n=e.Ce.count,r=this.ot(t);if(r){const s=r.target;if(Li(s))if(0===n){const e=new Ht(s.path);this.et(t,e,ai.newNoDocument(e,un.min()))}else It(1===n,20013,{expectedCount:n});else{const r=this._t(t);if(r!==n){const n=this.ut(e),s=n?this.ct(n,e,r):1;if(0!==s){this.it(t);const e=2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ye=this.Ye.insert(t,e)}oa?.lt(function(e,t,n,r,s){const i={localCacheCount:e,existenceFilterCount:t.count,databaseId:n.database,projectId:n.projectId},o=t.unchangedNames;return o&&(i.bloomFilter={applied:0===s,hashCount:o?.hashCount??0,bitmapLength:o?.bits?.bitmap?.length??0,padding:o?.bits?.padding??0,mightContain:e=>r?.mightContain(e)??!1}),i}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(r,e.Ce,this.Ge.ht(),n,s))}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:r=0},hashCount:s=0}=t;let i,o;try{i=vs(n).toUint8Array()}catch(e){if(e instanceof ms)return yt("Decoding the base64 bloom filter in existence filter failed ("+e.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw e}try{o=new la(i,r,s)}catch(e){return yt(e instanceof da?"BloomFilter error: ":"Applying bloom filter failed: ",e),null}return 0===o.ge?null:o}ct(e,t,n){return t.Ce.count===n-this.Pt(e,t.targetId)?0:2}Pt(e,t){const n=this.Ge.getRemoteKeysForTarget(t);let r=0;return n.forEach(n=>{const s=this.Ge.ht(),i=`projects/${s.projectId}/databases/${s.database}/documents/${n.path.canonicalString()}`;e.mightContain(i)||(this.et(t,n,null),r++)}),r}Tt(e){const t=new Map;this.ze.forEach((n,r)=>{const s=this.ot(r);if(s){if(n.current&&Li(s.target)){const t=new Ht(s.target.path);this.It(t).has(r)||this.Et(r,t)||this.et(r,t,ai.newNoDocument(t,e))}n.Be&&(t.set(r,n.ke()),n.qe())}});let n=po();this.He.forEach((e,t)=>{let r=!0;t.forEachWhile(e=>{const t=this.ot(e);return!t||"TargetPurposeLimboResolution"===t.purpose||(r=!1,!1)}),r&&(n=n.add(e))}),this.je.forEach((t,n)=>n.setReadTime(e));const r=new fa(e,t,this.Ye,this.je,n);return this.je=oo(),this.Je=ba(),this.He=ba(),this.Ye=new as(Lt),r}Xe(e,t){if(!this.rt(e))return;const n=this.Et(e,t.key)?2:0;this.nt(e).Qe(t.key,n),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.He=this.He.insert(t.key,this.dt(t.key).add(e))}et(e,t,n){if(!this.rt(e))return;const r=this.nt(e);this.Et(e,t)?r.Qe(t,1):r.$e(t),this.He=this.He.insert(t,this.dt(t).delete(e)),this.He=this.He.insert(t,this.dt(t).add(e)),n&&(this.je=this.je.insert(t,n))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}Ue(e){this.nt(e).Ue()}nt(e){let t=this.ze.get(e);return t||(t=new wa,this.ze.set(e,t)),t}dt(e){let t=this.He.get(e);return t||(t=new hs(Lt),this.He=this.He.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new hs(Lt),this.Je=this.Je.insert(e,t)),t}rt(e){const t=null!==this.ot(e);return t||gt("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new wa),this.Ge.getRemoteKeysForTarget(e).forEach(t=>{this.et(e,t,null)})}Et(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function ba(){return new as(Ht.comparator)}function Ia(){return new as(Ht.comparator)}const _a={asc:"ASCENDING",desc:"DESCENDING"},Ea={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Ta={and:"AND",or:"OR"};class Sa{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Ca(e,t){return e.useProto3Json||jn(t)?t:{value:t}}function Aa(e,t){return e.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function xa(e,t){return e.useProto3Json?t.toBase64():t.toUint8Array()}function Da(e,t){return Aa(e,t.toTimestamp())}function Na(e){return It(!!e,49232),un.fromTimestamp(function(e){const t=ys(e);return new cn(t.seconds,t.nanos)}(e))}function ka(e,t){return Ra(e,t).canonicalString()}function Ra(e,t){const n=function(e){return new Gt(["projects",e.projectId,"databases",e.database])}(e).child("documents");return void 0===t?n:n.child(t)}function Ma(e){const t=Gt.fromString(e);return It(nc(t),10190,{key:t.toString()}),t}function Oa(e,t){return ka(e.databaseId,t.path)}function Pa(e,t){const n=Ma(t);if(n.get(1)!==e.databaseId.projectId)throw new Tt(Et.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+e.databaseId.projectId);if(n.get(3)!==e.databaseId.database)throw new Tt(Et.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+e.databaseId.database);return new Ht(Ba(n))}function La(e,t){return ka(e.databaseId,t)}function Fa(e){const t=Ma(e);return 4===t.length?Gt.emptyPath():Ba(t)}function Va(e){return new Gt(["projects",e.databaseId.projectId,"databases",e.databaseId.database]).canonicalString()}function Ba(e){return It(e.length>4&&"documents"===e.get(4),29091,{key:e.toString()}),e.popFirst(5)}function Ua(e,t,n){return{name:Oa(e,t),fields:n.value.mapValue.fields}}function qa(e,t,n){const r=Pa(e,t.name),s=Na(t.updateTime),i=t.createTime?Na(t.createTime):un.min(),o=new ii({mapValue:{fields:t.fields}}),a=ai.newFoundDocument(r,s,i,o);return n&&a.setHasCommittedMutations(),n?a.setHasCommittedMutations():a}function ja(e,t){let n;if(t instanceof $o)n={update:Ua(e,t.key,t.value)};else if(t instanceof Wo)n={delete:Oa(e,t.key)};else if(t instanceof Go)n={update:Ua(e,t.key,t.data),updateMask:tc(t.fieldMask)};else{if(!(t instanceof Jo))return vt(16599,{Vt:t.type});n={verify:Oa(e,t.key)}}return t.fieldTransforms.length>0&&(n.updateTransforms=t.fieldTransforms.map(e=>function(e,t){const n=t.transform;if(n instanceof Co)return{fieldPath:t.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(n instanceof Ao)return{fieldPath:t.field.canonicalString(),appendMissingElements:{values:n.elements}};if(n instanceof Do)return{fieldPath:t.field.canonicalString(),removeAllFromArray:{values:n.elements}};if(n instanceof ko)return{fieldPath:t.field.canonicalString(),increment:n.Ae};throw vt(20930,{transform:t.transform})}(0,e))),t.precondition.isNone||(n.currentDocument=function(e,t){return void 0!==t.updateTime?{updateTime:Da(e,t.updateTime)}:void 0!==t.exists?{exists:t.exists}:vt(27497)}(e,t.precondition)),n}function za(e,t){const n=t.currentDocument?function(e){return void 0!==e.updateTime?Lo.updateTime(Na(e.updateTime)):void 0!==e.exists?Lo.exists(e.exists):Lo.none()}(t.currentDocument):Lo.none(),r=t.updateTransforms?t.updateTransforms.map(t=>function(e,t){let n=null;if("setToServerValue"in t)It("REQUEST_TIME"===t.setToServerValue,16630,{proto:t}),n=new Co;else if("appendMissingElements"in t){const e=t.appendMissingElements.values||[];n=new Ao(e)}else if("removeAllFromArray"in t){const e=t.removeAllFromArray.values||[];n=new Do(e)}else"increment"in t?n=new ko(e,t.increment):vt(16584,{proto:t});const r=Qt.fromServerFormat(t.fieldPath);return new Oo(r,n)}(e,t)):[];if(t.update){t.update.name;const s=Pa(e,t.update.name),i=new ii({mapValue:{fields:t.update.fields}});if(t.updateMask){const e=function(e){const t=e.fieldPaths||[];return new fs(t.map(e=>Qt.fromServerFormat(e)))}(t.updateMask);return new Go(s,i,e,n,r)}return new $o(s,i,n,r)}if(t.delete){const r=Pa(e,t.delete);return new Wo(r,n)}if(t.verify){const r=Pa(e,t.verify);return new Jo(r,n)}return vt(1463,{proto:t})}function $a(e,t){return{documents:[La(e,t.path)]}}function Ga(e,t){const n={structuredQuery:{}},r=t.path;let s;null!==t.collectionGroup?(s=r,n.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=La(e,s);const i=function(e){if(0!==e.length)return ec(gi.create(e,"and"))}(t.filters);i&&(n.structuredQuery.where=i);const o=function(e){if(0!==e.length)return e.map(e=>function(e){return{field:Ya(e.field),direction:Wa(e.dir)}}(e))}(t.orderBy);o&&(n.structuredQuery.orderBy=o);const a=Ca(e,t.limit);return null!==a&&(n.structuredQuery.limit=a),t.startAt&&(n.structuredQuery.startAt=function(e){return{before:e.inclusive,values:e.position}}(t.startAt)),t.endAt&&(n.structuredQuery.endAt=function(e){return{before:!e.inclusive,values:e.position}}(t.endAt)),{ft:n,parent:s}}function Ka(e,t,n,r){const{ft:s,parent:i}=Ga(e,t),o={},a=[];let c=0;return n.forEach(e=>{const t=r?e.alias:"aggregate_"+c++;o[t]=e.alias,"count"===e.aggregateType?a.push({alias:t,count:{}}):"avg"===e.aggregateType?a.push({alias:t,avg:{field:Ya(e.fieldPath)}}):"sum"===e.aggregateType&&a.push({alias:t,sum:{field:Ya(e.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:a,structuredQuery:s.structuredQuery},parent:s.parent},gt:o,parent:i}}function Qa(e){let t=Fa(e.parent);const n=e.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){It(1===r,65062);const e=n.from[0];e.allDescendants?s=e.collectionId:t=t.child(e.collectionId)}let i=[];n.where&&(i=function(e){const t=Ha(e);return t instanceof gi&&wi(t)?t.getFilters():[t]}(n.where));let o=[];n.orderBy&&(o=function(e){return e.map(e=>function(e){return new li(Za(e.field),function(e){switch(e){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(e.direction))}(e))}(n.orderBy));let a=null;n.limit&&(a=function(e){let t;return t="object"==typeof e?e.value:e,jn(t)?null:t}(n.limit));let c=null;n.startAt&&(c=function(e){const t=!!e.before,n=e.values||[];return new ci(n,t)}(n.startAt));let u=null;return n.endAt&&(u=function(e){const t=!e.before,n=e.values||[];return new ci(n,t)}(n.endAt)),qi(t,s,o,i,a,"F",c,u)}function Ha(e){return void 0!==e.unaryFilter?function(e){switch(e.unaryFilter.op){case"IS_NAN":const t=Za(e.unaryFilter.field);return mi.create(t,"==",{doubleValue:NaN});case"IS_NULL":const n=Za(e.unaryFilter.field);return mi.create(n,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const r=Za(e.unaryFilter.field);return mi.create(r,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const s=Za(e.unaryFilter.field);return mi.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return vt(61313);default:return vt(60726)}}(e):void 0!==e.fieldFilter?function(e){return mi.create(Za(e.fieldFilter.field),function(e){switch(e){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return vt(58110);default:return vt(50506)}}(e.fieldFilter.op),e.fieldFilter.value)}(e):void 0!==e.compositeFilter?function(e){return gi.create(e.compositeFilter.filters.map(e=>Ha(e)),function(e){switch(e){case"AND":return"and";case"OR":return"or";default:return vt(1026)}}(e.compositeFilter.op))}(e):vt(30097,{filter:e})}function Wa(e){return _a[e]}function Ja(e){return Ea[e]}function Xa(e){return Ta[e]}function Ya(e){return{fieldPath:e.canonicalString()}}function Za(e){return Qt.fromServerFormat(e.fieldPath)}function ec(e){return e instanceof mi?function(e){if("=="===e.op){if(Ws(e.value))return{unaryFilter:{field:Ya(e.field),op:"IS_NAN"}};if(Hs(e.value))return{unaryFilter:{field:Ya(e.field),op:"IS_NULL"}}}else if("!="===e.op){if(Ws(e.value))return{unaryFilter:{field:Ya(e.field),op:"IS_NOT_NAN"}};if(Hs(e.value))return{unaryFilter:{field:Ya(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ya(e.field),op:Ja(e.op),value:e.value}}}(e):e instanceof gi?function(e){const t=e.getFilters().map(e=>ec(e));return 1===t.length?t[0]:{compositeFilter:{op:Xa(e.op),filters:t}}}(e):vt(54877,{filter:e})}function tc(e){const t=[];return e.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function nc(e){return e.length>=4&&"projects"===e.get(0)&&"databases"===e.get(2)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rc{constructor(e,t,n,r,s=un.min(),i=un.min(),o=gs.EMPTY_BYTE_STRING,a=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=o,this.expectedCount=a}withSequenceNumber(e){return new rc(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new rc(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new rc(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new rc(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sc{constructor(e){this.yt=e}}function ic(e,t){const n=t.key,r={prefixPath:n.getCollectionPath().popLast().toArray(),collectionGroup:n.collectionGroup,documentId:n.path.lastSegment(),readTime:oc(t.readTime),hasCommittedMutations:t.hasCommittedMutations};if(t.isFoundDocument())r.document=function(e,t){return{name:Oa(e,t.key),fields:t.data.value.mapValue.fields,updateTime:Aa(e,t.version.toTimestamp()),createTime:Aa(e,t.createTime.toTimestamp())}}(e.yt,t);else if(t.isNoDocument())r.noDocument={path:n.path.toArray(),readTime:ac(t.version)};else{if(!t.isUnknownDocument())return vt(57904,{document:t});r.unknownDocument={path:n.path.toArray(),version:ac(t.version)}}return r}function oc(e){const t=e.toTimestamp();return[t.seconds,t.nanoseconds]}function ac(e){const t=e.toTimestamp();return{seconds:t.seconds,nanoseconds:t.nanoseconds}}function cc(e){const t=new cn(e.seconds,e.nanoseconds);return un.fromTimestamp(t)}function uc(e,t){const n=(t.baseMutations||[]).map(t=>za(e.yt,t));for(let i=0;i<t.mutations.length-1;++i){const e=t.mutations[i];if(i+1<t.mutations.length&&void 0!==t.mutations[i+1].transform){const n=t.mutations[i+1];e.updateTransforms=n.transform.fieldTransforms,t.mutations.splice(i+1,1),++i}}const r=t.mutations.map(t=>za(e.yt,t)),s=cn.fromMillis(t.localWriteTimeMs);return new Xo(t.batchId,s,n,r)}function hc(e){const t=cc(e.readTime),n=void 0!==e.lastLimboFreeSnapshotVersion?cc(e.lastLimboFreeSnapshotVersion):un.min();let r;return r=function(e){return void 0!==e.documents}(e.query)?function(e){const t=e.documents.length;return It(1===t,1966,{count:t}),Ki(ji(Fa(e.documents[0])))}(e.query):function(e){return Ki(Qa(e))}(e.query),new rc(r,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,n,gs.fromBase64String(e.resumeToken))}function lc(e,t){const n=ac(t.snapshotVersion),r=ac(t.lastLimboFreeSnapshotVersion);let s;s=Li(t.target)?$a(e.yt,t.target):Ga(e.yt,t.target).ft;const i=t.resumeToken.toBase64();return{targetId:t.targetId,canonicalId:Oi(t.target),readTime:n,resumeToken:i,lastListenSequenceNumber:t.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:s}}function dc(e){const t=Qa({parent:e.parent,structuredQuery:e.structuredQuery});return"LAST"===e.limitType?Ji(t,t.limit,"L"):t}function fc(e,t){return new Zo(t.largestBatchId,za(e.yt,t.overlayMutation))}function mc(e,t){const n=t.path.lastSegment();return[e,Kn(t.path.popLast()),n]}function gc(e,t,n,r){return{indexId:e,uid:t,sequenceNumber:n,readTime:ac(r.readTime),documentKey:Kn(r.documentKey.path),largestBatchId:r.largestBatchId}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pc{getBundleMetadata(e,t){return yc(e).get(t).next(e=>{if(e)return function(e){return{id:e.bundleId,createTime:cc(e.createTime),version:e.version}}(e)})}saveBundleMetadata(e,t){return yc(e).put(function(e){return{bundleId:e.id,createTime:ac(Na(e.createTime)),version:e.version}}(t))}getNamedQuery(e,t){return wc(e).get(t).next(e=>{if(e)return function(e){return{name:e.name,query:dc(e.bundledQuery),readTime:cc(e.readTime)}}(e)})}saveNamedQuery(e,t){return wc(e).put(function(e){return{name:e.name,readTime:ac(Na(e.readTime)),bundledQuery:e.bundledQuery}}(t))}}function yc(e){return ns(e,xr)}function wc(e){return ns(e,Dr)}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vc{constructor(e,t){this.serializer=e,this.userId=t}static wt(e,t){const n=t.uid||"";return new vc(e,n)}getOverlay(e,t){return bc(e).get(mc(this.userId,t)).next(e=>e?fc(this.serializer,e):null)}getOverlays(e,t){const n=ho();return Sn.forEach(t,t=>this.getOverlay(e,t).next(e=>{null!==e&&n.set(t,e)})).next(()=>n)}saveOverlays(e,t,n){const r=[];return n.forEach((n,s)=>{const i=new Zo(t,s);r.push(this.St(e,i))}),Sn.waitFor(r)}removeOverlaysForBatchId(e,t,n){const r=new Set;t.forEach(e=>r.add(Kn(e.getCollectionPath())));const s=[];return r.forEach(t=>{const r=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,n+1],!1,!0);s.push(bc(e).Z(jr,r))}),Sn.waitFor(s)}getOverlaysForCollection(e,t,n){const r=ho(),s=Kn(t),i=IDBKeyRange.bound([this.userId,s,n],[this.userId,s,Number.POSITIVE_INFINITY],!0);return bc(e).J(jr,i).next(e=>{for(const t of e){const e=fc(this.serializer,t);r.set(e.getKey(),e)}return r})}getOverlaysForCollectionGroup(e,t,n,r){const s=ho();let i;const o=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,Number.POSITIVE_INFINITY],!0);return bc(e).ee({index:$r,range:o},(e,t,n)=>{const o=fc(this.serializer,t);s.size()<r||o.largestBatchId===i?(s.set(o.getKey(),o),i=o.largestBatchId):n.done()}).next(()=>s)}St(e,t){return bc(e).put(function(e,t,n){const[r,s,i]=mc(t,n.mutation.key);return{userId:t,collectionPath:s,documentId:i,collectionGroup:n.mutation.key.getCollectionGroup(),largestBatchId:n.largestBatchId,overlayMutation:ja(e.yt,n.mutation)}}(this.serializer,this.userId,t))}}function bc(e){return ns(e,Ur)}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ic{bt(e){return ns(e,Kr)}getSessionToken(e){return this.bt(e).get("sessionToken").next(e=>{const t=e?.value;return t?gs.fromUint8Array(t):gs.EMPTY_BYTE_STRING})}setSessionToken(e,t){return this.bt(e).put({name:"sessionToken",value:t.toUint8Array()})}}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _c{constructor(){}Dt(e,t){this.Ct(e,t),t.vt()}Ct(e,t){if("nullValue"in e)this.Ft(t,5);else if("booleanValue"in e)this.Ft(t,10),t.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(t,15),t.Mt(ws(e.integerValue));else if("doubleValue"in e){const n=ws(e.doubleValue);isNaN(n)?this.Ft(t,13):(this.Ft(t,15),zn(n)?t.Mt(0):t.Mt(n))}else if("timestampValue"in e){let n=e.timestampValue;this.Ft(t,20),"string"==typeof n&&(n=ys(n)),t.xt(`${n.seconds||""}`),t.Mt(n.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,t),this.Nt(t);else if("bytesValue"in e)this.Ft(t,30),t.Bt(vs(e.bytesValue)),this.Nt(t);else if("referenceValue"in e)this.Lt(e.referenceValue,t);else if("geoPointValue"in e){const n=e.geoPointValue;this.Ft(t,45),t.Mt(n.latitude||0),t.Mt(n.longitude||0)}else"mapValue"in e?Zs(e)?this.Ft(t,Number.MAX_SAFE_INTEGER):Xs(e)?this.kt(e.mapValue,t):(this.qt(e.mapValue,t),this.Nt(t)):"arrayValue"in e?(this.Qt(e.arrayValue,t),this.Nt(t)):vt(19022,{$t:e})}Ot(e,t){this.Ft(t,25),this.Ut(e,t)}Ut(e,t){t.xt(e)}qt(e,t){const n=e.fields||{};this.Ft(t,55);for(const r of Object.keys(n))this.Ot(r,t),this.Ct(n[r],t)}kt(e,t){const n=e.fields||{};this.Ft(t,53);const r=Os,s=n[r].arrayValue?.values?.length||0;this.Ft(t,15),t.Mt(ws(s)),this.Ot(r,t),this.Ct(n[r],t)}Qt(e,t){const n=e.values||[];this.Ft(t,50);for(const r of n)this.Ct(r,t)}Lt(e,t){this.Ft(t,37),Ht.fromName(e).path.forEach(e=>{this.Ft(t,60),this.Ut(e,t)})}Ft(e,t){e.Mt(t)}Nt(e){e.Mt(2)}}_c.Kt=new _c;
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Ec=255;function Tc(e){if(0===e)return 8;let t=0;return e>>4||(t+=4,e<<=4),e>>6||(t+=2,e<<=2),e>>7||(t+=1),t}function Sc(e){const t=64-function(e){let t=0;for(let n=0;n<8;++n){const r=Tc(255&e[n]);if(t+=r,8!==r)break}return t}(e);return Math.ceil(t/8)}class Cc{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Wt(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Gt(n.value),n=t.next();this.zt()}jt(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Jt(n.value),n=t.next();this.Ht()}Yt(e){for(const t of e){const e=t.charCodeAt(0);if(e<128)this.Gt(e);else if(e<2048)this.Gt(960|e>>>6),this.Gt(128|63&e);else if(t<"\ud800"||"\udbff"<t)this.Gt(480|e>>>12),this.Gt(128|63&e>>>6),this.Gt(128|63&e);else{const e=t.codePointAt(0);this.Gt(240|e>>>18),this.Gt(128|63&e>>>12),this.Gt(128|63&e>>>6),this.Gt(128|63&e)}}this.zt()}Zt(e){for(const t of e){const e=t.charCodeAt(0);if(e<128)this.Jt(e);else if(e<2048)this.Jt(960|e>>>6),this.Jt(128|63&e);else if(t<"\ud800"||"\udbff"<t)this.Jt(480|e>>>12),this.Jt(128|63&e>>>6),this.Jt(128|63&e);else{const e=t.codePointAt(0);this.Jt(240|e>>>18),this.Jt(128|63&e>>>12),this.Jt(128|63&e>>>6),this.Jt(128|63&e)}}this.Ht()}Xt(e){const t=this.en(e),n=Sc(t);this.tn(1+n),this.buffer[this.position++]=255&n;for(let r=t.length-n;r<t.length;++r)this.buffer[this.position++]=255&t[r]}nn(e){const t=this.en(e),n=Sc(t);this.tn(1+n),this.buffer[this.position++]=~(255&n);for(let r=t.length-n;r<t.length;++r)this.buffer[this.position++]=~(255&t[r])}rn(){this.sn(Ec),this.sn(255)}_n(){this.an(Ec),this.an(255)}reset(){this.position=0}seed(e){this.tn(e.length),this.buffer.set(e,this.position),this.position+=e.length}un(){return this.buffer.slice(0,this.position)}en(e){const t=function(e){const t=new DataView(new ArrayBuffer(8));return t.setFloat64(0,e,!1),new Uint8Array(t.buffer)}(e),n=!!(128&t[0]);t[0]^=n?255:128;for(let r=1;r<t.length;++r)t[r]^=n?255:0;return t}Gt(e){const t=255&e;0===t?(this.sn(0),this.sn(255)):t===Ec?(this.sn(Ec),this.sn(0)):this.sn(t)}Jt(e){const t=255&e;0===t?(this.an(0),this.an(255)):t===Ec?(this.an(Ec),this.an(0)):this.an(e)}zt(){this.sn(0),this.sn(1)}Ht(){this.an(0),this.an(1)}sn(e){this.tn(1),this.buffer[this.position++]=e}an(e){this.tn(1),this.buffer[this.position++]=~e}tn(e){const t=e+this.position;if(t<=this.buffer.length)return;let n=2*this.buffer.length;n<t&&(n=t);const r=new Uint8Array(n);r.set(this.buffer),this.buffer=r}}class Ac{constructor(e){this.cn=e}Bt(e){this.cn.Wt(e)}xt(e){this.cn.Yt(e)}Mt(e){this.cn.Xt(e)}vt(){this.cn.rn()}}class xc{constructor(e){this.cn=e}Bt(e){this.cn.jt(e)}xt(e){this.cn.Zt(e)}Mt(e){this.cn.nn(e)}vt(){this.cn._n()}}class Dc{constructor(){this.cn=new Cc,this.ln=new Ac(this.cn),this.hn=new xc(this.cn)}seed(e){this.cn.seed(e)}Pn(e){return 0===e?this.ln:this.hn}un(){return this.cn.un()}reset(){this.cn.reset()}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nc{constructor(e,t,n,r){this.Tn=e,this.In=t,this.En=n,this.dn=r}An(){const e=this.dn.length,t=0===e||255===this.dn[e-1]?e+1:e,n=new Uint8Array(t);return n.set(this.dn,0),t!==e?n.set([0],this.dn.length):++n[n.length-1],new Nc(this.Tn,this.In,this.En,n)}Rn(e,t,n){return{indexId:this.Tn,uid:e,arrayValue:Mc(this.En),directionalValue:Mc(this.dn),orderedDocumentKey:Mc(t),documentKey:n.path.toArray()}}Vn(e,t,n){const r=this.Rn(e,t,n);return[r.indexId,r.uid,r.arrayValue,r.directionalValue,r.orderedDocumentKey,r.documentKey]}}function kc(e,t){let n=e.Tn-t.Tn;return 0!==n?n:(n=Rc(e.En,t.En),0!==n?n:(n=Rc(e.dn,t.dn),0!==n?n:Ht.comparator(e.In,t.In)))}function Rc(e,t){for(let n=0;n<e.length&&n<t.length;++n){const r=e[n]-t[n];if(0!==r)return r}return e.length-t.length}function Mc(e){return v()?function(e){let t="";for(let n=0;n<e.length;n++)t+=String.fromCharCode(e[n]);return t}(e):e}function Oc(e){return"string"!=typeof e?e:function(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e)}class Pc{constructor(e){this.mn=new hs((e,t)=>Qt.comparator(e.field,t.field)),this.collectionId=null!=e.collectionGroup?e.collectionGroup:e.path.lastSegment(),this.fn=e.orderBy,this.gn=[];for(const t of e.filters){const e=t;e.isInequality()?this.mn=this.mn.add(e):this.gn.push(e)}}get pn(){return this.mn.size>1}yn(e){if(It(e.collectionGroup===this.collectionId,49279),this.pn)return!1;const t=dn(e);if(void 0!==t&&!this.wn(t))return!1;const n=fn(e);let r=new Set,s=0,i=0;for(;s<n.length&&this.wn(n[s]);++s)r=r.add(n[s].fieldPath.canonicalString());if(s===n.length)return!0;if(this.mn.size>0){const e=this.mn.getIterator().getNext();if(!r.has(e.field.canonicalString())){const t=n[s];if(!this.Sn(e,t)||!this.bn(this.fn[i++],t))return!1}++s}for(;s<n.length;++s){const e=n[s];if(i>=this.fn.length||!this.bn(this.fn[i++],e))return!1}return!0}Dn(){if(this.pn)return null;let e=new hs(Qt.comparator);const t=[];for(const n of this.gn)if(!n.field.isKeyField())if("array-contains"===n.op||"array-contains-any"===n.op)t.push(new gn(n.field,2));else{if(e.has(n.field))continue;e=e.add(n.field),t.push(new gn(n.field,0))}for(const n of this.fn)n.field.isKeyField()||e.has(n.field)||(e=e.add(n.field),t.push(new gn(n.field,"asc"===n.dir?0:1)));return new ln(ln.UNKNOWN_ID,this.collectionId,t,yn.empty())}wn(e){for(const t of this.gn)if(this.Sn(t,e))return!0;return!1}Sn(e,t){if(void 0===e||!e.field.isEqual(t.fieldPath))return!1;const n="array-contains"===e.op||"array-contains-any"===e.op;return 2===t.kind===n}bn(e,t){return!!e.field.isEqual(t.fieldPath)&&(0===t.kind&&"asc"===e.dir||1===t.kind&&"desc"===e.dir)}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lc(e){if(It(e instanceof mi||e instanceof gi,20012),e instanceof mi){if(e instanceof Di){const t=e.value.arrayValue?.values?.map(t=>mi.create(e.field,"==",t))||[];return gi.create(t,"or")}return e}const t=e.filters.map(e=>Lc(e));return gi.create(t,e.op)}function Fc(e){if(0===e.getFilters().length)return[];const t=qc(Lc(e));return It(Uc(t),7391),Vc(t)||Bc(t)?[t]:t.getFilters()}function Vc(e){return e instanceof mi}function Bc(e){return e instanceof gi&&wi(e)}function Uc(e){return Vc(e)||Bc(e)||function(e){if(e instanceof gi&&yi(e)){for(const t of e.getFilters())if(!Vc(t)&&!Bc(t))return!1;return!0}return!1}(e)}function qc(e){if(It(e instanceof mi||e instanceof gi,34018),e instanceof mi)return e;if(1===e.filters.length)return qc(e.filters[0]);const t=e.filters.map(e=>qc(e));let n=gi.create(t,e.op);return n=$c(n),Uc(n)?n:(It(n instanceof gi,64498),It(pi(n),40251),It(n.filters.length>1,57927),n.filters.reduce((e,t)=>jc(e,t)))}function jc(e,t){let n;return It(e instanceof mi||e instanceof gi,38388),It(t instanceof mi||t instanceof gi,25473),n=e instanceof mi?t instanceof mi?function(e,t){return gi.create([e,t],"and")}(e,t):zc(e,t):t instanceof mi?zc(t,e):function(e,t){if(It(e.filters.length>0&&t.filters.length>0,48005),pi(e)&&pi(t))return _i(e,t.getFilters());const n=yi(e)?e:t,r=yi(e)?t:e,s=n.filters.map(e=>jc(e,r));return gi.create(s,"or")}(e,t),$c(n)}function zc(e,t){if(pi(t))return _i(t,e.getFilters());{const n=t.filters.map(t=>jc(e,t));return gi.create(n,"or")}}function $c(e){if(It(e instanceof mi||e instanceof gi,11850),e instanceof mi)return e;const t=e.getFilters();if(1===t.length)return $c(t[0]);if(vi(e))return e;const n=t.map(e=>$c(e)),r=[];return n.forEach(t=>{t instanceof mi?r.push(t):t instanceof gi&&(t.op===e.op?r.push(...t.filters):r.push(t))}),1===r.length?r[0]:gi.create(r,e.op)
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class Gc{constructor(){this.Cn=new Kc}addToCollectionParentIndex(e,t){return this.Cn.add(t),Sn.resolve()}getCollectionParents(e,t){return Sn.resolve(this.Cn.getEntries(t))}addFieldIndex(e,t){return Sn.resolve()}deleteFieldIndex(e,t){return Sn.resolve()}deleteAllFieldIndexes(e){return Sn.resolve()}createTargetIndexes(e,t){return Sn.resolve()}getDocumentsMatchingTarget(e,t){return Sn.resolve(null)}getIndexType(e,t){return Sn.resolve(0)}getFieldIndexes(e,t){return Sn.resolve([])}getNextCollectionGroupToUpdate(e){return Sn.resolve(null)}getMinOffset(e,t){return Sn.resolve(bn.min())}getMinOffsetFromCollectionGroup(e,t){return Sn.resolve(bn.min())}updateCollectionGroup(e,t,n){return Sn.resolve()}updateIndexEntries(e,t){return Sn.resolve()}}class Kc{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t]||new hs(Gt.comparator),s=!r.has(n);return this.index[t]=r.add(n),s}has(e){const t=e.lastSegment(),n=e.popLast(),r=this.index[t];return r&&r.has(n)}getEntries(e){return(this.index[e]||new hs(Gt.comparator)).toArray()}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qc="IndexedDbIndexManager",Hc=new Uint8Array(0);class Wc{constructor(e,t){this.databaseId=t,this.vn=new Kc,this.Fn=new so(e=>Oi(e),(e,t)=>Pi(e,t)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.vn.has(t)){const n=t.lastSegment(),r=t.popLast();e.addOnCommittedListener(()=>{this.vn.add(t)});const s={collectionId:n,parent:Kn(r)};return Jc(e).put(s)}return Sn.resolve()}getCollectionParents(e,t){const n=[],r=IDBKeyRange.bound([t,""],[jt(t),""],!1,!0);return Jc(e).J(r).next(e=>{for(const r of e){if(r.collectionId!==t)break;n.push(Wn(r.parent))}return n})}addFieldIndex(e,t){const n=Yc(e),r=function(e){return{indexId:e.indexId,collectionGroup:e.collectionGroup,fields:e.fields.map(e=>[e.fieldPath.canonicalString(),e.kind])}}(t);delete r.indexId;const s=n.add(r);if(t.indexState){const n=Zc(e);return s.next(e=>{n.put(gc(e,this.uid,t.indexState.sequenceNumber,t.indexState.offset))})}return s.next()}deleteFieldIndex(e,t){const n=Yc(e),r=Zc(e),s=Xc(e);return n.delete(t.indexId).next(()=>r.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}deleteAllFieldIndexes(e){const t=Yc(e),n=Xc(e),r=Zc(e);return t.Z().next(()=>n.Z()).next(()=>r.Z())}createTargetIndexes(e,t){return Sn.forEach(this.Mn(t),t=>this.getIndexType(e,t).next(n=>{if(0===n||1===n){const n=new Pc(t).Dn();if(null!=n)return this.addFieldIndex(e,n)}}))}getDocumentsMatchingTarget(e,t){const n=Xc(e);let r=!0;const s=new Map;return Sn.forEach(this.Mn(t),t=>this.xn(e,t).next(e=>{r&&(r=!!e),s.set(t,e)})).next(()=>{if(r){let e=po();const r=[];return Sn.forEach(s,(s,i)=>{gt(Qc,`Using index ${function(e){return`id=${e.indexId}|cg=${e.collectionGroup}|f=${e.fields.map(e=>`${e.fieldPath}:${e.kind}`).join(",")}`}(s)} to execute ${Oi(t)}`);const o=function(e,t){const n=dn(t);if(void 0===n)return null;for(const r of Fi(e,n.fieldPath))switch(r.op){case"array-contains-any":return r.value.arrayValue.values||[];case"array-contains":return[r.value]}return null}(i,s),a=function(e,t){const n=new Map;for(const r of fn(t))for(const t of Fi(e,r.fieldPath))switch(t.op){case"==":case"in":n.set(r.fieldPath.canonicalString(),t.value);break;case"not-in":case"!=":return n.set(r.fieldPath.canonicalString(),t.value),Array.from(n.values())}return null}(i,s),c=function(e,t){const n=[];let r=!0;for(const s of fn(t)){const t=0===s.kind?Vi(e,s.fieldPath,e.startAt):Bi(e,s.fieldPath,e.startAt);n.push(t.value),r&&(r=t.inclusive)}return new ci(n,r)}(i,s),u=function(e,t){const n=[];let r=!0;for(const s of fn(t)){const t=0===s.kind?Bi(e,s.fieldPath,e.endAt):Vi(e,s.fieldPath,e.endAt);n.push(t.value),r&&(r=t.inclusive)}return new ci(n,r)}(i,s),h=this.On(s,i,c),l=this.On(s,i,u),d=this.Nn(s,i,a),f=this.Bn(s.indexId,o,h,c.inclusive,l,u.inclusive,d);return Sn.forEach(f,s=>n.Y(s,t.limit).next(t=>{t.forEach(t=>{const n=Ht.fromSegments(t.documentKey);e.has(n)||(e=e.add(n),r.push(n))})}))}).next(()=>r)}return Sn.resolve(null)})}Mn(e){let t=this.Fn.get(e);return t||(t=0===e.filters.length?[e]:Fc(gi.create(e.filters,"and")).map(t=>Mi(e.path,e.collectionGroup,e.orderBy,t.getFilters(),e.limit,e.startAt,e.endAt)),this.Fn.set(e,t),t)}Bn(e,t,n,r,s,i,o){const a=(null!=t?t.length:1)*Math.max(n.length,s.length),c=a/(null!=t?t.length:1),u=[];for(let h=0;h<a;++h){const a=t?this.Ln(t[h/c]):Hc,l=this.kn(e,a,n[h%c],r),d=this.qn(e,a,s[h%c],i),f=o.map(t=>this.kn(e,a,t,!0));u.push(...this.createRange(l,d,f))}return u}kn(e,t,n,r){const s=new Nc(e,Ht.empty(),t,n);return r?s:s.An()}qn(e,t,n,r){const s=new Nc(e,Ht.empty(),t,n);return r?s.An():s}xn(e,t){const n=new Pc(t),r=null!=t.collectionGroup?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,r).next(e=>{let t=null;for(const r of e)n.yn(r)&&(!t||r.fields.length>t.fields.length)&&(t=r);return t})}getIndexType(e,t){let n=2;const r=this.Mn(t);return Sn.forEach(r,t=>this.xn(e,t).next(e=>{e?0!==n&&e.fields.length<function(e){let t=new hs(Qt.comparator),n=!1;for(const r of e.filters)for(const e of r.getFlattenedFilters())e.field.isKeyField()||("array-contains"===e.op||"array-contains-any"===e.op?n=!0:t=t.add(e.field));for(const r of e.orderBy)r.field.isKeyField()||(t=t.add(r.field));return t.size+(n?1:0)}(t)&&(n=1):n=0})).next(()=>function(e){return null!==e.limit}(t)&&r.length>1&&2===n?1:n)}Qn(e,t){const n=new Dc;for(const r of fn(e)){const e=t.data.field(r.fieldPath);if(null==e)return null;const s=n.Pn(r.kind);_c.Kt.Dt(e,s)}return n.un()}Ln(e){const t=new Dc;return _c.Kt.Dt(e,t.Pn(0)),t.un()}$n(e,t){const n=new Dc;return _c.Kt.Dt(Gs(this.databaseId,t),n.Pn(function(e){const t=fn(e);return 0===t.length?0:t[t.length-1].kind}(e))),n.un()}Nn(e,t,n){if(null===n)return[];let r=[];r.push(new Dc);let s=0;for(const i of fn(e)){const e=n[s++];for(const n of r)if(this.Un(t,i.fieldPath)&&Qs(e))r=this.Kn(r,i,e);else{const t=n.Pn(i.kind);_c.Kt.Dt(e,t)}}return this.Wn(r)}On(e,t,n){return this.Nn(e,t,n.position)}Wn(e){const t=[];for(let n=0;n<e.length;++n)t[n]=e[n].un();return t}Kn(e,t,n){const r=[...e],s=[];for(const i of n.arrayValue.values||[])for(const e of r){const n=new Dc;n.seed(e.un()),_c.Kt.Dt(i,n.Pn(t.kind)),s.push(n)}return s}Un(e,t){return!!e.filters.find(e=>e instanceof mi&&e.field.isEqual(t)&&("in"===e.op||"not-in"===e.op))}getFieldIndexes(e,t){const n=Yc(e),r=Zc(e);return(t?n.J(kr,IDBKeyRange.bound(t,t)):n.J()).next(e=>{const t=[];return Sn.forEach(e,e=>r.get([e.indexId,this.uid]).next(n=>{t.push(function(e,t){const n=t?new yn(t.sequenceNumber,new bn(cc(t.readTime),new Ht(Wn(t.documentKey)),t.largestBatchId)):yn.empty(),r=e.fields.map(([e,t])=>new gn(Qt.fromServerFormat(e),t));return new ln(e.indexId,e.collectionGroup,r,n)}(e,n))})).next(()=>t)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(e=>0===e.length?null:(e.sort((e,t)=>{const n=e.indexState.sequenceNumber-t.indexState.sequenceNumber;return 0!==n?n:Lt(e.collectionGroup,t.collectionGroup)}),e[0].collectionGroup))}updateCollectionGroup(e,t,n){const r=Yc(e),s=Zc(e);return this.Gn(e).next(e=>r.J(kr,IDBKeyRange.bound(t,t)).next(t=>Sn.forEach(t,t=>s.put(gc(t.indexId,this.uid,e,n)))))}updateIndexEntries(e,t){const n=new Map;return Sn.forEach(t,(t,r)=>{const s=n.get(t.collectionGroup);return(s?Sn.resolve(s):this.getFieldIndexes(e,t.collectionGroup)).next(s=>(n.set(t.collectionGroup,s),Sn.forEach(s,n=>this.zn(e,t,n).next(t=>{const s=this.jn(r,n);return t.isEqual(s)?Sn.resolve():this.Jn(e,r,n,t,s)}))))})}Hn(e,t,n,r){return Xc(e).put(r.Rn(this.uid,this.$n(n,t.key),t.key))}Yn(e,t,n,r){return Xc(e).delete(r.Vn(this.uid,this.$n(n,t.key),t.key))}zn(e,t,n){const r=Xc(e);let s=new hs(kc);return r.ee({index:Vr,range:IDBKeyRange.only([n.indexId,this.uid,Mc(this.$n(n,t))])},(e,r)=>{s=s.add(new Nc(n.indexId,t,Oc(r.arrayValue),Oc(r.directionalValue)))}).next(()=>s)}jn(e,t){let n=new hs(kc);const r=this.Qn(t,e);if(null==r)return n;const s=dn(t);if(null!=s){const i=e.data.field(s.fieldPath);if(Qs(i))for(const s of i.arrayValue.values||[])n=n.add(new Nc(t.indexId,e.key,this.Ln(s),r))}else n=n.add(new Nc(t.indexId,e.key,Hc,r));return n}Jn(e,t,n,r,s){gt(Qc,"Updating index entries for document '%s'",t.key);const i=[];return function(e,t,n,r,s){const i=e.getIterator(),o=t.getIterator();let a=ds(i),c=ds(o);for(;a||c;){let e=!1,t=!1;if(a&&c){const r=n(a,c);r<0?t=!0:r>0&&(e=!0)}else null!=a?t=!0:e=!0;e?(r(c),c=ds(o)):t?(s(a),a=ds(i)):(a=ds(i),c=ds(o))}}(r,s,kc,r=>{i.push(this.Hn(e,t,n,r))},r=>{i.push(this.Yn(e,t,n,r))}),Sn.waitFor(i)}Gn(e){let t=1;return Zc(e).ee({index:Or,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(e,n,r)=>{r.done(),t=n.sequenceNumber+1}).next(()=>t)}createRange(e,t,n){n=n.sort((e,t)=>kc(e,t)).filter((e,t,n)=>!t||0!==kc(e,n[t-1]));const r=[];r.push(e);for(const i of n){const n=kc(i,e),s=kc(i,t);if(0===n)r[0]=e.An();else if(n>0&&s<0)r.push(i),r.push(i.An());else if(s>0)break}r.push(t);const s=[];for(let i=0;i<r.length;i+=2){if(this.Zn(r[i],r[i+1]))return[];const e=r[i].Vn(this.uid,Hc,Ht.empty()),t=r[i+1].Vn(this.uid,Hc,Ht.empty());s.push(IDBKeyRange.bound(e,t))}return s}Zn(e,t){return kc(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(eu)}getMinOffset(e,t){return Sn.mapArray(this.Mn(t),t=>this.xn(e,t).next(e=>e||vt(44426))).next(eu)}}function Jc(e){return ns(e,Sr)}function Xc(e){return ns(e,Lr)}function Yc(e){return ns(e,Nr)}function Zc(e){return ns(e,Rr)}function eu(e){It(0!==e.length,28825);let t=e[0].indexState.offset,n=t.largestBatchId;for(let r=1;r<e.length;r++){const s=e[r].indexState.offset;In(s,t)<0&&(t=s),n<s.largestBatchId&&(n=s.largestBatchId)}return new bn(t.readTime,t.documentKey,n)}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tu={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},nu=41943040;class ru{static withCacheSize(e){return new ru(e,ru.DEFAULT_COLLECTION_PERCENTILE,ru.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function su(e,t,n){const r=e.store(er),s=e.store(ar),i=[],o=IDBKeyRange.only(n.batchId);let a=0;const c=r.ee({range:o},(e,t,n)=>(a++,n.delete()));i.push(c.next(()=>{It(1===a,47070,{batchId:n.batchId})}));const u=[];for(const h of n.mutations){const e=ir(t,h.key.path,n.batchId);i.push(s.delete(e)),u.push(h.key)}return Sn.waitFor(i).next(()=>u)}function iu(e){if(!e)return 0;let t;if(e.document)t=e.document;else if(e.unknownDocument)t=e.unknownDocument;else{if(!e.noDocument)throw vt(14731);t=e.noDocument}return JSON.stringify(t).length}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ru.DEFAULT_COLLECTION_PERCENTILE=10,ru.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,ru.DEFAULT=new ru(nu,ru.DEFAULT_COLLECTION_PERCENTILE,ru.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),ru.DISABLED=new ru(-1,0,0);class ou{constructor(e,t,n,r){this.userId=e,this.serializer=t,this.indexManager=n,this.referenceDelegate=r,this.Xn={}}static wt(e,t,n,r){It(""!==e.uid,64387);const s=e.isAuthenticated()?e.uid:"";return new ou(s,t,n,r)}checkEmpty(e){let t=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return cu(e).ee({index:nr,range:n},(e,n,r)=>{t=!1,r.done()}).next(()=>t)}addMutationBatch(e,t,n,r){const s=uu(e),i=cu(e);return i.add({}).next(o=>{It("number"==typeof o,49019);const a=new Xo(o,t,n,r),c=function(e,t,n){const r=n.baseMutations.map(t=>ja(e.yt,t)),s=n.mutations.map(t=>ja(e.yt,t));return{userId:t,batchId:n.batchId,localWriteTimeMs:n.localWriteTime.toMillis(),baseMutations:r,mutations:s}}(this.serializer,this.userId,a),u=[];let h=new hs((e,t)=>Lt(e.canonicalString(),t.canonicalString()));for(const e of r){const t=ir(this.userId,e.key.path,o);h=h.add(e.key.path.popLast()),u.push(i.put(c)),u.push(s.put(t,or))}return h.forEach(t=>{u.push(this.indexManager.addToCollectionParentIndex(e,t))}),e.addOnCommittedListener(()=>{this.Xn[o]=a.keys()}),Sn.waitFor(u).next(()=>a)})}lookupMutationBatch(e,t){return cu(e).get(t).next(e=>e?(It(e.userId===this.userId,48,"Unexpected user for mutation batch",{userId:e.userId,batchId:t}),uc(this.serializer,e)):null)}er(e,t){return this.Xn[t]?Sn.resolve(this.Xn[t]):this.lookupMutationBatch(e,t).next(e=>{if(e){const n=e.keys();return this.Xn[t]=n,n}return null})}getNextMutationBatchAfterBatchId(e,t){const n=t+1,r=IDBKeyRange.lowerBound([this.userId,n]);let s=null;return cu(e).ee({index:nr,range:r},(e,t,r)=>{t.userId===this.userId&&(It(t.batchId>=n,47524,{tr:n}),s=uc(this.serializer,t)),r.done()}).next(()=>s)}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=qn;return cu(e).ee({index:nr,range:t,reverse:!0},(e,t,r)=>{n=t.batchId,r.done()}).next(()=>n)}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,qn],[this.userId,Number.POSITIVE_INFINITY]);return cu(e).J(nr,t).next(e=>e.map(e=>uc(this.serializer,e)))}getAllMutationBatchesAffectingDocumentKey(e,t){const n=sr(this.userId,t.path),r=IDBKeyRange.lowerBound(n),s=[];return uu(e).ee({range:r},(n,r,i)=>{const[o,a,c]=n,u=Wn(a);if(o===this.userId&&t.path.isEqual(u))return cu(e).get(c).next(e=>{if(!e)throw vt(61480,{nr:n,batchId:c});It(e.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:e.userId,batchId:c}),s.push(uc(this.serializer,e))});i.done()}).next(()=>s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new hs(Lt);const r=[];return t.forEach(t=>{const s=sr(this.userId,t.path),i=IDBKeyRange.lowerBound(s),o=uu(e).ee({range:i},(e,r,s)=>{const[i,o,a]=e,c=Wn(o);i===this.userId&&t.path.isEqual(c)?n=n.add(a):s.done()});r.push(o)}),Sn.waitFor(r).next(()=>this.rr(e,n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,r=n.length+1,s=sr(this.userId,n),i=IDBKeyRange.lowerBound(s);let o=new hs(Lt);return uu(e).ee({range:i},(e,t,s)=>{const[i,a,c]=e,u=Wn(a);i===this.userId&&n.isPrefixOf(u)?u.length===r&&(o=o.add(c)):s.done()}).next(()=>this.rr(e,o))}rr(e,t){const n=[],r=[];return t.forEach(t=>{r.push(cu(e).get(t).next(e=>{if(null===e)throw vt(35274,{batchId:t});It(e.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:e.userId,batchId:t}),n.push(uc(this.serializer,e))}))}),Sn.waitFor(r).next(()=>n)}removeMutationBatch(e,t){return su(e.le,this.userId,t).next(n=>(e.addOnCommittedListener(()=>{this.ir(t.batchId)}),Sn.forEach(n,t=>this.referenceDelegate.markPotentiallyOrphaned(e,t))))}ir(e){delete this.Xn[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return Sn.resolve();const n=IDBKeyRange.lowerBound(function(e){return[e]}(this.userId)),r=[];return uu(e).ee({range:n},(e,t,n)=>{if(e[0]===this.userId){const t=Wn(e[1]);r.push(t)}else n.done()}).next(()=>{It(0===r.length,56720,{sr:r.map(e=>e.canonicalString())})})})}containsKey(e,t){return au(e,this.userId,t)}_r(e){return hu(e).get(this.userId).next(e=>e||{userId:this.userId,lastAcknowledgedBatchId:qn,lastStreamToken:""})}}function au(e,t,n){const r=sr(t,n.path),s=r[1],i=IDBKeyRange.lowerBound(r);let o=!1;return uu(e).ee({range:i,X:!0},(e,n,r)=>{const[i,a,c]=e;i===t&&a===s&&(o=!0),r.done()}).next(()=>o)}function cu(e){return ns(e,er)}function uu(e){return ns(e,ar)}function hu(e){return ns(e,Zn)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lu{constructor(e){this.ar=e}next(){return this.ar+=2,this.ar}static ur(){return new lu(0)}static cr(){return new lu(-1)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class du{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.lr(e).next(t=>{const n=new lu(t.highestTargetId);return t.highestTargetId=n.next(),this.hr(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.lr(e).next(e=>un.fromTimestamp(new cn(e.lastRemoteSnapshotVersion.seconds,e.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.lr(e).next(e=>e.highestListenSequenceNumber)}setTargetsMetadata(e,t,n){return this.lr(e).next(r=>(r.highestListenSequenceNumber=t,n&&(r.lastRemoteSnapshotVersion=n.toTimestamp()),t>r.highestListenSequenceNumber&&(r.highestListenSequenceNumber=t),this.hr(e,r)))}addTargetData(e,t){return this.Pr(e,t).next(()=>this.lr(e).next(n=>(n.targetCount+=1,this.Tr(t,n),this.hr(e,n))))}updateTargetData(e,t){return this.Pr(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>fu(e).delete(t.targetId)).next(()=>this.lr(e)).next(t=>(It(t.targetCount>0,8065),t.targetCount-=1,this.hr(e,t)))}removeTargets(e,t,n){let r=0;const s=[];return fu(e).ee((i,o)=>{const a=hc(o);a.sequenceNumber<=t&&null===n.get(a.targetId)&&(r++,s.push(this.removeTargetData(e,a)))}).next(()=>Sn.waitFor(s)).next(()=>r)}forEachTarget(e,t){return fu(e).ee((e,n)=>{const r=hc(n);t(r)})}lr(e){return mu(e).get(Er).next(e=>(It(null!==e,2888),e))}hr(e,t){return mu(e).put(Er,t)}Pr(e,t){return fu(e).put(lc(this.serializer,t))}Tr(e,t){let n=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,n=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,n=!0),n}getTargetCount(e){return this.lr(e).next(e=>e.targetCount)}getTargetData(e,t){const n=Oi(t),r=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let s=null;return fu(e).ee({range:r,index:yr},(e,n,r)=>{const i=hc(n);Pi(t,i.target)&&(s=i,r.done())}).next(()=>s)}addMatchingKeys(e,t,n){const r=[],s=gu(e);return t.forEach(t=>{const i=Kn(t.path);r.push(s.put({targetId:n,path:i})),r.push(this.referenceDelegate.addReference(e,n,t))}),Sn.waitFor(r)}removeMatchingKeys(e,t,n){const r=gu(e);return Sn.forEach(t,t=>{const s=Kn(t.path);return Sn.waitFor([r.delete([n,s]),this.referenceDelegate.removeReference(e,n,t)])})}removeMatchingKeysForTargetId(e,t){const n=gu(e),r=IDBKeyRange.bound([t],[t+1],!1,!0);return n.delete(r)}getMatchingKeysForTargetId(e,t){const n=IDBKeyRange.bound([t],[t+1],!1,!0),r=gu(e);let s=po();return r.ee({range:n,X:!0},(e,t,n)=>{const r=Wn(e[1]),i=new Ht(r);s=s.add(i)}).next(()=>s)}containsKey(e,t){const n=Kn(t.path),r=IDBKeyRange.bound([n],[jt(n)],!1,!0);let s=0;return gu(e).ee({index:Ir,X:!0,range:r},([e,t],n,r)=>{0!==e&&(s++,r.done())}).next(()=>s>0)}At(e,t){return fu(e).get(t).next(e=>e?hc(e):null)}}function fu(e){return ns(e,pr)}function mu(e){return ns(e,Tr)}function gu(e){return ns(e,vr)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pu="LruGarbageCollector",yu=1048576;function wu([e,t],[n,r]){const s=Lt(e,n);return 0===s?Lt(t,r):s}class vu{constructor(e){this.Ir=e,this.buffer=new hs(wu),this.Er=0}dr(){return++this.Er}Ar(e){const t=[e,this.dr()];if(this.buffer.size<this.Ir)this.buffer=this.buffer.add(t);else{const e=this.buffer.last();wu(t,e)<0&&(this.buffer=this.buffer.delete(e).add(t))}}get maxValue(){return this.buffer.last()[0]}}class bu{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.Rr=null}start(){-1!==this.garbageCollector.params.cacheSizeCollectionThreshold&&this.Vr(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return null!==this.Rr}Vr(e){gt(pu,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){Rn(e)?gt(pu,"Ignoring IndexedDB error during garbage collection: ",e):await Tn(e)}await this.Vr(3e5)})}}class Iu{constructor(e,t){this.mr=e,this.params=t}calculateTargetCount(e,t){return this.mr.gr(e).next(e=>Math.floor(t/100*e))}nthSequenceNumber(e,t){if(0===t)return Sn.resolve(Un.ce);const n=new vu(t);return this.mr.forEachTarget(e,e=>n.Ar(e.sequenceNumber)).next(()=>this.mr.pr(e,e=>n.Ar(e))).next(()=>n.maxValue)}removeTargets(e,t,n){return this.mr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.mr.removeOrphanedDocuments(e,t)}collect(e,t){return-1===this.params.cacheSizeCollectionThreshold?(gt("LruGarbageCollector","Garbage collection skipped; disabled"),Sn.resolve(tu)):this.getCacheSize(e).next(n=>n<this.params.cacheSizeCollectionThreshold?(gt("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),tu):this.yr(e,t))}getCacheSize(e){return this.mr.getCacheSize(e)}yr(e,t){let n,r,s,i,o,a,c;const u=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(t=>(t>this.params.maximumSequenceNumbersToCollect?(gt("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t}`),r=this.params.maximumSequenceNumbersToCollect):r=t,i=Date.now(),this.nthSequenceNumber(e,r))).next(r=>(n=r,o=Date.now(),this.removeTargets(e,n,t))).next(t=>(s=t,a=Date.now(),this.removeOrphanedDocuments(e,n))).next(e=>(c=Date.now(),mt()<=k.DEBUG&&gt("LruGarbageCollector",`LRU Garbage Collection\n\tCounted targets in ${i-u}ms\n\tDetermined least recently used ${r} in `+(o-i)+"ms\n"+`\tRemoved ${s} targets in `+(a-o)+"ms\n"+`\tRemoved ${e} documents in `+(c-a)+"ms\n"+`Total Duration: ${c-u}ms`),Sn.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:e})))}}function _u(e,t){return new Iu(e,t)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eu{constructor(e,t){this.db=e,this.garbageCollector=_u(this,t)}gr(e){const t=this.wr(e);return this.db.getTargetCache().getTargetCount(e).next(e=>t.next(t=>e+t))}wr(e){let t=0;return this.pr(e,e=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}pr(e,t){return this.Sr(e,(e,n)=>t(n))}addReference(e,t,n){return Tu(e,n)}removeReference(e,t,n){return Tu(e,n)}removeTargets(e,t,n){return this.db.getTargetCache().removeTargets(e,t,n)}markPotentiallyOrphaned(e,t){return Tu(e,t)}br(e,t){return function(e,t){let n=!1;return hu(e).te(r=>au(e,r,t).next(e=>(e&&(n=!0),Sn.resolve(!e)))).next(()=>n)}(e,t)}removeOrphanedDocuments(e,t){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),r=[];let s=0;return this.Sr(e,(i,o)=>{if(o<=t){const t=this.br(e,i).next(t=>{if(!t)return s++,n.getEntry(e,i).next(()=>(n.removeEntry(i,un.min()),gu(e).delete(function(e){return[0,Kn(e.path)]}(i))))});r.push(t)}}).next(()=>Sn.waitFor(r)).next(()=>n.apply(e)).next(()=>s)}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,n)}updateLimboDocument(e,t){return Tu(e,t)}Sr(e,t){const n=gu(e);let r,s=Un.ce;return n.ee({index:Ir},([e,n],{path:i,sequenceNumber:o})=>{0===e?(s!==Un.ce&&t(new Ht(Wn(r)),s),s=o,r=i):s=Un.ce}).next(()=>{s!==Un.ce&&t(new Ht(Wn(r)),s)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function Tu(e,t){return gu(e).put(function(e,t){return{targetId:0,path:Kn(e.path),sequenceNumber:t}}(t,e.currentSequenceNumber))}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Su{constructor(){this.changes=new so(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,ai.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return void 0!==n?Sn.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cu{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,n){return Nu(e).put(n)}removeEntry(e,t,n){return Nu(e).delete(function(e,t){const n=e.path.toArray();return[n.slice(0,n.length-2),n[n.length-2],oc(t),n[n.length-1]]}(t,n))}updateMetadata(e,t){return this.getMetadata(e).next(n=>(n.byteSize+=t,this.Dr(e,n)))}getEntry(e,t){let n=ai.newInvalidDocument(t);return Nu(e).ee({index:hr,range:IDBKeyRange.only(ku(t))},(e,r)=>{n=this.Cr(t,r)}).next(()=>n)}vr(e,t){let n={size:0,document:ai.newInvalidDocument(t)};return Nu(e).ee({index:hr,range:IDBKeyRange.only(ku(t))},(e,r)=>{n={document:this.Cr(t,r),size:iu(r)}}).next(()=>n)}getEntries(e,t){let n=oo();return this.Fr(e,t,(e,t)=>{const r=this.Cr(e,t);n=n.insert(e,r)}).next(()=>n)}Mr(e,t){let n=oo(),r=new as(Ht.comparator);return this.Fr(e,t,(e,t)=>{const s=this.Cr(e,t);n=n.insert(e,s),r=r.insert(e,iu(t))}).next(()=>({documents:n,Or:r}))}Fr(e,t,n){if(t.isEmpty())return Sn.resolve();let r=new hs(Mu);t.forEach(e=>r=r.add(e));const s=IDBKeyRange.bound(ku(r.first()),ku(r.last())),i=r.getIterator();let o=i.getNext();return Nu(e).ee({index:hr,range:s},(e,t,r)=>{const s=Ht.fromSegments([...t.prefixPath,t.collectionGroup,t.documentId]);for(;o&&Mu(o,s)<0;)n(o,null),o=i.getNext();o&&o.isEqual(s)&&(n(o,t),o=i.hasNext()?i.getNext():null),o?r.j(ku(o)):r.done()}).next(()=>{for(;o;)n(o,null),o=i.hasNext()?i.getNext():null})}getDocumentsMatchingQuery(e,t,n,r,s){const i=t.path,o=[i.popLast().toArray(),i.lastSegment(),oc(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],a=[i.popLast().toArray(),i.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Nu(e).J(IDBKeyRange.bound(o,a,!0)).next(e=>{s?.incrementDocumentReadCount(e.length);let n=oo();for(const s of e){const e=this.Cr(Ht.fromSegments(s.prefixPath.concat(s.collectionGroup,s.documentId)),s);e.isFoundDocument()&&(eo(t,e)||r.has(e.key))&&(n=n.insert(e.key,e))}return n})}getAllFromCollectionGroup(e,t,n,r){let s=oo();const i=Ru(t,n),o=Ru(t,bn.max());return Nu(e).ee({index:dr,range:IDBKeyRange.bound(i,o,!0)},(e,t,n)=>{const i=this.Cr(Ht.fromSegments(t.prefixPath.concat(t.collectionGroup,t.documentId)),t);s=s.insert(i.key,i),s.size===r&&n.done()}).next(()=>s)}newChangeBuffer(e){return new xu(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(e=>e.byteSize)}getMetadata(e){return Du(e).get(gr).next(e=>(It(!!e,20021),e))}Dr(e,t){return Du(e).put(gr,t)}Cr(e,t){if(t){const e=function(e,t){let n;if(t.document)n=qa(e.yt,t.document,!!t.hasCommittedMutations);else if(t.noDocument){const e=Ht.fromSegments(t.noDocument.path),r=cc(t.noDocument.readTime);n=ai.newNoDocument(e,r),t.hasCommittedMutations&&n.setHasCommittedMutations()}else{if(!t.unknownDocument)return vt(56709);{const e=Ht.fromSegments(t.unknownDocument.path),r=cc(t.unknownDocument.version);n=ai.newUnknownDocument(e,r)}}return t.readTime&&n.setReadTime(function(e){const t=new cn(e[0],e[1]);return un.fromTimestamp(t)}(t.readTime)),n}(this.serializer,t);if(!e.isNoDocument()||!e.version.isEqual(un.min()))return e}return ai.newInvalidDocument(e)}}function Au(e){return new Cu(e)}class xu extends Su{constructor(e,t){super(),this.Nr=e,this.trackRemovals=t,this.Br=new so(e=>e.toString(),(e,t)=>e.isEqual(t))}applyChanges(e){const t=[];let n=0,r=new hs((e,t)=>Lt(e.canonicalString(),t.canonicalString()));return this.changes.forEach((s,i)=>{const o=this.Br.get(s);if(t.push(this.Nr.removeEntry(e,s,o.readTime)),i.isValidDocument()){const a=ic(this.Nr.serializer,i);r=r.add(s.path.popLast());const c=iu(a);n+=c-o.size,t.push(this.Nr.addEntry(e,s,a))}else if(n-=o.size,this.trackRemovals){const n=ic(this.Nr.serializer,i.convertToNoDocument(un.min()));t.push(this.Nr.addEntry(e,s,n))}}),r.forEach(n=>{t.push(this.Nr.indexManager.addToCollectionParentIndex(e,n))}),t.push(this.Nr.updateMetadata(e,n)),Sn.waitFor(t)}getFromCache(e,t){return this.Nr.vr(e,t).next(e=>(this.Br.set(t,{size:e.size,readTime:e.document.readTime}),e.document))}getAllFromCache(e,t){return this.Nr.Mr(e,t).next(({documents:e,Or:t})=>(t.forEach((t,n)=>{this.Br.set(t,{size:n,readTime:e.get(t).readTime})}),e))}}function Du(e){return ns(e,mr)}function Nu(e){return ns(e,cr)}function ku(e){const t=e.path.toArray();return[t.slice(0,t.length-2),t[t.length-2],t[t.length-1]]}function Ru(e,t){const n=t.documentKey.path.toArray();return[e,oc(t.readTime),n.slice(0,n.length-2),n.length>0?n[n.length-1]:""]}function Mu(e,t){const n=e.path.toArray(),r=t.path.toArray();let s=0;for(let i=0;i<n.length-2&&i<r.length-2;++i)if(s=Lt(n[i],r[i]),s)return s;return s=Lt(n.length,r.length),s||(s=Lt(n[n.length-2],r[r.length-2]),s||Lt(n[n.length-1],r[r.length-1])
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */)}class Ou{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pu{constructor(e,t,n,r){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=r}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next(r=>(n=r,this.remoteDocumentCache.getEntry(e,t))).next(e=>(null!==n&&qo(n.mutation,e,fs.empty(),cn.now()),e))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.getLocalViewOfDocuments(e,t,po()).next(()=>t))}getLocalViewOfDocuments(e,t,n=po()){const r=ho();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,n).next(e=>{let t=co();return e.forEach((e,n)=>{t=t.insert(e,n.overlayedDocument)}),t}))}getOverlayedDocuments(e,t){const n=ho();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,po()))}populateOverlays(e,t,n){const r=[];return n.forEach(e=>{t.has(e)||r.push(e)}),this.documentOverlayCache.getOverlays(e,r).next(e=>{e.forEach((e,n)=>{t.set(e,n)})})}computeViews(e,t,n,r){let s=oo();const i=fo(),o=fo();return t.forEach((e,t)=>{const o=n.get(t.key);r.has(t.key)&&(void 0===o||o.mutation instanceof Go)?s=s.insert(t.key,t):void 0!==o?(i.set(t.key,o.mutation.getFieldMask()),qo(o.mutation,t,o.mutation.getFieldMask(),cn.now())):i.set(t.key,fs.empty())}),this.recalculateAndSaveOverlays(e,s).next(e=>(e.forEach((e,t)=>i.set(e,t)),t.forEach((e,t)=>o.set(e,new Ou(t,i.get(e)??null))),o))}recalculateAndSaveOverlays(e,t){const n=fo();let r=new as((e,t)=>e-t),s=po();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(e=>{for(const s of e)s.keys().forEach(e=>{const i=t.get(e);if(null===i)return;let o=n.get(e)||fs.empty();o=s.applyToLocalView(i,o),n.set(e,o);const a=(r.get(s.batchId)||po()).add(e);r=r.insert(s.batchId,a)})}).next(()=>{const i=[],o=r.getReverseIterator();for(;o.hasNext();){const r=o.getNext(),a=r.key,c=r.value,u=lo();c.forEach(e=>{if(!s.has(e)){const r=Bo(t.get(e),n.get(e));null!==r&&u.set(e,r),s=s.add(e)}}),i.push(this.documentOverlayCache.saveOverlays(e,a,u))}return Sn.waitFor(i)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.recalculateAndSaveOverlays(e,t))}getDocumentsMatchingQuery(e,t,n,r){return function(e){return Ht.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):$i(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,r):this.getDocumentsMatchingCollectionQuery(e,t,n,r)}getNextDocuments(e,t,n,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,r).next(s=>{const i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,r-s.size):Sn.resolve(ho());let o=hn,a=s;return i.next(t=>Sn.forEach(t,(t,n)=>(o<n.largestBatchId&&(o=n.largestBatchId),s.get(t)?Sn.resolve():this.remoteDocumentCache.getEntry(e,t).next(e=>{a=a.insert(t,e)}))).next(()=>this.populateOverlays(e,t,s)).next(()=>this.computeViews(e,a,t,po())).next(e=>({batchId:o,changes:uo(e)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new Ht(t)).next(e=>{let t=co();return e.isFoundDocument()&&(t=t.insert(e.key,e)),t})}getDocumentsMatchingCollectionGroupQuery(e,t,n,r){const s=t.collectionGroup;let i=co();return this.indexManager.getCollectionParents(e,s).next(o=>Sn.forEach(o,o=>{const a=function(e,t){return new Ui(t,null,e.explicitOrderBy.slice(),e.filters.slice(),e.limit,e.limitType,e.startAt,e.endAt)}(t,o.child(s));return this.getDocumentsMatchingCollectionQuery(e,a,n,r).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,t,n,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,s,r))).next(e=>{s.forEach((t,n)=>{const r=n.getKey();null===e.get(r)&&(e=e.insert(r,ai.newInvalidDocument(r)))});let n=co();return e.forEach((e,r)=>{const i=s.get(e);void 0!==i&&qo(i.mutation,r,fs.empty(),cn.now()),eo(t,r)&&(n=n.insert(e,r))}),n})}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lu{constructor(e){this.serializer=e,this.Lr=new Map,this.kr=new Map}getBundleMetadata(e,t){return Sn.resolve(this.Lr.get(t))}saveBundleMetadata(e,t){return this.Lr.set(t.id,function(e){return{id:e.id,version:e.version,createTime:Na(e.createTime)}}(t)),Sn.resolve()}getNamedQuery(e,t){return Sn.resolve(this.kr.get(t))}saveNamedQuery(e,t){return this.kr.set(t.name,function(e){return{name:e.name,query:dc(e.bundledQuery),readTime:Na(e.readTime)}}(t)),Sn.resolve()}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fu{constructor(){this.overlays=new as(Ht.comparator),this.qr=new Map}getOverlay(e,t){return Sn.resolve(this.overlays.get(t))}getOverlays(e,t){const n=ho();return Sn.forEach(t,t=>this.getOverlay(e,t).next(e=>{null!==e&&n.set(t,e)})).next(()=>n)}saveOverlays(e,t,n){return n.forEach((n,r)=>{this.St(e,t,r)}),Sn.resolve()}removeOverlaysForBatchId(e,t,n){const r=this.qr.get(n);return void 0!==r&&(r.forEach(e=>this.overlays=this.overlays.remove(e)),this.qr.delete(n)),Sn.resolve()}getOverlaysForCollection(e,t,n){const r=ho(),s=t.length+1,i=new Ht(t.child("")),o=this.overlays.getIteratorFrom(i);for(;o.hasNext();){const e=o.getNext().value,i=e.getKey();if(!t.isPrefixOf(i.path))break;i.path.length===s&&e.largestBatchId>n&&r.set(e.getKey(),e)}return Sn.resolve(r)}getOverlaysForCollectionGroup(e,t,n,r){let s=new as((e,t)=>e-t);const i=this.overlays.getIterator();for(;i.hasNext();){const e=i.getNext().value;if(e.getKey().getCollectionGroup()===t&&e.largestBatchId>n){let t=s.get(e.largestBatchId);null===t&&(t=ho(),s=s.insert(e.largestBatchId,t)),t.set(e.getKey(),e)}}const o=ho(),a=s.getIterator();for(;a.hasNext()&&(a.getNext().value.forEach((e,t)=>o.set(e,t)),!(o.size()>=r)););return Sn.resolve(o)}St(e,t,n){const r=this.overlays.get(n.key);if(null!==r){const e=this.qr.get(r.largestBatchId).delete(n.key);this.qr.set(r.largestBatchId,e)}this.overlays=this.overlays.insert(n.key,new Zo(t,n));let s=this.qr.get(t);void 0===s&&(s=po(),this.qr.set(t,s)),this.qr.set(t,s.add(n.key))}}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vu{constructor(){this.sessionToken=gs.EMPTY_BYTE_STRING}getSessionToken(e){return Sn.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,Sn.resolve()}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bu{constructor(){this.Qr=new hs(Uu.$r),this.Ur=new hs(Uu.Kr)}isEmpty(){return this.Qr.isEmpty()}addReference(e,t){const n=new Uu(e,t);this.Qr=this.Qr.add(n),this.Ur=this.Ur.add(n)}Wr(e,t){e.forEach(e=>this.addReference(e,t))}removeReference(e,t){this.Gr(new Uu(e,t))}zr(e,t){e.forEach(e=>this.removeReference(e,t))}jr(e){const t=new Ht(new Gt([])),n=new Uu(t,e),r=new Uu(t,e+1),s=[];return this.Ur.forEachInRange([n,r],e=>{this.Gr(e),s.push(e.key)}),s}Jr(){this.Qr.forEach(e=>this.Gr(e))}Gr(e){this.Qr=this.Qr.delete(e),this.Ur=this.Ur.delete(e)}Hr(e){const t=new Ht(new Gt([])),n=new Uu(t,e),r=new Uu(t,e+1);let s=po();return this.Ur.forEachInRange([n,r],e=>{s=s.add(e.key)}),s}containsKey(e){const t=new Uu(e,0),n=this.Qr.firstAfterOrEqual(t);return null!==n&&e.isEqual(n.key)}}class Uu{constructor(e,t){this.key=e,this.Yr=t}static $r(e,t){return Ht.comparator(e.key,t.key)||Lt(e.Yr,t.Yr)}static Kr(e,t){return Lt(e.Yr,t.Yr)||Ht.comparator(e.key,t.key)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qu{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.tr=1,this.Zr=new hs(Uu.$r)}checkEmpty(e){return Sn.resolve(0===this.mutationQueue.length)}addMutationBatch(e,t,n,r){const s=this.tr;this.tr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const i=new Xo(s,t,n,r);this.mutationQueue.push(i);for(const o of r)this.Zr=this.Zr.add(new Uu(o.key,s)),this.indexManager.addToCollectionParentIndex(e,o.key.path.popLast());return Sn.resolve(i)}lookupMutationBatch(e,t){return Sn.resolve(this.Xr(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,r=this.ei(n),s=r<0?0:r;return Sn.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return Sn.resolve(0===this.mutationQueue.length?qn:this.tr-1)}getAllMutationBatches(e){return Sn.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new Uu(t,0),r=new Uu(t,Number.POSITIVE_INFINITY),s=[];return this.Zr.forEachInRange([n,r],e=>{const t=this.Xr(e.Yr);s.push(t)}),Sn.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new hs(Lt);return t.forEach(e=>{const t=new Uu(e,0),r=new Uu(e,Number.POSITIVE_INFINITY);this.Zr.forEachInRange([t,r],e=>{n=n.add(e.Yr)})}),Sn.resolve(this.ti(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,r=n.length+1;let s=n;Ht.isDocumentKey(s)||(s=s.child(""));const i=new Uu(new Ht(s),0);let o=new hs(Lt);return this.Zr.forEachWhile(e=>{const t=e.key.path;return!!n.isPrefixOf(t)&&(t.length===r&&(o=o.add(e.Yr)),!0)},i),Sn.resolve(this.ti(o))}ti(e){const t=[];return e.forEach(e=>{const n=this.Xr(e);null!==n&&t.push(n)}),t}removeMutationBatch(e,t){It(0===this.ni(t.batchId,"removed"),55003),this.mutationQueue.shift();let n=this.Zr;return Sn.forEach(t.mutations,r=>{const s=new Uu(r.key,t.batchId);return n=n.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Zr=n})}ir(e){}containsKey(e,t){const n=new Uu(t,0),r=this.Zr.firstAfterOrEqual(n);return Sn.resolve(t.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,Sn.resolve()}ni(e,t){return this.ei(e)}ei(e){return 0===this.mutationQueue.length?0:e-this.mutationQueue[0].batchId}Xr(e){const t=this.ei(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ju{constructor(e){this.ri=e,this.docs=new as(Ht.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,r=this.docs.get(n),s=r?r.size:0,i=this.ri(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return Sn.resolve(n?n.document.mutableCopy():ai.newInvalidDocument(t))}getEntries(e,t){let n=oo();return t.forEach(e=>{const t=this.docs.get(e);n=n.insert(e,t?t.document.mutableCopy():ai.newInvalidDocument(e))}),Sn.resolve(n)}getDocumentsMatchingQuery(e,t,n,r){let s=oo();const i=t.path,o=new Ht(i.child("__id-9223372036854775808__")),a=this.docs.getIteratorFrom(o);for(;a.hasNext();){const{key:e,value:{document:o}}=a.getNext();if(!i.isPrefixOf(e.path))break;e.path.length>i.length+1||In(vn(o),n)<=0||(r.has(o.key)||eo(t,o))&&(s=s.insert(o.key,o.mutableCopy()))}return Sn.resolve(s)}getAllFromCollectionGroup(e,t,n,r){vt(9500)}ii(e,t){return Sn.forEach(this.docs,e=>t(e))}newChangeBuffer(e){return new zu(this)}getSize(e){return Sn.resolve(this.size)}}class zu extends Su{constructor(e){super(),this.Nr=e}applyChanges(e){const t=[];return this.changes.forEach((n,r)=>{r.isValidDocument()?t.push(this.Nr.addEntry(e,r)):this.Nr.removeEntry(n)}),Sn.waitFor(t)}getFromCache(e,t){return this.Nr.getEntry(e,t)}getAllFromCache(e,t){return this.Nr.getEntries(e,t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $u{constructor(e){this.persistence=e,this.si=new so(e=>Oi(e),Pi),this.lastRemoteSnapshotVersion=un.min(),this.highestTargetId=0,this.oi=0,this._i=new Bu,this.targetCount=0,this.ai=lu.ur()}forEachTarget(e,t){return this.si.forEach((e,n)=>t(n)),Sn.resolve()}getLastRemoteSnapshotVersion(e){return Sn.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return Sn.resolve(this.oi)}allocateTargetId(e){return this.highestTargetId=this.ai.next(),Sn.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.oi&&(this.oi=t),Sn.resolve()}Pr(e){this.si.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.ai=new lu(t),this.highestTargetId=t),e.sequenceNumber>this.oi&&(this.oi=e.sequenceNumber)}addTargetData(e,t){return this.Pr(t),this.targetCount+=1,Sn.resolve()}updateTargetData(e,t){return this.Pr(t),Sn.resolve()}removeTargetData(e,t){return this.si.delete(t.target),this._i.jr(t.targetId),this.targetCount-=1,Sn.resolve()}removeTargets(e,t,n){let r=0;const s=[];return this.si.forEach((i,o)=>{o.sequenceNumber<=t&&null===n.get(o.targetId)&&(this.si.delete(i),s.push(this.removeMatchingKeysForTargetId(e,o.targetId)),r++)}),Sn.waitFor(s).next(()=>r)}getTargetCount(e){return Sn.resolve(this.targetCount)}getTargetData(e,t){const n=this.si.get(t)||null;return Sn.resolve(n)}addMatchingKeys(e,t,n){return this._i.Wr(t,n),Sn.resolve()}removeMatchingKeys(e,t,n){this._i.zr(t,n);const r=this.persistence.referenceDelegate,s=[];return r&&t.forEach(t=>{s.push(r.markPotentiallyOrphaned(e,t))}),Sn.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this._i.jr(t),Sn.resolve()}getMatchingKeysForTargetId(e,t){const n=this._i.Hr(t);return Sn.resolve(n)}containsKey(e,t){return Sn.resolve(this._i.containsKey(t))}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gu{constructor(e,t){this.ui={},this.overlays={},this.ci=new Un(0),this.li=!1,this.li=!0,this.hi=new Vu,this.referenceDelegate=e(this),this.Pi=new $u(this),this.indexManager=new Gc,this.remoteDocumentCache=function(e){return new ju(e)}(e=>this.referenceDelegate.Ti(e)),this.serializer=new sc(t),this.Ii=new Lu(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.li=!1,Promise.resolve()}get started(){return this.li}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Fu,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.ui[e.toKey()];return n||(n=new qu(t,this.referenceDelegate),this.ui[e.toKey()]=n),n}getGlobalsCache(){return this.hi}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ii}runTransaction(e,t,n){gt("MemoryPersistence","Starting transaction:",e);const r=new Ku(this.ci.next());return this.referenceDelegate.Ei(),n(r).next(e=>this.referenceDelegate.di(r).next(()=>e)).toPromise().then(e=>(r.raiseOnCommittedEvent(),e))}Ai(e,t){return Sn.or(Object.values(this.ui).map(n=>()=>n.containsKey(e,t)))}}class Ku extends En{constructor(e){super(),this.currentSequenceNumber=e}}class Qu{constructor(e){this.persistence=e,this.Ri=new Bu,this.Vi=null}static mi(e){return new Qu(e)}get fi(){if(this.Vi)return this.Vi;throw vt(60996)}addReference(e,t,n){return this.Ri.addReference(n,t),this.fi.delete(n.toString()),Sn.resolve()}removeReference(e,t,n){return this.Ri.removeReference(n,t),this.fi.add(n.toString()),Sn.resolve()}markPotentiallyOrphaned(e,t){return this.fi.add(t.toString()),Sn.resolve()}removeTarget(e,t){this.Ri.jr(t.targetId).forEach(e=>this.fi.add(e.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next(e=>{e.forEach(e=>this.fi.add(e.toString()))}).next(()=>n.removeTargetData(e,t))}Ei(){this.Vi=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return Sn.forEach(this.fi,n=>{const r=Ht.fromPath(n);return this.gi(e,r).next(e=>{e||t.removeEntry(r,un.min())})}).next(()=>(this.Vi=null,t.apply(e)))}updateLimboDocument(e,t){return this.gi(e,t).next(e=>{e?this.fi.delete(t.toString()):this.fi.add(t.toString())})}Ti(e){return 0}gi(e,t){return Sn.or([()=>Sn.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ai(e,t)])}}class Hu{constructor(e,t){this.persistence=e,this.pi=new so(e=>Kn(e.path),(e,t)=>e.isEqual(t)),this.garbageCollector=_u(this,t)}static mi(e,t){return new Hu(e,t)}Ei(){}di(e){return Sn.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}gr(e){const t=this.wr(e);return this.persistence.getTargetCache().getTargetCount(e).next(e=>t.next(t=>e+t))}wr(e){let t=0;return this.pr(e,e=>{t++}).next(()=>t)}pr(e,t){return Sn.forEach(this.pi,(n,r)=>this.br(e,n,r).next(e=>e?Sn.resolve():t(r)))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ii(e,r=>this.br(e,r,t).next(e=>{e||(n++,s.removeEntry(r,un.min()))})).next(()=>s.apply(e)).next(()=>n)}markPotentiallyOrphaned(e,t){return this.pi.set(t,e.currentSequenceNumber),Sn.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.pi.set(n,e.currentSequenceNumber),Sn.resolve()}removeReference(e,t,n){return this.pi.set(n,e.currentSequenceNumber),Sn.resolve()}updateLimboDocument(e,t){return this.pi.set(t,e.currentSequenceNumber),Sn.resolve()}Ti(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=$s(e.data.value)),t}br(e,t,n){return Sn.or([()=>this.persistence.Ai(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const e=this.pi.get(t);return Sn.resolve(void 0!==e&&e>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wu{constructor(e){this.serializer=e}k(e,t,n,r){const s=new An("createOrUpgrade",t);n<1&&r>=1&&(function(e){e.createObjectStore(Xn)}(e),function(e){e.createObjectStore(Zn,{keyPath:"userId"});e.createObjectStore(er,{keyPath:tr,autoIncrement:!0}).createIndex(nr,rr,{unique:!0}),e.createObjectStore(ar)}(e),Ju(e),function(e){e.createObjectStore(Jn)}(e));let i=Sn.resolve();return n<3&&r>=3&&(0!==n&&(function(e){e.deleteObjectStore(vr),e.deleteObjectStore(pr),e.deleteObjectStore(Tr)}(e),Ju(e)),i=i.next(()=>function(e){const t=e.store(Tr),n={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:un.min().toTimestamp(),targetCount:0};return t.put(Er,n)}(s))),n<4&&r>=4&&(0!==n&&(i=i.next(()=>function(e,t){return t.store(er).J().next(n=>{e.deleteObjectStore(er),e.createObjectStore(er,{keyPath:tr,autoIncrement:!0}).createIndex(nr,rr,{unique:!0});const r=t.store(er),s=n.map(e=>r.put(e));return Sn.waitFor(s)})}(e,s))),i=i.next(()=>{!function(e){e.createObjectStore(Ar,{keyPath:"clientId"})}(e)})),n<5&&r>=5&&(i=i.next(()=>this.yi(s))),n<6&&r>=6&&(i=i.next(()=>(function(e){e.createObjectStore(mr)}(e),this.wi(s)))),n<7&&r>=7&&(i=i.next(()=>this.Si(s))),n<8&&r>=8&&(i=i.next(()=>this.bi(e,s))),n<9&&r>=9&&(i=i.next(()=>{!function(e){e.objectStoreNames.contains("remoteDocumentChanges")&&e.deleteObjectStore("remoteDocumentChanges")}(e)})),n<10&&r>=10&&(i=i.next(()=>this.Di(s))),n<11&&r>=11&&(i=i.next(()=>{!function(e){e.createObjectStore(xr,{keyPath:"bundleId"})}(e),function(e){e.createObjectStore(Dr,{keyPath:"name"})}(e)})),n<12&&r>=12&&(i=i.next(()=>{!function(e){const t=e.createObjectStore(Ur,{keyPath:qr});t.createIndex(jr,zr,{unique:!1}),t.createIndex($r,Gr,{unique:!1})}(e)})),n<13&&r>=13&&(i=i.next(()=>function(e){const t=e.createObjectStore(cr,{keyPath:ur});t.createIndex(hr,lr),t.createIndex(dr,fr)}(e)).next(()=>this.Ci(e,s)).next(()=>e.deleteObjectStore(Jn))),n<14&&r>=14&&(i=i.next(()=>this.Fi(e,s))),n<15&&r>=15&&(i=i.next(()=>function(e){e.createObjectStore(Nr,{keyPath:"indexId",autoIncrement:!0}).createIndex(kr,"collectionGroup",{unique:!1});e.createObjectStore(Rr,{keyPath:Mr}).createIndex(Or,Pr,{unique:!1});e.createObjectStore(Lr,{keyPath:Fr}).createIndex(Vr,Br,{unique:!1})}(e))),n<16&&r>=16&&(i=i.next(()=>{t.objectStore(Rr).clear()}).next(()=>{t.objectStore(Lr).clear()})),n<17&&r>=17&&(i=i.next(()=>{!function(e){e.createObjectStore(Kr,{keyPath:"name"})}(e)})),n<18&&r>=18&&v()&&(i=i.next(()=>{t.objectStore(Rr).clear()}).next(()=>{t.objectStore(Lr).clear()})),i}wi(e){let t=0;return e.store(Jn).ee((e,n)=>{t+=iu(n)}).next(()=>{const n={byteSize:t};return e.store(mr).put(gr,n)})}yi(e){const t=e.store(Zn),n=e.store(er);return t.J().next(t=>Sn.forEach(t,t=>{const r=IDBKeyRange.bound([t.userId,qn],[t.userId,t.lastAcknowledgedBatchId]);return n.J(nr,r).next(n=>Sn.forEach(n,n=>{It(n.userId===t.userId,18650,"Cannot process batch from unexpected user",{batchId:n.batchId});const r=uc(this.serializer,n);return su(e,t.userId,r).next(()=>{})}))}))}Si(e){const t=e.store(vr),n=e.store(Jn);return e.store(Tr).get(Er).next(e=>{const r=[];return n.ee((n,s)=>{const i=new Gt(n),o=function(e){return[0,Kn(e)]}(i);r.push(t.get(o).next(n=>n?Sn.resolve():(n=>t.put({targetId:0,path:Kn(n),sequenceNumber:e.highestListenSequenceNumber}))(i)))}).next(()=>Sn.waitFor(r))})}bi(e,t){e.createObjectStore(Sr,{keyPath:Cr});const n=t.store(Sr),r=new Kc,s=e=>{if(r.add(e)){const t=e.lastSegment(),r=e.popLast();return n.put({collectionId:t,parent:Kn(r)})}};return t.store(Jn).ee({X:!0},(e,t)=>{const n=new Gt(e);return s(n.popLast())}).next(()=>t.store(ar).ee({X:!0},([e,t,n],r)=>{const i=Wn(t);return s(i.popLast())}))}Di(e){const t=e.store(pr);return t.ee((e,n)=>{const r=hc(n),s=lc(this.serializer,r);return t.put(s)})}Ci(e,t){const n=t.store(Jn),r=[];return n.ee((e,n)=>{const s=t.store(cr),i=function(e){return e.document?new Ht(Gt.fromString(e.document.name).popFirst(5)):e.noDocument?Ht.fromSegments(e.noDocument.path):e.unknownDocument?Ht.fromSegments(e.unknownDocument.path):vt(36783)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(n).path.toArray(),o={prefixPath:i.slice(0,i.length-2),collectionGroup:i[i.length-2],documentId:i[i.length-1],readTime:n.readTime||[0,0],unknownDocument:n.unknownDocument,noDocument:n.noDocument,document:n.document,hasCommittedMutations:!!n.hasCommittedMutations};r.push(s.put(o))}).next(()=>Sn.waitFor(r))}Fi(e,t){const n=t.store(er),r=Au(this.serializer),s=new Gu(Qu.mi,this.serializer.yt);return n.J().next(e=>{const n=new Map;return e.forEach(e=>{let t=n.get(e.userId)??po();uc(this.serializer,e).keys().forEach(e=>t=t.add(e)),n.set(e.userId,t)}),Sn.forEach(n,(e,n)=>{const i=new lt(n),o=vc.wt(this.serializer,i),a=s.getIndexManager(i),c=ou.wt(i,this.serializer,a,s.referenceDelegate);return new Pu(r,c,o,a).recalculateAndSaveOverlaysForDocumentKeys(new ts(t,Un.ce),e).next()})})}}function Ju(e){e.createObjectStore(vr,{keyPath:br}).createIndex(Ir,_r,{unique:!0}),e.createObjectStore(pr,{keyPath:"targetId"}).createIndex(yr,wr,{unique:!0}),e.createObjectStore(Tr)}const Xu="IndexedDbPersistence",Yu=18e5,Zu=5e3,eh="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",th="main";class nh{constructor(e,t,n,r,s,i,o,a,c,u,h=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=n,this.Mi=s,this.window=i,this.document=o,this.xi=c,this.Oi=u,this.Ni=h,this.ci=null,this.li=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Bi=null,this.inForeground=!1,this.Li=null,this.ki=null,this.qi=Number.NEGATIVE_INFINITY,this.Qi=e=>Promise.resolve(),!nh.v())throw new Tt(Et.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new Eu(this,r),this.$i=t+th,this.serializer=new sc(a),this.Ui=new xn(this.$i,this.Ni,new Wu(this.serializer)),this.hi=new Ic,this.Pi=new du(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Au(this.serializer),this.Ii=new pc,this.window&&this.window.localStorage?this.Ki=this.window.localStorage:(this.Ki=null,!1===u&&pt(Xu,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.Wi().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new Tt(Et.FAILED_PRECONDITION,eh);return this.Gi(),this.zi(),this.ji(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.Pi.getHighestSequenceNumber(e))}).then(e=>{this.ci=new Un(e,this.xi)}).then(()=>{this.li=!0}).catch(e=>(this.Ui&&this.Ui.close(),Promise.reject(e)))}Ji(e){return this.Qi=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.Ui.$(async t=>{null===t.newVersion&&await e()})}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.Mi.enqueueAndForget(async()=>{this.started&&await this.Wi()}))}Wi(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>sh(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.Hi(e).next(e=>{e||(this.isPrimary=!1,this.Mi.enqueueRetryable(()=>this.Qi(!1)))})}).next(()=>this.Yi(e)).next(t=>this.isPrimary&&!t?this.Zi(e).next(()=>!1):!!t&&this.Xi(e).next(()=>!0))).catch(e=>{if(Rn(e))return gt(Xu,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return gt(Xu,"Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.Mi.enqueueRetryable(()=>this.Qi(e)),this.isPrimary=e})}Hi(e){return rh(e).get(Yn).next(e=>Sn.resolve(this.es(e)))}ts(e){return sh(e).delete(this.clientId)}async ns(){if(this.isPrimary&&!this.rs(this.qi,Yu)){this.qi=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",e=>{const t=ns(e,Ar);return t.J().next(e=>{const n=this.ss(e,Yu),r=e.filter(e=>-1===n.indexOf(e));return Sn.forEach(r,e=>t.delete(e.clientId)).next(()=>r)})}).catch(()=>[]);if(this.Ki)for(const t of e)this.Ki.removeItem(this._s(t.clientId))}}ji(){this.ki=this.Mi.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.Wi().then(()=>this.ns()).then(()=>this.ji()))}es(e){return!!e&&e.ownerId===this.clientId}Yi(e){return this.Oi?Sn.resolve(!0):rh(e).get(Yn).next(t=>{if(null!==t&&this.rs(t.leaseTimestampMs,Zu)&&!this.us(t.ownerId)){if(this.es(t)&&this.networkEnabled)return!0;if(!this.es(t)){if(!t.allowTabSynchronization)throw new Tt(Et.FAILED_PRECONDITION,eh);return!1}}return!(!this.networkEnabled||!this.inForeground)||sh(e).J().next(e=>void 0===this.ss(e,Zu).find(e=>{if(this.clientId!==e.clientId){const t=!this.networkEnabled&&e.networkEnabled,n=!this.inForeground&&e.inForeground,r=this.networkEnabled===e.networkEnabled;if(t||n&&r)return!0}return!1}))}).next(e=>(this.isPrimary!==e&&gt(Xu,`Client ${e?"is":"is not"} eligible for a primary lease.`),e))}async shutdown(){this.li=!1,this.cs(),this.ki&&(this.ki.cancel(),this.ki=null),this.ls(),this.hs(),await this.Ui.runTransaction("shutdown","readwrite",[Xn,Ar],e=>{const t=new ts(e,Un.ce);return this.Zi(t).next(()=>this.ts(t))}),this.Ui.close(),this.Ps()}ss(e,t){return e.filter(e=>this.rs(e.updateTimeMs,t)&&!this.us(e.clientId))}Ts(){return this.runTransaction("getActiveClients","readonly",e=>sh(e).J().next(e=>this.ss(e,Yu).map(e=>e.clientId)))}get started(){return this.li}getGlobalsCache(){return this.hi}getMutationQueue(e,t){return ou.wt(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new Wc(e,this.serializer.yt.databaseId)}getDocumentOverlayCache(e){return vc.wt(this.serializer,e)}getBundleCache(){return this.Ii}runTransaction(e,t,n){gt(Xu,"Starting transaction:",e);const r="readonly"===t?"readonly":"readwrite",s=function(e){return 18===e?es:17===e?Zr:16===e?Yr:15===e?Xr:14===e?Jr:13===e?Wr:12===e?Hr:11===e?Qr:void vt(60245)}(this.Ni);let i;return this.Ui.runTransaction(e,r,s,r=>(i=new ts(r,this.ci?this.ci.next():Un.ce),"readwrite-primary"===t?this.Hi(i).next(e=>!!e||this.Yi(i)).next(t=>{if(!t)throw pt(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.Mi.enqueueRetryable(()=>this.Qi(!1)),new Tt(Et.FAILED_PRECONDITION,_n);return n(i)}).next(e=>this.Xi(i).next(()=>e)):this.Is(i).next(()=>n(i)))).then(e=>(i.raiseOnCommittedEvent(),e))}Is(e){return rh(e).get(Yn).next(e=>{if(null!==e&&this.rs(e.leaseTimestampMs,Zu)&&!this.us(e.ownerId)&&!this.es(e)&&!(this.Oi||this.allowTabSynchronization&&e.allowTabSynchronization))throw new Tt(Et.FAILED_PRECONDITION,eh)})}Xi(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return rh(e).put(Yn,t)}static v(){return xn.v()}Zi(e){const t=rh(e);return t.get(Yn).next(e=>this.es(e)?(gt(Xu,"Releasing primary lease."),t.delete(Yn)):Sn.resolve())}rs(e,t){const n=Date.now();return!(e<n-t||e>n&&(pt(`Detected an update time that is in the future: ${e} > ${n}`),1))}Gi(){null!==this.document&&"function"==typeof this.document.addEventListener&&(this.Li=()=>{this.Mi.enqueueAndForget(()=>(this.inForeground="visible"===this.document.visibilityState,this.Wi()))},this.document.addEventListener("visibilitychange",this.Li),this.inForeground="visible"===this.document.visibilityState)}ls(){this.Li&&(this.document.removeEventListener("visibilitychange",this.Li),this.Li=null)}zi(){"function"==typeof this.window?.addEventListener&&(this.Bi=()=>{this.cs();const e=/(?:Version|Mobile)\/1[456]/;w()&&(navigator.appVersion.match(e)||navigator.userAgent.match(e))&&this.Mi.enterRestrictedMode(!0),this.Mi.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Bi))}hs(){this.Bi&&(this.window.removeEventListener("pagehide",this.Bi),this.Bi=null)}us(e){try{const t=null!==this.Ki?.getItem(this._s(e));return gt(Xu,`Client '${e}' ${t?"is":"is not"} zombied in LocalStorage`),t}catch(e){return pt(Xu,"Failed to get zombied client id.",e),!1}}cs(){if(this.Ki)try{this.Ki.setItem(this._s(this.clientId),String(Date.now()))}catch(e){pt("Failed to set zombie client id.",e)}}Ps(){if(this.Ki)try{this.Ki.removeItem(this._s(this.clientId))}catch(e){}}_s(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function rh(e){return ns(e,Xn)}function sh(e){return ns(e,Ar)}function ih(e,t){let n=e.projectId;return e.isDefaultDatabase||(n+="."+e.database),"firestore/"+t+"/"+n+"/"
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class oh{constructor(e,t,n,r){this.targetId=e,this.fromCache=t,this.Es=n,this.ds=r}static As(e,t){let n=po(),r=po();for(const s of t.docChanges)switch(s.type){case 0:n=n.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new oh(e,t.fromCache,n,r)}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ah{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ch{constructor(){this.Rs=!1,this.Vs=!1,this.fs=100,this.gs=w()?8:Dn(p())>0?6:4}initialize(e,t){this.ps=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,n,r){const s={result:null};return this.ys(e,t).next(e=>{s.result=e}).next(()=>{if(!s.result)return this.ws(e,t,r,n).next(e=>{s.result=e})}).next(()=>{if(s.result)return;const n=new ah;return this.Ss(e,t,n).next(r=>{if(s.result=r,this.Vs)return this.bs(e,t,n,r.size)})}).next(()=>s.result)}bs(e,t,n,r){return n.documentReadCount<this.fs?(mt()<=k.DEBUG&&gt("QueryEngine","SDK will not create cache indexes for query:",Zi(t),"since it only creates cache indexes for collection contains","more than or equal to",this.fs,"documents"),Sn.resolve()):(mt()<=k.DEBUG&&gt("QueryEngine","Query:",Zi(t),"scans",n.documentReadCount,"local documents and returns",r,"documents as results."),n.documentReadCount>this.gs*r?(mt()<=k.DEBUG&&gt("QueryEngine","The SDK decides to create cache indexes for query:",Zi(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Ki(t))):Sn.resolve())}ys(e,t){if(zi(t))return Sn.resolve(null);let n=Ki(t);return this.indexManager.getIndexType(e,n).next(r=>0===r?null:(null!==t.limit&&1===r&&(t=Ji(t,null,"F"),n=Ki(t)),this.indexManager.getDocumentsMatchingTarget(e,n).next(r=>{const s=po(...r);return this.ps.getDocuments(e,s).next(r=>this.indexManager.getMinOffset(e,n).next(n=>{const i=this.Ds(t,r);return this.Cs(t,i,s,n.readTime)?this.ys(e,Ji(t,null,"F")):this.vs(e,i,t,n)}))})))}ws(e,t,n,r){return zi(t)||r.isEqual(un.min())?Sn.resolve(null):this.ps.getDocuments(e,n).next(s=>{const i=this.Ds(t,s);return this.Cs(t,i,n,r)?Sn.resolve(null):(mt()<=k.DEBUG&&gt("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),Zi(t)),this.vs(e,i,t,wn(r,hn)).next(e=>e))})}Ds(e,t){let n=new hs(no(e));return t.forEach((t,r)=>{eo(e,r)&&(n=n.add(r))}),n}Cs(e,t,n,r){if(null===e.limit)return!1;if(n.size!==t.size)return!0;const s="F"===e.limitType?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}Ss(e,t,n){return mt()<=k.DEBUG&&gt("QueryEngine","Using full collection scan to execute query:",Zi(t)),this.ps.getDocumentsMatchingQuery(e,t,bn.min(),n)}vs(e,t,n,r){return this.ps.getDocumentsMatchingQuery(e,n,r).next(e=>(t.forEach(t=>{e=e.insert(t.key,t)}),e))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uh="LocalStore";class hh{constructor(e,t,n,r){this.persistence=e,this.Fs=t,this.serializer=r,this.Ms=new as(Lt),this.xs=new so(e=>Oi(e),Pi),this.Os=new Map,this.Ns=e.getRemoteDocumentCache(),this.Pi=e.getTargetCache(),this.Ii=e.getBundleCache(),this.Bs(n)}Bs(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Pu(this.Ns,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ns.setIndexManager(this.indexManager),this.Fs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Ms))}}function lh(e,t,n,r){return new hh(e,t,n,r)}async function dh(e,t){const n=_t(e);return await n.persistence.runTransaction("Handle user change","readonly",e=>{let r;return n.mutationQueue.getAllMutationBatches(e).next(s=>(r=s,n.Bs(t),n.mutationQueue.getAllMutationBatches(e))).next(t=>{const s=[],i=[];let o=po();for(const e of r){s.push(e.batchId);for(const t of e.mutations)o=o.add(t.key)}for(const e of t){i.push(e.batchId);for(const t of e.mutations)o=o.add(t.key)}return n.localDocuments.getDocuments(e,o).next(e=>({Ls:e,removedBatchIds:s,addedBatchIds:i}))})})}function fh(e){const t=_t(e);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.Pi.getLastRemoteSnapshotVersion(e))}function mh(e,t,n){let r=po(),s=po();return n.forEach(e=>r=r.add(e)),t.getEntries(e,r).next(e=>{let r=oo();return n.forEach((n,i)=>{const o=e.get(n);i.isFoundDocument()!==o.isFoundDocument()&&(s=s.add(n)),i.isNoDocument()&&i.version.isEqual(un.min())?(t.removeEntry(n,i.readTime),r=r.insert(n,i)):!o.isValidDocument()||i.version.compareTo(o.version)>0||0===i.version.compareTo(o.version)&&o.hasPendingWrites?(t.addEntry(i),r=r.insert(n,i)):gt(uh,"Ignoring outdated watch update for ",n,". Current version:",o.version," Watch version:",i.version)}),{ks:r,qs:s}})}function gh(e,t){const n=_t(e);return n.persistence.runTransaction("Get next mutation batch","readonly",e=>(void 0===t&&(t=qn),n.mutationQueue.getNextMutationBatchAfterBatchId(e,t)))}function ph(e,t){const n=_t(e);return n.persistence.runTransaction("Allocate target","readwrite",e=>{let r;return n.Pi.getTargetData(e,t).next(s=>s?(r=s,Sn.resolve(r)):n.Pi.allocateTargetId(e).next(s=>(r=new rc(t,s,"TargetPurposeListen",e.currentSequenceNumber),n.Pi.addTargetData(e,r).next(()=>r))))}).then(e=>{const r=n.Ms.get(e.targetId);return(null===r||e.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.Ms=n.Ms.insert(e.targetId,e),n.xs.set(t,e.targetId)),e})}async function yh(e,t,n){const r=_t(e),s=r.Ms.get(t),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,e=>r.persistence.referenceDelegate.removeTarget(e,s))}catch(e){if(!Rn(e))throw e;gt(uh,`Failed to update sequence numbers for target ${t}: ${e}`)}r.Ms=r.Ms.remove(t),r.xs.delete(s.target)}function wh(e,t,n){const r=_t(e);let s=un.min(),i=po();return r.persistence.runTransaction("Execute query","readwrite",e=>function(e,t,n){const r=_t(e),s=r.xs.get(n);return void 0!==s?Sn.resolve(r.Ms.get(s)):r.Pi.getTargetData(t,n)}(r,e,Ki(t)).next(t=>{if(t)return s=t.lastLimboFreeSnapshotVersion,r.Pi.getMatchingKeysForTargetId(e,t.targetId).next(e=>{i=e})}).next(()=>r.Fs.getDocumentsMatchingQuery(e,t,n?s:un.min(),n?i:po())).next(e=>(Ih(r,to(t),e),{documents:e,Qs:i})))}function vh(e,t){const n=_t(e),r=_t(n.Pi),s=n.Ms.get(t);return s?Promise.resolve(s.target):n.persistence.runTransaction("Get target data","readonly",e=>r.At(e,t).next(e=>e?e.target:null))}function bh(e,t){const n=_t(e),r=n.Os.get(t)||un.min();return n.persistence.runTransaction("Get new document changes","readonly",e=>n.Ns.getAllFromCollectionGroup(e,t,wn(r,hn),Number.MAX_SAFE_INTEGER)).then(e=>(Ih(n,t,e),e))}function Ih(e,t,n){let r=e.Os.get(t)||un.min();n.forEach((e,t)=>{t.readTime.compareTo(r)>0&&(r=t.readTime)}),e.Os.set(t,r)}async function _h(e,t,n=po()){const r=await ph(e,Ki(dc(t.bundledQuery))),s=_t(e);return s.persistence.runTransaction("Save named query","readwrite",e=>{const i=Na(t.readTime);if(r.snapshotVersion.compareTo(i)>=0)return s.Ii.saveNamedQuery(e,t);const o=r.withResumeToken(gs.EMPTY_BYTE_STRING,i);return s.Ms=s.Ms.insert(o.targetId,o),s.Pi.updateTargetData(e,o).next(()=>s.Pi.removeMatchingKeysForTargetId(e,r.targetId)).next(()=>s.Pi.addMatchingKeys(e,n,r.targetId)).next(()=>s.Ii.saveNamedQuery(e,t))})}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eh="firestore_clients";function Th(e,t){return`${Eh}_${e}_${t}`}const Sh="firestore_mutations";function Ch(e,t,n){let r=`${Sh}_${e}_${n}`;return t.isAuthenticated()&&(r+=`_${t.uid}`),r}const Ah="firestore_targets";function xh(e,t){return`${Ah}_${e}_${t}`}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dh="SharedClientState";class Nh{constructor(e,t,n,r){this.user=e,this.batchId=t,this.state=n,this.error=r}static Ws(e,t,n){const r=JSON.parse(n);let s,i="object"==typeof r&&-1!==["pending","acknowledged","rejected"].indexOf(r.state)&&(void 0===r.error||"object"==typeof r.error);return i&&r.error&&(i="string"==typeof r.error.message&&"string"==typeof r.error.code,i&&(s=new Tt(r.error.code,r.error.message))),i?new Nh(e,t,r.state,s):(pt(Dh,`Failed to parse mutation state for ID '${t}': ${n}`),null)}Gs(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class kh{constructor(e,t,n){this.targetId=e,this.state=t,this.error=n}static Ws(e,t){const n=JSON.parse(t);let r,s="object"==typeof n&&-1!==["not-current","current","rejected"].indexOf(n.state)&&(void 0===n.error||"object"==typeof n.error);return s&&n.error&&(s="string"==typeof n.error.message&&"string"==typeof n.error.code,s&&(r=new Tt(n.error.code,n.error.message))),s?new kh(e,n.state,r):(pt(Dh,`Failed to parse target state for ID '${e}': ${t}`),null)}Gs(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Rh{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Ws(e,t){const n=JSON.parse(t);let r="object"==typeof n&&n.activeTargetIds instanceof Array,s=wo();for(let i=0;r&&i<n.activeTargetIds.length;++i)r=$n(n.activeTargetIds[i]),s=s.add(n.activeTargetIds[i]);return r?new Rh(e,s):(pt(Dh,`Failed to parse client data for instance '${e}': ${t}`),null)}}class Mh{constructor(e,t){this.clientId=e,this.onlineState=t}static Ws(e){const t=JSON.parse(e);return"object"==typeof t&&-1!==["Unknown","Online","Offline"].indexOf(t.onlineState)&&"string"==typeof t.clientId?new Mh(t.clientId,t.onlineState):(pt(Dh,`Failed to parse online state: ${e}`),null)}}class Oh{constructor(){this.activeTargetIds=wo()}zs(e){this.activeTargetIds=this.activeTargetIds.add(e)}js(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Gs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Ph{constructor(e,t,n,r,s){this.window=e,this.Mi=t,this.persistenceKey=n,this.Js=r,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.Hs=this.Ys.bind(this),this.Zs=new as(Lt),this.started=!1,this.Xs=[];const i=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=s,this.eo=Th(this.persistenceKey,this.Js),this.no=function(e){return`firestore_sequence_number_${e}`}(this.persistenceKey),this.Zs=this.Zs.insert(this.Js,new Oh),this.ro=new RegExp(`^${Eh}_${i}_([^_]*)$`),this.io=new RegExp(`^${Sh}_${i}_(\\d+)(?:_(.*))?$`),this.so=new RegExp(`^${Ah}_${i}_(\\d+)$`),this.oo=function(e){return`firestore_online_state_${e}`}(this.persistenceKey),this._o=function(e){return`firestore_bundle_loaded_v2_${e}`}(this.persistenceKey),this.window.addEventListener("storage",this.Hs)}static v(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Ts();for(const n of e){if(n===this.Js)continue;const e=this.getItem(Th(this.persistenceKey,n));if(e){const t=Rh.Ws(n,e);t&&(this.Zs=this.Zs.insert(t.clientId,t))}}this.ao();const t=this.storage.getItem(this.oo);if(t){const e=this.uo(t);e&&this.co(e)}for(const n of this.Xs)this.Ys(n);this.Xs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(e){this.setItem(this.no,JSON.stringify(e))}getAllActiveQueryTargets(){return this.lo(this.Zs)}isActiveQueryTarget(e){let t=!1;return this.Zs.forEach((n,r)=>{r.activeTargetIds.has(e)&&(t=!0)}),t}addPendingMutation(e){this.ho(e,"pending")}updateMutationState(e,t,n){this.ho(e,t,n),this.Po(e)}addLocalQueryTarget(e,t=!0){let n="not-current";if(this.isActiveQueryTarget(e)){const t=this.storage.getItem(xh(this.persistenceKey,e));if(t){const r=kh.Ws(e,t);r&&(n=r.state)}}return t&&this.To.zs(e),this.ao(),n}removeLocalQueryTarget(e){this.To.js(e),this.ao()}isLocalQueryTarget(e){return this.To.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(xh(this.persistenceKey,e))}updateQueryState(e,t,n){this.Io(e,t,n)}handleUserChange(e,t,n){t.forEach(e=>{this.Po(e)}),this.currentUser=e,n.forEach(e=>{this.addPendingMutation(e)})}setOnlineState(e){this.Eo(e)}notifyBundleLoaded(e){this.Ao(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.Hs),this.removeItem(this.eo),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return gt(Dh,"READ",e,t),t}setItem(e,t){gt(Dh,"SET",e,t),this.storage.setItem(e,t)}removeItem(e){gt(Dh,"REMOVE",e),this.storage.removeItem(e)}Ys(e){const t=e;if(t.storageArea===this.storage){if(gt(Dh,"EVENT",t.key,t.newValue),t.key===this.eo)return void pt("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.Mi.enqueueRetryable(async()=>{if(this.started){if(null!==t.key)if(this.ro.test(t.key)){if(null==t.newValue){const e=this.Ro(t.key);return this.Vo(e,null)}{const e=this.mo(t.key,t.newValue);if(e)return this.Vo(e.clientId,e)}}else if(this.io.test(t.key)){if(null!==t.newValue){const e=this.fo(t.key,t.newValue);if(e)return this.po(e)}}else if(this.so.test(t.key)){if(null!==t.newValue){const e=this.yo(t.key,t.newValue);if(e)return this.wo(e)}}else if(t.key===this.oo){if(null!==t.newValue){const e=this.uo(t.newValue);if(e)return this.co(e)}}else if(t.key===this.no){const e=function(e){let t=Un.ce;if(null!=e)try{const n=JSON.parse(e);It("number"==typeof n,30636,{So:e}),t=n}catch(e){pt(Dh,"Failed to read sequence number from WebStorage",e)}return t}(t.newValue);e!==Un.ce&&this.sequenceNumberHandler(e)}else if(t.key===this._o){const e=this.bo(t.newValue);await Promise.all(e.map(e=>this.syncEngine.Do(e)))}}else this.Xs.push(t)})}}get To(){return this.Zs.get(this.Js)}ao(){this.setItem(this.eo,this.To.Gs())}ho(e,t,n){const r=new Nh(this.currentUser,e,t,n),s=Ch(this.persistenceKey,this.currentUser,e);this.setItem(s,r.Gs())}Po(e){const t=Ch(this.persistenceKey,this.currentUser,e);this.removeItem(t)}Eo(e){const t={clientId:this.Js,onlineState:e};this.storage.setItem(this.oo,JSON.stringify(t))}Io(e,t,n){const r=xh(this.persistenceKey,e),s=new kh(e,t,n);this.setItem(r,s.Gs())}Ao(e){const t=JSON.stringify(Array.from(e));this.setItem(this._o,t)}Ro(e){const t=this.ro.exec(e);return t?t[1]:null}mo(e,t){const n=this.Ro(e);return Rh.Ws(n,t)}fo(e,t){const n=this.io.exec(e),r=Number(n[1]),s=void 0!==n[2]?n[2]:null;return Nh.Ws(new lt(s),r,t)}yo(e,t){const n=this.so.exec(e),r=Number(n[1]);return kh.Ws(r,t)}uo(e){return Mh.Ws(e)}bo(e){return JSON.parse(e)}async po(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Co(e.batchId,e.state,e.error);gt(Dh,`Ignoring mutation for non-active user ${e.user.uid}`)}wo(e){return this.syncEngine.vo(e.targetId,e.state,e.error)}Vo(e,t){const n=t?this.Zs.insert(e,t):this.Zs.remove(e),r=this.lo(this.Zs),s=this.lo(n),i=[],o=[];return s.forEach(e=>{r.has(e)||i.push(e)}),r.forEach(e=>{s.has(e)||o.push(e)}),this.syncEngine.Fo(i,o).then(()=>{this.Zs=n})}co(e){this.Zs.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}lo(e){let t=wo();return e.forEach((e,n)=>{t=t.unionWith(n.activeTargetIds)}),t}}class Lh{constructor(){this.Mo=new Oh,this.xo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.Mo.zs(e),this.xo[e]||"not-current"}updateQueryState(e,t,n){this.xo[e]=t}removeLocalQueryTarget(e){this.Mo.js(e)}isLocalQueryTarget(e){return this.Mo.activeTargetIds.has(e)}clearQueryState(e){delete this.xo[e]}getAllActiveQueryTargets(){return this.Mo.activeTargetIds}isActiveQueryTarget(e){return this.Mo.activeTargetIds.has(e)}start(){return this.Mo=new Oh,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fh{Oo(e){}shutdown(){}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vh="ConnectivityMonitor";class Bh{constructor(){this.No=()=>this.Bo(),this.Lo=()=>this.ko(),this.qo=[],this.Qo()}Oo(e){this.qo.push(e)}shutdown(){window.removeEventListener("online",this.No),window.removeEventListener("offline",this.Lo)}Qo(){window.addEventListener("online",this.No),window.addEventListener("offline",this.Lo)}Bo(){gt(Vh,"Network connectivity changed: AVAILABLE");for(const e of this.qo)e(0)}ko(){gt(Vh,"Network connectivity changed: UNAVAILABLE");for(const e of this.qo)e(1)}static v(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Uh=null;function qh(){return null===Uh?Uh=268435456+Math.round(2147483648*Math.random()):Uh++,"0x"+Uh.toString(16)
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}const jh="RestConnection",zh={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class $h{get $o(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.Uo=t+"://"+e.host,this.Ko=`projects/${n}/databases/${r}`,this.Wo=this.databaseId.database===xs?`project_id=${n}`:`project_id=${n}&database_id=${r}`}Go(e,t,n,r,s){const i=qh(),o=this.zo(e,t.toUriEncodedString());gt(jh,`Sending RPC '${e}' ${i}:`,o,n);const a={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Wo};this.jo(a,r,s);const{host:c}=new URL(o),u=l(c);return this.Jo(e,o,a,n,u).then(t=>(gt(jh,`Received RPC '${e}' ${i}: `,t),t),t=>{throw yt(jh,`RPC '${e}' ${i} failed with error: `,t,"url: ",o,"request:",n),t})}Ho(e,t,n,r,s,i){return this.Go(e,t,n,r,s)}jo(e,t,n){e["X-Goog-Api-Client"]="gl-js/ fire/"+dt,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((t,n)=>e[n]=t),n&&n.headers.forEach((t,n)=>e[n]=t)}zo(e,t){const n=zh[e];return`${this.Uo}/v1/${t}:${n}`}terminate(){}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gh{constructor(e){this.Yo=e.Yo,this.Zo=e.Zo}Xo(e){this.e_=e}t_(e){this.n_=e}r_(e){this.i_=e}onMessage(e){this.s_=e}close(){this.Zo()}send(e){this.Yo(e)}o_(){this.e_()}__(){this.n_()}a_(e){this.i_(e)}u_(e){this.s_(e)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kh="WebChannelConnection";class Qh extends $h{constructor(e){super(e),this.c_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Jo(e,t,n,r,s){const i=qh();return new Promise((s,o)=>{const a=new et;a.setWithCredentials(!0),a.listenOnce(nt.COMPLETE,()=>{try{switch(a.getLastErrorCode()){case rt.NO_ERROR:const t=a.getResponseJson();gt(Kh,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(t)),s(t);break;case rt.TIMEOUT:gt(Kh,`RPC '${e}' ${i} timed out`),o(new Tt(Et.DEADLINE_EXCEEDED,"Request time out"));break;case rt.HTTP_ERROR:const n=a.getStatus();if(gt(Kh,`RPC '${e}' ${i} failed with status:`,n,"response text:",a.getResponseText()),n>0){let e=a.getResponseJson();Array.isArray(e)&&(e=e[0]);const t=e?.error;if(t&&t.status&&t.message){const e=function(e){const t=e.toLowerCase().replace(/_/g,"-");return Object.values(Et).indexOf(t)>=0?t:Et.UNKNOWN}(t.status);o(new Tt(e,t.message))}else o(new Tt(Et.UNKNOWN,"Server responded with status "+a.getStatus()))}else o(new Tt(Et.UNAVAILABLE,"Connection failed."));break;default:vt(9055,{l_:e,streamId:i,h_:a.getLastErrorCode(),P_:a.getLastError()})}}finally{gt(Kh,`RPC '${e}' ${i} completed.`)}});const c=JSON.stringify(r);gt(Kh,`RPC '${e}' ${i} sending request:`,r),a.send(t,"POST",c,n,15)})}T_(e,t,n){const r=qh(),s=[this.Uo,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=at(),o=ot(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;void 0!==c&&(a.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(a.useFetchStreams=!0),this.jo(a.initMessageHeaders,t,n),a.encodeInitMessageHeaders=!0;const u=s.join("");gt(Kh,`Creating RPC '${e}' stream ${r}: ${u}`,a);const h=i.createWebChannel(u,a);this.I_(h);let l=!1,d=!1;const f=new Gh({Yo:t=>{d?gt(Kh,`Not sending because RPC '${e}' stream ${r} is closed:`,t):(l||(gt(Kh,`Opening RPC '${e}' stream ${r} transport.`),h.open(),l=!0),gt(Kh,`RPC '${e}' stream ${r} sending:`,t),h.send(t))},Zo:()=>h.close()}),m=(e,t,n)=>{e.listen(t,e=>{try{n(e)}catch(e){setTimeout(()=>{throw e},0)}})};return m(h,tt.EventType.OPEN,()=>{d||(gt(Kh,`RPC '${e}' stream ${r} transport opened.`),f.o_())}),m(h,tt.EventType.CLOSE,()=>{d||(d=!0,gt(Kh,`RPC '${e}' stream ${r} transport closed`),f.a_(),this.E_(h))}),m(h,tt.EventType.ERROR,t=>{d||(d=!0,yt(Kh,`RPC '${e}' stream ${r} transport errored. Name:`,t.name,"Message:",t.message),f.a_(new Tt(Et.UNAVAILABLE,"The operation could not be completed")))}),m(h,tt.EventType.MESSAGE,t=>{if(!d){const n=t.data[0];It(!!n,16349);const s=n,i=s?.error||s[0]?.error;if(i){gt(Kh,`RPC '${e}' stream ${r} received error:`,i);const t=i.status;let n=function(e){const t=na[e];if(void 0!==t)return ia(t)}(t),s=i.message;void 0===n&&(n=Et.INTERNAL,s="Unknown error status: "+t+" with message "+i.message),d=!0,f.a_(new Tt(n,s)),h.close()}else gt(Kh,`RPC '${e}' stream ${r} received:`,n),f.u_(n)}}),m(o,it.STAT_EVENT,t=>{t.stat===st.PROXY?gt(Kh,`RPC '${e}' stream ${r} detected buffering proxy`):t.stat===st.NOPROXY&&gt(Kh,`RPC '${e}' stream ${r} detected no buffering proxy`)}),setTimeout(()=>{f.__()},0),f}terminate(){this.c_.forEach(e=>e.close()),this.c_=[]}I_(e){this.c_.push(e)}E_(e){this.c_=this.c_.filter(t=>t===e)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hh(){return"undefined"!=typeof window?window:null}function Wh(){return"undefined"!=typeof document?document:null}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jh(e){return new Sa(e,!0)}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xh{constructor(e,t,n=1e3,r=1.5,s=6e4){this.Mi=e,this.timerId=t,this.d_=n,this.A_=r,this.R_=s,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(e){this.cancel();const t=Math.floor(this.V_+this.y_()),n=Math.max(0,Date.now()-this.f_),r=Math.max(0,t-n);r>0&&gt("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.V_} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){null!==this.m_&&(this.m_.skipDelay(),this.m_=null)}cancel(){null!==this.m_&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yh="PersistentStream";class Zh{constructor(e,t,n,r,s,i,o,a){this.Mi=e,this.S_=n,this.b_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=o,this.listener=a,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new Xh(e,t)}x_(){return 1===this.state||5===this.state||this.O_()}O_(){return 2===this.state||3===this.state}start(){this.F_=0,4!==this.state?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&null===this.C_&&(this.C_=this.Mi.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(e){this.Q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}Q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.Q_(),this.U_(),this.M_.cancel(),this.D_++,4!==e?this.M_.reset():t&&t.code===Et.RESOURCE_EXHAUSTED?(pt(t.toString()),pt("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===Et.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.K_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.r_(t)}K_(){}auth(){this.state=1;const e=this.W_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([e,n])=>{this.D_===t&&this.G_(e,n)},t=>{e(()=>{const e=new Tt(Et.UNKNOWN,"Fetching auth token failed: "+t.message);return this.z_(e)})})}G_(e,t){const n=this.W_(this.D_);this.stream=this.j_(e,t),this.stream.Xo(()=>{n(()=>this.listener.Xo())}),this.stream.t_(()=>{n(()=>(this.state=2,this.v_=this.Mi.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.t_()))}),this.stream.r_(e=>{n(()=>this.z_(e))}),this.stream.onMessage(e=>{n(()=>1==++this.F_?this.J_(e):this.onNext(e))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return gt(Yh,`close with error: ${e}`),this.stream=null,this.close(4,e)}W_(e){return t=>{this.Mi.enqueueAndForget(()=>this.D_===e?t():(gt(Yh,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class el extends Zh{constructor(e,t,n,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,r,i),this.serializer=s}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=function(e,t){let n;if("targetChange"in t){t.targetChange;const r=function(e){return"NO_CHANGE"===e?0:"ADD"===e?1:"REMOVE"===e?2:"CURRENT"===e?3:"RESET"===e?4:vt(39313,{state:e})}(t.targetChange.targetChangeType||"NO_CHANGE"),s=t.targetChange.targetIds||[],i=function(e,t){return e.useProto3Json?(It(void 0===t||"string"==typeof t,58123),gs.fromBase64String(t||"")):(It(void 0===t||t instanceof Buffer||t instanceof Uint8Array,16193),gs.fromUint8Array(t||new Uint8Array))}(e,t.targetChange.resumeToken),o=t.targetChange.cause,a=o&&function(e){const t=void 0===e.code?Et.UNKNOWN:ia(e.code);return new Tt(t,e.message||"")}(o);n=new ya(r,s,i,a||null)}else if("documentChange"in t){t.documentChange;const r=t.documentChange;r.document,r.document.name,r.document.updateTime;const s=Pa(e,r.document.name),i=Na(r.document.updateTime),o=r.document.createTime?Na(r.document.createTime):un.min(),a=new ii({mapValue:{fields:r.document.fields}}),c=ai.newFoundDocument(s,i,o,a),u=r.targetIds||[],h=r.removedTargetIds||[];n=new ga(u,h,c.key,c)}else if("documentDelete"in t){t.documentDelete;const r=t.documentDelete;r.document;const s=Pa(e,r.document),i=r.readTime?Na(r.readTime):un.min(),o=ai.newNoDocument(s,i),a=r.removedTargetIds||[];n=new ga([],a,o.key,o)}else if("documentRemove"in t){t.documentRemove;const r=t.documentRemove;r.document;const s=Pa(e,r.document),i=r.removedTargetIds||[];n=new ga([],i,s,null)}else{if(!("filter"in t))return vt(11601,{Rt:t});{t.filter;const e=t.filter;e.targetId;const{count:r=0,unchangedNames:s}=e,i=new ta(r,s),o=e.targetId;n=new pa(o,i)}}return n}(this.serializer,e),n=function(e){if(!("targetChange"in e))return un.min();const t=e.targetChange;return t.targetIds&&t.targetIds.length?un.min():t.readTime?Na(t.readTime):un.min()}(e);return this.listener.H_(t,n)}Y_(e){const t={};t.database=Va(this.serializer),t.addTarget=function(e,t){let n;const r=t.target;if(n=Li(r)?{documents:$a(e,r)}:{query:Ga(e,r).ft},n.targetId=t.targetId,t.resumeToken.approximateByteSize()>0){n.resumeToken=xa(e,t.resumeToken);const r=Ca(e,t.expectedCount);null!==r&&(n.expectedCount=r)}else if(t.snapshotVersion.compareTo(un.min())>0){n.readTime=Aa(e,t.snapshotVersion.toTimestamp());const r=Ca(e,t.expectedCount);null!==r&&(n.expectedCount=r)}return n}(this.serializer,e);const n=function(e,t){const n=function(e){switch(e){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return vt(28987,{purpose:e})}}(t.purpose);return null==n?null:{"goog-listen-tags":n}}(this.serializer,e);n&&(t.labels=n),this.q_(t)}Z_(e){const t={};t.database=Va(this.serializer),t.removeTarget=e,this.q_(t)}}class tl extends Zh{constructor(e,t,n,r,s,i){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,r,i),this.serializer=s}get X_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}K_(){this.X_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return It(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,It(!e.writeResults||0===e.writeResults.length,55816),this.listener.ta()}onNext(e){It(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=function(e,t){return e&&e.length>0?(It(void 0!==t,14353),e.map(e=>function(e,t){let n=e.updateTime?Na(e.updateTime):Na(t);return n.isEqual(un.min())&&(n=Na(t)),new Po(n,e.transformResults||[])}(e,t))):[]}(e.writeResults,e.commitTime),n=Na(e.commitTime);return this.listener.na(n,t)}ra(){const e={};e.database=Va(this.serializer),this.q_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map(e=>ja(this.serializer,e))};this.q_(t)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nl{}class rl extends nl{constructor(e,t,n,r){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new Tt(Et.FAILED_PRECONDITION,"The client has already been terminated.")}Go(e,t,n,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Go(e,Ra(t,n),r,s,i)).catch(e=>{throw"FirebaseError"===e.name?(e.code===Et.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new Tt(Et.UNKNOWN,e.toString())})}Ho(e,t,n,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Ho(e,Ra(t,n),r,i,o,s)).catch(e=>{throw"FirebaseError"===e.name?(e.code===Et.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new Tt(Et.UNKNOWN,e.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}class sl{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){0===this.oa&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){"Online"===this.state?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,"Online"===e&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(pt(t),this.aa=!1):gt("OnlineStateTracker",t)}Pa(){null!==this._a&&(this._a.cancel(),this._a=null)}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const il="RemoteStore";class ol{constructor(e,t,n,r,s){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.da=[],this.Aa=s,this.Aa.Oo(e=>{n.enqueueAndForget(async()=>{gl(this)&&(gt(il,"Restarting streams for network reachability change."),await async function(e){const t=_t(e);t.Ea.add(4),await cl(t),t.Ra.set("Unknown"),t.Ea.delete(4),await al(t)}(this))})}),this.Ra=new sl(n,r)}}async function al(e){if(gl(e))for(const t of e.da)await t(!0)}async function cl(e){for(const t of e.da)await t(!1)}function ul(e,t){const n=_t(e);n.Ia.has(t.targetId)||(n.Ia.set(t.targetId,t),ml(n)?fl(n):Ol(n).O_()&&ll(n,t))}function hl(e,t){const n=_t(e),r=Ol(n);n.Ia.delete(t),r.O_()&&dl(n,t),0===n.Ia.size&&(r.O_()?r.L_():gl(n)&&n.Ra.set("Unknown"))}function ll(e,t){if(e.Va.Ue(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(un.min())>0){const n=e.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(n)}Ol(e).Y_(t)}function dl(e,t){e.Va.Ue(t),Ol(e).Z_(t)}function fl(e){e.Va=new va({getRemoteKeysForTarget:t=>e.remoteSyncer.getRemoteKeysForTarget(t),At:t=>e.Ia.get(t)||null,ht:()=>e.datastore.serializer.databaseId}),Ol(e).start(),e.Ra.ua()}function ml(e){return gl(e)&&!Ol(e).x_()&&e.Ia.size>0}function gl(e){return 0===_t(e).Ea.size}function pl(e){e.Va=void 0}async function yl(e){e.Ra.set("Online")}async function wl(e){e.Ia.forEach((t,n)=>{ll(e,t)})}async function vl(e,t){pl(e),ml(e)?(e.Ra.ha(t),fl(e)):e.Ra.set("Unknown")}async function bl(e,t,n){if(e.Ra.set("Online"),t instanceof ya&&2===t.state&&t.cause)try{await async function(e,t){const n=t.cause;for(const r of t.targetIds)e.Ia.has(r)&&(await e.remoteSyncer.rejectListen(r,n),e.Ia.delete(r),e.Va.removeTarget(r))}(e,t)}catch(n){gt(il,"Failed to remove targets %s: %s ",t.targetIds.join(","),n),await Il(e,n)}else if(t instanceof ga?e.Va.Ze(t):t instanceof pa?e.Va.st(t):e.Va.tt(t),!n.isEqual(un.min()))try{const t=await fh(e.localStore);n.compareTo(t)>=0&&await function(e,t){const n=e.Va.Tt(t);return n.targetChanges.forEach((n,r)=>{if(n.resumeToken.approximateByteSize()>0){const s=e.Ia.get(r);s&&e.Ia.set(r,s.withResumeToken(n.resumeToken,t))}}),n.targetMismatches.forEach((t,n)=>{const r=e.Ia.get(t);if(!r)return;e.Ia.set(t,r.withResumeToken(gs.EMPTY_BYTE_STRING,r.snapshotVersion)),dl(e,t);const s=new rc(r.target,t,n,r.sequenceNumber);ll(e,s)}),e.remoteSyncer.applyRemoteEvent(n)}(e,n)}catch(t){gt(il,"Failed to raise snapshot:",t),await Il(e,t)}}async function Il(e,t,n){if(!Rn(t))throw t;e.Ea.add(1),await cl(e),e.Ra.set("Offline"),n||(n=()=>fh(e.localStore)),e.asyncQueue.enqueueRetryable(async()=>{gt(il,"Retrying IndexedDB access"),await n(),e.Ea.delete(1),await al(e)})}function _l(e,t){return t().catch(n=>Il(e,n,t))}async function El(e){const t=_t(e),n=Pl(t);let r=t.Ta.length>0?t.Ta[t.Ta.length-1].batchId:qn;for(;Tl(t);)try{const e=await gh(t.localStore,r);if(null===e){0===t.Ta.length&&n.L_();break}r=e.batchId,Sl(t,e)}catch(e){await Il(t,e)}Cl(t)&&Al(t)}function Tl(e){return gl(e)&&e.Ta.length<10}function Sl(e,t){e.Ta.push(t);const n=Pl(e);n.O_()&&n.X_&&n.ea(t.mutations)}function Cl(e){return gl(e)&&!Pl(e).x_()&&e.Ta.length>0}function Al(e){Pl(e).start()}async function xl(e){Pl(e).ra()}async function Dl(e){const t=Pl(e);for(const n of e.Ta)t.ea(n.mutations)}async function Nl(e,t,n){const r=e.Ta.shift(),s=Yo.from(r,t,n);await _l(e,()=>e.remoteSyncer.applySuccessfulWrite(s)),await El(e)}async function kl(e,t){t&&Pl(e).X_&&await async function(e,t){if(function(e){return sa(e)&&e!==Et.ABORTED}(t.code)){const n=e.Ta.shift();Pl(e).B_(),await _l(e,()=>e.remoteSyncer.rejectFailedWrite(n.batchId,t)),await El(e)}}(e,t),Cl(e)&&Al(e)}async function Rl(e,t){const n=_t(e);n.asyncQueue.verifyOperationInProgress(),gt(il,"RemoteStore received new credentials");const r=gl(n);n.Ea.add(3),await cl(n),r&&n.Ra.set("Unknown"),await n.remoteSyncer.handleCredentialChange(t),n.Ea.delete(3),await al(n)}async function Ml(e,t){const n=_t(e);t?(n.Ea.delete(2),await al(n)):t||(n.Ea.add(2),await cl(n),n.Ra.set("Unknown"))}function Ol(e){return e.ma||(e.ma=function(e,t,n){const r=_t(e);return r.sa(),new el(t,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}(e.datastore,e.asyncQueue,{Xo:yl.bind(null,e),t_:wl.bind(null,e),r_:vl.bind(null,e),H_:bl.bind(null,e)}),e.da.push(async t=>{t?(e.ma.B_(),ml(e)?fl(e):e.Ra.set("Unknown")):(await e.ma.stop(),pl(e))})),e.ma}function Pl(e){return e.fa||(e.fa=function(e,t,n){const r=_t(e);return r.sa(),new tl(t,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(e.datastore,e.asyncQueue,{Xo:()=>Promise.resolve(),t_:xl.bind(null,e),r_:kl.bind(null,e),ta:Dl.bind(null,e),na:Nl.bind(null,e)}),e.da.push(async t=>{t?(e.fa.B_(),await El(e)):(await e.fa.stop(),e.Ta.length>0&&(gt(il,`Stopping write stream with ${e.Ta.length} pending writes`),e.Ta=[]))})),e.fa
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}class Ll{constructor(e,t,n,r,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=r,this.removalCallback=s,this.deferred=new St,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(e=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,r,s){const i=Date.now()+n,o=new Ll(e,t,i,r,s);return o.start(n),o}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new Tt(Et.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Fl(e,t){if(pt("AsyncQueue",`${t}: ${e}`),Rn(e))return new Tt(Et.UNAVAILABLE,`${t}: ${e}`);throw e}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vl{static emptySet(e){return new Vl(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||Ht.comparator(t.key,n.key):(e,t)=>Ht.comparator(e.key,t.key),this.keyedMap=co(),this.sortedSet=new as(this.comparator)}has(e){return null!=this.keyedMap.get(e)}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,n)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Vl))return!1;if(this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const e=t.getNext().key,r=n.getNext().key;if(!e.isEqual(r))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),0===e.length?"DocumentSet ()":"DocumentSet (\n  "+e.join("  \n")+"\n)"}copy(e,t){const n=new Vl;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bl{constructor(){this.ga=new as(Ht.comparator)}track(e){const t=e.doc.key,n=this.ga.get(t);n?0!==e.type&&3===n.type?this.ga=this.ga.insert(t,e):3===e.type&&1!==n.type?this.ga=this.ga.insert(t,{type:n.type,doc:e.doc}):2===e.type&&2===n.type?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):2===e.type&&0===n.type?this.ga=this.ga.insert(t,{type:0,doc:e.doc}):1===e.type&&0===n.type?this.ga=this.ga.remove(t):1===e.type&&2===n.type?this.ga=this.ga.insert(t,{type:1,doc:n.doc}):0===e.type&&1===n.type?this.ga=this.ga.insert(t,{type:2,doc:e.doc}):vt(63341,{Rt:e,pa:n}):this.ga=this.ga.insert(t,e)}ya(){const e=[];return this.ga.inorderTraversal((t,n)=>{e.push(n)}),e}}class Ul{constructor(e,t,n,r,s,i,o,a,c){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=o,this.excludesMetadataChanges=a,this.hasCachedResults=c}static fromInitialDocuments(e,t,n,r,s){const i=[];return t.forEach(e=>{i.push({type:0,doc:e})}),new Ul(e,t,Vl.emptySet(t),i,n,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Xi(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let r=0;r<t.length;r++)if(t[r].type!==n[r].type||!t[r].doc.isEqual(n[r].doc))return!1;return!0}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ql{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(e=>e.Da())}}class jl{constructor(){this.queries=zl(),this.onlineState="Unknown",this.Ca=new Set}terminate(){!function(e,t){const n=_t(e),r=n.queries;n.queries=zl(),r.forEach((e,n)=>{for(const r of n.Sa)r.onError(t)})}(this,new Tt(Et.ABORTED,"Firestore shutting down"))}}function zl(){return new so(e=>Yi(e),Xi)}async function $l(e,t){const n=_t(e);let r=3;const s=t.query;let i=n.queries.get(s);i?!i.ba()&&t.Da()&&(r=2):(i=new ql,r=t.Da()?0:1);try{switch(r){case 0:i.wa=await n.onListen(s,!0);break;case 1:i.wa=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(e){const n=Fl(e,`Initialization of query '${Zi(t.query)}' failed`);return void t.onError(n)}n.queries.set(s,i),i.Sa.push(t),t.va(n.onlineState),i.wa&&t.Fa(i.wa)&&Hl(n)}async function Gl(e,t){const n=_t(e),r=t.query;let s=3;const i=n.queries.get(r);if(i){const e=i.Sa.indexOf(t);e>=0&&(i.Sa.splice(e,1),0===i.Sa.length?s=t.Da()?0:1:!i.ba()&&t.Da()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function Kl(e,t){const n=_t(e);let r=!1;for(const s of t){const e=s.query,t=n.queries.get(e);if(t){for(const e of t.Sa)e.Fa(s)&&(r=!0);t.wa=s}}r&&Hl(n)}function Ql(e,t,n){const r=_t(e),s=r.queries.get(t);if(s)for(const i of s.Sa)i.onError(n);r.queries.delete(t)}function Hl(e){e.Ca.forEach(e=>{e.next()})}var Wl,Jl;(Jl=Wl||(Wl={})).Ma="default",Jl.Cache="cache";class Xl{constructor(e,t,n){this.query=e,this.xa=t,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=n||{}}Fa(e){if(!this.options.includeMetadataChanges){const t=[];for(const n of e.docChanges)3!==n.type&&t.push(n);e=new Ul(e.query,e.docs,e.oldDocs,t,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),t=!0):this.La(e,this.onlineState)&&(this.ka(e),t=!0),this.Na=e,t}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let t=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),t=!0),t}La(e,t){if(!e.fromCache)return!0;if(!this.Da())return!0;const n="Offline"!==t;return(!this.options.qa||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||"Offline"===t)}Ba(e){if(e.docChanges.length>0)return!0;const t=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&!0===this.options.includeMetadataChanges}ka(e){e=Ul.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==Wl.Cache}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yl{constructor(e,t){this.Qa=e,this.byteLength=t}$a(){return"metadata"in this.Qa}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zl{constructor(e){this.serializer=e}$s(e){return Pa(this.serializer,e)}Us(e){return e.metadata.exists?qa(this.serializer,e.document,!1):ai.newNoDocument(this.$s(e.metadata.name),this.Ks(e.metadata.readTime))}Ks(e){return Na(e)}}class ed{constructor(e,t){this.Ua=e,this.serializer=t,this.Ka=[],this.Wa=[],this.collectionGroups=new Set,this.progress=td(e)}get queries(){return this.Ka}get documents(){return this.Wa}Ga(e){this.progress.bytesLoaded+=e.byteLength;let t=this.progress.documentsLoaded;if(e.Qa.namedQuery)this.Ka.push(e.Qa.namedQuery);else if(e.Qa.documentMetadata){this.Wa.push({metadata:e.Qa.documentMetadata}),e.Qa.documentMetadata.exists||++t;const n=Gt.fromString(e.Qa.documentMetadata.name);this.collectionGroups.add(n.get(n.length-2))}else e.Qa.document&&(this.Wa[this.Wa.length-1].document=e.Qa.document,++t);return t!==this.progress.documentsLoaded?(this.progress.documentsLoaded=t,{...this.progress}):null}za(e){const t=new Map,n=new Zl(this.serializer);for(const r of e)if(r.metadata.queries){const e=n.$s(r.metadata.name);for(const n of r.metadata.queries){const r=(t.get(n)||po()).add(e);t.set(n,r)}}return t}async ja(e){const t=await async function(e,t,n,r){const s=_t(e);let i=po(),o=oo();for(const u of n){const e=t.$s(u.metadata.name);u.document&&(i=i.add(e));const n=t.Us(u);n.setReadTime(t.Ks(u.metadata.readTime)),o=o.insert(e,n)}const a=s.Ns.newChangeBuffer({trackRemovals:!0}),c=await ph(s,function(e){return Ki(ji(Gt.fromString(`__bundle__/docs/${e}`)))}(r));return s.persistence.runTransaction("Apply bundle documents","readwrite",e=>mh(e,a,o).next(t=>(a.apply(e),t)).next(t=>s.Pi.removeMatchingKeysForTargetId(e,c.targetId).next(()=>s.Pi.addMatchingKeys(e,i,c.targetId)).next(()=>s.localDocuments.getLocalViewOfDocuments(e,t.ks,t.qs)).next(()=>t.ks)))}(e,new Zl(this.serializer),this.Wa,this.Ua.id),n=this.za(this.documents);for(const r of this.Ka)await _h(e,r,n.get(r.name));return this.progress.taskState="Success",{progress:this.progress,Ja:this.collectionGroups,Ha:t}}}function td(e){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:e.totalDocuments,totalBytes:e.totalBytes}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nd{constructor(e){this.key=e}}class rd{constructor(e){this.key=e}}class sd{constructor(e,t){this.query=e,this.Ya=t,this.Za=null,this.hasCachedResults=!1,this.current=!1,this.Xa=po(),this.mutatedKeys=po(),this.eu=no(e),this.tu=new Vl(this.eu)}get nu(){return this.Ya}ru(e,t){const n=t?t.iu:new Bl,r=t?t.tu:this.tu;let s=t?t.mutatedKeys:this.mutatedKeys,i=r,o=!1;const a="F"===this.query.limitType&&r.size===this.query.limit?r.last():null,c="L"===this.query.limitType&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((e,t)=>{const u=r.get(e),h=eo(this.query,t)?t:null,l=!!u&&this.mutatedKeys.has(u.key),d=!!h&&(h.hasLocalMutations||this.mutatedKeys.has(h.key)&&h.hasCommittedMutations);let f=!1;u&&h?u.data.isEqual(h.data)?l!==d&&(n.track({type:3,doc:h}),f=!0):this.su(u,h)||(n.track({type:2,doc:h}),f=!0,(a&&this.eu(h,a)>0||c&&this.eu(h,c)<0)&&(o=!0)):!u&&h?(n.track({type:0,doc:h}),f=!0):u&&!h&&(n.track({type:1,doc:u}),f=!0,(a||c)&&(o=!0)),f&&(h?(i=i.add(h),s=d?s.add(e):s.delete(e)):(i=i.delete(e),s=s.delete(e)))}),null!==this.query.limit)for(;i.size>this.query.limit;){const e="F"===this.query.limitType?i.last():i.first();i=i.delete(e.key),s=s.delete(e.key),n.track({type:1,doc:e})}return{tu:i,iu:n,Cs:o,mutatedKeys:s}}su(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,r){const s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const i=e.iu.ya();i.sort((e,t)=>function(e,t){const n=e=>{switch(e){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return vt(20277,{Rt:e})}};return n(e)-n(t)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e.type,t.type)||this.eu(e.doc,t.doc)),this.ou(n),r=r??!1;const o=t&&!r?this._u():[],a=0===this.Xa.size&&this.current&&!r?1:0,c=a!==this.Za;return this.Za=a,0!==i.length||c?{snapshot:new Ul(this.query,e.tu,s,i,e.mutatedKeys,0===a,c,!1,!!n&&n.resumeToken.approximateByteSize()>0),au:o}:{au:o}}va(e){return this.current&&"Offline"===e?(this.current=!1,this.applyChanges({tu:this.tu,iu:new Bl,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{au:[]}}uu(e){return!this.Ya.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(e=>this.Ya=this.Ya.add(e)),e.modifiedDocuments.forEach(e=>{}),e.removedDocuments.forEach(e=>this.Ya=this.Ya.delete(e)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Xa;this.Xa=po(),this.tu.forEach(e=>{this.uu(e.key)&&(this.Xa=this.Xa.add(e.key))});const t=[];return e.forEach(e=>{this.Xa.has(e)||t.push(new rd(e))}),this.Xa.forEach(n=>{e.has(n)||t.push(new nd(n))}),t}cu(e){this.Ya=e.Qs,this.Xa=po();const t=this.ru(e.documents);return this.applyChanges(t,!0)}lu(){return Ul.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,0===this.Za,this.hasCachedResults)}}const id="SyncEngine";class od{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class ad{constructor(e){this.key=e,this.hu=!1}}class cd{constructor(e,t,n,r,s,i){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Pu={},this.Tu=new so(e=>Yi(e),Xi),this.Iu=new Map,this.Eu=new Set,this.du=new as(Ht.comparator),this.Au=new Map,this.Ru=new Bu,this.Vu={},this.mu=new Map,this.fu=lu.cr(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return!0===this.gu}}async function ud(e,t,n=!0){const r=Vd(e);let s;const i=r.Tu.get(t);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.lu()):s=await ld(r,t,n,!0),s}async function hd(e,t){const n=Vd(e);await ld(n,t,!0,!1)}async function ld(e,t,n,r){const s=await ph(e.localStore,Ki(t)),i=s.targetId,o=e.sharedClientState.addLocalQueryTarget(i,n);let a;return r&&(a=await dd(e,t,i,"current"===o,s.resumeToken)),e.isPrimaryClient&&n&&ul(e.remoteStore,s),a}async function dd(e,t,n,r,s){e.pu=(t,n,r)=>async function(e,t,n,r){let s=t.view.ru(n);s.Cs&&(s=await wh(e.localStore,t.query,!1).then(({documents:e})=>t.view.ru(e,s)));const i=r&&r.targetChanges.get(t.targetId),o=r&&null!=r.targetMismatches.get(t.targetId),a=t.view.applyChanges(s,e.isPrimaryClient,i,o);return Td(e,t.targetId,a.au),a.snapshot}(e,t,n,r);const i=await wh(e.localStore,t,!0),o=new sd(t,i.Qs),a=o.ru(i.documents),c=ma.createSynthesizedTargetChangeForCurrentChange(n,r&&"Offline"!==e.onlineState,s),u=o.applyChanges(a,e.isPrimaryClient,c);Td(e,n,u.au);const h=new od(t,n,o);return e.Tu.set(t,h),e.Iu.has(n)?e.Iu.get(n).push(t):e.Iu.set(n,[t]),u.snapshot}async function fd(e,t,n){const r=_t(e),s=r.Tu.get(t),i=r.Iu.get(s.targetId);if(i.length>1)return r.Iu.set(s.targetId,i.filter(e=>!Xi(e,t))),void r.Tu.delete(t);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await yh(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&hl(r.remoteStore,s.targetId),_d(r,s.targetId)}).catch(Tn)):(_d(r,s.targetId),await yh(r.localStore,s.targetId,!0))}async function md(e,t){const n=_t(e),r=n.Tu.get(t),s=n.Iu.get(r.targetId);n.isPrimaryClient&&1===s.length&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),hl(n.remoteStore,r.targetId))}async function gd(e,t){const n=_t(e);try{const e=await function(e,t){const n=_t(e),r=t.snapshotVersion;let s=n.Ms;return n.persistence.runTransaction("Apply remote event","readwrite-primary",e=>{const i=n.Ns.newChangeBuffer({trackRemovals:!0});s=n.Ms;const o=[];t.targetChanges.forEach((i,a)=>{const c=s.get(a);if(!c)return;o.push(n.Pi.removeMatchingKeys(e,i.removedDocuments,a).next(()=>n.Pi.addMatchingKeys(e,i.addedDocuments,a)));let u=c.withSequenceNumber(e.currentSequenceNumber);null!==t.targetMismatches.get(a)?u=u.withResumeToken(gs.EMPTY_BYTE_STRING,un.min()).withLastLimboFreeSnapshotVersion(un.min()):i.resumeToken.approximateByteSize()>0&&(u=u.withResumeToken(i.resumeToken,r)),s=s.insert(a,u),function(e,t,n){return 0===e.resumeToken.approximateByteSize()||(t.snapshotVersion.toMicroseconds()-e.snapshotVersion.toMicroseconds()>=3e8||n.addedDocuments.size+n.modifiedDocuments.size+n.removedDocuments.size>0)}(c,u,i)&&o.push(n.Pi.updateTargetData(e,u))});let a=oo(),c=po();if(t.documentUpdates.forEach(r=>{t.resolvedLimboDocuments.has(r)&&o.push(n.persistence.referenceDelegate.updateLimboDocument(e,r))}),o.push(mh(e,i,t.documentUpdates).next(e=>{a=e.ks,c=e.qs})),!r.isEqual(un.min())){const t=n.Pi.getLastRemoteSnapshotVersion(e).next(t=>n.Pi.setTargetsMetadata(e,e.currentSequenceNumber,r));o.push(t)}return Sn.waitFor(o).next(()=>i.apply(e)).next(()=>n.localDocuments.getLocalViewOfDocuments(e,a,c)).next(()=>a)}).then(e=>(n.Ms=s,e))}(n.localStore,t);t.targetChanges.forEach((e,t)=>{const r=n.Au.get(t);r&&(It(e.addedDocuments.size+e.modifiedDocuments.size+e.removedDocuments.size<=1,22616),e.addedDocuments.size>0?r.hu=!0:e.modifiedDocuments.size>0?It(r.hu,14607):e.removedDocuments.size>0&&(It(r.hu,42227),r.hu=!1))}),await Ad(n,e,t)}catch(e){await Tn(e)}}function pd(e,t,n){const r=_t(e);if(r.isPrimaryClient&&0===n||!r.isPrimaryClient&&1===n){const e=[];r.Tu.forEach((n,r)=>{const s=r.view.va(t);s.snapshot&&e.push(s.snapshot)}),function(e,t){const n=_t(e);n.onlineState=t;let r=!1;n.queries.forEach((e,n)=>{for(const s of n.Sa)s.va(t)&&(r=!0)}),r&&Hl(n)}(r.eventManager,t),e.length&&r.Pu.H_(e),r.onlineState=t,r.isPrimaryClient&&r.sharedClientState.setOnlineState(t)}}async function yd(e,t,n){const r=_t(e);r.sharedClientState.updateQueryState(t,"rejected",n);const s=r.Au.get(t),i=s&&s.key;if(i){let e=new as(Ht.comparator);e=e.insert(i,ai.newNoDocument(i,un.min()));const n=po().add(i),s=new fa(un.min(),new Map,new as(Lt),e,n);await gd(r,s),r.du=r.du.remove(i),r.Au.delete(t),Cd(r)}else await yh(r.localStore,t,!1).then(()=>_d(r,t,n)).catch(Tn)}async function wd(e,t){const n=_t(e),r=t.batch.batchId;try{const e=await function(e,t){const n=_t(e);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",e=>{const r=t.batch.keys(),s=n.Ns.newChangeBuffer({trackRemovals:!0});return function(e,t,n,r){const s=n.batch,i=s.keys();let o=Sn.resolve();return i.forEach(e=>{o=o.next(()=>r.getEntry(t,e)).next(t=>{const i=n.docVersions.get(e);It(null!==i,48541),t.version.compareTo(i)<0&&(s.applyToRemoteDocument(t,n),t.isValidDocument()&&(t.setReadTime(n.commitVersion),r.addEntry(t)))})}),o.next(()=>e.mutationQueue.removeMutationBatch(t,s))}(n,e,t,s).next(()=>s.apply(e)).next(()=>n.mutationQueue.performConsistencyCheck(e)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(e,r,t.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,function(e){let t=po();for(let n=0;n<e.mutationResults.length;++n)e.mutationResults[n].transformResults.length>0&&(t=t.add(e.batch.mutations[n].key));return t}(t))).next(()=>n.localDocuments.getDocuments(e,r))})}(n.localStore,t);Id(n,r,null),bd(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await Ad(n,e)}catch(e){await Tn(e)}}async function vd(e,t,n){const r=_t(e);try{const e=await function(e,t){const n=_t(e);return n.persistence.runTransaction("Reject batch","readwrite-primary",e=>{let r;return n.mutationQueue.lookupMutationBatch(e,t).next(t=>(It(null!==t,37113),r=t.keys(),n.mutationQueue.removeMutationBatch(e,t))).next(()=>n.mutationQueue.performConsistencyCheck(e)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(e,r,t)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,r)).next(()=>n.localDocuments.getDocuments(e,r))})}(r.localStore,t);Id(r,t,n),bd(r,t),r.sharedClientState.updateMutationState(t,"rejected",n),await Ad(r,e)}catch(n){await Tn(n)}}function bd(e,t){(e.mu.get(t)||[]).forEach(e=>{e.resolve()}),e.mu.delete(t)}function Id(e,t,n){const r=_t(e);let s=r.Vu[r.currentUser.toKey()];if(s){const e=s.get(t);e&&(n?e.reject(n):e.resolve(),s=s.remove(t)),r.Vu[r.currentUser.toKey()]=s}}function _d(e,t,n=null){e.sharedClientState.removeLocalQueryTarget(t);for(const r of e.Iu.get(t))e.Tu.delete(r),n&&e.Pu.yu(r,n);e.Iu.delete(t),e.isPrimaryClient&&e.Ru.jr(t).forEach(t=>{e.Ru.containsKey(t)||Ed(e,t)})}function Ed(e,t){e.Eu.delete(t.path.canonicalString());const n=e.du.get(t);null!==n&&(hl(e.remoteStore,n),e.du=e.du.remove(t),e.Au.delete(n),Cd(e))}function Td(e,t,n){for(const r of n)r instanceof nd?(e.Ru.addReference(r.key,t),Sd(e,r)):r instanceof rd?(gt(id,"Document no longer in limbo: "+r.key),e.Ru.removeReference(r.key,t),e.Ru.containsKey(r.key)||Ed(e,r.key)):vt(19791,{wu:r})}function Sd(e,t){const n=t.key,r=n.path.canonicalString();e.du.get(n)||e.Eu.has(r)||(gt(id,"New document in limbo: "+n),e.Eu.add(r),Cd(e))}function Cd(e){for(;e.Eu.size>0&&e.du.size<e.maxConcurrentLimboResolutions;){const t=e.Eu.values().next().value;e.Eu.delete(t);const n=new Ht(Gt.fromString(t)),r=e.fu.next();e.Au.set(r,new ad(n)),e.du=e.du.insert(n,r),ul(e.remoteStore,new rc(Ki(ji(n.path)),r,"TargetPurposeLimboResolution",Un.ce))}}async function Ad(e,t,n){const r=_t(e),s=[],i=[],o=[];r.Tu.isEmpty()||(r.Tu.forEach((e,a)=>{o.push(r.pu(a,t,n).then(e=>{if((e||n)&&r.isPrimaryClient){const t=e?!e.fromCache:n?.targetChanges.get(a.targetId)?.current;r.sharedClientState.updateQueryState(a.targetId,t?"current":"not-current")}if(e){s.push(e);const t=oh.As(a.targetId,e);i.push(t)}}))}),await Promise.all(o),r.Pu.H_(s),await async function(e,t){const n=_t(e);try{await n.persistence.runTransaction("notifyLocalViewChanges","readwrite",e=>Sn.forEach(t,t=>Sn.forEach(t.Es,r=>n.persistence.referenceDelegate.addReference(e,t.targetId,r)).next(()=>Sn.forEach(t.ds,r=>n.persistence.referenceDelegate.removeReference(e,t.targetId,r)))))}catch(e){if(!Rn(e))throw e;gt(uh,"Failed to update sequence numbers: "+e)}for(const r of t){const e=r.targetId;if(!r.fromCache){const t=n.Ms.get(e),r=t.snapshotVersion,s=t.withLastLimboFreeSnapshotVersion(r);n.Ms=n.Ms.insert(e,s)}}}(r.localStore,i))}async function xd(e,t){const n=_t(e);if(!n.currentUser.isEqual(t)){gt(id,"User change. New user:",t.toKey());const e=await dh(n.localStore,t);n.currentUser=t,function(e,t){e.mu.forEach(e=>{e.forEach(e=>{e.reject(new Tt(Et.CANCELLED,t))})}),e.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(t,e.removedBatchIds,e.addedBatchIds),await Ad(n,e.Ls)}}function Dd(e,t){const n=_t(e),r=n.Au.get(t);if(r&&r.hu)return po().add(r.key);{let e=po();const r=n.Iu.get(t);if(!r)return e;for(const t of r){const r=n.Tu.get(t);e=e.unionWith(r.view.nu)}return e}}async function Nd(e,t){const n=_t(e),r=await wh(n.localStore,t.query,!0),s=t.view.cu(r);return n.isPrimaryClient&&Td(n,t.targetId,s.au),s}async function kd(e,t){const n=_t(e);return bh(n.localStore,t).then(e=>Ad(n,e))}async function Rd(e,t,n,r){const s=_t(e),i=await function(e,t){const n=_t(e),r=_t(n.mutationQueue);return n.persistence.runTransaction("Lookup mutation documents","readonly",e=>r.er(e,t).next(t=>t?n.localDocuments.getDocuments(e,t):Sn.resolve(null)))}(s.localStore,t);null!==i?("pending"===n?await El(s.remoteStore):"acknowledged"===n||"rejected"===n?(Id(s,t,r||null),bd(s,t),function(e,t){_t(_t(e).mutationQueue).ir(t)}(s.localStore,t)):vt(6720,"Unknown batchState",{Su:n}),await Ad(s,i)):gt(id,"Cannot apply mutation batch with id: "+t)}async function Md(e,t,n){const r=_t(e),s=[],i=[];for(const o of t){let e;const t=r.Iu.get(o);if(t&&0!==t.length){e=await ph(r.localStore,Ki(t[0]));for(const e of t){const t=r.Tu.get(e),n=await Nd(r,t);n.snapshot&&i.push(n.snapshot)}}else{const t=await vh(r.localStore,o);e=await ph(r.localStore,t),await dd(r,Od(t),o,!1,e.resumeToken)}s.push(e)}return r.Pu.H_(i),s}function Od(e){return qi(e.path,e.collectionGroup,e.orderBy,e.filters,e.limit,"F",e.startAt,e.endAt)}function Pd(e){return function(e){return _t(_t(e).persistence).Ts()}(_t(e).localStore)}async function Ld(e,t,n,r){const s=_t(e);if(s.gu)return void gt(id,"Ignoring unexpected query state notification.");const i=s.Iu.get(t);if(i&&i.length>0)switch(n){case"current":case"not-current":{const e=await bh(s.localStore,to(i[0])),r=fa.createSynthesizedRemoteEventForCurrentChange(t,"current"===n,gs.EMPTY_BYTE_STRING);await Ad(s,e,r);break}case"rejected":await yh(s.localStore,t,!0),_d(s,t,r);break;default:vt(64155,n)}}async function Fd(e,t,n){const r=Vd(e);if(r.gu){for(const e of t){if(r.Iu.has(e)&&r.sharedClientState.isActiveQueryTarget(e)){gt(id,"Adding an already active target "+e);continue}const t=await vh(r.localStore,e),n=await ph(r.localStore,t);await dd(r,Od(t),n.targetId,!1,n.resumeToken),ul(r.remoteStore,n)}for(const e of n)r.Iu.has(e)&&await yh(r.localStore,e,!1).then(()=>{hl(r.remoteStore,e),_d(r,e)}).catch(Tn)}}function Vd(e){const t=_t(e);return t.remoteStore.remoteSyncer.applyRemoteEvent=gd.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=Dd.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=yd.bind(null,t),t.Pu.H_=Kl.bind(null,t.eventManager),t.Pu.yu=Ql.bind(null,t.eventManager),t}function Bd(e){const t=_t(e);return t.remoteStore.remoteSyncer.applySuccessfulWrite=wd.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=vd.bind(null,t),t}class Ud{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Jh(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,t){return null}Mu(e,t){return null}vu(e){return lh(this.persistence,new ch,e.initialUser,this.serializer)}Cu(e){return new Gu(Qu.mi,this.serializer)}Du(e){return new Lh}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ud.provider={build:()=>new Ud};class qd extends Ud{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,t){It(this.persistence.referenceDelegate instanceof Hu,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new bu(n,e.asyncQueue,t)}Cu(e){const t=void 0!==this.cacheSizeBytes?ru.withCacheSize(this.cacheSizeBytes):ru.DEFAULT;return new Gu(e=>Hu.mi(e,t),this.serializer)}}class jd extends Ud{constructor(e,t,n){super(),this.xu=e,this.cacheSizeBytes=t,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.xu.initialize(this,e),await Bd(this.xu.syncEngine),await El(this.xu.remoteStore),await this.persistence.Ji(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}vu(e){return lh(this.persistence,new ch,e.initialUser,this.serializer)}Fu(e,t){const n=this.persistence.referenceDelegate.garbageCollector;return new bu(n,e.asyncQueue,t)}Mu(e,t){const n=new Bn(t,this.persistence);return new Vn(e.asyncQueue,n)}Cu(e){const t=ih(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),n=void 0!==this.cacheSizeBytes?ru.withCacheSize(this.cacheSizeBytes):ru.DEFAULT;return new nh(this.synchronizeTabs,t,e.clientId,n,e.asyncQueue,Hh(),Wh(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Du(e){return new Lh}}class zd extends jd{constructor(e,t){super(e,t,!1),this.xu=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.xu.syncEngine;this.sharedClientState instanceof Ph&&(this.sharedClientState.syncEngine={Co:Rd.bind(null,t),vo:Ld.bind(null,t),Fo:Fd.bind(null,t),Ts:Pd.bind(null,t),Do:kd.bind(null,t)},await this.sharedClientState.start()),await this.persistence.Ji(async e=>{await async function(e,t){const n=_t(e);if(Vd(n),Bd(n),!0===t&&!0!==n.gu){const e=n.sharedClientState.getAllActiveQueryTargets(),t=await Md(n,e.toArray());n.gu=!0,await Ml(n.remoteStore,!0);for(const r of t)ul(n.remoteStore,r)}else if(!1===t&&!1!==n.gu){const e=[];let t=Promise.resolve();n.Iu.forEach((r,s)=>{n.sharedClientState.isLocalQueryTarget(s)?e.push(s):t=t.then(()=>(_d(n,s),yh(n.localStore,s,!0))),hl(n.remoteStore,s)}),await t,await Md(n,e),function(e){const t=_t(e);t.Au.forEach((e,n)=>{hl(t.remoteStore,n)}),t.Ru.Jr(),t.Au=new Map,t.du=new as(Ht.comparator)}(n),n.gu=!1,await Ml(n.remoteStore,!1)}}(this.xu.syncEngine,e),this.gcScheduler&&(e&&!this.gcScheduler.started?this.gcScheduler.start():e||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(e&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():e||this.indexBackfillerScheduler.stop())})}Du(e){const t=Hh();if(!Ph.v(t))throw new Tt(Et.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=ih(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new Ph(t,e.asyncQueue,n,e.clientId,e.initialUser)}}class $d{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=e=>pd(this.syncEngine,e,1),this.remoteStore.remoteSyncer.handleCredentialChange=xd.bind(null,this.syncEngine),await Ml(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new jl}createDatastore(e){const t=Jh(e.databaseInfo.databaseId),n=function(e){return new Qh(e)}(e.databaseInfo);return function(e,t,n,r){return new rl(e,t,n,r)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return function(e,t,n,r,s){return new ol(e,t,n,r,s)}(this.localStore,this.datastore,e.asyncQueue,e=>pd(this.syncEngine,e,0),Bh.v()?new Bh:new Fh)}createSyncEngine(e,t){return function(e,t,n,r,s,i,o){const a=new cd(e,t,n,r,s,i);return o&&(a.gu=!0),a}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){await async function(e){const t=_t(e);gt(il,"RemoteStore shutting down."),t.Ea.add(5),await cl(t),t.Aa.shutdown(),t.Ra.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}function Gd(e,t=10240){let n=0;return{async read(){if(n<e.byteLength){const r={value:e.slice(n,n+t),done:!1};return n+=t,r}return{done:!0}},async cancel(){},releaseLock(){},closed:Promise.resolve()}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */$d.provider={build:()=>new $d};class Kd{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):pt("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,t){setTimeout(()=>{this.muted||e(t)},0)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qd{constructor(e,t){this.Bu=e,this.serializer=t,this.metadata=new St,this.buffer=new Uint8Array,this.Lu=new TextDecoder("utf-8"),this.ku().then(e=>{e&&e.$a()?this.metadata.resolve(e.Qa.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is\n             ${JSON.stringify(e?.Qa)}`))},e=>this.metadata.reject(e))}close(){return this.Bu.cancel()}async getMetadata(){return this.metadata.promise}async bu(){return await this.getMetadata(),this.ku()}async ku(){const e=await this.qu();if(null===e)return null;const t=this.Lu.decode(e),n=Number(t);isNaN(n)&&this.Qu(`length string (${t}) is not valid number`);const r=await this.$u(n);return new Yl(JSON.parse(r),e.length+n)}Uu(){return this.buffer.findIndex(e=>e==="{".charCodeAt(0))}async qu(){for(;this.Uu()<0&&!(await this.Ku()););if(0===this.buffer.length)return null;const e=this.Uu();e<0&&this.Qu("Reached the end of bundle when a length string is expected.");const t=this.buffer.slice(0,e);return this.buffer=this.buffer.slice(e),t}async $u(e){for(;this.buffer.length<e;)await this.Ku()&&this.Qu("Reached the end of bundle when more is expected.");const t=this.Lu.decode(this.buffer.slice(0,e));return this.buffer=this.buffer.slice(e),t}Qu(e){throw this.Bu.cancel(),new Error(`Invalid bundle format: ${e}`)}async Ku(){const e=await this.Bu.read();if(!e.done){const t=new Uint8Array(this.buffer.length+e.value.length);t.set(this.buffer),t.set(e.value,this.buffer.length),this.buffer=t}return e.done}}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hd{constructor(e,t){this.bundleData=e,this.serializer=t,this.cursor=0,this.elements=[];let n=this.bu();if(!n||!n.$a())throw new Error(`The first element of the bundle is not a metadata object, it is\n         ${JSON.stringify(n?.Qa)}`);this.metadata=n;do{n=this.bu(),null!==n&&this.elements.push(n)}while(null!==n)}getMetadata(){return this.metadata}Wu(){return this.elements}bu(){if(this.cursor===this.bundleData.length)return null;const e=this.qu(),t=this.$u(e);return new Yl(JSON.parse(t),e)}$u(e){if(this.cursor+e>this.bundleData.length)throw new Tt(Et.INTERNAL,"Reached the end of bundle when more is expected.");return this.bundleData.slice(this.cursor,this.cursor+=e)}qu(){const e=this.cursor;let t=this.cursor;for(;t<this.bundleData.length;){if("{"===this.bundleData[t]){if(t===e)throw new Error("First character is a bracket and not a number");return this.cursor=t,Number(this.bundleData.slice(e,t))}t++}throw new Error("Reached the end of bundle when more is expected.")}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wd{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new Tt(Et.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await async function(e,t){const n=_t(e),r={documents:t.map(e=>Oa(n.serializer,e))},s=await n.Ho("BatchGetDocuments",n.serializer.databaseId,Gt.emptyPath(),r,t.length),i=new Map;s.forEach(e=>{const t=function(e,t){return"found"in t?function(e,t){It(!!t.found,43571),t.found.name,t.found.updateTime;const n=Pa(e,t.found.name),r=Na(t.found.updateTime),s=t.found.createTime?Na(t.found.createTime):un.min(),i=new ii({mapValue:{fields:t.found.fields}});return ai.newFoundDocument(n,r,s,i)}(e,t):"missing"in t?function(e,t){It(!!t.missing,3894),It(!!t.readTime,22933);const n=Pa(e,t.missing),r=Na(t.readTime);return ai.newNoDocument(n,r)}(e,t):vt(7234,{result:t})}(n.serializer,e);i.set(t.key.toString(),t)});const o=[];return t.forEach(e=>{const t=i.get(e.toString());It(!!t,55234,{key:e}),o.push(t)}),o}(this.datastore,e);return t.forEach(e=>this.recordVersion(e)),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(e){this.lastTransactionError=e}this.writtenDocs.add(e.toString())}delete(e){this.write(new Wo(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach(t=>{e.delete(t.key.toString())}),e.forEach((e,t)=>{const n=Ht.fromPath(t);this.mutations.push(new Jo(n,this.precondition(n)))}),await async function(e,t){const n=_t(e),r={writes:t.map(e=>ja(n.serializer,e))};await n.Go("Commit",n.serializer.databaseId,Gt.emptyPath(),r)}(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw vt(50498,{Gu:e.constructor.name});t=un.min()}const n=this.readVersions.get(e.key.toString());if(n){if(!t.isEqual(n))throw new Tt(Et.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(un.min())?Lo.exists(!1):Lo.updateTime(t):Lo.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(un.min()))throw new Tt(Et.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return Lo.updateTime(t)}return Lo.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jd{constructor(e,t,n,r,s){this.asyncQueue=e,this.datastore=t,this.options=n,this.updateFunction=r,this.deferred=s,this.zu=n.maxAttempts,this.M_=new Xh(this.asyncQueue,"transaction_retry")}ju(){this.zu-=1,this.Ju()}Ju(){this.M_.p_(async()=>{const e=new Wd(this.datastore),t=this.Hu(e);t&&t.then(t=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(t)}).catch(e=>{this.Yu(e)}))}).catch(e=>{this.Yu(e)})})}Hu(e){try{const t=this.updateFunction(e);return!jn(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(e){return this.deferred.reject(e),null}}Yu(e){this.zu>0&&this.Zu(e)?(this.zu-=1,this.asyncQueue.enqueueAndForget(()=>(this.Ju(),Promise.resolve()))):this.deferred.reject(e)}Zu(e){if("FirebaseError"===e?.name){const t=e.code;return"aborted"===t||"failed-precondition"===t||"already-exists"===t||!sa(t)}return!1}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xd="FirestoreClient";class Yd{constructor(e,t,n,r,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this.databaseInfo=r,this.user=lt.UNAUTHENTICATED,this.clientId=Pt.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(n,async e=>{gt(Xd,"Received user=",e.uid),await this.authCredentialListener(e),this.user=e}),this.appCheckCredentials.start(n,e=>(gt(Xd,"Received new app check token=",e),this.appCheckCredentialListener(e,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new St;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Fl(t,"Failed to shutdown persistence");e.reject(n)}}),e.promise}}async function Zd(e,t){e.asyncQueue.verifyOperationInProgress(),gt(Xd,"Initializing OfflineComponentProvider");const n=e.configuration;await t.initialize(n);let r=n.initialUser;e.setCredentialChangeListener(async e=>{r.isEqual(e)||(await dh(t.localStore,e),r=e)}),t.persistence.setDatabaseDeletedListener(()=>e.terminate()),e._offlineComponents=t}async function ef(e,t){e.asyncQueue.verifyOperationInProgress();const n=await tf(e);gt(Xd,"Initializing OnlineComponentProvider"),await t.initialize(n,e.configuration),e.setCredentialChangeListener(e=>Rl(t.remoteStore,e)),e.setAppCheckTokenChangeListener((e,n)=>Rl(t.remoteStore,n)),e._onlineComponents=t}async function tf(e){if(!e._offlineComponents)if(e._uninitializedComponentsProvider){gt(Xd,"Using user provided OfflineComponentProvider");try{await Zd(e,e._uninitializedComponentsProvider._offline)}catch(t){const n=t;if(!function(e){return"FirebaseError"===e.name?e.code===Et.FAILED_PRECONDITION||e.code===Et.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&e instanceof DOMException)||22===e.code||20===e.code||11===e.code}(n))throw n;yt("Error using user provided cache. Falling back to memory cache: "+n),await Zd(e,new Ud)}}else gt(Xd,"Using default OfflineComponentProvider"),await Zd(e,new qd(void 0));return e._offlineComponents}async function nf(e){return e._onlineComponents||(e._uninitializedComponentsProvider?(gt(Xd,"Using user provided OnlineComponentProvider"),await ef(e,e._uninitializedComponentsProvider._online)):(gt(Xd,"Using default OnlineComponentProvider"),await ef(e,new $d))),e._onlineComponents}function rf(e){return tf(e).then(e=>e.persistence)}function sf(e){return tf(e).then(e=>e.localStore)}function of(e){return nf(e).then(e=>e.remoteStore)}function af(e){return nf(e).then(e=>e.syncEngine)}function cf(e){return nf(e).then(e=>e.datastore)}async function uf(e){const t=await nf(e),n=t.eventManager;return n.onListen=ud.bind(null,t.syncEngine),n.onUnlisten=fd.bind(null,t.syncEngine),n.onFirstRemoteStoreListen=hd.bind(null,t.syncEngine),n.onLastRemoteStoreUnlisten=md.bind(null,t.syncEngine),n}function hf(e,t,n={}){const r=new St;return e.asyncQueue.enqueueAndForget(async()=>function(e,t,n,r,s){const i=new Kd({next:a=>{i.Nu(),t.enqueueAndForget(()=>Gl(e,o));const c=a.docs.has(n);!c&&a.fromCache?s.reject(new Tt(Et.UNAVAILABLE,"Failed to get document because the client is offline.")):c&&a.fromCache&&r&&"server"===r.source?s.reject(new Tt(Et.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):s.resolve(a)},error:e=>s.reject(e)}),o=new Xl(ji(n.path),i,{includeMetadataChanges:!0,qa:!0});return $l(e,o)}(await uf(e),e.asyncQueue,t,n,r)),r.promise}function lf(e,t,n={}){const r=new St;return e.asyncQueue.enqueueAndForget(async()=>function(e,t,n,r,s){const i=new Kd({next:n=>{i.Nu(),t.enqueueAndForget(()=>Gl(e,o)),n.fromCache&&"server"===r.source?s.reject(new Tt(Et.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):s.resolve(n)},error:e=>s.reject(e)}),o=new Xl(n,i,{includeMetadataChanges:!0,qa:!0});return $l(e,o)}(await uf(e),e.asyncQueue,t,n,r)),r.promise}function df(e,t,n,r){const s=function(e,t){let n;return n="string"==typeof e?aa().encode(e):e,function(e,t){return new Qd(e,t)}(function(e,t){if(e instanceof Uint8Array)return Gd(e,t);if(e instanceof ArrayBuffer)return Gd(new Uint8Array(e),t);if(e instanceof ReadableStream)return e.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")}(n),t)}(n,Jh(t));e.asyncQueue.enqueueAndForget(async()=>{!function(e,t,n){const r=_t(e);(async function(e,t,n){try{const r=await t.getMetadata();if(await function(e,t){const n=_t(e),r=Na(t.createTime);return n.persistence.runTransaction("hasNewerBundle","readonly",e=>n.Ii.getBundleMetadata(e,t.id)).then(e=>!!e&&e.createTime.compareTo(r)>=0)}(e.localStore,r))return await t.close(),n._completeWith(function(e){return{taskState:"Success",documentsLoaded:e.totalDocuments,bytesLoaded:e.totalBytes,totalDocuments:e.totalDocuments,totalBytes:e.totalBytes}}(r)),Promise.resolve(new Set);n._updateProgress(td(r));const s=new ed(r,t.serializer);let i=await t.bu();for(;i;){const e=await s.Ga(i);e&&n._updateProgress(e),i=await t.bu()}const o=await s.ja(e.localStore);return await Ad(e,o.Ha,void 0),await function(e,t){const n=_t(e);return n.persistence.runTransaction("Save bundle","readwrite",e=>n.Ii.saveBundleMetadata(e,t))}(e.localStore,r),n._completeWith(o.progress),Promise.resolve(o.Ja)}catch(e){return yt(id,`Loading bundle failed with ${e}`),n._failWith(e),Promise.resolve(new Set)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */)(r,t,n).then(e=>{r.sharedClientState.notifyBundleLoaded(e)})}(await af(e),s,r)})}function ff(e,t){return function(e,t){return new Hd(e,t)}(e,t)}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function mf(e){const t={};return void 0!==e.timeoutSeconds&&(t.timeoutSeconds=e.timeoutSeconds),t
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}const gf=new Map,pf="firestore.googleapis.com",yf=!0;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wf{constructor(e){if(void 0===e.host){if(void 0!==e.ssl)throw new Tt(Et.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=pf,this.ssl=yf}else this.host=e.host,this.ssl=e.ssl??yf;if(this.isUsingEmulator=void 0!==e.emulatorOptions,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,void 0===e.cacheSizeBytes)this.cacheSizeBytes=nu;else{if(-1!==e.cacheSizeBytes&&e.cacheSizeBytes<yu)throw new Tt(Et.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Jt("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===e.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=mf(e.experimentalLongPollingOptions??{}),function(e){if(void 0!==e.timeoutSeconds){if(isNaN(e.timeoutSeconds))throw new Tt(Et.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);if(e.timeoutSeconds<5)throw new Tt(Et.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);if(e.timeoutSeconds>30)throw new Tt(Et.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(e,t){return e.timeoutSeconds===t.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class vf{constructor(e,t,n,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new wf({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Tt(Et.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(e){if(this._settingsFrozen)throw new Tt(Et.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new wf(e),this._emulatorOptions=e.emulatorOptions||{},void 0!==e.credentials&&(this._authCredentials=function(e){if(!e)return new At;switch(e.type){case"firstParty":return new kt(e.sessionIndex||"0",e.iamToken||null,e.authTokenFactory||null);case"provider":return e.client;default:throw new Tt(Et.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const t=gf.get(e);t&&(gt("ComponentProvider","Removing Datastore"),gf.delete(e),t.terminate())}(this),Promise.resolve()}}function bf(e,t,n,r={}){e=tn(e,vf);const i=l(t),o=e._getSettings(),a={...o,emulatorOptions:e._getEmulatorOptions()},c=`${t}:${n}`;i&&(d(`https://${c}`),g("Firestore",!0)),o.host!==pf&&o.host!==c&&yt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u={...o,host:c,ssl:i,emulatorOptions:r};if(!T(u,a)&&(e._setSettings(u),r.mockUserToken)){let t,n;if("string"==typeof r.mockUserToken)t=r.mockUserToken,n=lt.MOCK_USER;else{t=function(e,t){if(e.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n=t||"demo-project",r=e.iat||0,i=e.sub||e.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${n}`,aud:n,iat:r,exp:r+3600,auth_time:r,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...e};return[s(JSON.stringify({alg:"none",type:"JWT"})),s(JSON.stringify(o)),""].join(".")}(r.mockUserToken,e._app?.options.projectId);const i=r.mockUserToken.sub||r.mockUserToken.user_id;if(!i)throw new Tt(Et.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");n=new lt(i)}e._authCredentials=new xt(new Ct(t,n))}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class If{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new If(this.firestore,e,this._query)}}class _f{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ef(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new _f(this.firestore,e,this._key)}toJSON(){return{type:_f._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(sn(t,_f._jsonSchema))return new _f(e,n||null,new Ht(Gt.fromString(t.referencePath)))}}_f._jsonSchemaVersion="firestore/documentReference/1.0",_f._jsonSchema={type:rn("string",_f._jsonSchemaVersion),referencePath:rn("string")};class Ef extends If{constructor(e,t,n){super(e,t,ji(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new _f(this.firestore,null,new Ht(e))}withConverter(e){return new Ef(this.firestore,e,this._path)}}function Tf(e,t,...n){if(e=C(e),1===arguments.length&&(t=Pt.newId()),Wt("doc","path",t),e instanceof vf){const r=Gt.fromString(t,...n);return Xt(r),new _f(e,null,new Ht(r))}{if(!(e instanceof _f||e instanceof Ef))throw new Tt(Et.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=e._path.child(Gt.fromString(t,...n));return Xt(r),new _f(e.firestore,e instanceof Ef?e.converter:null,new Ht(r))}}function Sf(e,t){return e=C(e),t=C(t),e instanceof If&&t instanceof If&&e.firestore===t.firestore&&Xi(e._query,t._query)&&e.converter===t.converter
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}const Cf="AsyncQueue";class Af{constructor(e=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new Xh(this,"async_queue_retry"),this._c=()=>{const e=Wh();e&&gt(Cf,"Visibility state changed to "+e.visibilityState),this.M_.w_()},this.ac=e;const t=Wh();t&&"function"==typeof t.addEventListener&&t.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const t=Wh();t&&"function"==typeof t.removeEventListener&&t.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const t=new St;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Xu.push(e),this.lc()))}async lc(){if(0!==this.Xu.length){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(e){if(!Rn(e))throw e;gt(Cf,"Operation failed with retryable error: "+e)}this.Xu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const t=this.ac.then(()=>(this.rc=!0,e().catch(e=>{throw this.nc=e,this.rc=!1,pt("INTERNAL UNHANDLED ERROR: ",xf(e)),e}).then(e=>(this.rc=!1,e))));return this.ac=t,t}enqueueAfterDelay(e,t,n){this.uc(),this.oc.indexOf(e)>-1&&(t=0);const r=Ll.createAndSchedule(this,e,t,n,e=>this.hc(e));return this.tc.push(r),r}uc(){this.nc&&vt(47125,{Pc:xf(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do{e=this.ac,await e}while(e!==this.ac)}Ic(e){for(const t of this.tc)if(t.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((e,t)=>e.targetTimeMs-t.targetTimeMs);for(const t of this.tc)if(t.skipDelay(),"all"!==e&&t.timerId===e)break;return this.Tc()})}dc(e){this.oc.push(e)}hc(e){const t=this.tc.indexOf(e);this.tc.splice(t,1)}}function xf(e){let t=e.message||"";return e.stack&&(t=e.stack.includes(e.message)?e.stack:e.message+"\n"+e.stack),t
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}function Df(e){return function(e,t){if("object"!=typeof e||null===e)return!1;const n=e;for(const r of t)if(r in n&&"function"==typeof n[r])return!0;return!1}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(e,["next","error","complete"])}class Nf{constructor(){this._progressObserver={},this._taskCompletionResolver=new St,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(e,t,n){this._progressObserver={next:e,error:t,complete:n}}catch(e){return this._taskCompletionResolver.promise.catch(e)}then(e,t){return this._taskCompletionResolver.promise.then(e,t)}_completeWith(e){this._updateProgress(e),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(e)}_failWith(e){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(e),this._taskCompletionResolver.reject(e)}_updateProgress(e){this._lastProgress=e,this._progressObserver.next&&this._progressObserver.next(e)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kf extends vf{constructor(e,t,n,r){super(e,t,n,r),this.type="firestore",this._queue=new Af,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Af(e),this._firestoreClient=void 0,await e}}}function Rf(e,t){const n="object"==typeof e?e:function(e=De){const t=ke.get(e);if(!t&&e===De&&u())return Be();if(!t)throw Fe.create("no-app",{appName:e});return t}(),r="string"==typeof e?e:t||xs,s=Le(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const e=c("firestore");e&&bf(s,...e)}return s}function Mf(e){if(e._terminated)throw new Tt(Et.FAILED_PRECONDITION,"The client has already been terminated.");return e._firestoreClient||Of(e),e._firestoreClient}function Of(e){const t=e._freezeSettings(),n=function(e,t,n,r){return new As(e,t,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,mf(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator)}(e._databaseId,e._app?.options.appId||"",e._persistenceKey,t);e._componentsProvider||t.localCache?._offlineComponentProvider&&t.localCache?._onlineComponentProvider&&(e._componentsProvider={_offline:t.localCache._offlineComponentProvider,_online:t.localCache._onlineComponentProvider}),e._firestoreClient=new Yd(e._authCredentials,e._appCheckCredentials,e._queue,n,e._componentsProvider&&function(e){const t=e?._online.build();return{_offline:e?._offline.build(t),_online:t}}(e._componentsProvider))}function Pf(e,t){yt("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const n=e._freezeSettings();return Lf(e,$d.provider,{build:e=>new jd(e,n.cacheSizeBytes,t?.forceOwnership)}),Promise.resolve()}function Lf(e,t,n){if((e=tn(e,kf))._firestoreClient||e._terminated)throw new Tt(Et.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(e._componentsProvider||e._getSettings().localCache)throw new Tt(Et.FAILED_PRECONDITION,"SDK cache is already specified.");e._componentsProvider={_online:t,_offline:n},Of(e)}function Ff(e,t){const n=Mf(e=tn(e,kf)),r=new Nf;return df(n,e._databaseId,t,r),r}function Vf(e,t){return function(e,t){return e.asyncQueue.enqueue(async()=>function(e,t){const n=_t(e);return n.persistence.runTransaction("Get named query","readonly",e=>n.Ii.getNamedQuery(e,t))}(await sf(e),t))}(Mf(e=tn(e,kf)),t).then(t=>t?new If(e,null,t.query):null)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bf{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class Uf{constructor(e,t,n){this._userDataWriter=t,this._data=n,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qf{constructor(e){this._byteString=e}static fromBase64String(e){try{return new qf(gs.fromBase64String(e))}catch(e){throw new Tt(Et.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(e){return new qf(gs.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:qf._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(sn(e,qf._jsonSchema))return qf.fromBase64String(e.bytes)}}qf._jsonSchemaVersion="firestore/bytes/1.0",qf._jsonSchema={type:rn("string",qf._jsonSchemaVersion),bytes:rn("string")};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class jf{constructor(...e){for(let t=0;t<e.length;++t)if(0===e[t].length)throw new Tt(Et.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Qt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class zf{constructor(e){this._methodName=e}}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $f{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new Tt(Et.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new Tt(Et.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Lt(this._lat,e._lat)||Lt(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:$f._jsonSchemaVersion}}static fromJSON(e){if(sn(e,$f._jsonSchema))return new $f(e.latitude,e.longitude)}}$f._jsonSchemaVersion="firestore/geoPoint/1.0",$f._jsonSchema={type:rn("string",$f._jsonSchemaVersion),latitude:rn("number"),longitude:rn("number")};
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Gf{constructor(e){this._values=(e||[]).map(e=>e)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;++n)if(e[n]!==t[n])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Gf._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(sn(e,Gf._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(e=>"number"==typeof e))return new Gf(e.vectorValues);throw new Tt(Et.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Gf._jsonSchemaVersion="firestore/vectorValue/1.0",Gf._jsonSchema={type:rn("string",Gf._jsonSchemaVersion),vectorValues:rn("object")};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Kf=/^__.*__$/;class Qf{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return null!==this.fieldMask?new Go(e,this.data,this.fieldMask,t,this.fieldTransforms):new $o(e,this.data,t,this.fieldTransforms)}}class Hf{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new Go(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Wf(e){switch(e){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw vt(40011,{Ac:e})}}class Jf{constructor(e,t,n,r,s,i){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=r,void 0===s&&this.Rc(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get Ac(){return this.settings.Ac}Vc(e){return new Jf({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}mc(e){const t=this.path?.child(e),n=this.Vc({path:t,fc:!1});return n.gc(e),n}yc(e){const t=this.path?.child(e),n=this.Vc({path:t,fc:!1});return n.Rc(),n}wc(e){return this.Vc({path:void 0,fc:!0})}Sc(e){return pm(e,this.settings.methodName,this.settings.bc||!1,this.path,this.settings.Dc)}contains(e){return void 0!==this.fieldMask.find(t=>e.isPrefixOf(t))||void 0!==this.fieldTransforms.find(t=>e.isPrefixOf(t.field))}Rc(){if(this.path)for(let e=0;e<this.path.length;e++)this.gc(this.path.get(e))}gc(e){if(0===e.length)throw this.Sc("Document fields must not be empty");if(Wf(this.Ac)&&Kf.test(e))throw this.Sc('Document fields cannot begin and end with "__"')}}class Xf{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||Jh(e)}Cc(e,t,n,r=!1){return new Jf({Ac:e,methodName:t,Dc:n,path:Qt.emptyPath(),fc:!1,bc:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Yf(e){const t=e._freezeSettings(),n=Jh(e._databaseId);return new Xf(e._databaseId,!!t.ignoreUndefinedProperties,n)}function Zf(e,t,n,r,s,i={}){const o=e.Cc(i.merge||i.mergeFields?2:0,t,n,s);dm("Data must be an object, but it was:",o,r);const a=hm(r,o);let c,u;if(i.merge)c=new fs(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const e=[];for(const r of i.mergeFields){const s=fm(t,r,n);if(!o.contains(s))throw new Tt(Et.INVALID_ARGUMENT,`Field '${s}' is specified in your field mask but missing from your input data.`);ym(e,s)||e.push(s)}c=new fs(e),u=o.fieldTransforms.filter(e=>c.covers(e.field))}else c=null,u=o.fieldTransforms;return new Qf(new ii(a),c,u)}class em extends zf{_toFieldTransform(e){if(2!==e.Ac)throw 1===e.Ac?e.Sc(`${this._methodName}() can only appear at the top level of your update data`):e.Sc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof em}}function tm(e,t,n){return new Jf({Ac:3,Dc:t.settings.Dc,methodName:e._methodName,fc:n},t.databaseId,t.serializer,t.ignoreUndefinedProperties)}class nm extends zf{_toFieldTransform(e){return new Oo(e.path,new Co)}isEqual(e){return e instanceof nm}}class rm extends zf{constructor(e,t){super(e),this.vc=t}_toFieldTransform(e){const t=tm(this,e,!0),n=this.vc.map(e=>um(e,t)),r=new Ao(n);return new Oo(e.path,r)}isEqual(e){return e instanceof rm&&T(this.vc,e.vc)}}class sm extends zf{constructor(e,t){super(e),this.vc=t}_toFieldTransform(e){const t=tm(this,e,!0),n=this.vc.map(e=>um(e,t)),r=new Do(n);return new Oo(e.path,r)}isEqual(e){return e instanceof sm&&T(this.vc,e.vc)}}class im extends zf{constructor(e,t){super(e),this.Fc=t}_toFieldTransform(e){const t=new ko(e.serializer,Io(e.serializer,this.Fc));return new Oo(e.path,t)}isEqual(e){return e instanceof im&&this.Fc===e.Fc}}function om(e,t,n,r){const s=e.Cc(1,t,n);dm("Data must be an object, but it was:",s,r);const i=[],o=ii.empty();ss(r,(e,r)=>{const a=gm(t,e,n);r=C(r);const c=s.yc(a);if(r instanceof em)i.push(a);else{const e=um(r,c);null!=e&&(i.push(a),o.set(a,e))}});const a=new fs(i);return new Hf(o,a,s.fieldTransforms)}function am(e,t,n,r,s,i){const o=e.Cc(1,t,n),a=[fm(t,r,n)],c=[s];if(i.length%2!=0)throw new Tt(Et.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let d=0;d<i.length;d+=2)a.push(fm(t,i[d])),c.push(i[d+1]);const u=[],h=ii.empty();for(let d=a.length-1;d>=0;--d)if(!ym(u,a[d])){const e=a[d];let t=c[d];t=C(t);const n=o.yc(e);if(t instanceof em)u.push(e);else{const r=um(t,n);null!=r&&(u.push(e),h.set(e,r))}}const l=new fs(u);return new Hf(h,l,o.fieldTransforms)}function cm(e,t,n,r=!1){return um(n,e.Cc(r?4:3,t))}function um(e,t){if(lm(e=C(e)))return dm("Unsupported field value:",t,e),hm(e,t);if(e instanceof zf)return function(e,t){if(!Wf(t.Ac))throw t.Sc(`${e._methodName}() can only be used with update() and set()`);if(!t.path)throw t.Sc(`${e._methodName}() is not currently supported inside arrays`);const n=e._toFieldTransform(t);n&&t.fieldTransforms.push(n)}(e,t),null;if(void 0===e&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),e instanceof Array){if(t.settings.fc&&4!==t.Ac)throw t.Sc("Nested arrays are not supported");return function(e,t){const n=[];let r=0;for(const s of e){let e=um(s,t.wc(r));null==e&&(e={nullValue:"NULL_VALUE"}),n.push(e),r++}return{arrayValue:{values:n}}}(e,t)}return function(e,t){if(null===(e=C(e)))return{nullValue:"NULL_VALUE"};if("number"==typeof e)return Io(t.serializer,e);if("boolean"==typeof e)return{booleanValue:e};if("string"==typeof e)return{stringValue:e};if(e instanceof Date){const n=cn.fromDate(e);return{timestampValue:Aa(t.serializer,n)}}if(e instanceof cn){const n=new cn(e.seconds,1e3*Math.floor(e.nanoseconds/1e3));return{timestampValue:Aa(t.serializer,n)}}if(e instanceof $f)return{geoPointValue:{latitude:e.latitude,longitude:e.longitude}};if(e instanceof qf)return{bytesValue:xa(t.serializer,e._byteString)};if(e instanceof _f){const n=t.databaseId,r=e.firestore._databaseId;if(!r.isEqual(n))throw t.Sc(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);return{referenceValue:ka(e.firestore._databaseId||t.databaseId,e._key.path)}}if(e instanceof Gf)return function(e,t){return{mapValue:{fields:{[Ns]:{stringValue:Ms},[Os]:{arrayValue:{values:e.toArray().map(e=>{if("number"!=typeof e)throw t.Sc("VectorValues must only contain numeric values.");return vo(t.serializer,e)})}}}}}}(e,t);throw t.Sc(`Unsupported field value: ${en(e)}`)}(e,t)}function hm(e,t){const n={};return os(e)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):ss(e,(e,r)=>{const s=um(r,t.mc(e));null!=s&&(n[e]=s)}),{mapValue:{fields:n}}}function lm(e){return!("object"!=typeof e||null===e||e instanceof Array||e instanceof Date||e instanceof cn||e instanceof $f||e instanceof qf||e instanceof _f||e instanceof zf||e instanceof Gf)}function dm(e,t,n){if(!lm(n)||!Zt(n)){const r=en(n);throw"an object"===r?t.Sc(e+" a custom object"):t.Sc(e+" "+r)}}function fm(e,t,n){if((t=C(t))instanceof jf)return t._internalPath;if("string"==typeof t)return gm(e,t);throw pm("Field path arguments must be of type string or ",e,!1,void 0,n)}const mm=new RegExp("[~\\*/\\[\\]]");function gm(e,t,n){if(t.search(mm)>=0)throw pm(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,e,!1,void 0,n);try{return new jf(...t.split("."))._internalPath}catch(r){throw pm(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,e,!1,void 0,n)}}function pm(e,t,n,r,s){const i=r&&!r.isEmpty(),o=void 0!==s;let a=`Function ${t}() called with invalid data`;n&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${r}`),o&&(c+=` in document ${s}`),c+=")"),new Tt(Et.INVALID_ARGUMENT,a+e+c)}function ym(e,t){return e.some(e=>e.isEqual(t))}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wm{constructor(e,t,n,r,s){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new _f(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const e=new vm(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(bm("DocumentSnapshot.get",e));if(null!==t)return this._userDataWriter.convertValue(t)}}}class vm extends wm{data(){return super.data()}}function bm(e,t){return"string"==typeof t?gm(e,t):t instanceof jf?t._internalPath:t._delegate._internalPath}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Im(e){if("L"===e.limitType&&0===e.explicitOrderBy.length)throw new Tt(Et.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class _m{}class Em extends _m{}class Tm extends Em{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new Tm(e,t,n)}_apply(e){const t=this._parse(e);return Mm(e._query,t),new If(e.firestore,e.converter,Wi(e._query,t))}_parse(e){const t=Yf(e.firestore),n=function(e,t,n,r,s,i,o){let a;if(s.isKeyField()){if("array-contains"===i||"array-contains-any"===i)throw new Tt(Et.INVALID_ARGUMENT,`Invalid Query. You can't perform '${i}' queries on documentId().`);if("in"===i||"not-in"===i){Rm(o,i);const t=[];for(const n of o)t.push(km(r,e,n));a={arrayValue:{values:t}}}else a=km(r,e,o)}else"in"!==i&&"not-in"!==i&&"array-contains-any"!==i||Rm(o,i),a=cm(n,t,o,"in"===i||"not-in"===i);return mi.create(s,i,a)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value);return n}}class Sm extends _m{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Sm(e,t)}_parse(e){const t=this._queryConstraints.map(t=>t._parse(e)).filter(e=>e.getFilters().length>0);return 1===t.length?t[0]:gi.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return 0===t.getFilters().length?e:(function(e,t){let n=e;const r=t.getFlattenedFilters();for(const s of r)Mm(n,s),n=Wi(n,s)}(e._query,t),new If(e.firestore,e.converter,Wi(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return"and"===this.type?"and":"or"}}class Cm extends Em{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Cm(e,t)}_apply(e){const t=function(e,t,n){if(null!==e.startAt)throw new Tt(Et.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(null!==e.endAt)throw new Tt(Et.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new li(t,n)}(e._query,this._field,this._direction);return new If(e.firestore,e.converter,function(e,t){const n=e.explicitOrderBy.concat([t]);return new Ui(e.path,e.collectionGroup,n,e.filters.slice(),e.limit,e.limitType,e.startAt,e.endAt)}(e._query,t))}}class Am extends Em{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new Am(e,t,n)}_apply(e){return new If(e.firestore,e.converter,Ji(e._query,this._limit,this._limitType))}}class xm extends Em{constructor(e,t,n){super(),this.type=e,this._docOrFields=t,this._inclusive=n}static _create(e,t,n){return new xm(e,t,n)}_apply(e){const t=Nm(e,this.type,this._docOrFields,this._inclusive);return new If(e.firestore,e.converter,function(e,t){return new Ui(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),e.limit,e.limitType,t,e.endAt)}(e._query,t))}}class Dm extends Em{constructor(e,t,n){super(),this.type=e,this._docOrFields=t,this._inclusive=n}static _create(e,t,n){return new Dm(e,t,n)}_apply(e){const t=Nm(e,this.type,this._docOrFields,this._inclusive);return new If(e.firestore,e.converter,function(e,t){return new Ui(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),e.limit,e.limitType,e.startAt,t)}(e._query,t))}}function Nm(e,t,n,r){if(n[0]=C(n[0]),n[0]instanceof wm)return function(e,t,n,r,s){if(!r)throw new Tt(Et.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${n}().`);const i=[];for(const o of Gi(e))if(o.field.isKeyField())i.push(Gs(t,r.key));else{const e=r.data.field(o.field);if(Ts(e))throw new Tt(Et.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+o.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(null===e){const e=o.field.canonicalString();throw new Tt(Et.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${e}' (used as the orderBy) does not exist.`)}i.push(e)}return new ci(i,s)}(e._query,e.firestore._databaseId,t,n[0]._document,r);{const s=Yf(e.firestore);return function(e,t,n,r,s,i){const o=e.explicitOrderBy;if(s.length>o.length)throw new Tt(Et.INVALID_ARGUMENT,`Too many arguments provided to ${r}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const a=[];for(let c=0;c<s.length;c++){const i=s[c];if(o[c].field.isKeyField()){if("string"!=typeof i)throw new Tt(Et.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${r}(), but got a ${typeof i}`);if(!$i(e)&&-1!==i.indexOf("/"))throw new Tt(Et.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${r}() must be a plain document ID, but '${i}' contains a slash.`);const n=e.path.child(Gt.fromString(i));if(!Ht.isDocumentKey(n))throw new Tt(Et.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${r}() must result in a valid document path, but '${n}' is not because it contains an odd number of segments.`);const s=new Ht(n);a.push(Gs(t,s))}else{const e=cm(n,r,i);a.push(e)}}return new ci(a,i)}(e._query,e.firestore._databaseId,s,t,n,r)}}function km(e,t,n){if("string"==typeof(n=C(n))){if(""===n)throw new Tt(Et.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!$i(t)&&-1!==n.indexOf("/"))throw new Tt(Et.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=t.path.child(Gt.fromString(n));if(!Ht.isDocumentKey(r))throw new Tt(Et.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Gs(e,new Ht(r))}if(n instanceof _f)return Gs(e,n._key);throw new Tt(Et.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${en(n)}.`)}function Rm(e,t){if(!Array.isArray(e)||0===e.length)throw new Tt(Et.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function Mm(e,t){const n=function(e,t){for(const n of e)for(const e of n.getFlattenedFilters())if(t.indexOf(e.op)>=0)return e.op;return null}(e.filters,function(e){switch(e){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(null!==n)throw n===t.op?new Tt(Et.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new Tt(Et.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${n.toString()}' filters.`)}function Om(e,t){if(!(t instanceof Tm||t instanceof Sm))throw new Tt(Et.INVALID_ARGUMENT,`Function ${e}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}class Pm{convertValue(e,t="none"){switch(Ls(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ws(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(vs(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw vt(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return ss(e,(e,r)=>{n[e]=this.convertValue(r,t)}),n}convertVectorValue(e){const t=e.fields?.[Os].arrayValue?.values?.map(e=>ws(e.doubleValue));return new Gf(t)}convertGeoPoint(e){return new $f(ws(e.latitude),ws(e.longitude))}convertArray(e,t){return(e.values||[]).map(e=>this.convertValue(e,t))}convertServerTimestamp(e,t){switch(t){case"previous":const n=Ss(e);return null==n?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(Cs(e));default:return null}}convertTimestamp(e){const t=ys(e);return new cn(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=Gt.fromString(e);It(nc(n),9688,{name:e});const r=new Ds(n.get(1),n.get(3)),s=new Ht(n.popFirst(5));return r.isEqual(t)||pt(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lm(e,t,n){let r;return r=e?n&&(n.merge||n.mergeFields)?e.toFirestore(t,n):e.toFirestore(t):t,r}class Fm extends Pm{constructor(e){super(),this.firestore=e}convertBytes(e){return new qf(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new _f(this.firestore,null,t)}}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vm(){return new Bf("count")}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const Bm="NOT SUPPORTED";class Um{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class qm extends wm{constructor(e,t,n,r,s,i){super(e,t,n,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new jm(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(bm("DocumentSnapshot.get",e));if(null!==n)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new Tt(Et.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=qm._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),e&&e.isValidDocument()&&e.isFoundDocument()?(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t):t}}qm._jsonSchemaVersion="firestore/documentSnapshot/1.0",qm._jsonSchema={type:rn("string",qm._jsonSchemaVersion),bundleSource:rn("string","DocumentSnapshot"),bundleName:rn("string"),bundle:rn("string")};class jm extends qm{data(e={}){return super.data(e)}}class zm{constructor(e,t,n,r){this._firestore=e,this._userDataWriter=t,this._snapshot=r,this.metadata=new Um(r.hasPendingWrites,r.fromCache),this.query=n}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(e,t){this._snapshot.docs.forEach(n=>{e.call(t,new jm(this._firestore,this._userDataWriter,n.key,n,new Um(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new Tt(Et.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(e,t){if(e._snapshot.oldDocs.isEmpty()){let t=0;return e._snapshot.docChanges.map(n=>{const r=new jm(e._firestore,e._userDataWriter,n.doc.key,n.doc,new Um(e._snapshot.mutatedKeys.has(n.doc.key),e._snapshot.fromCache),e.query.converter);return n.doc,{type:"added",doc:r,oldIndex:-1,newIndex:t++}})}{let n=e._snapshot.oldDocs;return e._snapshot.docChanges.filter(e=>t||3!==e.type).map(t=>{const r=new jm(e._firestore,e._userDataWriter,t.doc.key,t.doc,new Um(e._snapshot.mutatedKeys.has(t.doc.key),e._snapshot.fromCache),e.query.converter);let s=-1,i=-1;return 0!==t.type&&(s=n.indexOf(t.doc.key),n=n.delete(t.doc.key)),1!==t.type&&(n=n.add(t.doc),i=n.indexOf(t.doc.key)),{type:$m(t.type),doc:r,oldIndex:s,newIndex:i}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new Tt(Et.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=zm._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Pt.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],r=[];return this.docs.forEach(e=>{null!==e._document&&(t.push(e._document),n.push(this._userDataWriter.convertObjectMap(e._document.data.value.mapValue.fields,"previous")),r.push(e.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function $m(e){switch(e){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return vt(61501,{type:e})}}zm._jsonSchemaVersion="firestore/querySnapshot/1.0",zm._jsonSchema={type:rn("string",zm._jsonSchemaVersion),bundleSource:rn("string","QuerySnapshot"),bundleName:rn("string"),bundle:rn("string")};class Gm extends Pm{constructor(e){super(),this.firestore=e}convertBytes(e){return new qf(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new _f(this.firestore,null,t)}}function Km(e,...t){e=C(e);let n={includeMetadataChanges:!1,source:"default"},r=0;"object"!=typeof t[r]||Df(t[r])||(n=t[r++]);const s={includeMetadataChanges:n.includeMetadataChanges,source:n.source};if(Df(t[r])){const e=t[r];t[r]=e.next?.bind(e),t[r+1]=e.error?.bind(e),t[r+2]=e.complete?.bind(e)}let i,o,a;if(e instanceof _f)o=tn(e.firestore,kf),a=ji(e._key.path),i={next:n=>{t[r]&&t[r](Hm(o,e,n))},error:t[r+1],complete:t[r+2]};else{const n=tn(e,If);o=tn(n.firestore,kf),a=n._query;const s=new Gm(o);i={next:e=>{t[r]&&t[r](new zm(o,s,n,e))},error:t[r+1],complete:t[r+2]},Im(e._query)}return function(e,t,n,r){const s=new Kd(r),i=new Xl(t,s,n);return e.asyncQueue.enqueueAndForget(async()=>$l(await uf(e),i)),()=>{s.Nu(),e.asyncQueue.enqueueAndForget(async()=>Gl(await uf(e),i))}}(Mf(o),a,s,i)}function Qm(e,t){return function(e,t){const n=new St;return e.asyncQueue.enqueueAndForget(async()=>async function(e,t,n){const r=Bd(e);try{const e=await function(e,t){const n=_t(e),r=cn.now(),s=t.reduce((e,t)=>e.add(t.key),po());let i,o;return n.persistence.runTransaction("Locally write mutations","readwrite",e=>{let a=oo(),c=po();return n.Ns.getEntries(e,s).next(e=>{a=e,a.forEach((e,t)=>{t.isValidDocument()||(c=c.add(e))})}).next(()=>n.localDocuments.getOverlayedDocuments(e,a)).next(s=>{i=s;const o=[];for(const e of t){const t=jo(e,i.get(e.key).overlayedDocument);null!=t&&o.push(new Go(e.key,t,oi(t.value.mapValue),Lo.exists(!0)))}return n.mutationQueue.addMutationBatch(e,r,o,t)}).next(t=>{o=t;const r=t.applyToLocalDocumentSet(i,c);return n.documentOverlayCache.saveOverlays(e,t.batchId,r)})}).then(()=>({batchId:o.batchId,changes:uo(i)}))}(r.localStore,t);r.sharedClientState.addPendingMutation(e.batchId),function(e,t,n){let r=e.Vu[e.currentUser.toKey()];r||(r=new as(Lt)),r=r.insert(t,n),e.Vu[e.currentUser.toKey()]=r}(r,e.batchId,n),await Ad(r,e.changes),await El(r.remoteStore)}catch(e){const t=Fl(e,"Failed to persist write");n.reject(t)}}(await af(e),t,n)),n.promise}(Mf(e),t)}function Hm(e,t,n){const r=n.docs.get(t._key),s=new Gm(e);return new qm(e,s,t._key,r,new Um(n.hasPendingWrites,n.fromCache),t.converter)}function Wm(e,t){const n=tn(e.firestore,kf),r=Mf(n),s=is(t,(e,t)=>new ea(t,e.aggregateType,e._internalFieldPath));return function(e,t,n){const r=new St;return e.asyncQueue.enqueueAndForget(async()=>{try{const s=await cf(e);r.resolve(async function(e,t,n){const r=_t(e),{request:s,gt:i,parent:o}=Ka(r.serializer,Qi(t),n);r.connection.$o||delete s.parent;const a=(await r.Ho("RunAggregationQuery",r.serializer.databaseId,o,s,1)).filter(e=>!!e.result);It(1===a.length,64727);const c=a[0].result?.aggregateFields;return Object.keys(c).reduce((e,t)=>(e[i[t]]=c[t],e),{})}(s,t,n))}catch(e){r.reject(e)}}),r.promise}(r,e._query,s).then(t=>function(e,t,n){const r=new Gm(e);return new Uf(t,r,n)}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(n,e,t))}class Jm{constructor(e){this.kind="memory",this._onlineComponentProvider=$d.provider,this._offlineComponentProvider=e?.garbageCollector?e.garbageCollector._offlineComponentProvider:{build:()=>new qd(void 0)}}toJSON(){return{kind:this.kind}}}class Xm{constructor(e){let t;this.kind="persistent",e?.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=ng(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}class Ym{constructor(){this.kind="memoryEager",this._offlineComponentProvider=Ud.provider}toJSON(){return{kind:this.kind}}}class Zm{constructor(e){this.kind="memoryLru",this._offlineComponentProvider={build:()=>new qd(e)}}toJSON(){return{kind:this.kind}}}class eg{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=$d.provider,this._offlineComponentProvider={build:t=>new jd(t,e?.cacheSizeBytes,this.forceOwnership)}}}class tg{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=$d.provider,this._offlineComponentProvider={build:t=>new zd(t,e?.cacheSizeBytes)}}}function ng(e){return new eg(e?.forceOwnership)}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const rg={maxAttempts:5};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sg{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Yf(e)}set(e,t,n){this._verifyNotCommitted();const r=ig(e,this._firestore),s=Lm(r.converter,t,n),i=Zf(this._dataReader,"WriteBatch.set",r._key,s,null!==r.converter,n);return this._mutations.push(i.toMutation(r._key,Lo.none())),this}update(e,t,n,...r){this._verifyNotCommitted();const s=ig(e,this._firestore);let i;return i="string"==typeof(t=C(t))||t instanceof jf?am(this._dataReader,"WriteBatch.update",s._key,t,n,r):om(this._dataReader,"WriteBatch.update",s._key,t),this._mutations.push(i.toMutation(s._key,Lo.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=ig(e,this._firestore);return this._mutations=this._mutations.concat(new Wo(t._key,Lo.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new Tt(Et.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function ig(e,t){if((e=C(e)).firestore!==t)throw new Tt(Et.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return e}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class og{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=Yf(e)}get(e){const t=ig(e,this._firestore),n=new Fm(this._firestore);return this._transaction.lookup([t._key]).then(e=>{if(!e||1!==e.length)return vt(24041);const r=e[0];if(r.isFoundDocument())return new wm(this._firestore,n,r.key,r,t.converter);if(r.isNoDocument())return new wm(this._firestore,n,t._key,null,t.converter);throw vt(18433,{doc:r})})}set(e,t,n){const r=ig(e,this._firestore),s=Lm(r.converter,t,n),i=Zf(this._dataReader,"Transaction.set",r._key,s,null!==r.converter,n);return this._transaction.set(r._key,i),this}update(e,t,n,...r){const s=ig(e,this._firestore);let i;return i="string"==typeof(t=C(t))||t instanceof jf?am(this._dataReader,"Transaction.update",s._key,t,n,r):om(this._dataReader,"Transaction.update",s._key,t),this._transaction.update(s._key,i),this}delete(e){const t=ig(e,this._firestore);return this._transaction.delete(t._key),this}}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ag extends og{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=ig(e,this._firestore),n=new Gm(this._firestore);return super.get(e).then(e=>new qm(this._firestore,n,t._key,e._document,new Um(!1,!1),t.converter))}}function cg(e,t){if("string"!=typeof e[t])throw new Tt(Et.INVALID_ARGUMENT,"Missing string value for: "+t);return e[t]}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ug{constructor(e){this._firestore=e,this.type="PersistentCacheIndexManager"}}function hg(e,t){(function(e,t){return e.asyncQueue.enqueue(async()=>function(e,t){_t(e).Fs.Vs=t}(await sf(e),t))})(Mf(e._firestore),t).then(e=>gt(`setting persistent cache index auto creation isEnabled=${t} succeeded`)).catch(e=>yt(`setting persistent cache index auto creation isEnabled=${t} failed`,e))}const lg=new WeakMap;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dg{constructor(){this.Mc=new Map}static get instance(){return fg||(fg=new dg,function(e){if(oa)throw new Error("a TestingHooksSpi instance is already set");oa=e}(fg)),fg}lt(e){this.Mc.forEach(t=>t(e))}onExistenceFilterMismatch(e){const t=Symbol(),n=this.Mc;return n.set(t,e),()=>n.delete(t)}}let fg=null;!function(e,t=!0){!function(e){dt=e}("12.4.0"),Pe(new A("firestore",(e,{instanceIdentifier:n,options:r})=>{const s=e.getProvider("app").getImmediate(),i=new kf(new Dt(e.getProvider("auth-internal")),new Mt(s,e.getProvider("app-check-internal")),function(e,t){if(!Object.prototype.hasOwnProperty.apply(e.options,["projectId"]))throw new Tt(Et.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ds(e.options.projectId,t)}(s,n),s);return r={useFetchStreams:t,...r},i._setSettings(r),i},"PUBLIC").setMultipleInstances(!0)),Ue(ut,ht,e),Ue(ut,ht,"esm2020")}();const mg=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:Pm,AggregateField:Bf,AggregateQuerySnapshot:Uf,Bytes:qf,CACHE_SIZE_UNLIMITED:-1,CollectionReference:Ef,DocumentReference:_f,DocumentSnapshot:qm,FieldPath:jf,FieldValue:zf,Firestore:kf,FirestoreError:Tt,GeoPoint:$f,LoadBundleTask:Nf,PersistentCacheIndexManager:ug,Query:If,QueryCompositeFilterConstraint:Sm,QueryConstraint:Em,QueryDocumentSnapshot:jm,QueryEndAtConstraint:Dm,QueryFieldFilterConstraint:Tm,QueryLimitConstraint:Am,QueryOrderByConstraint:Cm,QuerySnapshot:zm,QueryStartAtConstraint:xm,SnapshotMetadata:Um,Timestamp:cn,Transaction:ag,VectorValue:Gf,WriteBatch:sg,_AutoId:Pt,_ByteString:gs,_DatabaseId:Ds,_DocumentKey:Ht,_EmptyAppCheckTokenProvider:class{getToken(){return Promise.resolve(new Rt(""))}invalidateToken(){}start(e,t){}shutdown(){}},_EmptyAuthCredentialsProvider:At,_FieldPath:Qt,_TestingHooks:
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class{constructor(){throw new Error("instances of this class should not be created")}static onExistenceFilterMismatch(e){return dg.instance.onExistenceFilterMismatch(e)}},_cast:tn,_debugAssert:function(e,t){e||vt(57014,t)},_internalAggregationQueryToProtoRunAggregationQueryRequest:function(e,t){const n=is(t,(e,t)=>new ea(t,e.aggregateType,e._internalFieldPath)),r=Mf(tn(e.firestore,kf)),s=r._onlineComponents?.datastore.serializer;return void 0===s?null:Ka(s,Qi(e._query),n,!0).request},_internalQueryToProtoQueryTarget:function(e){const t=Mf(tn(e.firestore,kf)),n=t._onlineComponents?.datastore.serializer;return void 0===n?null:Ga(n,Ki(e._query)).ft},_isBase64Available:function(){return"undefined"!=typeof atob},_logWarn:yt,_validateIsNotUsedTogether:Jt,addDoc:function(e,t){const n=tn(e.firestore,kf),r=Tf(e),s=Lm(e.converter,t);return Qm(n,[Zf(Yf(e.firestore),"addDoc",r._key,s,null!==e.converter,{}).toMutation(r._key,Lo.exists(!1))]).then(()=>r)},aggregateFieldEqual:function(e,t){return e instanceof Bf&&t instanceof Bf&&e.aggregateType===t.aggregateType&&e._internalFieldPath?.canonicalString()===t._internalFieldPath?.canonicalString()},aggregateQuerySnapshotEqual:function(e,t){return Sf(e.query,t.query)&&T(e.data(),t.data())},and:function(...e){return e.forEach(e=>Om("and",e)),Sm._create("and",e)},arrayRemove:function(...e){return new sm("arrayRemove",e)},arrayUnion:function(...e){return new rm("arrayUnion",e)},average:function(e){return new Bf("avg",fm("average",e))},clearIndexedDbPersistence:function(e){if(e._initialized&&!e._terminated)throw new Tt(Et.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const t=new St;return e._queue.enqueueAndForgetEvenWhileRestricted(async()=>{try{await async function(e){if(!xn.v())return Promise.resolve();const t=e+th;await xn.delete(t)}(ih(e._databaseId,e._persistenceKey)),t.resolve()}catch(e){t.reject(e)}}),t.promise},collection:function(e,t,...n){if(e=C(e),Wt("collection","path",t),e instanceof vf){const r=Gt.fromString(t,...n);return Yt(r),new Ef(e,null,r)}{if(!(e instanceof _f||e instanceof Ef))throw new Tt(Et.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=e._path.child(Gt.fromString(t,...n));return Yt(r),new Ef(e.firestore,null,r)}},collectionGroup:function(e,t){if(e=tn(e,vf),Wt("collectionGroup","collection id",t),t.indexOf("/")>=0)throw new Tt(Et.INVALID_ARGUMENT,`Invalid collection ID '${t}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new If(e,null,function(e){return new Ui(Gt.emptyPath(),e)}(t))},connectFirestoreEmulator:bf,count:Vm,deleteAllPersistentCacheIndexes:function(e){(function(e){return e.asyncQueue.enqueue(async()=>function(e){const t=_t(e),n=t.indexManager;return t.persistence.runTransaction("Delete All Indexes","readwrite",e=>n.deleteAllFieldIndexes(e))}(await sf(e)))})(Mf(e._firestore)).then(e=>gt("deleting all persistent cache indexes succeeded")).catch(e=>yt("deleting all persistent cache indexes failed",e))},deleteDoc:function(e){return Qm(tn(e.firestore,kf),[new Wo(e._key,Lo.none())])},deleteField:
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function(){return new em("deleteField")},disableNetwork:function(e){return function(e){return e.asyncQueue.enqueue(async()=>{const t=await rf(e),n=await of(e);return t.setNetworkEnabled(!1),async function(e){const t=_t(e);t.Ea.add(0),await cl(t),t.Ra.set("Offline")}(n)})}(Mf(e=tn(e,kf)))},disablePersistentCacheIndexAutoCreation:function(e){hg(e,!1)},doc:Tf,documentId:function(){return new jf(zt)},documentSnapshotFromJSON:function(e,t,n){if(sn(t,qm._jsonSchema)){if(t.bundle===Bm)throw new Tt(Et.INVALID_ARGUMENT,"The provided JSON object was created in a client environment, which is not supported.");const r=Jh(e._databaseId),s=ff(t.bundle,r),i=s.Wu(),o=new ed(s.getMetadata(),r);for(const e of i)o.Ga(e);const a=o.documents;if(1!==a.length)throw new Tt(Et.INVALID_ARGUMENT,`Expected bundle data to contain 1 document, but it contains ${a.length} documents.`);const c=qa(r,a[0].document),u=new Ht(Gt.fromString(t.bundleName));return new qm(e,new Fm(e),u,c,new Um(!1,!1),n||null)}},enableIndexedDbPersistence:Pf,enableMultiTabIndexedDbPersistence:async function(e){yt("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=e._freezeSettings();Lf(e,$d.provider,{build:e=>new zd(e,t.cacheSizeBytes)})},enableNetwork:function(e){return function(e){return e.asyncQueue.enqueue(async()=>{const t=await rf(e),n=await of(e);return t.setNetworkEnabled(!0),function(e){const t=_t(e);return t.Ea.delete(0),al(t)}(n)})}(Mf(e=tn(e,kf)))},enablePersistentCacheIndexAutoCreation:function(e){hg(e,!0)},endAt:function(...e){return Dm._create("endAt",e,!0)},endBefore:function(...e){return Dm._create("endBefore",e,!1)},ensureFirestoreConfigured:Mf,executeWrite:Qm,getAggregateFromServer:Wm,getCountFromServer:function(e){return Wm(e,{count:Vm()})},getDoc:
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function(e){e=tn(e,_f);const t=tn(e.firestore,kf);return hf(Mf(t),e._key).then(n=>Hm(t,e,n))},getDocFromCache:function(e){e=tn(e,_f);const t=tn(e.firestore,kf),n=Mf(t),r=new Gm(t);return function(e,t){const n=new St;return e.asyncQueue.enqueueAndForget(async()=>async function(e,t,n){try{const r=await function(e,t){const n=_t(e);return n.persistence.runTransaction("read document","readonly",e=>n.localDocuments.getDocument(e,t))}(e,t);r.isFoundDocument()?n.resolve(r):r.isNoDocument()?n.resolve(null):n.reject(new Tt(Et.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(e){const r=Fl(e,`Failed to get document '${t} from cache`);n.reject(r)}}(await sf(e),t,n)),n.promise}(n,e._key).then(n=>new qm(t,r,e._key,n,new Um(null!==n&&n.hasLocalMutations,!0),e.converter))},getDocFromServer:function(e){e=tn(e,_f);const t=tn(e.firestore,kf);return hf(Mf(t),e._key,{source:"server"}).then(n=>Hm(t,e,n))},getDocs:function(e){e=tn(e,If);const t=tn(e.firestore,kf),n=Mf(t),r=new Gm(t);return Im(e._query),lf(n,e._query).then(n=>new zm(t,r,e,n))},getDocsFromCache:function(e){e=tn(e,If);const t=tn(e.firestore,kf),n=Mf(t),r=new Gm(t);return function(e,t){const n=new St;return e.asyncQueue.enqueueAndForget(async()=>async function(e,t,n){try{const r=await wh(e,t,!0),s=new sd(t,r.Qs),i=s.ru(r.documents),o=s.applyChanges(i,!1);n.resolve(o.snapshot)}catch(e){const r=Fl(e,`Failed to execute query '${t} against cache`);n.reject(r)}}(await sf(e),t,n)),n.promise}(n,e._query).then(n=>new zm(t,r,e,n))},getDocsFromServer:function(e){e=tn(e,If);const t=tn(e.firestore,kf),n=Mf(t),r=new Gm(t);return lf(n,e._query,{source:"server"}).then(n=>new zm(t,r,e,n))},getFirestore:Rf,getPersistentCacheIndexManager:function(e){e=tn(e,kf);const t=lg.get(e);if(t)return t;const n=Mf(e);if("persistent"!==n._uninitializedComponentsProvider?._offline.kind)return null;const r=new ug(e);return lg.set(e,r),r},increment:function(e){return new im("increment",e)},initializeFirestore:function(e,t,n){n||(n=xs);const r=Le(e,"firestore");if(r.isInitialized(n)){const e=r.getImmediate({identifier:n});if(T(r.getOptions(n),t))return e;throw new Tt(Et.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(void 0!==t.cacheSizeBytes&&void 0!==t.localCache)throw new Tt(Et.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(void 0!==t.cacheSizeBytes&&-1!==t.cacheSizeBytes&&t.cacheSizeBytes<yu)throw new Tt(Et.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return t.host&&l(t.host)&&d(t.host),r.initialize({options:t,instanceIdentifier:n})},limit:function(e){return nn("limit",e),Am._create("limit",e,"F")},limitToLast:function(e){return nn("limitToLast",e),Am._create("limitToLast",e,"L")},loadBundle:Ff,memoryEagerGarbageCollector:function(){return new Ym},memoryLocalCache:function(e){return new Jm(e)},memoryLruGarbageCollector:function(e){return new Zm(e?.cacheSizeBytes)},namedQuery:Vf,onSnapshot:Km,onSnapshotResume:function(e,t,...n){const r=C(e),s=function(e){const t={bundle:"",bundleName:"",bundleSource:""},n=["bundle","bundleName","bundleSource"];for(const r of n){if(!(r in e)){t.error=`snapshotJson missing required field: ${r}`;break}const n=e[r];if("string"!=typeof n){t.error=`snapshotJson field '${r}' must be a string.`;break}if(0===n.length){t.error=`snapshotJson field '${r}' cannot be an empty string.`;break}"bundle"===r?t.bundle=n:"bundleName"===r?t.bundleName=n:"bundleSource"===r&&(t.bundleSource=n)}return t}(t);if(s.error)throw new Tt(Et.INVALID_ARGUMENT,s.error);let i,o=0;if("object"!=typeof n[o]||Df(n[o])||(i=n[o++]),"QuerySnapshot"===s.bundleSource){let e=null;if("object"==typeof n[o]&&Df(n[o])){const t=n[o++];e={next:t.next,error:t.error,complete:t.complete}}else e={next:n[o++],error:n[o++],complete:n[o++]};return function(e,t,n,r,s){let i,o=!1;return Ff(e,t.bundle).then(()=>Vf(e,t.bundleName)).then(e=>{e&&!o&&(s&&e.withConverter(s),i=Km(e,n||{},r))}).catch(e=>(r.error&&r.error(e),()=>{})),()=>{o||(o=!0,i&&i())}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */}(r,s,i,e,n[o])}if("DocumentSnapshot"===s.bundleSource){let e=null;if("object"==typeof n[o]&&Df(n[o])){const t=n[o++];e={next:t.next,error:t.error,complete:t.complete}}else e={next:n[o++],error:n[o++],complete:n[o++]};return function(e,t,n,r,s){let i,o=!1;return Ff(e,t.bundle).then(()=>{if(!o){const o=new _f(e,s||null,Ht.fromPath(t.bundleName));i=Km(o,n||{},r)}}).catch(e=>(r.error&&r.error(e),()=>{})),()=>{o||(o=!0,i&&i())}}(r,s,i,e,n[o])}throw new Tt(Et.INVALID_ARGUMENT,`unsupported bundle source: ${s.bundleSource}`)},onSnapshotsInSync:function(e,t){return function(e,t){const n=new Kd(t);return e.asyncQueue.enqueueAndForget(async()=>function(e,t){_t(e).Ca.add(t),t.next()}(await uf(e),n)),()=>{n.Nu(),e.asyncQueue.enqueueAndForget(async()=>function(e,t){_t(e).Ca.delete(t)}(await uf(e),n))}}(Mf(e=tn(e,kf)),Df(t)?t:{next:t})},or:function(...e){return e.forEach(e=>Om("or",e)),Sm._create("or",e)},orderBy:function(e,t="asc"){const n=t,r=bm("orderBy",e);return Cm._create(r,n)},persistentLocalCache:function(e){return new Xm(e)},persistentMultipleTabManager:function(){return new tg},persistentSingleTabManager:ng,query:function(e,t,...n){let r=[];t instanceof _m&&r.push(t),r=r.concat(n),function(e){const t=e.filter(e=>e instanceof Sm).length,n=e.filter(e=>e instanceof Tm).length;if(t>1||t>0&&n>0)throw new Tt(Et.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(r);for(const s of r)e=s._apply(e);return e},queryEqual:Sf,querySnapshotFromJSON:function(e,t,n){if(sn(t,zm._jsonSchema)){if(t.bundle===Bm)throw new Tt(Et.INVALID_ARGUMENT,"The provided JSON object was created in a client environment, which is not supported.");const r=Jh(e._databaseId),s=ff(t.bundle,r),i=s.Wu(),o=new ed(s.getMetadata(),r);for(const e of i)o.Ga(e);if(1!==o.queries.length)throw new Tt(Et.INVALID_ARGUMENT,`Snapshot data expected 1 query but found ${o.queries.length} queries.`);const a=dc(o.queries[0].bundledQuery),c=o.documents;let u=new Vl;c.map(e=>{const t=qa(r,e.document);u=u.add(t)});const h=Ul.fromInitialDocuments(a,u,po(),!1,!1),l=new If(e,n||null,a);return new zm(e,new Fm(e),l,h)}},refEqual:function(e,t){return e=C(e),t=C(t),(e instanceof _f||e instanceof Ef)&&(t instanceof _f||t instanceof Ef)&&e.firestore===t.firestore&&e.path===t.path&&e.converter===t.converter},runTransaction:function(e,t,n){e=tn(e,kf);const r={...rg,...n};return function(e){if(e.maxAttempts<1)throw new Tt(Et.INVALID_ARGUMENT,"Max attempts must be at least 1")}(r),function(e,t,n){const r=new St;return e.asyncQueue.enqueueAndForget(async()=>{const s=await cf(e);new Jd(e.asyncQueue,s,n,t,r).ju()}),r.promise}(Mf(e),n=>t(new ag(e,n)),r)},serverTimestamp:function(){return new nm("serverTimestamp")},setDoc:function(e,t,n){e=tn(e,_f);const r=tn(e.firestore,kf),s=Lm(e.converter,t,n);return Qm(r,[Zf(Yf(r),"setDoc",e._key,s,null!==e.converter,n).toMutation(e._key,Lo.none())])},setIndexConfiguration:
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function(e,t){const n=Mf(e=tn(e,kf));if(!n._uninitializedComponentsProvider||"memory"===n._uninitializedComponentsProvider._offline.kind)return yt("Cannot enable indexes when persistence is disabled"),Promise.resolve();const r=function(e){const t="string"==typeof e?function(e){try{return JSON.parse(e)}catch(e){throw new Tt(Et.INVALID_ARGUMENT,"Failed to parse JSON: "+e?.message)}}(e):e,n=[];if(Array.isArray(t.indexes))for(const r of t.indexes){const e=cg(r,"collectionGroup"),t=[];if(Array.isArray(r.fields))for(const n of r.fields){const e=gm("setIndexConfiguration",cg(n,"fieldPath"));"CONTAINS"===n.arrayConfig?t.push(new gn(e,2)):"ASCENDING"===n.order?t.push(new gn(e,0)):"DESCENDING"===n.order&&t.push(new gn(e,1))}n.push(new ln(ln.UNKNOWN_ID,e,t,yn.empty()))}return n}(t);return function(e,t){return e.asyncQueue.enqueue(async()=>async function(e,t){const n=_t(e),r=n.indexManager,s=[];return n.persistence.runTransaction("Configure indexes","readwrite",e=>r.getFieldIndexes(e).next(n=>
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function(e,t,n,r,s){e=[...e],t=[...t],e.sort(n),t.sort(n);const i=e.length,o=t.length;let a=0,c=0;for(;a<o&&c<i;){const i=n(e[c],t[a]);i<0?s(e[c++]):i>0?r(t[a++]):(a++,c++)}for(;a<o;)r(t[a++]);for(;c<i;)s(e[c++])}(n,t,mn,t=>{s.push(r.addFieldIndex(e,t))},t=>{s.push(r.deleteFieldIndex(e,t))})).next(()=>Sn.waitFor(s)))}(await sf(e),t))}(n,r)},setLogLevel:function(e){ft.setLogLevel(e)},snapshotEqual:function(e,t){return e instanceof qm&&t instanceof qm?e._firestore===t._firestore&&e._key.isEqual(t._key)&&(null===e._document?null===t._document:e._document.isEqual(t._document))&&e._converter===t._converter:e instanceof zm&&t instanceof zm&&e._firestore===t._firestore&&Sf(e.query,t.query)&&e.metadata.isEqual(t.metadata)&&e._snapshot.isEqual(t._snapshot)},startAfter:function(...e){return xm._create("startAfter",e,!1)},startAt:function(...e){return xm._create("startAt",e,!0)},sum:function(e){return new Bf("sum",fm("sum",e))},terminate:function(e){return function(e,t,n=De){Le(e,t).clearInstance(n)}(e.app,"firestore",e._databaseId.database),e._delete()},updateDoc:function(e,t,n,...r){e=tn(e,_f);const s=tn(e.firestore,kf),i=Yf(s);let o;return o="string"==typeof(t=C(t))||t instanceof jf?am(i,"updateDoc",e._key,t,n,r):om(i,"updateDoc",e._key,t),Qm(s,[o.toMutation(e._key,Lo.exists(!0))])},vector:function(e){return new Gf(e)}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */,waitForPendingWrites:function(e){return function(e){const t=new St;return e.asyncQueue.enqueueAndForget(async()=>async function(e,t){const n=_t(e);gl(n.remoteStore)||gt(id,"The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const e=await function(e){const t=_t(e);return t.persistence.runTransaction("Get highest unacknowledged batch id","readonly",e=>t.mutationQueue.getHighestUnacknowledgedBatchId(e))}(n.localStore);if(e===qn)return void t.resolve();const r=n.mu.get(e)||[];r.push(t),n.mu.set(e,r)}catch(e){const n=Fl(e,"Initialization of waitForPendingWrites() operation failed");t.reject(n)}}(await af(e),t)),t.promise}(Mf(e=tn(e,kf)))},where:function(e,t,n){const r=t,s=bm("where",e);return Tm._create(s,r,n)},writeBatch:function(e){return Mf(e=tn(e,kf)),new sg(e,t=>Qm(e,t))}},Symbol.toStringTag,{value:"Module"}));export{mg as a,Pf as e,Rf as g,Be as i,Ue as r};
//# sourceMappingURL=index.esm-C88_lkS0.js.map
