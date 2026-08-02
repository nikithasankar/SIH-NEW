
interface CheaterFlashOverlayProps {
  visible: boolean;
  message?: string;
}

export function CheaterFlashOverlay({ visible, message = 'Go Lower!' }: CheaterFlashOverlayProps) {
  if (!visible) return null;
  return (
    <div className="cheat-flash flex items-center justify-center">
      <span className="text-white text-3xl font-bold animate-pulse">
        ⚠️ {message}
      </span>
    </div>
  );
}
