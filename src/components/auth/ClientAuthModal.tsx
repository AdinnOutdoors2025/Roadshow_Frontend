/* eslint-disable */
// @ts-nocheck
"use client";

import React from "react";
import {useAuth} from "@/context/AuthContext";
import "./ClientAuthModal.css";


export default function AuthModal(){

const {
open,
closeAuth,
screen,
setScreen
}=useAuth();



if(!open)
return null;



return(

<div className="auth-overlay">


<div className="auth-box">


<button
className="close"
onClick={closeAuth}
>
×
</button>



{
screen==="login" &&

<>


<div className="auth-icon">
🚚
</div>


<h3>
Log In
</h3>


<input
placeholder="Contractor ID"
/>


<button className="continue">
Continue
</button>



<p>
Don't have an Account ?
<b
onClick={()=>setScreen("signup")}
>
 Sign Up
</b>
</p>


<footer>
By continuing, you agree to Adinn Roadshow's
<span>
 Terms & Privacy Policy
</span>
</footer>


</>


}




{
screen==="signup" &&


<>


<div className="auth-icon">
➜
</div>


<h3>
Sign Up
</h3>



<input placeholder="Full Name"/>

<input placeholder="Mobile Number"/>

<input placeholder="User@gmail.com"/>



<button
className="continue"
onClick={()=>setScreen("otp")}
>
Continue
</button>


<p>
Already have account?
<b
onClick={()=>setScreen("login")}
>
 Sign In
</b>
</p>


<footer>
By continuing, you agree to Adinn Roadshow's
<span>
 Terms & Privacy Policy
</span>
</footer>


</>


}



{
screen==="otp" &&


<>


<div className="auth-icon">
✉
</div>


<h3>
Enter OTP to Verify
</h3>


<p>
Sent to 9487576585
</p>



<input
placeholder="Enter valid OTP"
/>



<button
className="continue"
>
Continue
</button>


<p>
Don't have an Account ?
<b
onClick={()=>setScreen("signup")}
>
 Sign Up
</b>
</p>


<footer>
By continuing, you agree to Adinn Roadshow's
<span>
 Terms & Privacy Policy
</span>
</footer>


</>


}



</div>


</div>

)

}