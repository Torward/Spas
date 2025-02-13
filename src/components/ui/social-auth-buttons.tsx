import { Button } from "./button";

interface SocialAuthButtonsProps {
  onVkClick: () => void;
  onYandexClick: () => void;
  onGosuslugiClick: () => void;
  loading?: boolean;
}

export function SocialAuthButtons({
  onVkClick,
  onYandexClick,
  onGosuslugiClick,
  loading = false,
}: SocialAuthButtonsProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Или войти через
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        <Button
          variant="outline"
          type="button"
          disabled={loading}
          onClick={onVkClick}
          className="bg-[#0077FF] text-white hover:bg-[#0077FF]/90"
        >
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2Zm3.08 14.27h-1.46c-.55 0-.72-.44-1.71-1.42-.86-.83-1.24-.94-1.45-.94-.29 0-.38.08-.38.47v1.29c0 .33-.11.52-1 .52-1.48 0-3.12-.9-4.28-2.57-1.74-2.44-2.21-4.27-2.21-4.65 0-.2.08-.39.47-.39h1.46c.35 0 .51.17.66.58.72 2.06 1.89 3.87 2.38 3.87.19 0 .27-.08.27-.54V9.95c-.06-1-.58-1.08-.58-1.44 0-.17.14-.35.37-.35h2.29c.31 0 .42.17.42.55v2.92c0 .31.13.42.23.42.19 0 .34-.11.69-.45 1.07-1.19 1.84-3.03 1.84-3.03.1-.22.27-.42.66-.42h1.46c.44 0 .54.23.44.55-.18.86-1.96 3.36-1.96 3.36-.15.25-.21.36 0 .64.15.21.66.64 1 1.02.62.71 1.1 1.31 1.23 1.71.11.41-.09.62-.51.62Z"
            />
          </svg>
          ВКонтакте
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={loading}
          onClick={onYandexClick}
          className="bg-[#FC3F1D] text-white hover:bg-[#FC3F1D]/90"
        >
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12Zm11.5-6h-3l-.004.028L6 19h2.5l1.5-4h3l1.5 4H17L12.5 6Zm-1.25 7h-1.5l1.5-4 1.5 4h-1.5Z"
            />
          </svg>
          Яндекс
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={loading}
          onClick={onGosuslugiClick}
          className="bg-[#0B1F33] text-white hover:bg-[#0B1F33]/90"
        >
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14h-9v-1.5h9V16zm0-3h-9v-1.5h9V13zm0-3h-9V8.5h9V10z"
            />
          </svg>
          Госуслуги
        </Button>
      </div>
    </div>
  );
}
