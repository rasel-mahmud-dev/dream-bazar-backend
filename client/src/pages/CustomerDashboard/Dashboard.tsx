import React, {lazy, Suspense, useContext, useState} from 'react'
import {useParams, Link, Route, Outlet, useLocation,} from "react-router-dom"
import {nonInitialEffect} from "src/reactTools"

import {
  Menu,
  Animation
} from "components/UI"

import { useDispatch, useSelector} from "react-redux"
import "./Dashboard.scss"
import {RootState} from "src/store";
import {
  BiStar,
  BiUser,
  BsGear, FaAddressBook, FaIcons,
  FaQuestionCircle, FaSignOutAlt, FiShoppingCart, GiCancel,
  GiHelp, GiReturnArrow, GoReport,
  GrOrderedList,
  MdDashboard,
  MdFavorite, MdManageAccounts, MdPayment
} from "react-icons/all";


import {AppContext, AppContextType, DeviceType} from "store/AppContext";


import ShoppingCart from "pages/Customer/cart/ShoppingCart";
import staticImagePath from "src/utills/staticImagePath";



// const AddressBook = lazy(()=> import("./AddressBook/AddressBook"))
// const Orders = lazy(()=> import("./Orders/Orders"))
// const OrderDetails = lazy(()=> import("./OrderDetails/OrderDetails"))
// const AccountInfo = lazy(()=> import("./accountInfo/AccountInfo"))
// const CustomerDashboard = lazy(()=> import("./CustomerDashboard"))
// const CreateSellerAccount = lazy(()=>import("../SellerHub/createSellerAccount/CreateSellerAccount"))

const sidebarData =  [
  {
    id: "0",
    name: "Dashboard",
    icon: <MdDashboard />,
    to: `/auth/customer/dashboard`
  },
  {
    label: "Manage My Account",
    name: "My Account",
    id: 1,
    to: "none",
    icon: <BiUser />,
    subMenu: [
      {name: "Account Information", to: `/customer/ : "guest"}/account-info`,  icon: <MdManageAccounts />, id: "11"},
      {name: "Address Book", to: `/customer/$ : "guest"}/address-book`, icon: <FaAddressBook />},
      {name: "Payment Option", to: "/dashboard/brands", icon: <MdPayment />},
      {name: "Vouchers", to: "/dashboard/brands", icon: <GoReport />},
    ]
  },
  {
    label: "Manger My orders",
    name: "Orders",
    id: 2,
    to: "none",
    icon: <GrOrderedList />,
    subMenu: [
      {name: "My Orders", to: `/customer/`, icon: <FaIcons />, id: "111"},
      {name: "My Returns", to: "/dashboard/brands", icon: <GiReturnArrow />, id: "112"},
      {name: "My Cancellations", to: "/dashboard/brands", icon: <GiCancel />, id: "113"},
    ]
  },
  {
    name: "My Shopping Cart",
    to: "/auth/customer/dashboard/cart",
    id: 102,
    icon: <FiShoppingCart />
  },
  {
    name: "My Reviews",
    to: "",
    id: 3,
    icon: <BiStar />
  },{
    name: "My Wishlist & Followed Stores",
    to: "/auth/customer/dashboard/wishlist",
    id: 4,
    icon: <MdFavorite />
  },
  {
    name: "Setting",
    to: "",
    id: 3,
    icon: <BsGear/>
  },
  {
    name: "Policies",
    to: "",
    id: 4,
    icon: <FaQuestionCircle />
  },
  {
    name: "Help",
    to: "",
    id: 5,
    icon: <GiHelp />
  },
  {
    name: "Sign Out",
    to: "",
    id: 6,
    icon: <FaSignOutAlt />
  }
]


