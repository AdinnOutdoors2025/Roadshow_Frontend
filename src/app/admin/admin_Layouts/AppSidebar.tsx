"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../../../icons/index";
import SidebarWidget from "./SidebarWidget";
import {
  HiOutlineUserGroup,
  HiOutlineClipboardList,
  HiOutlineShoppingBag,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShieldCheck
} from "react-icons/hi";
import { getToken } from "../../utils/auth";
import { parseAdminJwtPayload, fetchLiveAllowedMenus } from "../../utils/permissionSync";
import API_BASE from "../../../../baseurl";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  key?: string;
  subItems?: { name: string; path: string; key?: string; pro?: boolean; new?: boolean }[];
};


const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    key: "/admin/dashboard",
    subItems: [{ name: "Roadshow", path: "/admin/dashboard", pro: false }],
  },

    {
    name: "Vehicles",
    icon: <ListIcon />,
    subItems: [
      { name: "Vehicle Onboarding", path: "/admin/Vehicles/Vehicle_Onboarding", key: "/admin/Vehicles/Vehicle_Onboarding", pro: false },
      { name: "Vehicle Inventory", path: "/admin/Vehicles/Vehicle_Inventory", key: "/admin/Vehicles/Vehicle_Inventory", pro: false }
    ],

  },
      {
    name: "Package Management",
    icon: <HiOutlineCube />,
    path: "/admin/package-management"
  },
    {
    name: "Project Settings",
    icon: <HiOutlineCube />,
    path: "/admin/project-setting"
  },

     {
    name: "Order Creation",
     icon: <HiOutlineClipboardList />,
    path: "/admin/order-creation"
  },

        {
    icon: <GridIcon />,
    name: "Order Handling",
    subItems: [
      { name: "Sales Handling", path: "/admin/sales-handling", key: "/admin/sales-handling", pro: false },
      { name: "Operation Handling", path: "/admin/operation-handling", key: "/admin/operation-handling", pro: false },
    ],

  },
     {
    name: "Sales User Management",
    icon: <HiOutlineUserGroup />,
    path: "/admin/sales-management"
  },
  {
    name: "Operation User Management",
    icon: <HiOutlineUserGroup />,
    path: "/admin/operation-management"
  },


  // {
  //   name: "Client Request Order",
  //   icon: <HiOutlineClipboardList />,
  //   path: "/admin/client-request-order"
  // },




  {
    name: "Driver Management",
    icon: <HiOutlineCube />,
    path: "/admin/driver"
  },

   {
    name: "Promoter",
    icon: <HiOutlineUsers />,
    path: "/admin/promoter"
  },
 {
    name: "Invoice Generation",
    icon: <HiOutlineClipboardList />,
    path: "/admin/invoice-generation"
  },

 
  {
    name: "Role Permission",
    icon: <HiOutlineShieldCheck />,
    path: "/admin/role-permission"
  },


];

const othersItems: NavItem[] = [];

function computeAllowedMenus(): string[] | null {
  const token = getToken();
  if (!token) return [];
  const payload = parseAdminJwtPayload(token);
  if (!payload) return [];
  if (payload.role === "admin") return null; // null = no restriction
  return payload.allowedMenus || [];
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  // admin role → full sidebar. sales/operation roles → only menus present in
  // their `allowedMenus` (baked into the JWT at login by RolePermission).
  //
  // Server has no cookie access, so SSR always renders the safe deny-all `[]`
  // shell. The client's very first render must produce that exact same `[]`
  // too (React requires the pre-hydration client render to match the server
  // HTML) — reading the cookie can only happen client-side, so the real
  // role/allowedMenus are resolved in useEffect, right after mount. That
  // still means the client corrects itself a beat after hydration, but it
  // corrects FROM deny-all, never from — or to — the full unrestricted menu,
  // so a sales/operation login never has a frame where the full admin
  // sidebar is visible.
  const [allowedMenus, setAllowedMenus] = useState<string[] | null>([]);

  useEffect(() => {
    // JWT-embedded value first (instant, no flash), then re-fetch the live
    // value from the backend so a permission change Admin just made shows up
    // here without the user having to log out/in.
    setAllowedMenus(computeAllowedMenus());

    const token = getToken();
    if (!token) return;
    const payload = parseAdminJwtPayload(token);
    if (!payload || payload.role === "admin" || !payload.id) return;
    let cancelled = false;
    fetchLiveAllowedMenus(API_BASE, token, payload.id).then((live) => {
      if (!cancelled && live) setAllowedMenus(live);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const menuKey = (nav: NavItem) => nav.key || nav.path || nav.name;
  // Grouped items (subItems, no own key — e.g. "Order Handling", "Vehicles")
  // are permission-gated per sub-item: the group stays visible if at least
  // one sub-item is allowed, and only the allowed sub-items are shown inside it.
  const filterByPermission = (items: NavItem[]): NavItem[] => {
    if (allowedMenus === null) return items;
    return items.reduce<NavItem[]>((acc, nav) => {
      if (nav.subItems && !nav.key) {
        const allowedSubItems = nav.subItems.filter((sub) =>
          allowedMenus.includes(sub.key || sub.path)
        );
        if (allowedSubItems.length > 0) acc.push({ ...nav, subItems: allowedSubItems });
        return acc;
      }
      if (allowedMenus.includes(menuKey(nav))) acc.push(nav);
      return acc;
    }, []);
  };

  const filteredNavItems = filterByPermission(navItems);
  const filteredOthersItems = filterByPermission(othersItems);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/admin/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/AdinnLogo.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/AdinnLogo.png"
                style={{ background: 'white' }}
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/Favicons/adinnIcon32x32.jpg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  ""
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>

            {filteredOthersItems.length > 0 && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(filteredOthersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
