import React, {useContext, useEffect, useState} from "react";
import {Outlet, useLocation, useParams} from "react-router-dom";

// import {nonInitialEffect} from "src/reactTools"
//
// import {
//     Menu,
//     Animation
// } from "UI/index"
import {useDispatch, useSelector} from "react-redux";
import "./Dashboard.scss";
import {RootState} from "src/store";

import {
    BsGear,
    CgAdd,
    CgProductHunt,
    FaAddressBook,
    FaIcons,
    FaQuestionCircle,
    FaSignOutAlt,
    GiHelp,
    GrOrderedList,
    MdDashboard,
    MdManageAccounts,
} from "react-icons/all";

import {AppContext, AppContextType} from "store/AppContext";

// import staticImagePath from "src/utills/staticImagePath";
// import SellerNavigation from "pages/sellerDashboard/components/sellerNavigation/SellerNavigation";
import AdminNavigation from "pages/adminDashboard/components/adminNavigation/AdminNavigation";
import AdminSidebar from "./components/adminSidebar/AdminSidebar";
import {currentAuthAction} from "actions/authAction";
import {Scope} from "store/types";

const sidebarData = [
    {
        id: 0,
        name: "Dashboard",
        icon: <MdDashboard/>,
        to: `/auth/admin/dashboard`,
    },
    {
        label: "Manage Product",
        name: "Products",
        to: "none",
        id: 1,
        icon: <CgProductHunt/>,
        subMenu: [
            {name: "Products", to: `/auth/admin/dashboard/products`, icon: <MdManageAccounts/>, id: "11"},
            {name: "Add Products", to: `/auth/admin/dashboard/add-product`, icon: <FaAddressBook/>, id: "23432432"},
        ],
    },
    {
        label: "Manage Brands",
        name: "Brands",
        to: "none",
        id: 2,
        icon: <GrOrderedList/>,
        subMenu: [
            {name: "Brands", to: "/auth/admin/dashboard/brands", icon: <FaIcons/>, id: "234234"},
            {name: "Add Brand", to: "/auth/admin/dashboard/add-brand", icon: <CgAdd/>, id: "7574"},
        ],
    },
    {
        label: "Manage Categories",
        name: "Categories",
        to: "none",
        id: 3,
        icon: <GrOrderedList/>,
        subMenu: [
            {name: "Categories", to: `/auth/admin/dashboard/categories`, icon: <FaIcons/>, id: "7567"},
            {name: "Add Category", to: "/auth/admin/dashboard/add-category", icon: <CgAdd/>},
        ],
    },
    {
        name: "Setting",
        to: "",
        id: 4,
        icon: <BsGear/>,
    },
    {
        name: "Policies",
        to: "",
        id: 5,
        icon: <FaQuestionCircle/>,
    },
    {
        name: "Help",
        to: "",
        id: 6,
        icon: <GiHelp/>,
    },
    {
        name: "Sign Out",
        to: "",
        id: 7,
        icon: <FaSignOutAlt/>,
    },
];

