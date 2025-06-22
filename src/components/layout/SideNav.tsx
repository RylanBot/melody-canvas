import { useEffect, useRef, useState } from "react";

import { AudioVisualizer, BackdropDisplay, ImageProcessor, TextManager } from "@/editors";
import { useMediaBreakpoint } from "@/hooks";
import { useCanvasStore } from "@/stores";

interface NavItemProps {
  icon: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, name, isActive, onClick }) => (
  <button
    className={`w-14 h-14 rounded-md flex-center flex-col font-bold border-2 border-dotted text-emerald-800  border-emerald-800 dark:(text-emerald-200 border-emerald-200) ${
      isActive ? "lg:pointer-events-none bg-emerald-100 dark:bg-dark-300" : "hover:(bg-emerald-100 dark:bg-dark-200)"
    }`}
    max-lg="p-0 border-0"
    onClick={onClick}
  >
    <div className={`${icon} text-2xl my-1`} />
    <span
      className="text-[10px]"
      max-lg="hidden"
    >
      {name}
    </span>
  </button>
);

const navList = [
  { id: "nav-audio", name: "Audio", icon: "i-icon-park-outline:electric-wave", component: <AudioVisualizer /> },
  { id: "nav-backdrop", name: "Backdrop", icon: "i-geo:turf-size", component: <BackdropDisplay /> },
  { id: "nav-image", name: "Image", icon: "i-lsicon:picture-outline", component: <ImageProcessor /> },
  { id: "nav-text", name: "Text", icon: "i-iconoir:text-square", component: <TextManager /> }
];

/**
 * 左侧边栏
 */
const SideNav: React.FC = () => {
  const isMobileOrTablet = useMediaBreakpoint("max-lg");
  const { canvasInstance, activeObjects } = useCanvasStore();

  const navRef = useRef<HTMLDivElement>(null);

  const [activeNav, setActiveNav] = useState<string>(navList[0].id);
  const [panelHidden, setPanelHidden] = useState(isMobileOrTablet);

  useEffect(() => {
    const matchingNav = navList.find((nav) => isSubTypeMatch(nav.id));
    if (matchingNav) {
      setActiveNav(matchingNav.id);
    }
  }, [activeObjects[0]]);

  useEffect(() => {
    setPanelHidden(isMobileOrTablet);
    if (!isMobileOrTablet) return;

    /* 小屏幕情况下，点击侧边栏之外的区域自动关闭 */
    const handleClickOutside = (event: MouseEvent) => {
      // TDesign 的 Popup 直接挂在 body 上，避免和它冲突
      const portalWrappers = document.querySelectorAll(".t-portal-wrapper");
      const isInsideWrapper = Array.from(portalWrappers).some((wrapper) => wrapper.contains(event.target as Node));

      if (!navRef.current?.contains(event.target as Node) && !isInsideWrapper) {
        setPanelHidden(true);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileOrTablet]);

  const isSubTypeMatch = (navId: string) => {
    return navId.split("-")[1] === activeObjects[0]?.subType;
  };

  const handleNavClick = (navId: string) => {
    /* 小屏幕情况下，点击同一个 nav 时进行切换显示或隐藏 */
    if (isMobileOrTablet && activeNav === navId) {
      setPanelHidden((prevPanelHidden) => !prevPanelHidden);
    } else {
      setPanelHidden(false);
      setActiveNav(navId);
    }

    if (!isSubTypeMatch(navId)) {
      canvasInstance?.discardActiveObject();
      canvasInstance?.renderAll();
    }
  };

  return (
    <>
      <div
        id="side-nav"
        ref={navRef}
        className="w-18 h-screen top-0 space-x-10 border-r-2 border-emerald-700 bg-emerald-50"
        dark="border-dark-100 bg-dark-500"
      >
        {/* 左侧栏 */}
        <nav className="w-full h-screen">
          <div className="h-full px-2 py-4 flex flex-col items-center text-center">
            {/* Logo */}
            <a
              className="mb-10"
              href="https://github.com/RylanBot/melody-canvas"
              target="_blank"
            >
              <img
                className="w-8 h-8 mx-auto rounded-lg shadow-md"
                src="/image/favicon.png"
              />
              <p
                className="py-2 font-sans font-bold text-xs text-emerald-800"
                dark="text-white"
                max-lg="hidden"
              >
                Melody Canvas
              </p>
            </a>

            {/* 按钮组 */}
            <div className="flex flex-col space-y-8">
              {navList.map((item, index) => (
                <NavItem
                  key={index}
                  icon={item.icon}
                  name={item.name}
                  isActive={activeNav === item.id}
                  onClick={() => handleNavClick(item.id)}
                />
              ))}
            </div>
          </div>
        </nav>

        <div
          className="absolute left-12 top-2 z-10"
          hidden={panelHidden}
        >
          {/* 对应的子组件 */}
          {navList.map((nav) => (
            <div
              key={nav.id}
              id={nav.id}
              className="h-[90vh] w-64 rounded-md p-4 border-2 border-emerald-500 bg-green-50"
              dark="border-dark-50 bg-dark-400"
              max-lg="overflow-y-auto"
              hidden={nav.id !== activeNav}
            >
              {nav.component}
            </div>
          ))}
        </div>
      </div>

      {/* 可视化元素不支持调整渐变角度 */}
      {activeNav === "nav-audio" && (
        <style>
          {`
            .t-color-picker__gradient-degree {
              display: none;
            }
          `}
        </style>
      )}
    </>
  );
};

export default SideNav;
