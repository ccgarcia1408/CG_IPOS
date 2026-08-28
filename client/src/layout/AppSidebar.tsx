import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  BoxIcon,
  BoxIconLine,
  CalenderIcon,
  ChevronDownIcon,
  DocsIcon,
  DollarLineIcon,
  DownloadIcon,
  FileIcon,
  FolderIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  TaskIcon,
  TimeIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Menu } from "../types/Menu";
import { ApiResponse } from "../types/ApiResponse";

type NavSubItem = {
  menuId: number;
  name: string;
  path: string;
  icon?: React.ReactNode;
};

type NavItem = {
  menuId: number;
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavSubItem[];
};

const getIconByName = (iconName?: string): React.ReactNode => {
  switch ((iconName || "").trim()) {
    case "GridIcon":
      return <GridIcon />;
    case "CalenderIcon":
      return <CalenderIcon />;
    case "UserCircleIcon":
      return <UserCircleIcon />;
    case "ListIcon":
      return <ListIcon />;
    case "TableIcon":
      return <TableIcon />;
    case "PageIcon":
      return <PageIcon />;
    case "PieChartIcon":
      return <PieChartIcon />;
    case "PlugInIcon":
      return <PlugInIcon />;
    case "BoxCubeIcon":
      return <BoxCubeIcon />;
    case "BoxIcon":
      return <BoxIcon />;
    case "BoxIconLine":
      return <BoxIconLine />;
    case "GroupIcon":
      return <GroupIcon />;
    case "FolderIcon":
      return <FolderIcon />;
    case "DollarLineIcon":
      return <DollarLineIcon />;
    case "DownloadIcon":
      return <DownloadIcon />;
    case "TaskIcon":
      return <TaskIcon />;
    case "DocsIcon":
      return <DocsIcon />;
    case "FileIcon":
      return <FileIcon />;
    case "TimeIcon":
      return <TimeIcon />;
    default:
      return <GridIcon />;
  }
};

const normalizePath = (path?: string | null) => {
  if (!path || !String(path).trim()) return undefined;
  return path.startsWith("/") ? path : `/${path}`;
};

