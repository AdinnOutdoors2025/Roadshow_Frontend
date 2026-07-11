/* eslint-disable */
// @ts-nocheck
"use client";

import React, {createContext, useContext, useState} from "react";

const AuthContext = createContext<any>(null);


export function AuthProvider({
    children
}:{
    children:React.ReactNode
}){

    const [open,setOpen] = useState(false);

    const [screen,setScreen] = useState<
    "login"|"signup"|"otp"
    >("login");


    const openAuth = () =>{
        setScreen("login");
        setOpen(true);
    };


    const closeAuth = ()=>{
        setOpen(false);
    };


    return(
        <AuthContext.Provider
        value={{
            open,
            setOpen,
            screen,
            setScreen,
            openAuth,
            closeAuth
        }}
        >

        {children}

        </AuthContext.Provider>
    )
}


export function useAuth(){
    return useContext(AuthContext);
}