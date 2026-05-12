import { ViewTransitions } from "next-view-transitions";
import { AppThemeProvider } from "@/components/theme";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ViewTransitions>
      <AppThemeProvider>{children}</AppThemeProvider>
    </ViewTransitions>
  );
};
