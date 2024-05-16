import React from 'react';
import "../css/common.css";
import Sidebar from "../component/Sidebar";

const Layout = (props) => {
    return (
        <div>
            <Sidebar onSearchAddress={props.onSearchAddress} />
            {props.children}
        </div>
    );
}

export default Layout;
