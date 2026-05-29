import{r as e,i as a,g as E,e as s}from"./index.esm-C88_lkS0.js";
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
e("firebase","12.4.0","app");const o={BASE_URL:"/",DEV:!1,MODE:"production",PROD:!0,SSR:!1,VITE_API_BASE_URL:"https://gg0b1.netlify.app/api/v1",VITE_API_URL:"http://localhost:5000/api/v1",VITE_FIREBASE_API_KEY:"AIzaSyAMLs_SO_LBTWvPcKLyr7fO2tuw7xn2DbM",VITE_FIREBASE_APP_ID:"1:357081663277:web:c787254ff6f8a76ad5b5a4",VITE_FIREBASE_AUTH_DOMAIN:"messagegg-39a44.firebaseapp.com",VITE_FIREBASE_MEASUREMENT_ID:"G-H8SSXVS813",VITE_FIREBASE_MESSAGING_SENDER_ID:"357081663277",VITE_FIREBASE_PROJECT_ID:"messagegg-39a44",VITE_FIREBASE_STORAGE_BUCKET:"messagegg-39a44.firebasestorage.app",VITE_STRIPE_PUBLISHABLE_KEY:"pk_test_51THhcDHSn3j5Zn67VPCQ1LVWDqt3aiYaHu78HS709OSwXyrZs8EI7nlbOSqGQ0CKmR5PtSfvEF8EqydsIEnOETbK0065BZzsld",VITE_VAPID_PUBLIC_KEY:"BIJkwTEZoZQ8omBOp-p9YyJ-96PdFZWHH5JTlaUMMpTVJTz_M8VdY3icUAT00U0rpl6DA_H8Mso8WSxCjifmufU"};var i={};const I={apiKey:"dummy-key-for-dev",authDomain:"dummy.firebaseapp.com",projectId:"dummy-project-id",storageBucket:"dummy.appspot.com",messagingSenderId:"dummy-sender-id",appId:"dummy-app-id",measurementId:"dummy-measurement-id"},n=(e,a="")=>void 0!==o[e]?o[e]:"undefined"!=typeof process&&void 0!==i[e]?i[e]:a,r={apiKey:n("VITE_FIREBASE_API_KEY",I.apiKey),authDomain:n("VITE_FIREBASE_AUTH_DOMAIN",I.authDomain),projectId:n("VITE_FIREBASE_PROJECT_ID",I.projectId),storageBucket:n("VITE_FIREBASE_STORAGE_BUCKET",I.storageBucket),messagingSenderId:n("VITE_FIREBASE_MESSAGING_SENDER_ID",I.messagingSenderId),appId:n("VITE_FIREBASE_APP_ID",I.appId),measurementId:n("VITE_FIREBASE_MEASUREMENT_ID",I.measurementId)};let _,t;if("undefined"!=typeof window)try{_=a(r),t=E(_),s(t).catch(e=>{"failed-precondition"===e.code?console.warn("Offline persistence can only be enabled in one tab at a time."):"unimplemented"===e.code&&console.warn("The current browser does not support offline persistence.")}),console.log("Firebase initialized successfully")}catch(d){console.error("Firebase initialization error:",d),r.apiKey.includes("dummy")&&(console.error("Please check your .env file and ensure all Firebase configuration values are set."),console.log("Refer to .env.example for the required variables"))}else console.warn("Firebase is not initialized on the server side");export{_ as app,t as db,r as firebaseConfig};
//# sourceMappingURL=firebase-B3ygP4F9.js.map
