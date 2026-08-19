const EmptyState = ({ title = "No data yet", description, action, icon: Icon }) => {
  return (
    <div className="page-empty">
      <div className="page-empty__inner">
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]">
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
        <h3 className="page-empty__title">{title}</h3>
        {description ? <p className="page-empty__text">{description}</p> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
};

export default EmptyState;