const buildNavItems = (menus: Menu[]): NavItem[] => {
  const activeMenus = (Array.isArray(menus) ? menus : [])
    .filter((menu) => Number(menu.IsActive) === 1)
    .sort((a, b) => Number(a.Sorting) - Number(b.Sorting));

  const childMenus = activeMenus.filter(
    (menu) => Number(menu.ParentMenuId) !== 0
  );

  const parentMenus = activeMenus.filter(
    (menu) => Number(menu.ParentMenuId) === 0
  );

  return parentMenus.map((parent) => {
    const children = childMenus
      .filter((child) => Number(child.ParentMenuId) === Number(parent.MenuId))
      .sort((a, b) => Number(a.Sorting) - Number(b.Sorting));

    const parentPath = normalizePath(parent.Path);

    if (children.length > 0) {
      return {
        menuId: parent.MenuId,
        name: parent.Name,
        icon: getIconByName(parent.Icon),
        path: parentPath,
        subItems: children
          .map((child) => ({
            menuId: child.MenuId,
            name: child.Name,
            path: normalizePath(child.Path) || "#",
            icon: getIconByName(child.Icon),
          }))
          .filter((child) => child.path !== "#"),
      };
    }

    return {
      menuId: parent.MenuId,
      name: parent.Name,
      icon: getIconByName(parent.Icon),
      path: parentPath,
    };
  });
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  // const { user } = useAuth();
  const { user, token, isLoading: authLoading, isAuthenticated } = useAuth();

  const [menuItems, setMenuItems] = useState<NavItem[]>([]);
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [menuError, setMenuError] = useState("");

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const roleId = useMemo(() => user?.RoleId ?? null, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) return;

    const fetchMenus = async () => {
      try {
        setLoadingMenus(true);
        setMenuError("");

        let endpoint = "/api/menus";

        if (
          roleId !== null &&
          roleId !== undefined &&
          String(roleId).trim() !== "" &&
          Number(roleId) !== 1
        ) {
          endpoint = `/api/menus?RoleId=${encodeURIComponent(String(roleId))}`;
        }

        // console.log("token from localStorage:", localStorage.getItem("token"));
        // console.log("endpoint:", endpoint);

        const response = await api.get<ApiResponse<Menu[]>>(endpoint, {
          auth: true,
        });

        const menus = Array.isArray(response?.data) ? response.data : [];
        const navItems = buildNavItems(menus);

        setMenuItems(navItems);
      } catch (error) {
        console.error("Failed to fetch menus:", error);
        setMenuError("Failed to load menus.");
        setMenuItems([]);
      } finally {
        setLoadingMenus(false);
      }
    };

    fetchMenus();
  }, [roleId, authLoading, isAuthenticated, token]);

  // useEffect(() => {
  //   const fetchMenus = async () => {
  //     try {
  //       setLoadingMenus(true);
  //       setMenuError("");

  //       let endpoint = "/api/menus";

  //       console.log("token from localStorage:", localStorage.getItem("token"));
  //       console.log("user from localStorage:", localStorage.getItem("user"));
  //       console.log("roleId:", roleId);
  //       console.log("endpoint:", endpoint);

  //       if (
  //         roleId !== null &&
  //         roleId !== undefined &&
  //         String(roleId).trim() !== "" &&
  //         Number(roleId) !== 1
  //       ) {
  //         endpoint = `/api/menus?RoleId=${encodeURIComponent(String(roleId))}`;
  //       }

  //       const response = await api.get<ApiResponse<Menu[]>>(endpoint, {
  //         auth: true,
  //       });

  //       const menus = Array.isArray(response?.data) ? response.data : [];
  //       // console.log("menus:", menus);
  //       const navItems = buildNavItems(menus);

  //       setMenuItems(navItems);
  //     } catch (error) {
  //       console.error("Failed to fetch menus:", error);
  //       setMenuError("Failed to load menus.");
  //       setMenuItems([]);
  //     } finally {
  //       setLoadingMenus(false);
  //     }
  //   };

  //   fetchMenus();
  // }, [roleId]);

  useEffect(() => {
    let submenuMatched = false;

    menuItems.forEach((nav, index) => {
      if (nav.subItems?.length) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [menuItems, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu, menuItems]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === "main" &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: "main", index };
    });
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const hasSubItems = Boolean(nav.subItems && nav.subItems.length > 0);

        return (
          <li key={`${nav.menuId}-${nav.name}-${index}`}>
            {hasSubItems ? (
              <button
                type="button"
                onClick={() => handleSubmenuToggle(index)}
                className={`menu-item group w-full ${
                  openSubmenu?.type === "main" && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === "main" && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}

                {/* {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === "main" && openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )} */}

                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === "main" && openSubmenu?.index === index
                        ? "rotate-0 text-brand-500"
                        : "-rotate-90"
                    }`}
                  />
                )}
              </button>
            ) : nav.path ? (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                } ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            ) : (
              <div
                className={`menu-item group ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                } menu-item-inactive`}
              >
                <span className="menu-item-icon-size menu-item-icon-inactive">
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </div>
            )}

            {hasSubItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`main-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === "main" && openSubmenu?.index === index
                      ? `${subMenuHeight[`main-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems!.map((subItem) => (
                    <li key={subItem.menuId}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        <span className="inline-block w-2 h-2 rounded-full bg-current mr-2" />
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
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
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="CG-IPOS"
                width={154}
                height={32}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="CG-IPOS"
                width={154}
                height={32}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="CG-IPOS"
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
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>

              {authLoading || loadingMenus ? (
                <div className="text-sm text-gray-400 px-2">Loading menus...</div>
              ) : (
                renderMenuItems(menuItems)
              )}
            </div>

            {menuError && (
              <div className="text-sm text-red-500 px-2">{menuError}</div>
            )}

            {!loadingMenus && !menuError && menuItems.length === 0 && (
              <div className="text-sm text-gray-400 px-2">No menus found.</div>
            )}
          </div>
        </nav>

        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