const Dashboard = (props) => {
  
  let params = useParams() 
  
  const location = useLocation();
  // let history = useHistory()
  const dispatch = useDispatch()
  
  const { authState : {auth} } = useSelector((state: RootState)=>state)
  
  let [collapseIds, setCollapseIds] = React.useState(["1", "1-11"])
  const [isInline, setInline] = useState(false)
  let [currentPage, setCurrentPage] = React.useState("0")
  
  const {contextState, contextDispatch} = useContext<AppContextType>(AppContext)
  
  React.useEffect(()=>{
    
    let a: any = location.pathname.lastIndexOf("/");
    
    if(a !== -1){
      a =  location.pathname.slice(a)
    }
    
    let isFound = false
    sidebarData.forEach(item=>{
      
      if(item.to){
        let index = item.to.indexOf(a)
        
        if(index !== -1){
          setCurrentPage(item.id.toString())
          isFound = true
          return;
          
        } else  {
          
          if(!isFound && item.subMenu) {
            item.subMenu.forEach(subItem => {
              if (subItem.to && subItem.to.indexOf(a) !== -1) {
                if(subItem.id) {
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
  
  
  
  React.useEffect(()=>{
    if(contextState.windowWidth > 800){
      setInline(false)
    } else {
      setInline(true)
    }
  }, [contextState.windowWidth])
  
  
  nonInitialEffect(()=>{
    if(!auth){
      // history.push("/auth/login?redirect=dashboard")
    } 
  }, [auth])
  
  
  function renderSidebarMenu(){
    
    function toggleCollapseSubMenu(id){
      if(collapseIds.indexOf(id.toString()) !== -1){
        setCollapseIds([])
      } else{
        setCollapseIds([id.toString()]);
      }
    }
    
    function renderInlineMode(isInline, item){
      
        return isInline && (
            <div className="menu-item_inline relative py-3 px-4 flex flex-col justify-center items-center">
              
              {React.cloneElement(item.icon, { className: "text-xl menu-item-icon"})}
              
              { item.label && (
                  <span
                      className="flex mt-2 gap-0.5 justify-center h-4 items-center"
                      onClick={()=>toggleCollapseSubMenu(item.id)}>
                    <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
                    <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
                    <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
                  </span>
                )
              }
              
              <Animation baseClass="sub_menu_animation" inProp={(collapseIds.includes(item.id.toString()))}>
                  {item.subMenu && item.subMenu.map(item2=>(
                      item2.icon && (
                          <div className="my-3">
                       
                            { React.cloneElement(item2.icon, { className: "text-xl menu-item-icon-sub" }) }
                           
                            { collapseIds.includes(item.id.toString()) && <span
                                className="menu-item-tooltip-sub absolute left-16 whitespace-nowrap bg-neutral-700 px-3 py-2">
                                {item2.name}
                              </span>
                             }
                          </div>
                      )
                  ))}
              </Animation>
              
              <div className="menu-item-tooltip absolute left-16 whitespace-nowrap bg-neutral-700 px-3 py-2">
                <span className="">{item.name}</span>
              </div>
            </div>
        )
    }
    
    return (
      <div className={`sidebar bg-white dark:bg-neutral-800 ${isInline ? "inline-mode" : ""}`}>
         <div className="sidebar_content custom_scrollbar">
           
           <div className="p-2 md:p-5 bg-neutral-100 dark:bg-neutral-700">
                     <div className="w-8 md:w-14 mx-auto">
                         <img className="rounded-full" src={staticImagePath(auth?.avatar)} alt=""/>
                     </div>
                     <div className="hidden md:block">
                         <h3 className="text-center text-lg font-medium mt-3 dark:text-neutral-200">{auth?.firstName} {auth?.lastName}</h3>
                     <h3 className="text-center font-medium mt-1 text-green-500">{auth?.roles}</h3>
                     </div>
                 </div>
           
           
           { sidebarData.map(data=>(
               <div className="">
              
              <Menu selectedKeys={collapseIds} inline={isInline}>
                
                  <Menu.SubMenu
                      onClickOnItem={toggleCollapseSubMenu} className="pt-1 px-4"
                      key={data.id.toString()}
                      item={data as any}
                      activeId={currentPage}
                      renderInlineMode={renderInlineMode}
                      label={<h1 className="text-red-500 font-medium mt-3 ml-2 mb-1">{data.label}</h1>}>
                    
                      <div className="menu-item text-neutral-200">
                        { (!data.subMenu && data.to) ? (
                            <Link to={data.to} className="flex items-center">
                              { data.icon }
                              <span className="ml-2">{data.name}</span>
                          </Link>
                        ) : (
                            <div className="flex items-center">
                              { data.icon }
                              <span className="ml-2">{data.name}</span>
                          </div>
                        ) }
                        
                      </div>
  
  
                    {data.subMenu && <div className="bg-neutral-100 dark:bg-neutral-700 px-3 py-2">
                          {data.subMenu.map(s=>(
                              <Menu.Item className=" my-1" key={s.id}>
                                <Link to={s.to} className="flex items-center gap-x-1 text-neutral-200 py-1 menu-item">
                                  {s.icon}
                                  {s.name}
                              </Link>
                            </Menu.Item>
                          ))}
                        </div>
                    }
                    
                  </Menu.SubMenu>
              </Menu>
            </div>
           )) }
         </div>
      </div>
    )
  }
  
  return (
        <div className="dashboard-container">
          <div className="flex">
        
            {renderSidebarMenu()}
    
            <div className={`content w-full ml-8 ${isInline ? "inline-mode" : ""}`}>
              <Outlet />
            </div>
          
          </div>
        </div>
    )
}



export default Dashboard