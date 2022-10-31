import React, {FC, HTMLAttributes, ReactNode} from "react";
import { Popup } from "UI/index";

import { useDispatch } from "react-redux";
import { logoutAction } from "actions/authAction";
import staticImagePath from "src/utills/staticImagePath";
import { Link, useNavigate } from "react-router-dom";
import { Scope } from "store/types";

interface Props extends HTMLAttributes<HTMLDivElement> {
    isShow: boolean;
    auth: any;
    children?: ReactNode
}

const AuthDropdown: FC<Props> = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { auth } = props;
    
    function handleLogout() {
        logoutAction(dispatch, Scope.SELLER_DASHBOARD)
        navigate("/seller/login", {state: "/seller/dashboard"})
    }
    
    return (
        <Popup
            timeout={500}
            animationClass="nav-popup-menu"
            className={`bg-white dark:bg-neutral-800 ${props.className}`}
            inProp={props.isShow}
        >
			<div className="text-neutral-700 dark:text-neutral-50 flex items-center font-medium ">
				<div className="w-9">
                    <img className="rounded-full" src={staticImagePath(auth?.avatar)} alt="" />
                </div>
				<div className="ml-2">
					<h4>{auth?.username}</h4>
					<p>{auth?.email}</p>
				</div>
			</div>
            
            <div className="mt-2">
                {props.children}
            </div>
            
		</Popup>
    );
};

export default AuthDropdown;