const AdminDashboard = (props) => {
    
    let params = useParams()
    let location = useLocation();
    
    React.useEffect(() => {
        
        let a: any = location.pathname.lastIndexOf("/");
        
        if (a !== -1) {
            a = location.pathname.slice(a)
        }
        
        let isFound = false
        sidebarData.forEach(item => {
            
            if (item.to) {
                let index = item.to.indexOf(a as any)
                
                if (index !== -1) {
                    setCurrentPage(item.id.toString())
                    isFound = true
                    return;
                    
                } else {
                    
                    if (!isFound && item.subMenu) {
                        item.subMenu.forEach(subItem => {
                            if (subItem.to && subItem.to.indexOf(a as any) !== -1) {
                                if (subItem.id) {
                                    setCurrentPage(subItem.id.toString())
                                    return;
                                }
                            }
                        })
                    }
                }
            }
        })
        
    }, [location.pathname])
    
    
    let [collapseIds, setCollapseIds] = React.useState(["1"])
    let [currentPage, setCurrentPage] = React.useState("0")
    
    
    const [isInline, setInline] = useState(false)
    const {contextState, contextDispatch} = useContext<AppContextType>(AppContext)
    
    
    // React.useEffect(()=>{
    //     if(contextState.windowWidth > 800){
    //         setInline(false)
    //     } else {
    //         setInline(true)
    //     }
    //
    //     console.log(contextState)
    //
    // }, [contextState.windowWidth])
    
    
    // nonInitialEffect(()=>{
    //     if(!auth){
    //         // history.push("/auth/login?redirect=dashboard")
    //     }
    // }, [auth])
    //
    
    // function renderSidebarMenu(){
    //
    //     function toggleCollapseSubMenu(id){
    //         if(collapseIds.indexOf(id.toString()) !== -1){
    //             setCollapseIds([])
    //         } else{
    //             setCollapseIds([id.toString()]);
    //         }
    //     }
    //
    //     function renderInlineMode(isInline, item){
    //
    //         return isInline && (
    //             <div className="menu-item_inline relative py-3 px-4 flex flex-col justify-center items-center">
    //
    //             {React.cloneElement(item.icon, { className: "text-xl menu-item-icon"})}
    //
    //             { item.label && (
    //                 <span
    //                     className="flex mt-2 gap-0.5 justify-center h-4 items-center"
    //                     onClick={()=>toggleCollapseSubMenu(item.id)}>
    //                     <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
    //                     <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
    //                     <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
    //                 </span>
    //             )}
    //
    //             <Animation baseClass="sub_menu_animation" inProp={(collapseIds.includes(item.id.toString()))}>
    //               {item.subMenu && item.subMenu.map(item2=>(
    //                   item2.icon && (
    //                       <div className="my-3">
    //
    //                         { React.cloneElement(item2.icon, { className: "text-xl menu-item-icon-sub" }) }
    //
    //                           { collapseIds.includes(item.id.toString()) && <span
    //                               className="menu-item-tooltip-sub absolute left-16 whitespace-nowrap bg-neutral-700 px-3 py-2">
    //                             {item2.name}
    //                           </span>
    //                           }
    //                       </div>
    //                   )
    //               ))}
    //           </Animation>
    //
    //           <div className="menu-item-tooltip absolute left-16 whitespace-nowrap bg-neutral-700 px-3 py-2">
    //             <span className="">{item.name}</span>
    //           </div>
    //         </div>
    //     )}
    //
    //     return auth && (
    //         <div className={`sidebar bg-white dark:bg-neutral-800 ${isInline ? "inline-mode" : ""}`}>
    //
    //          <div className="sidebar_content custom_scrollbar">
    //
    //              <div className="p-2 md:p-5 bg-neutral-100 dark:bg-neutral-700">
    //                  <div className="w-8 md:w-14 mx-auto">
    //                      <img className="rounded-full" src={staticImagePath(auth?.avatar)} alt=""/>
    //                  </div>
    //                  <div className="hidden md:block">
    //                      <h3 className="text-center text-lg font-medium mt-3 dark:text-neutral-200">{auth.firstName} {auth.lastName}</h3>
    //                  <h3 className="text-center font-medium mt-1 text-green-500">{auth.roles}</h3>
    //                  </div>
    //              </div>
    //
    //            { sidebarData.map(data=>(
    //                <div className="">
    //
    //                   <Menu selectedKeys={collapseIds} inline={isInline}>
    //
    //                       <Menu.SubMenu
    //                           onClickOnItem={toggleCollapseSubMenu} className="pt-1 px-4"
    //                           key={data.id.toString()}
    //                           item={data as any}
    //                           activeId={currentPage}
    //                           renderInlineMode={renderInlineMode}
    //                           label={<h1 className="text-green-400 font-medium mt-3 ml-2 mb-1">{data.label}</h1>}>
    //
    //                           <div className="menu-item text-neutral-200">
    //                             { (!data.subMenu && data.to) ? (
    //                                 <Link to={data.to} className="flex items-center">
    //                                   { data.icon }
    //                                     <span className="ml-2">{data.name}</span>
    //                               </Link>
    //                             ) : (
    //                                 <div className="flex items-center">
    //                                   { data.icon }
    //                                     <span className="ml-2">{data.name}</span>
    //                               </div>
    //                             ) }
    //
    //                           </div>
    //
    //
    //                           {data.subMenu  && <div className="bg-neutral-100 dark:bg-neutral-700 px-3 py-2">
    //                               {data.subMenu.map((s)=>(
    //                                   <Menu.Item className={`my-1`} key={s.id} >
    //                                     <Link to={s.to} className="flex items-center gap-x-1 text-neutral-200 py-1 menu-item">
    //                                         {s.icon}
    //                                         {s.name}
    //                                   </Link>
    //                                 </Menu.Item>
    //                               ))}
    //                             </div>
    //                           }
    //
    //                       </Menu.SubMenu>
    //                   </Menu>
    //             </div>
    //            )) }
    //          </div>
    //     </div>
    // )}
    
    
    const dispatch = useDispatch();
    const {
        appState: {isOpenLeftBar},
        adminState: {admin},
    } = useSelector((state: RootState) => state);
    
    
    useEffect(() => {
        currentAuthAction(dispatch, Scope.ADMIN_DASHBOARD);
    }, []);
    
    
    return (
        <div className="">
            
        <AdminNavigation admin={admin}/>
            			<div className="container mx-auto">
          <div className="flex">
              <AdminSidebar isOpenLeftBar={isOpenLeftBar} auth={admin}/>
              <div className="w-full ml-0 lg:ml-6">
                  <Outlet/>
              </div>
          </div>
          </div>
        </div>
    )
}


export default AdminDashboard