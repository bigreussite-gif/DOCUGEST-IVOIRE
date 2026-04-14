import { Button } from "../ui/Button";

export type DocumentEditorActionButtonsProps = {
  onSave: () => void | Promise<void>;
  onDownload: () => void | Promise<void>;
  onPrint: () => void;
  onReset: () => void;
  saving?: boolean;
  downloading?: boolean;
  disabled?: boolean;
  saveLabel?: string;
  downloadLabel?: string;
  /** Barre compacte (en-tête sticky) */
  variant?: "default" | "compact";
  className?: string;
};

/**
 * Actions standard sur les documents : sauvegarde, export PDF, impression, réinitialisation.
 */
export function DocumentEditorActionButtons({
  onSave,
  onDownload,
  onPrint,
  onReset,
  saving = false,
  downloading = false,
  disabled = false,
  saveLabel = "Sauvegarder",
  downloadLabel = "Télécharger PDF",
  variant = "default",
  className = ""
}: DocumentEditorActionButtonsProps) {
  const compact = variant === "compact";
  const btnClass = compact ? "h-9 min-h-9 px-3 text-xs rounded-xl" : "min-h-11 w-full sm:w-auto";

  return (
    <div
      className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center ${className}`}
      role="group"
      aria-label="Actions document"
    >
      <Button
        type="button"
        variant="secondary"
        size={compact ? "sm" : "md"}
        className={btnClass}
        disabled={disabled || saving}
        loading={saving}
        onClick={async () => {
          await onSave();
          alert("Brouillon sauvegardé !");
        }}
      >
        {saveLabel}
      </Button>
      <Button
        type="button"
        variant="primary"
        size={compact ? "sm" : "md"}
        className={btnClass}
        disabled={disabled || downloading}
        loading={downloading}
        onClick={() => void onDownload()}
      >
        {downloadLabel}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size={compact ? "sm" : "md"}
        className={btnClass}
        disabled={disabled || downloading}
        onClick={onPrint}
      >
        Imprimer
      </Button>
      <Button
        type="button"
        variant="ghost"
        size={compact ? "sm" : "md"}
        className={btnClass}
        disabled={disabled || saving}
        onClick={onReset}
      >
        Réinitialiser
      </Button>
    </div>
  );
}
