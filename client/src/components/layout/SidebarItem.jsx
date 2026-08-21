import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

const SIDEBAR_GAP = 10;
const POPOVER_WIDTH = 236;
const VIEWPORT_GUTTER = 12;

const getActiveChild = (pathname, children) =>
  children.find((child) => pathname === child.path) || null;

const SidebarItem = ({
  item,
  expanded,
  onToggle,
  onNavigate,
  collapsed = false,
}) => {
  const location = useLocation();
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState(null);

  const Icon = item.icon;
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const activeChild = useMemo(
    () => (hasChildren ? getActiveChild(location.pathname, item.children) : null),
    [hasChildren, item.children, location.pathname],
  );
  const hasActiveChild = Boolean(activeChild);
  const groupOpen = hasChildren && (expanded === undefined ? hasActiveChild : expanded);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const schedulePopoverClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setPopoverOpen(false);
    }, 170);
  }, [clearCloseTimer]);

  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const maxTop = Math.max(
      VIEWPORT_GUTTER,
      window.innerHeight - VIEWPORT_GUTTER - 64,
    );
    const estimatedHeight = Math.min(420, 74 + item.children.length * 42);
    const preferredTop = rect.top + rect.height / 2 - estimatedHeight / 2;
    const top = Math.min(
      Math.max(VIEWPORT_GUTTER, preferredTop),
      maxTop - Math.min(estimatedHeight, window.innerHeight - VIEWPORT_GUTTER * 2),
    );

    setPopoverPosition({
      top,
      left: rect.right + SIDEBAR_GAP,
      width: Math.min(POPOVER_WIDTH, window.innerWidth - rect.right - SIDEBAR_GAP - VIEWPORT_GUTTER),
    });
  }, [item.children?.length]);

  const openCollapsedPopover = useCallback(() => {
    clearCloseTimer();
    updatePopoverPosition();
    setPopoverOpen(true);
  }, [clearCloseTimer, updatePopoverPosition]);

  useEffect(() => {
    if (!collapsed || !popoverOpen) return undefined;

    const onWindowChange = () => updatePopoverPosition();
    const onPointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target)
      ) {
        return;
      }
      setPopoverOpen(false);
    };

    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange, true);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [collapsed, popoverOpen, updatePopoverPosition]);

  useEffect(() => {
    if (!collapsed) {
      setPopoverOpen(false);
    }
  }, [collapsed]);

  useEffect(
    () => () => {
      clearCloseTimer();
    },
    [clearCloseTimer],
  );

  const itemClass = (active = false) =>
    `sidebar-nav-item flex w-full items-center ${
      collapsed ? "justify-center px-2" : "gap-3 px-3"
    } py-2.5 text-sm font-semibold ${active ? "is-active" : ""}`;

  const renderChildLink = (child, popout = false) => {
    const ChildIcon = child.icon;

    return (
      <NavLink
        key={child.path}
        to={child.path}
        end
        onClick={() => {
          setPopoverOpen(false);
          onNavigate();
        }}
        aria-current={location.pathname === child.path ? "page" : undefined}
        tabIndex={popout || groupOpen ? 0 : -1}
        className={({ isActive }) =>
          `sidebar-child-link flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
            isActive
              ? "is-active"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]"
          } ${popout ? "sidebar-child-link--popout" : ""}`
        }
      >
        <span
          className={`flex w-4 shrink-0 items-center justify-center ${
            child.color || "text-[var(--color-text-secondary)]"
          }`}
        >
          <ChildIcon size={16} strokeWidth={1.9} />
        </span>
        <span className="min-w-0 truncate">{child.title}</span>
      </NavLink>
    );
  };

  if (hasChildren) {
    if (collapsed) {
      return (
        <div
          className="sidebar-collapsed-parent"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={schedulePopoverClose}
        >
          <button
            ref={triggerRef}
            type="button"
            onClick={openCollapsedPopover}
            onMouseEnter={openCollapsedPopover}
            aria-label={`${item.title}${hasActiveChild ? ", current section" : ""}`}
            aria-haspopup="menu"
            aria-expanded={popoverOpen}
            title={item.title}
            className={itemClass(hasActiveChild)}
          >
            <span
              className={`sidebar-item-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] ${
                item.color || "text-[var(--primary-lighter)]"
              }`}
            >
              <Icon size={18} strokeWidth={1.9} />
            </span>
            <span
              className={`sidebar-active-marker ${hasActiveChild ? "is-visible" : ""}`}
              aria-hidden="true"
            />
          </button>

          {popoverOpen && popoverPosition && (
            <div
              ref={popoverRef}
              role="menu"
              className="sidebar-collapsed-popout"
              style={popoverPosition}
              onMouseEnter={clearCloseTimer}
              onMouseLeave={schedulePopoverClose}
            >
              <div className="sidebar-collapsed-popout__header">
                <span>{item.title}</span>
                <ChevronRight size={15} aria-hidden="true" />
              </div>
              <div className="sidebar-collapsed-popout__items">
                {item.children.map((child) => renderChildLink(child, true))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="sidebar-parent-group">
        <button
          type="button"
          onClick={() => onToggle(!groupOpen)}
          aria-label={item.title}
          aria-expanded={groupOpen}
          className={itemClass(hasActiveChild)}
        >
          <span
            className={`sidebar-item-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] ${
              item.color || "text-[var(--primary-lighter)]"
            }`}
          >
            <Icon size={18} strokeWidth={1.9} />
          </span>

          <span className="min-w-0 flex-1 truncate text-left">
            {item.title}
          </span>

          <ChevronDown
            size={17}
            aria-hidden="true"
            className={`shrink-0 transition-transform duration-200 ${
              groupOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`sidebar-child-collapse ${
            groupOpen ? "is-open" : ""
          }`}
          aria-hidden={!groupOpen}
        >
          <div className="sidebar-child-list">
            {item.children.map((child) => renderChildLink(child))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end
      onClick={onNavigate}
      aria-label={item.title}
      title={collapsed ? item.title : undefined}
      aria-current={location.pathname === item.path ? "page" : undefined}
      className={({ isActive }) => itemClass(isActive)}
    >
      <span
        className={`sidebar-item-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] ${
          item.color || "text-[var(--primary-lighter)]"
        }`}
      >
        <Icon size={18} strokeWidth={1.9} />
      </span>
      {!collapsed && (
        <span className="min-w-0 truncate">{item.title}</span>
      )}
      {collapsed && (
        <span className="sidebar-active-marker" aria-hidden="true" />
      )}
    </NavLink>
  );
};

export default SidebarItem;
