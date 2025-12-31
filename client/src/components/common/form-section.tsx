interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function FormSection({ title, description, children, actions }: FormSectionProps) {
  return (
    <div className="space-y-4" data-testid="form-section">
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
      {actions && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          {actions}
        </div>
      )}
    </div>
  );
}

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormFieldWrapper({
  label,
  required = false,
  error,
  hint,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className="space-y-2" data-testid="form-field">
      <label className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
